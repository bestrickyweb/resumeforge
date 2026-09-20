import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/dashboard/page-header'
import { SprintDashboard } from '@/components/dashboard/sprint-dashboard'
import { getActiveSprint, createSprint } from '@/app/actions/sprint'
import { getCareerRoadmaps } from '@/app/actions/queries'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
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

async function SprintInitializer() {
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
        <form className="mt-6 w-full max-w-md space-y-4">
          <SprintForm />
        </form>
      </div>
    </div>
  )
}

async function SprintForm() {
  return (
    <form action={handleCreateSprint}>
      <div className="space-y-1.5">
        <label htmlFor="goalRole" className="text-sm font-medium">Target role</label>
          <input
            id="goalRole"
            name="goalRole"
            required
            placeholder="e.g. Product Manager"
            className="flex h-9 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <label htmlFor="durationWeeks" className="text-sm font-medium">Duration (weeks)</label>
          <input
            id="durationWeeks"
            name="durationWeeks"
            type="number"
            min={4}
            max={24}
            defaultValue={12}
            className="flex h-9 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="targetApplications" className="text-sm font-medium">Target applications</label>
          <input
            id="targetApplications"
            name="targetApplications"
            type="number"
            min={1}
            defaultValue={10}
            className="flex h-9 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="targetInterviews" className="text-sm font-medium">Target interviews</label>
          <input
            id="targetInterviews"
            name="targetInterviews"
            type="number"
            min={1}
            defaultValue={3}
            className="flex h-9 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm"
          />
        </div>
      </div>
      <Button type="submit" className="w-full">
        Start Sprint
      </Button>
    </form>
  )
}

async function handleCreateSprint(formData: FormData) {
  'use server'
  const goalRole = formData.get('goalRole') as string
  const targetApplications = parseInt(formData.get('targetApplications') as string) || 10
  const targetInterviews = parseInt(formData.get('targetInterviews') as string) || 3
  const durationWeeks = parseInt(formData.get('durationWeeks') as string) || 12

  await createSprint({ goalRole, durationWeeks, targetApplications, targetInterviews })
  const { revalidatePath } = await import('next/cache')
  revalidatePath('/dashboard/sprint')
  revalidatePath('/dashboard')
}
