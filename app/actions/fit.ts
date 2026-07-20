'use server'

import { generateText, Output } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'
import { getUserId } from '@/lib/session'
import { getUsage } from '@/app/actions/queries'

const tailorModel = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  ? google('gemini-2.5-flash')
  : 'openai/gpt-5-mini'

const fitSchema = z.object({
  matchScore: z
    .number()
    .max(100)
    .describe('Overall ATS-readiness percentage (0-100).'),
  keywordMatchPct: z
    .number()
    .max(100)
    .describe(
      'Percentage of the job description keywords present in the CV. This is the single most important number: resumes below 70% are routinely filtered before a human reads them.',
    ),
  matchedSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  sectionScores: z.object({
    experience: z.number().max(100),
    skills: z.number().max(100),
    education: z.number().max(100),
    keywords: z.number().max(100),
    formatting: z
      .number()
      .max(100)
      .describe(
        'ATS parse-safety score. Penalise multi-column layouts, tables for content, contact info in headers/footers, images/graphics with text, and non-standard headings.',
      ),
    quantification: z
      .number()
      .max(100)
      .describe(
        'Metric density score based on how many achievement bullets carry a number (%, $, count, scale, timeframe).',
      ),
  }),
  formatFlags: z
    .array(z.string())
    .describe(
      'List of detected ATS parse problems, e.g. "multi-column", "tables-used", "contact-in-header-footer", "images-or-graphics", "non-standard-headings", "scanned-image-pdf". Empty array means clean.',
    ),
  quantificationDetail: z.object({
    metricBullets: z.number().describe('Achievement bullets that contain a metric'),
    totalBullets: z.number().describe('Total achievement bullets examined'),
    coveragePct: z.number().max(100).describe('metricBullets / totalBullets * 100'),
  }),
  titleMatch: z
    .boolean()
    .describe(
      'True if the CV contains the job title (or a close variant) from the posting. Mirroring the exact job title strongly improves ATS ranking.',
    ),
  interviewReadinessBand: z
    .enum(['below-cliff', 'competitive', 'strong'])
    .describe(
      'Derived from keywordMatchPct: below-cliff (<70%, likely filtered), competitive (70-84%), strong (85+).',
    ),
  recommendations: z
    .array(z.string())
    .describe(
      'Top 3 highest-ROI, most specific fixes to improve interview odds, ordered by impact (e.g. "Add the exact keywords X, Y, Z from the posting", "Quantify bullets 3 and 5 with numbers", "Flatten to a single-column layout", "Mirror the job title in your summary").',
    ),
  summary: z.string().describe('2-3 sentence summary of fit'),
})

export type JobFitSectionScores = z.infer<typeof fitSchema>['sectionScores']
export type JobFitQuantification = z.infer<typeof fitSchema>['quantificationDetail']
export type JobFitResult = {
  ok: boolean
  error?: string
  matchScore?: number
  keywordMatchPct?: number
  matchedSkills?: string[]
  missingSkills?: string[]
  sectionScores?: JobFitSectionScores
  formatFlags?: string[]
  quantification?: JobFitQuantification
  titleMatch?: boolean
  interviewReadinessBand?: 'below-cliff' | 'competitive' | 'strong'
  recommendations?: string[]
  summary?: string
}

export async function analyzeJobFit(input: {
  jobDescription: string
  cvText: string
}): Promise<JobFitResult> {
  const userId = await getUserId()

  const usage = await getUsage()
  const feature = usage.features.jobFitAnalyzer
  if (feature.limit !== Infinity && feature.remaining <= 0) {
    return {
      ok: false,
      error:
        usage.plan === 'free'
          ? 'Upgrade your plan to use job fit analysis.'
          : 'You have reached your limit for this feature.',
    }
  }

  const jobDescription = input.jobDescription.trim()
  const cvText = input.cvText.trim()

  if (jobDescription.length < 40 || cvText.length < 40) {
    return { ok: false, error: 'Please provide fuller inputs for analysis.' }
  }

  try {
    const { experimental_output } = await generateText({
      model: tailorModel,
      system:
        'You are a recruiter and ATS specialist. Analyze a CV against a job description. ' +
        'Be balanced: do not inflate scores. A weak match should score below 60. ' +
        'Score against what actually gets interviews. The keyword match percentage is the most important number: ' +
        'below 70% the resume is usually filtered before a human sees it, 70-84% is competitive, 85%+ is strong. ' +
        'Detect ATS parse problems from the raw text (multi-column layouts, tables used for content, contact info placed in headers/footers, ' +
        'images/graphics containing text, non-standard section headings like "My Journey" instead of "Work Experience"). ' +
        'Count how many achievement bullets carry a concrete metric (%, $, count, scale, timeframe) and score quantification density. ' +
        'Check whether the CV contains the exact job title or a close variant. ' +
        'Give 3 specific, highest-impact recommendations ordered by effect.',
      prompt:
        `JOB DESCRIPTION:\n${jobDescription}\n\n` +
        `CANDIDATE CV:\n${cvText}\n\n` +
        'Analyze the fit and return structured JSON. The keywordMatchPct and interviewReadinessBand must reflect the 70% threshold described above.',
      experimental_output: Output.object({ schema: fitSchema }),
    })

    const out = experimental_output
    return {
      ok: true,
      matchScore: out.matchScore,
      keywordMatchPct: out.keywordMatchPct,
      matchedSkills: out.matchedSkills,
      missingSkills: out.missingSkills,
      sectionScores: out.sectionScores,
      formatFlags: out.formatFlags,
      quantification: out.quantificationDetail,
      titleMatch: out.titleMatch,
      interviewReadinessBand: out.interviewReadinessBand,
      recommendations: out.recommendations,
      summary: out.summary,
    }
  } catch (err) {
    console.log('[v0] analyzeJobFit error:', err instanceof Error ? err.message : err)
    return { ok: false, error: 'We could not analyze job fit right now.' }
  }
}
