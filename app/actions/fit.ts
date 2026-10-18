'use server'

import { getUserId } from '@/lib/session'
import { getUsage } from '@/app/actions/queries'
import { recordUsage } from '@/lib/usage'
import { runJobFit, type JobFitResult } from '@/lib/job-fit'

export async function analyzeJobFit(input: {
  jobDescription: string
  cvText: string
}): Promise<JobFitResult> {
  const userId = await getUserId()

  const usage = await getUsage({ fresh: true })
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

  const result = await runJobFit(input)
  if (result.ok) await recordUsage(userId, 'jobFitAnalyzer')
  return result
}
