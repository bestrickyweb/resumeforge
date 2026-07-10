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
  matchScore: z.number().max(100).describe('Overall compatibility percentage'),
  matchedSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  sectionScores: z.object({
    experience: z.number().max(100),
    skills: z.number().max(100),
    education: z.number().max(100),
    keywords: z.number().max(100),
  }),
  summary: z.string().describe('2-3 sentence summary of fit'),
})

export type JobFitResult = {
  ok: boolean
  error?: string
  matchScore?: number
  matchedSkills?: string[]
  missingSkills?: string[]
  sectionScores?: z.infer<typeof fitSchema>['sectionScores']
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
        'Be balanced: do not inflate scores. A weak match should score below 60.',
      prompt:
        `JOB DESCRIPTION:\n${jobDescription}\n\n` +
        `CANDIDATE CV:\n${cvText}\n\n` +
        'Analyze the fit and return structured JSON.',
      experimental_output: Output.object({ schema: fitSchema }),
    })

    const out = experimental_output
    return {
      ok: true,
      matchScore: out.matchScore,
      matchedSkills: out.matchedSkills,
      missingSkills: out.missingSkills,
      sectionScores: out.sectionScores,
      summary: out.summary,
    }
  } catch (err) {
    console.log('[v0] analyzeJobFit error:', err instanceof Error ? err.message : err)
    return { ok: false, error: 'We could not analyze job fit right now.' }
  }
}
