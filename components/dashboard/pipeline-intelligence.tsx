'use client'

import Link from 'next/link'
import { Fragment } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Award,
  BarChart3,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  bandBadgeClass,
  bandLabel,
  type InterviewBand,
} from '@/lib/utils'

type FunnelStage =
  | 'saved'
  | 'applied'
  | 'screen'
  | 'assessment'
  | 'interview'
  | 'offer'
  | 'accepted'
  | 'declined'
  | 'rejected'

type PipelineIntelligenceData = {
  funnel: Record<FunnelStage, number>
  funnelRates: {
    appliedToScreen: number
    screenToInterview: number
    interviewToOffer: number
  }
  bandBreakdown: {
    band: InterviewBand
    totalApps: number
    interviews: number
    interviewRate: number
    offerRate: number
  }[]
  dropOffReasons: {
    stage: string
    count: number
    likelyCause: string
  }[]
  topPerformingCv: {
    id: number
    jobTitle: string
    keywordMatchPct: number
    interviewRate: number
  } | null
  predictedApplicationsForNextInterview: number | null
}

const funnelStages: {
  key: Exclude<FunnelStage, 'accepted' | 'declined' | 'rejected'>
  label: string
  tone: string
}[] = [
  { key: 'saved', label: 'Saved', tone: 'bg-muted text-muted-foreground' },
  { key: 'applied', label: 'Applied', tone: 'bg-secondary text-secondary-foreground' },
  { key: 'screen', label: 'Screen', tone: 'bg-accent/15 text-accent-foreground' },
  { key: 'assessment', label: 'Assessment', tone: 'bg-accent/15 text-accent-foreground' },
  { key: 'interview', label: 'Interview', tone: 'bg-primary/15 text-primary' },
  { key: 'offer', label: 'Offer', tone: 'bg-primary/15 text-primary' },
]

const bandProgressClass: Record<InterviewBand, string> = {
  'below-cliff': '[&_[data-slot=progress-indicator]]:bg-destructive',
  competitive: '[&_[data-slot=progress-indicator]]:bg-amber-500',
  strong: '[&_[data-slot=progress-indicator]]:bg-primary',
}

const causeClass: Record<string, string> = {
  'low keyword match': 'bg-destructive/10 text-destructive',
  'format issues': 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  unknown: 'bg-muted text-muted-foreground',
}

function conversionRate(funnel: Record<FunnelStage, number>, from: FunnelStage, to: FunnelStage): number {
  const source = funnel[from]
  return source > 0 ? Math.round((funnel[to] / source) * 100) : 0
}

function rateLabel(value: number | null): string {
  return value === null ? '—' : `${value}%`
}

function FunnelSection({ data }: { data: PipelineIntelligenceData }) {
  const maxCount = Math.max(
    1,
    ...funnelStages.map(({ key }) => data.funnel[key]),
  )
  const transitionRates: Record<string, number | undefined> = {
    'applied-screen': data.funnelRates.appliedToScreen,
    'screen-interview': data.funnelRates.screenToInterview,
    'interview-offer': data.funnelRates.interviewToOffer,
  }

  return (
    <Card className="rounded-2xl border-border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <BarChart3 className="h-4 w-4" />
          </span>
          <div>
            <h3 className="font-heading text-lg font-bold">Application funnel</h3>
            <p className="text-xs text-muted-foreground">
              Current application status and stage-to-stage conversion
            </p>
          </div>
        </div>
        <Badge variant="outline" className="shrink-0">
          {data.funnel.applied + data.funnel.screen + data.funnel.assessment + data.funnel.interview + data.funnel.offer} active
        </Badge>
      </div>

      <div className="mt-5 flex items-stretch gap-2 overflow-x-auto pb-2">
        {funnelStages.map((stage, index) => {
          const nextStage = funnelStages[index + 1]
          const rate = nextStage
            ? transitionRates[`${stage.key}-${nextStage.key}`] ??
              conversionRate(data.funnel, stage.key, nextStage.key)
            : null

          return (
            <Fragment key={stage.key}>
              <div className="min-w-28 flex-1 rounded-xl border border-border bg-background p-3">
                <div className="flex items-center justify-between gap-2">
                  <Badge className={`${stage.tone} rounded-full px-2 py-0.5 text-[10px] font-semibold`}>
                    {stage.label}
                  </Badge>
                  <span className="font-heading text-xl font-extrabold tabular-nums">
                    {data.funnel[stage.key]}
                  </span>
                </div>
                <Progress
                  value={(data.funnel[stage.key] / maxCount) * 100}
                  className="mt-3 h-1.5"
                />
              </div>
              {nextStage && (
                <div className="flex w-10 shrink-0 flex-col items-center justify-center gap-1" aria-label={`${stage.label} to ${nextStage.label} conversion`}>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-[10px] font-semibold text-muted-foreground tabular-nums">
                    {rateLabel(rate)}
                  </span>
                </div>
              )}
            </Fragment>
          )
        })}
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">
        Percentages show the share of the previous stage represented by the next stage.
      </p>
    </Card>
  )
}

