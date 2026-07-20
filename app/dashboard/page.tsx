import Link from 'next/link'
import { interviewBand, bandBadgeClass, bandLabel } from '@/lib/utils'
import {
  Sparkles,
  FileText,
  KanbanSquare,
  Trophy,
  ArrowRight,
  Plus,
  BarChart3,
} from 'lucide-react'
import { PageHeader } from '@/components/dashboard/page-header'
import { UsageCard } from '@/components/dashboard/usage-card'
import { Button } from '@/components/ui/button'
import { getSessionUser } from '@/lib/session'
import { getDashboardStats, getUsage, getTailoredCvs, getPipelineConversion } from '@/app/actions/queries'
import { PLANS } from '@/lib/plans'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function PipelineConversionCard({
  conversion,
}: {
  conversion: { band: string; totalApps: number; interviews: number; interviewRate: number }[]
}) {
  const hasData = conversion.length > 0
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
          <BarChart3 className="h-4 w-4" />
        </span>
        <div>
          <h3 className="font-heading font-bold">Your interview forecast</h3>
          <p className="text-[11px] text-muted-foreground">
            Based on CV-linked tracked applications only
          </p>
        </div>
      </div>
      {hasData ? (
        <div className="mt-4 space-y-2.5">
          {conversion.map((row) => (
            <div key={row.band} className="flex items-center justify-between gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${bandBadgeClass[row.band as 'below-cliff' | 'competitive' | 'strong']}`}
              >
                {bandLabel[row.band as 'below-cliff' | 'competitive' | 'strong']}
              </span>
              <span className="text-xs text-muted-foreground">
                {row.totalApps} app{row.totalApps === 1 ? '' : 's'} → {row.interviews} interview
                {row.interviews === 1 ? '' : 's'} ({row.interviewRate}%)
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-xs text-muted-foreground">
          No tracked outcomes yet — track applications from your CVs to build your forecast.
        </p>
      )}
    </div>
  )
}

export default async function DashboardOverview() {
  const [user, stats, usage, cvs, conversion] = await Promise.all([
    getSessionUser(),
    getDashboardStats(),
    getUsage(),
    getTailoredCvs(),
    getPipelineConversion(),
  ])

  const firstName = user?.name?.split(' ')[0] ?? 'there'
  const recent = cvs.slice(0, 4)

  const tiles = [
    { label: 'Tailored CVs', value: stats.totalCvs, icon: FileText },
    { label: 'Applications', value: stats.totalApplications, icon: KanbanSquare },
    { label: 'Interviews & offers', value: stats.interviews, icon: Trophy },
    { label: 'In progress', value: stats.inProgress, icon: Sparkles },
  ]

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Tailor a CV, track your applications, and land more interviews."
        action={
          <Button asChild>
            <Link href="/dashboard/tailor">
              <Sparkles className="mr-2 h-4 w-4" /> Tailor a CV
            </Link>
          </Button>
        }
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => (
          <div
            key={t.label}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t.label}</span>
              <t.icon className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-2 font-heading text-3xl font-extrabold">
              {t.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="font-heading font-bold">Recent CVs</h2>
              <Link
                href="/dashboard/cvs"
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {recent.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <FileText className="h-6 w-6" />
                </span>
                <p className="mt-4 font-medium">No tailored CVs yet</p>
                <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                  Paste a job description and your CV to get an ATS-optimized
                  version in seconds.
                </p>
                <Button asChild className="mt-5">
                  <Link href="/dashboard/tailor">
                    <Plus className="mr-2 h-4 w-4" /> Tailor your first CV
                  </Link>
                </Button>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {recent.map((cv) => (
                  <li key={cv.id}>
                    <Link
                      href={`/dashboard/cvs/${cv.id}`}
                      className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-muted/50"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">{cv.jobTitle}</p>
                        <p className="truncate text-sm text-muted-foreground">
                          {cv.company || 'Tailored CV'} Â·{' '}
                          {new Date(cv.createdAt).toLocaleDateString('en-NG', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </p>
                      </div>
                      <span className="flex shrink-0 items-center gap-1.5">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${bandBadgeClass[interviewBand(cv.keywordMatchPct ?? cv.matchAfter)]}`}
                        >
                          {bandLabel[interviewBand(cv.keywordMatchPct ?? cv.matchAfter)]}
                        </span>
                        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                          {cv.matchAfter}% match
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <UsageCard usage={usage} />
          <PipelineConversionCard conversion={conversion} />
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-heading font-bold">Your plan</h3>
            <p className="mt-1 text-2xl font-extrabold text-primary">
              {PLANS[usage.plan].name}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {usage.plan === 'free'
                ? 'Upgrade for monthly CVs and cover letters.'
                : 'Thanks for being a subscriber.'}
            </p>
            <Button asChild variant="outline" size="sm" className="mt-4 w-full">
              <Link href="/dashboard/billing">Manage billing</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

