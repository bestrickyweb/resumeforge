import { getUsage, getPipelineIntelligence } from '@/app/actions/queries'
import { getSprintProgress, getActiveSprint } from '@/app/actions/sprint'
import { PLANS } from '@/lib/plans'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Target, Play } from 'lucide-react'
import { UsageCard } from '@/components/dashboard/usage-card'
import { FeedbackBanner } from '@/components/dashboard/feedback-banner'
import { PipelineIntelligence } from '@/components/dashboard/pipeline-intelligence'

export async function OverviewSidebar() {
  const [usage, pipeline, activeSprint] = await Promise.all([
    getUsage(),
    getPipelineIntelligence(),
    getActiveSprint(),
  ])

  let sprintProgress: { applications: { current: number; target: number; percent: number }; interviews: { current: number; target: number; percent: number }; skills: { current: number } } | null = null

  if (activeSprint) {
    const progressRes = await getSprintProgress(activeSprint.id)
    if (progressRes.ok && progressRes.progress) {
      sprintProgress = {
        applications: progressRes.progress.applications,
        interviews: progressRes.progress.interviews,
        skills: { current: progressRes.progress.skills.current },
      }
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {!usage.feedbackSubmittedAt && <FeedbackBanner />}
      {activeSprint && sprintProgress && (
        <div className="rounded-xl border border-primary/20 bg-card p-5">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Target className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-heading font-bold">Current Sprint</h3>
              <p className="text-[11px] text-muted-foreground">{activeSprint.name}</p>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">Applications</span>
                <span className="font-medium">{sprintProgress.applications.current}/{sprintProgress.applications.target}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${sprintProgress.applications.percent}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">Interviews</span>
                <span className="font-medium">{sprintProgress.interviews.current}/{sprintProgress.interviews.target}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${sprintProgress.interviews.percent}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">Skills done</span>
                <span className="font-medium">{sprintProgress.skills.current}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-amber-500 transition-all"
                  style={{ width: `${Math.min(100, sprintProgress.skills.current * 10)}%` }}
                />
              </div>
            </div>
          </div>
          <Button asChild variant="outline" size="sm" className="mt-4 w-full">
            <Link href="/dashboard/sprint">View Sprint <Target className="ml-2 h-3.5 w-3.5" /></Link>
          </Button>
        </div>
      )}
      {!activeSprint && (
        <div className="rounded-xl border border-dashed border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Target className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-heading font-bold">Start a 90-Day Sprint</h3>
              <p className="text-[11px] text-muted-foreground">Set goals and stay accountable.</p>
            </div>
          </div>
          <Button asChild size="sm" className="mt-4 w-full">
            <Link href="/dashboard/sprint">
              <Play className="mr-2 h-3.5 w-3.5" /> Start a Sprint
            </Link>
          </Button>
        </div>
      )}
      <UsageCard usage={usage} />
      <PipelineIntelligence intelligence={pipeline} />
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-heading font-bold">Your plan</h3>
        <p className="mt-1 text-2xl font-extrabold text-primary">
          {PLANS[usage.plan].name}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {usage.plan === 'free'
            ? 'Upgrade for more weekly CVs, cover letters and more.'
            : 'Thanks for being a subscriber.'}
        </p>
        <Button asChild variant="outline" size="sm" className="mt-4 w-full">
          <Link href="/dashboard/billing">Manage billing</Link>
        </Button>
      </div>
    </div>
  )
}
