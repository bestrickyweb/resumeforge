'use server'

import { generateText, Output } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'
import { getUserId } from '@/lib/session'
import { getUsage } from '@/app/actions/queries'

const scanModel = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  ? google('gemini-2.5-flash')
  : 'openai/gpt-5-mini'

const scanItemSchema = z.object({
  section: z.string().describe('Which part of the CV this issue relates to (e.g. "Work Experience", "Skills", "Summary").'),
  severity: z.enum(['critical', 'high', 'medium', 'low']).describe('How much this matters for getting interviews.'),
  issue: z.string().describe('Concise description of the problem.'),
  fix: z.string().describe('Specific, actionable fix the candidate can make right now.'),
})

const scanResultSchema = z.object({
  atsReadinessScore: z
    .number()
    .min(0)
    .max(100)
    .describe('Overall ATS-readiness score 0-100. Below 70 = likely filtered by ATS.'),
  formatSafetyScore: z
    .number()
    .min(0)
    .max(100)
    .describe('How safe this CV is for ATS parsing (single column, standard headings, contact in body).'),
  quantificationScore: z
    .number()
    .min(0)
    .max(100)
    .describe('Percentage of achievement bullets that carry a concrete metric.'),
  keywordDensity: z
    .number()
    .min(0)
    .max(100)
    .describe('Keyword richness score: how well the CV covers role-relevant hard skills and terms.'),
  interviewReadinessBand: z
    .enum(['below-cliff', 'competitive', 'strong'])
    .describe('Derived from atsReadinessScore: below-cliff (<70), competitive (70-84), strong (85+).'),
  issues: z.array(scanItemSchema).describe('Up to 5 most impactful issues found, ordered by severity.'),
  summary: z.string().describe('2-3 sentence overall feedback on resume strength.'),
})

export type ResumeScanResult = {
  ok: boolean
  error?: string
  scan?: {
    atsReadinessScore: number
    formatSafetyScore: number
    quantificationScore: number
    keywordDensity: number
    interviewReadinessBand: 'below-cliff' | 'competitive' | 'strong'
    issues: {
      section: string
      severity: 'critical' | 'high' | 'medium' | 'low'
      issue: string
      fix: string
    }[]
    summary: string
  }
}

export async function scanResumeQuality(input: {
  cvText: string
  targetRole?: string
}): Promise<ResumeScanResult> {
  const userId = await getUserId()

  const usage = await getUsage()
  const feature = usage.features.aiResumeScan ?? { used: 0, limit: 0, remaining: 0 }
  if (feature.limit !== Infinity && feature.remaining <= 0) {
    return {
      ok: false,
      error:
        usage.plan === 'free'
          ? 'Upgrade to Pro or Unlimited to use the AI resume quality scanner.'
          : 'You have reached your limit for AI resume scans. Upgrade your plan for more.',
    }
  }

  const cvText = input.cvText.trim()
  if (cvText.length < 40) {
    return { ok: false, error: 'Please provide a fuller CV for scanning.' }
  }

  const roleContext = input.targetRole
    ? `TARGET ROLE: ${input.targetRole}\n\n`
    : ''

  try {
    const { experimental_output } = await generateText({
      model: scanModel,
      system:
        'You are a senior recruiter and resume expert with 15 years of experience reviewing CVs for Google, Meta, and Fortune 500 companies. ' +
        'You evaluate resumes holistically for ATS-readiness, keyword coverage, quantification, and format safety. ' +
        'Be honest and critical, but actionable. A fresh-from-scratch resume usually scores 65-85. Below 70 is likely filtered by ATS systems. ' +
        'Identify the 3-5 most impactful issues and give specific fixes.',
      prompt:
        `${roleContext}` +
        `CV TEXT:\n${cvText}\n\n` +
        'Analyze this CV and return structured JSON with scores and actionable issues.',
      experimental_output: Output.object({ schema: scanResultSchema }),
    })

    const out = experimental_output
    return {
      ok: true,
      scan: {
        atsReadinessScore: out.atsReadinessScore,
        formatSafetyScore: out.formatSafetyScore,
        quantificationScore: out.quantificationScore,
        keywordDensity: out.keywordDensity,
        interviewReadinessBand: out.interviewReadinessBand,
        issues: out.issues,
        summary: out.summary,
      },
    }
  } catch (err) {
    console.log('[v0] scanResumeQuality error:', err instanceof Error ? err.message : err)
    return { ok: false, error: 'We could not scan your resume right now.' }
  }
}
