import { PageHeader } from '@/components/dashboard/page-header'
import { InterviewStudio } from '@/components/dashboard/interview-studio'
import { JobFitPanel } from '@/components/dashboard/job-fit-panel'
import { RoadmapPanel } from '@/components/dashboard/roadmap-panel'
import { SprintDashboard } from '@/components/dashboard/sprint-dashboard'
import { SprintForm } from '@/components/dashboard/sprint-form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getActiveSprint } from '@/app/actions/sprint'
import { getCareerRoadmaps } from '@/app/actions/queries'
import { Mic, Sparkles, Crosshair, Target } from 'lucide-react'

export const metadata = { title: 'Interview Studio | Tailorvance' }
export const dynamic = 'force-dynamic'
export const revalidate = 0

const VALID_TABS = ['mock-interview', 'job-fit', 'career-roadmap', 'career-sprint'] as const
type ValidTab = (typeof VALID_TABS)[number]

export default async function InterviewStudioPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const params = await searchParams
  const requestedTab = params?.tab ?? 'mock-interview'
  const activeTab = (VALID_TABS as readonly string[]).includes(requestedTab)
    ? (requestedTab as ValidTab)
    : 'mock-interview'

  const [sprint, roadmaps] = await Promise.all([
    getActiveSprint(),
    getCareerRoadmaps(),
  ])

  let milestones: any[] = []
  if (sprint?.milestoneLog) {
    try {
      milestones = JSON.parse(sprint.milestoneLog)
    } catch {
      milestones = []
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
      <PageHeader
        title="Interview Studio"
        description="Practice mock interviews, analyze job fit, build a career roadmap, and run a 90-day career sprint — all in one place."
      />

      <Tabs defaultValue={activeTab} className="mt-8">
        <TabsList className="mb-6 grid w-full grid-cols-4">
          <TabsTrigger value="mock-interview">
            <Mic className="mr-2 h-4 w-4" />
            Mock Interview
          </TabsTrigger>
          <TabsTrigger value="job-fit">
            <Sparkles className="mr-2 h-4 w-4" />
            Job Fit
          </TabsTrigger>
          <TabsTrigger value="career-roadmap">
            <Target className="mr-2 h-4 w-4" />
            Career Roadmap
          </TabsTrigger>
          <TabsTrigger value="career-sprint">
            <Crosshair className="mr-2 h-4 w-4" />
            Career Sprint
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mock-interview">
          <InterviewStudio />
        </TabsContent>

        <TabsContent value="job-fit">
          <JobFitPanel />
        </TabsContent>

        <TabsContent value="career-roadmap">
          <RoadmapPanel />
        </TabsContent>

        <TabsContent value="career-sprint">
          {!sprint ? (
            <div className="space-y-6">
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

              <div className="rounded-xl border border-dashed border-border bg-card p-8">
                <SprintForm />
              </div>
            </div>
          ) : (
            <SprintDashboard sprint={sprint} milestones={milestones} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
