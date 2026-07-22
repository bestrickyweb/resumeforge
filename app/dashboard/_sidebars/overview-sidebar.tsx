import { getUsage, getPipelineConversion } from '@/app/actions/queries'
import { PLANS } from '@/lib/plans'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { BarChart3 } from 'lucide-react'
import { UsageCard } from '@/components/dashboard/usage-card'
import { FeedbackBanner } from '@/components/dashboard/feedback-banner'
import { bandBadgeClass, bandLabel } from '@/lib/utils'

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

export async function OverviewSidebar() {
  const [usage, conversion] = await Promise.all([
    getUsage(),
    getPipelineConversion(),
  ])

  return (
    <div className="flex flex-col gap-6">
      {!usage.feedbackSubmittedAt && <FeedbackBanner />}
      <UsageCard usage={usage} />
      <PipelineConversionCard conversion={conversion} />
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
