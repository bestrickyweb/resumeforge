import Link from 'next/link'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import type { UsageInfo } from '@/app/actions/queries'
import { PLANS } from '@/lib/plans'

export function UsageCard({ usage }: { usage: UsageInfo }) {
  const unlimited = usage.limit === Infinity
  const pct = unlimited
    ? 100
    : Math.min(100, Math.round((usage.used / usage.limit) * 100))

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-bold">CV usage</h3>
        <span className="text-xs text-muted-foreground">
          {usage.plan === 'free' ? 'Lifetime' : 'This month'}
        </span>
      </div>

      {unlimited ? (
        <p className="mt-3 text-2xl font-extrabold text-primary">Unlimited</p>
      ) : (
        <>
          <p className="mt-3 text-sm text-muted-foreground">
            <span className="text-2xl font-extrabold text-foreground">
              {usage.used}
            </span>{' '}
            / {usage.limit} used
          </p>
          <Progress value={pct} className="mt-3 h-2" />
          {usage.remaining <= 0 && (
            <div className="mt-4">
              <p className="text-sm text-destructive">
                You&apos;ve used all your tailored CVs.
              </p>
              <Button asChild size="sm" className="mt-2 w-full">
                <Link href="/dashboard/billing">Upgrade plan</Link>
              </Button>
            </div>
          )}
          {usage.remaining > 0 && usage.plan === 'free' && (
            <p className="mt-2 text-xs text-muted-foreground">
              {usage.remaining} free{' '}
              {usage.remaining === 1 ? 'CV' : 'CVs'} remaining on the{' '}
              {PLANS[usage.plan].name} plan.
            </p>
          )}
        </>
      )}
    </div>
  )
}
