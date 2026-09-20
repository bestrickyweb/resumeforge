'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckinModal } from '@/components/dashboard/checkin-modal'
import {
  getSprintProgress,
  getActiveSprint,
  submitWeeklyCheckin,
  pauseSprint,
  resumeSprint,
  completeSprint,
} from '@/app/actions/sprint'

function calculateCurrentWeek(startDate: Date, totalWeeks: number): number {
  const now = new Date()
  const diffMs = now.getTime() - startDate.getTime()
  const weeksPassed = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7))
  return Math.max(1, Math.min(totalWeeks, weeksPassed + 1))
}

export function SprintDashboard({ sprint, milestones }: { sprint: Awaited<ReturnType<typeof getActiveSprint>>; milestones: any[] }) {
  const router = useRouter()
  const [progress, setProgress] = useState<any>(null)
  const [showCheckin, setShowCheckin] = useState(false)
  const [currentWeek, setCurrentWeek] = useState(1)
  const [totalWeeks, setTotalWeeks] = useState(12)
  const [lastCheckinDate, setLastCheckinDate] = useState<string | null>(null)
  const [canCheckin, setCanCheckin] = useState(false)

  useEffect(() => {
    if (!sprint) return
    const start = new Date(sprint.startDate)
    const end = new Date(sprint.endDate)
    const total = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7)))
    setTotalWeeks(total)
    setCurrentWeek(calculateCurrentWeek(start, total))
  }, [sprint])

  useEffect(() => {
    if (!sprint) return
    loadProgress()
    loadLastCheckin()
  }, [sprint])

  async function loadProgress() {
    const res = await getSprintProgress(sprint.id)
    if (res.ok) setProgress(res.progress)
  }

  async function loadLastCheckin() {
    try {
      const res = await fetch(`/api/checkins?status=active`)
      // Check via weeklyCheckin table indirectly
      const sprintData = await getActiveSprint()
      if (sprintData?.weeklyCheckins) {
        const checkins = JSON.parse(sprintData.weeklyCheckins)
        if (checkins.length > 0) {
          const last = checkins[checkins.length - 1]
          setLastCheckinDate(last.submittedAt)
          const lastDate = new Date(last.submittedAt)
          const now = new Date()
          const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
          setCanCheckin(diffDays >= 7)
        } else {
          setCanCheckin(true)
        }
      } else {
        setCanCheckin(true)
      }
    } catch { /* ignore */ }
  }

  async function handleCheckinSubmitted() {
    setShowCheckin(false)
    await loadProgress()
    await loadLastCheckin()
    toast.success('Weekly check-in submitted!')
  }

  async function handleCompleteSprint() {
    if (!progress?.allTargetsMet) return
    try {
      await completeSprint(sprint.id)
      toast.success('Sprint completed! Congratulations!')
      router.refresh()
    } catch {
      toast.error('Could not complete sprint')
    }
  }

  if (!sprint) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-2xl font-bold">90-Day Career Sprint</h2>
            <p className="text-muted-foreground">Start your sprint to stay accountable and track progress.</p>
          </div>
        </div>
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="text-3xl">??</span>
            </div>
            <h3 className="mt-4 font-heading text-xl font-bold">No active sprint</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Create a 90-day career sprint to stay on track with your job search goals.
            </p>
            <Button asChild className="mt-6" onClick={() => setShowCheckin(true)}>
              Start a Sprint
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const weeks = Array.from({ length: totalWeeks }, (_, i) => i + 1)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold">{sprint.name}</h2>
          <p className="text-muted-foreground">
{sprint.goalRole} — {sprint.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} —{' '}
            {sprint.endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {sprint.status === 'active' && (
            <>
              <Button variant="outline" size="sm" onClick={async () => { await pauseSprint(sprint.id); router.refresh() }}>Pause</Button>
              <Button variant="outline" size="sm" onClick={() => setShowCheckin(true)} disabled={!canCheckin}>
                Weekly Check-in
              </Button>
            </>
          )}
          {sprint.status === 'paused' && (
            <Button variant="outline" size="sm" onClick={async () => { await resumeSprint(sprint.id); router.refresh() }}>Resume</Button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 shrink-0">
          <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r={32} fill="none" strokeWidth="8" className="stroke-muted" />
            <circle
              cx="40"
              cy="40"
              r={32}
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 32}
              strokeDashoffset={2 * Math.PI * 32 - (currentWeek / totalWeeks) * 2 * Math.PI * 32}
              className="stroke-primary transition-all"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center font-heading text-xl font-extrabold">
            Week {currentWeek}
          </span>
        </div>
        <div>
          <p className="text-lg font-heading font-bold">Week {currentWeek} of {totalWeeks}</p>
          <p className="text-sm text-muted-foreground">
            {sprint.status === 'active' ? 'In progress' : sprint.status === 'paused' ? 'Paused' : 'Completed'}
          </p>
        </div>
      </div>

      {progress && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>{progress.applications.current}/{progress.applications.target}</span>
                  <span className="text-muted-foreground">{progress.applications.percent}%</span>
                </div>
                <Progress value={progress.applications.percent} className="h-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Interviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>{progress.interviews.current}/{progress.interviews.target}</span>
                  <span className="text-muted-foreground">{progress.interviews.percent}%</span>
                </div>
                <Progress value={progress.interviews.percent} className="h-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Skills Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-heading font-extrabold">{progress.skills.current}</p>
                {progress.skills.list.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {progress.skills.list.slice(0, 5).map((s: string) => (
                      <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
                    ))}
                    {progress.skills.list.length > 5 && (
                      <Badge variant="outline" className="text-[10px]">+{progress.skills.list.length - 5}</Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(milestones || []).map((m, i) => {
                  const weekNum = m.week
                  const isPast = weekNum < currentWeek || (weekNum === currentWeek && progress.totalCheckins > 0)
                  const isCompleted = isPast && weekNum < currentWeek
                  return (
                    <div key={i} className="flex items-start gap-4">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        isCompleted ? 'bg-primary text-primary-foreground' : isPast ? 'bg-primary/30 text-primary' : 'bg-muted text-muted-foreground'
                      }`}>
                        {isCompleted ? '\u2713' : weekNum}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{m.title}</p>
                        <p className="text-xs text-muted-foreground">{m.description}</p>
                      </div>
                      <Badge variant={isCompleted ? 'default' : 'outline'} className="text-[10px]">
                        Week {weekNum}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {progress.allTargetsMet && (
            <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-5 text-center">
              <p className="text-lg font-heading font-bold text-green-700 dark:text-green-400">All targets met!</p>
              <p className="text-sm text-green-600 dark:text-green-300 mt-1">Complete your sprint to celebrate your achievement.</p>
              <Button className="mt-4" onClick={handleCompleteSprint}>Complete Sprint</Button>
            </div>
          )}
        </>
      )}

      <CheckinModal
        open={showCheckin}
        onOpenChange={setShowCheckin}
        sprintId={sprint.id}
        sprintStartDate={sprint.startDate}
        currentWeek={currentWeek}
        milestones={milestones}
        onSubmitted={handleCheckinSubmitted}
      />
    </div>
  )
}
