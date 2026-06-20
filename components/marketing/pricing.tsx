import Link from 'next/link'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PLANS, formatNgn } from '@/lib/plans'
import { cn } from '@/lib/utils'

export function Pricing() {
  const plans = [PLANS.free, PLANS.pro, PLANS.unlimited]

  return (
    <section id="pricing" className="mx-auto max-w-6xl px-4 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
          Pricing
        </p>
        <h3 className="mt-2 text-balance font-heading text-3xl font-extrabold tracking-tight md:text-4xl">
          Priced for Nigerian job seekers
        </h3>
        <p className="mt-3 text-pretty text-muted-foreground">
          Start free. Upgrade only when you are applying seriously. Pay securely
          with Paystack — card, bank transfer or USSD.
        </p>
      </div>

      <div className="mt-12 grid items-start gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={cn(
              'flex flex-col rounded-2xl border bg-card p-7',
              plan.highlight
                ? 'border-primary shadow-xl ring-1 ring-primary md:-mt-3 md:pb-10'
                : 'border-border',
            )}
          >
            {plan.highlight && (
              <span className="mb-4 inline-flex w-fit rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                Most popular
              </span>
            )}
            <h3 className="font-heading text-lg font-bold">{plan.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>
            <div className="mt-5 flex items-end gap-1">
              <span className="font-heading text-4xl font-extrabold">
                {plan.priceNgn === 0 ? 'Free' : formatNgn(plan.priceNgn)}
              </span>
              {plan.priceNgn > 0 && (
                <span className="mb-1 text-sm text-muted-foreground">
                  /month
                </span>
              )}
            </div>

            <ul className="mt-6 flex flex-1 flex-col gap-3">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="text-foreground/85">{f}</span>
                </li>
              ))}
            </ul>

            <Button
              asChild
              size="lg"
              variant={plan.highlight ? 'default' : 'outline'}
              className="mt-7"
            >
              <Link href="/sign-up">
                {plan.priceNgn === 0 ? 'Start free' : `Choose ${plan.name}`}
              </Link>
            </Button>
          </div>
        ))}
      </div>
    </section>
  )
}
