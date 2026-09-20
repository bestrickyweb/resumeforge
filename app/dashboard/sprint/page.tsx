import { PageHeader } from '@/components/dashboard/page-header'
import { SprintDashboard } from '@/components/dashboard/sprint-dashboard'
import { SprintForm } from '@/components/dashboard/sprint-form'
import { getActiveSprint } from '@/app/actions/sprint'
import { getCareerRoadmaps } from '@/app/actions/queries'
import { Target, Sparkles } from 'lucide-react'

export const metadata = { title: 'Career Sprint | ResumeForge' }
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function SprintPage() {
  const sprint = await getActiveSprint()
  const roadmaps = await getCareerRoadmaps()

  let milestones: any[] = []
  if (sprint?.milestoneLog) {
    try {
      milestones = JSON.parse(sprint.milestoneLog)
    } catch { milestones = [] }
  }

  // If no active sprint, show creation UI
  if (!sprint) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
        <PageHeader
          title="90-Day Career Sprint"
          description="Set a 90-day goal, build a milestone plan, and track your progress with weekly check-ins."
        />

        <div className="mt-8 space-y-6">
          {roadmaps.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-heading text-lg font-bold">Based on your roadmaps</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                We found {roadmaps.length} career roadmap{roadmaps.length > 1 ? 's' : ''}. Pick a goal role or create a custom sprint.
              </p>
              <div className="mt-4 space-y-2">
                {roadmaps.slice(0, 3).map((r) => (
                  <button
                    key={r.id}
                    className="flex w-full items-center justify-between rounded-lg border border-border px-4 py-3 text-left transition-colors hover:bg-muted/50"
                  >
                    <div>
                      <p className="font-medium text-sm">{r.targetRole}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.estimatedWeeks ? `${r.estimatedWeeks} weeks` : 'Timeline TBD'} • Readiness {r.readinessScore}%
                      </p>
                    </div>
                    <Sparkles className="h-4 w-4 text-primary" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <SprintInitializer />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
      <PageHeader
        title="Career Sprint"
        description="Track your 90-day goal with weekly check-ins and milestone reviews."
      />
      <div className="mt-8">
        <SprintDashboard sprint={sprint} milestones={milestones} />
      </div>
    </div>
  )
}

function SprintInitializer() {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card p-8">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Target className="h-8 w-8" />
        </div>
        <h3 className="mt-4 font-heading text-xl font-bold">Start your first sprint</h3>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Define your target role, set application and interview goals, and commit to a 90-day plan.
        </p>
        <div className="mt-6 w-full max-w-md">
          <SprintForm />
        </div>
      </div>
    </div>
  )
}
