import { getUsage, getPipelineIntelligence } from '@/app/actions/queries'
import { PLANS } from '@/lib/plans'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { UsageCard } from '@/components/dashboard/usage-card'
import { FeedbackBanner } from '@/components/dashboard/feedback-banner'
import { PipelineIntelligence } from '@/components/dashboard/pipeline-intelligence'

export async function OverviewSidebar() {
  const [usage, pipeline] = await Promise.all([
    getUsage(),
    getPipelineIntelligence(),
  ])

  return (
    <div className="flex flex-col gap-6">
      {!usage.feedbackSubmittedAt && <FeedbackBanner />}
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
