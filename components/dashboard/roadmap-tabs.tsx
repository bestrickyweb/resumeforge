'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, BookOpen, AlertCircle, TrendingUp, FileText } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { bandBadgeClass, bandLabel, interviewBand } from '@/lib/utils'
import { exportRoadmapToPdf } from '@/lib/roadmap-pdf'
import type { CareerRoadmap } from '@/app/actions/roadmap'

type TabKey = 'overview' | 'gaps' | 'timeline' | 'projects'

const TABS = [
  { key: 'overview' as TabKey, label: 'Overview', icon: TrendingUp },
  { key: 'gaps' as TabKey, label: 'Skill Gaps', icon: AlertCircle },
  { key: 'timeline' as TabKey, label: 'Timeline', icon: Calendar },
  { key: 'projects' as TabKey, label: 'Projects', icon: BookOpen },
]

export function RoadmapTabs({ roadmap, hoursPerWeek, showProgress = false, initialProgress, onProgressChange }: {
  roadmap: CareerRoadmap & { id?: number; createdAt?: string; estimatedWeeks?: number | null; completionDate?: string | null }
  hoursPerWeek?: number
  showProgress?: boolean
  initialProgress?: Record<string, 'not_started' | 'in_progress' | 'completed'>
  onProgressChange?: (skillName: string, status: 'not_started' | 'in_progress' | 'completed') => void
}) {
  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const band = interviewBand(roadmap.readinessScore)

  return (
    <div className="space-y-6 rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-heading text-lg font-bold">Your Career Roadmap</h3>
          <p className="text-sm text-muted-foreground">
            {roadmap.summary}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => exportRoadmapToPdf(roadmap, hoursPerWeek)}
          >
            <FileText className="mr-2 h-4 w-4" /> Export PDF
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/dashboard/tailor?jobTitle=${encodeURIComponent(roadmap.targetRole ?? '')}`}>
              <FileText className="mr-2 h-4 w-4" /> Tailor my CV for this role
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Badge className={`${bandBadgeClass[band]} text-sm`}>
          {bandLabel[band]}
        </Badge>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20">
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
              strokeDashoffset={2 * Math.PI * 32 - (roadmap.readinessScore / 100) * 2 * Math.PI * 32}
              className="stroke-primary transition-all"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center font-heading text-xl font-extrabold">
            {roadmap.readinessScore}%
          </span>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Readiness</span>
            <span className="font-medium">
              {roadmap.estimatedWeeks ? `${roadmap.estimatedWeeks} weeks` : 'Timeline TBD'}
              {hoursPerWeek ? ` at ${hoursPerWeek} hrs/week` : ''}
            </span>
          </div>
          <Progress value={roadmap.readinessScore} className="mt-2 h-2" />
          <p className="mt-1 text-xs text-muted-foreground">
            Projected fit after roadmap: {roadmap.timeline?.projectedFitScore ?? roadmap.readinessScore}%
          </p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-border pb-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <OverviewTab roadmap={roadmap} />
      )}

      {activeTab === 'gaps' && (
        <GapsTab roadmap={roadmap} showProgress={showProgress} onProgressChange={onProgressChange} />
      )}

      {activeTab === 'timeline' && (
        <TimelineTab roadmap={roadmap} />
      )}

      {activeTab === 'projects' && (
        <ProjectsTab roadmap={roadmap} />
      )}
    </div>
  )
}

function OverviewTab({ roadmap }: { roadmap: CareerRoadmap & { id?: number; createdAt?: string; estimatedWeeks?: number | null; completionDate?: string | null } }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Matched Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {(roadmap.matchedSkills ?? []).length === 0 ? (
              <span className="text-xs text-muted-foreground">No strong matches detected.</span>
            ) : (
              (roadmap.matchedSkills ?? []).map((s) => (
                <span key={s.name} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                  {s.name}
                </span>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {Object.entries(roadmap.categoryScores ?? {}).map(([cat, score]) => (
            <div key={cat} className="flex items-center justify-between text-sm">
              <span className="capitalize text-muted-foreground">{cat}</span>
              <span className="font-medium">{typeof score === 'number' ? score : 0}%</span>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card className="sm:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Phases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {(roadmap.timeline?.phases ?? []).map((phase, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {phase.name}: Week {phase.startWeek}–{phase.endWeek}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function GapsTab({ roadmap, showProgress, onProgressChange, initialProgress }: {
  roadmap: CareerRoadmap & { id?: number; createdAt?: string; estimatedWeeks?: number | null; completionDate?: string | null }
  showProgress?: boolean
  onProgressChange?: (skillName: string, status: 'not_started' | 'in_progress' | 'completed') => void
  initialProgress?: Record<string, 'not_started' | 'in_progress' | 'completed'>
}) {
  const [localStatus, setLocalStatus] = useState<Record<string, 'not_started' | 'in_progress' | 'completed'>>({})

  useEffect(() => {
    if (initialProgress) {
      setLocalStatus(initialProgress)
    }
  }, [initialProgress])

  async function handleStatusChange(skillName: string, status: 'not_started' | 'in_progress' | 'completed') {
    setLocalStatus((prev) => ({ ...prev, [skillName]: status }))
    onProgressChange?.(skillName, status)
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {(roadmap.missingSkills ?? []).map((gap, i) => {
        const currentStatus = localStatus[gap.name] ?? 'not_started'
        return (
          <Card key={i}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{gap.name}</CardTitle>
                <Badge
                  variant="outline"
                  className={
                    gap.severity === 'critical'
                      ? 'border-destructive text-destructive'
                      : gap.severity === 'important'
                        ? 'border-amber-500 text-amber-600'
                        : 'border-muted-foreground text-muted-foreground'
                  }
                >
                  {gap.severity}
                </Badge>
              </div>
              <CardDescription className="text-xs">{gap.whyItMatters}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" />
                <span>{gap.estimatedHours}h estimated</span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase">{gap.difficulty}</span>
              </div>
              {gap.resources.length > 0 && (
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-foreground">Resources:</span>
                  {gap.resources.map((r, ri) => (
                    <span key={ri} className="pl-1">
                      {r.type}: {r.title}
                      {r.provider ? ` (${r.provider})` : ''}
                    </span>
                  ))}
                </div>
              )}
              {gap.prerequisites.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  <span className="text-foreground">Prereqs:</span>
                  {gap.prerequisites.map((p) => (
                    <Badge key={p} variant="secondary" className="text-[10px]">{p}</Badge>
                  ))}
                </div>
              )}
              {showProgress && (
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={currentStatus === 'in_progress' ? 'default' : 'outline'}
                    onClick={() => handleStatusChange(gap.name, 'in_progress')}
                    className="text-[10px]"
                  >
                    In Progress
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={currentStatus === 'completed' ? 'default' : 'outline'}
                    onClick={() => handleStatusChange(gap.name, 'completed')}
                    className="text-[10px]"
                  >
                    Completed
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function TimelineTab({ roadmap }: { roadmap: CareerRoadmap & { id?: number; createdAt?: string; estimatedWeeks?: number | null; completionDate?: string | null } }) {
  return (
    <div className="space-y-3">
      {(roadmap.timeline?.schedule ?? []).map((item, i) => (
        <div key={i} className="flex items-start gap-4 rounded-xl border border-border bg-background p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            W{item.startWeek}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="font-medium">{item.skill}</p>
              <span className="text-xs text-muted-foreground">
                Week {item.startWeek}–{item.endWeek}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{item.milestone}</p>
            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {item.totalHours}h total
              </span>
              <span>{item.hoursPerWeek} hrs/week</span>
            </div>
          </div>
        </div>
      ))}
      <div className="rounded-xl border border-border bg-muted/40 p-4 text-center text-sm text-muted-foreground">
        Estimated completion: {roadmap.completionDate ? new Date(roadmap.completionDate).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }) : 'TBD'}
        {roadmap.timeline?.isRealistic === false
          ? ' — this exceeds your stated deadline. Consider increasing weekly hours.'
          : ''}
      </div>
    </div>
  )
}

function ProjectsTab({ roadmap }: { roadmap: CareerRoadmap & { id?: number; createdAt?: string; estimatedWeeks?: number | null; completionDate?: string | null } }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {(roadmap.portfolioProjects ?? []).map((project, i) => (
        <Card key={i}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{project.title}</CardTitle>
            <CardDescription className="text-xs">{project.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-muted-foreground">
            <div className="flex flex-wrap gap-1">
              {project.skillsDemonstrated.map((s) => (
                <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
              ))}
            </div>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {project.estimatedHours}h estimated
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
