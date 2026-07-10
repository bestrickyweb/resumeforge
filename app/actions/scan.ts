'use server'

import { generateText, Output } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'
import { getUserId } from '@/lib/session'
import { getUsage } from '@/app/actions/queries'

const tailorModel = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  ? google('gemini-2.5-flash')
  : 'openai/gpt-5-mini'

const achievementSchema = z.object({
  originalBullet: z.string().describe('The exact bullet as it appears in the CV'),
  hasMetric: z.boolean().describe('Whether the bullet already contains a quantifiable metric'),
  suggestion: z.string().describe('A suggested rewrite adding a metric if missing'),
  metricType: z.string().describe('Type of metric: amount, percentage, frequency, scale'),
})

const scanSchema = z.object({
  achievements: z.array(achievementSchema).describe('Bullets examined with metric status and suggestions'),
  coverageScore: z.number().max(100).describe('Percentage of bullets that have metrics'),
})

export type AchievementScanResult = {
  ok: boolean
  error?: string
  achievements?: z.infer<typeof scanSchema>['achievements']
  coverageScore?: number
}

export async function scanAchievements(input: { cvText: string }): Promise<AchievementScanResult> {
  const userId = await getUserId()

  const usage = await getUsage()
  const feature = usage.features.achievementsScanner
  if (feature.limit !== Infinity && feature.remaining <= 0) {
    return {
      ok: false,
      error:
        usage.plan === 'free'
          ? 'Upgrade your plan to use the achievements scanner.'
          : 'You have reached your limit for this feature.',
    }
  }

  const cvText = input.cvText.trim()
  if (cvText.length < 40) {
    return { ok: false, error: 'Please provide a fuller CV for scanning.' }
  }

  try {
    const { experimental_output } = await generateText({
      model: tailorModel,
      system:
        'You are a career coach specializing in achievement quantification. ' +
        'Examine the CV bullets and determine which already contain metrics and which need them. ' +
        'Return structured JSON only.',
      prompt:
        `CV:\n${cvText}\n\n` +
        'Identify bullets under work experience that lack metrics. Suggest metric-driven rewrites.',
      experimental_output: Output.object({ schema: scanSchema }),
    })

    const out = experimental_output
    return {
      ok: true,
      achievements: out.achievements,
      coverageScore: out.coverageScore,
    }
  } catch (err) {
    console.log('[v0] scanAchievements error:', err instanceof Error ? err.message : err)
    return { ok: false, error: 'We could not scan achievements right now.' }
  }
}