function BandPerformance({ data }: { data: PipelineIntelligenceData }) {
  return (
    <Card className="rounded-2xl border-border bg-card p-5">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <BarChart3 className="h-4 w-4" />
          </span>
          <div>
            <h3 className="font-heading text-lg font-bold">Band performance</h3>
            <p className="text-xs text-muted-foreground">
              Interview and offer rates by CV match band
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.bandBreakdown.map((row) => (
          <div key={row.band} className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Badge className={`${bandBadgeClass[row.band]} rounded-full px-2 py-0.5 text-[10px] font-semibold`}>
                {bandLabel[row.band]}
              </Badge>
              <span className="text-right text-[11px] text-muted-foreground tabular-nums">
                {row.interviews}/{row.totalApps} interviews · {row.offerRate}% offers
              </span>
            </div>
            <Progress
              value={row.interviewRate}
              className={bandProgressClass[row.band]}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function DropOffDiagnosis({ data }: { data: PipelineIntelligenceData }) {
  return (
    <Card className="rounded-2xl border-border bg-card p-5">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-4 w-4" />
          </span>
          <div>
            <h3 className="font-heading text-lg font-bold">Drop-off diagnosis</h3>
            <p className="text-xs text-muted-foreground">
              Where applications stop progressing and the likely CV cause
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {data.dropOffReasons.length > 0 ? (
          <ul className="space-y-2.5">
            {data.dropOffReasons.map((reason, index) => (
              <li key={`${reason.stage}-${index}`} className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
                <Badge className={`${causeClass[reason.likelyCause] ?? causeClass.unknown} shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold`}>
                  {reason.likelyCause}
                </Badge>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{reason.stage}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {reason.count} application{reason.count === 1 ? '' : 's'} did not progress
                  </p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex items-center gap-3 rounded-xl border border-border bg-background p-4 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            No stage drop-offs detected yet.
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function TopPerformingCv({ cv }: { cv: PipelineIntelligenceData['topPerformingCv'] }) {
  return (
    <Card className="rounded-2xl border-border bg-card p-5">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Award className="h-4 w-4" />
          </span>
          <div>
            <h3 className="font-heading text-lg font-bold">Top performing CV</h3>
            <p className="text-xs text-muted-foreground">
              Best interview rate from CV-linked applications
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {cv ? (
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-heading text-base font-bold">{cv.jobTitle}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-[10px] font-semibold">
                  {cv.keywordMatchPct}% keyword match
                </Badge>
                <Badge className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  {cv.interviewRate}% interview rate
                </Badge>
              </div>
            </div>
            <Button asChild variant="outline" size="sm" className="shrink-0">
              <Link href={`/dashboard/cvs/${cv.id}`}>
                View <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-background p-4 text-sm text-muted-foreground">
            <Award className="h-4 w-4 text-muted-foreground" />
            Track applications against a tailored CV to identify your strongest performer.
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ForecastCard({ data }: { data: PipelineIntelligenceData }) {
  const forecast = data.predictedApplicationsForNextInterview

  return (
    <Card className="rounded-2xl border-border bg-card p-5">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <TrendingUp className="h-4 w-4" />
          </span>
          <div>
            <h3 className="font-heading text-lg font-bold">Interview forecast</h3>
            <p className="text-xs text-muted-foreground">
              Based on your current application conversion rate
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <span className="font-heading text-4xl font-extrabold tabular-nums">
            {forecast === null ? '—' : `~${forecast}`}
          </span>
          <span className="text-xs text-muted-foreground">applications per interview</span>
        </div>
        <p className="mt-3 text-sm font-medium">
          {forecast === null
            ? 'Track applications and outcomes to generate your forecast.'
            : `At your current rate, expect ~${forecast} applications per interview`}
        </p>
      </CardContent>
    </Card>
  )
}

export function PipelineIntelligence({
  intelligence,
}: {
  intelligence: PipelineIntelligenceData
}) {
  return (
    <div className="space-y-6">
      <FunnelSection data={intelligence} />

      <div className="grid gap-4 lg:grid-cols-2">
        <BandPerformance data={intelligence} />
        <DropOffDiagnosis data={intelligence} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TopPerformingCv cv={intelligence.topPerformingCv} />
        <ForecastCard data={intelligence} />
      </div>
    </div>
  )
}
