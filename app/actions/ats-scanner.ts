'use server'

import { generateText, Output } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'
import { getUserId } from '@/lib/session'
import { getUsage } from '@/app/actions/queries'

const model = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  ? google('gemini-2.5-flash')
  : 'openai/gpt-5-mini'

const atsSchema = z.object({
  overallScore: z.number().max(100).describe('Overall ATS readiness score 0-100'),
  keywordMatchPct: z.number().max(100).describe('Percentage of job description keywords present in the CV'),
  formatScore: z.number().max(100).describe('ATS parse-safety score 0-100'),
  quantScore: z.number().max(100).describe('Metric density score 0-100'),
  titleMatch: z.boolean().describe('True if CV contains the job title or close variant'),
  missingKeywords: z.array(z.string()).describe('Important job description keywords missing from the CV'),
  formatIssues: z.array(z.string()).describe('Formatting problems that may break ATS parsing'),
  improvementTips: z.array(z.string()).describe('Actionable suggestions to improve the CV for this role'),
  interviewBand: z.enum(['below-cliff', 'competitive', 'strong']).describe('Derived from keywordMatchPct: below-cliff (<70), competitive (70-84), strong (85+)'),
})

export type AtsScanResult = {
  ok: boolean
  error?: string
  scan?: z.infer<typeof atsSchema>
}

export async function scanResume(input: { cvText: string; jobDescription: string }): Promise<AtsScanResult> {
  const userId = await getUserId()

  const usage = await getUsage()
  const feature = usage.features.atsScanner
  if (feature.limit !== Infinity && feature.remaining <= 0) {
    return {
      ok: false,
      error:
        usage.plan === 'free'
          ? 'Upgrade your plan to use the ATS scanner.'
          : 'You have reached your limit for this feature.',
    }
  }

  const cvText = input.cvText.trim()
  const jobDescription = input.jobDescription.trim()

  if (cvText.length < 40 || jobDescription.length < 40) {
    return { ok: false, error: 'Please provide a fuller CV and job description.' }
  }

  try {
    const { experimental_output } = await generateText({
      model,
      system:
        'You are an expert ATS resume scanner. ' +
        'Evaluate the candidate CV against the job description and return a structured JSON scan result. ' +
        'Be strict but fair. A generic untailored CV usually scores 30-55 before optimization.',
      prompt: `JOB DESCRIPTION:\n${jobDescription}\n\nCANDIDATE CV:\n${cvText}\n\nScan this CV for ATS compatibility against the job description. Return structured JSON only.`,
      experimental_output: Output.object({ schema: atsSchema }),
    })

    return { ok: true, scan: experimental_output }
  } catch (err) {
    console.log('[v0] scanResume error:', err instanceof Error ? err.message : err)
    return { ok: false, error: 'We could not scan your resume right now.' }
  }
}
