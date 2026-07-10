'use server'

import { generateText, Output } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'
import { getUserId } from '@/lib/session'
import { getUsage } from '@/app/actions/queries'
import { PLAN_FEATURE_LIMITS, type PlanId, type PlanFeatureKey } from '@/lib/plans'

const tailorModel = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  ? google('gemini-2.5-flash')
  : 'openai/gpt-5-mini'

const salarySchema = z.object({
  rangeLow: z.number(),
  rangeHigh: z.number(),
  median: z.number(),
  confidence: z.number().max(100).describe('0-100 confidence score'),
  factors: z.array(z.string()).describe('Factors that influenced the estimate'),
})

export type SalaryBenchmarkResult = {
  ok: boolean
  error?: string
  rangeLow?: number
  rangeHigh?: number
  median?: number
  confidence?: number
  factors?: string[]
}

export async function benchmarkSalary(input: {
  jobTitle: string
  location: string
  experience?: string
}): Promise<SalaryBenchmarkResult> {
  const userId = await getUserId()

  const usage = await getUsage()
  const feature = usage.features.salaryBenchmarking
  if (feature.limit !== Infinity && feature.remaining <= 0) {
    return {
      ok: false,
      error:
        usage.plan === 'free'
          ? 'Upgrade your plan to use salary benchmarking.'
          : 'You have reached your limit for this feature.',
    }
  }

  const { jobTitle, location, experience } = input
  if (!jobTitle.trim() || !location.trim()) {
    return { ok: false, error: 'Please provide both a job title and location.' }
  }

  try {
    const { experimental_output } = await generateText({
      model: tailorModel,
      system:
        'You are a career compensation analyst for the Nigerian and remote-first job market. ' +
        'Based on role, location, and experience, estimate a realistic monthly salary range in Naira. ' +
        'Always label the result as an AI estimate.',
      prompt:
        `JOB TITLE: ${jobTitle}\n` +
        `LOCATION: ${location}\n` +
        `EXPERIENCE: ${experience ?? 'Not specified'}\n\n` +
        'Estimate the monthly salary range and return structured JSON.',
      experimental_output: Output.object({ schema: salarySchema }),
    })

    const out = experimental_output
    return {
      ok: true,
      rangeLow: out.rangeLow,
      rangeHigh: out.rangeHigh,
      median: out.median,
      confidence: out.confidence,
      factors: out.factors,
    }
  } catch (err) {
    console.log('[v0] benchmarkSalary error:', err instanceof Error ? err.message : err)
    return { ok: false, error: 'We could not generate a salary estimate right now.' }
  }
}
