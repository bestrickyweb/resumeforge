"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { PLANS, formatNgn, type PlanId } from "@/lib/plans"
import type { UsageInfo } from "@/app/actions/queries"

export function BillingPlans({ usage }: { usage: UsageInfo }) {
  const params = useSearchParams()
  const router = useRouter()
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null)

  useEffect(() => {
    const status = params.get("status")
    if (!status) return
    if (status === "success") toast.success("Payment successful — your plan is active!")
    else if (status === "failed") toast.error("Payment was not completed.")
    else if (status === "error") toast.error("Something went wrong verifying payment.")
    // clean the url
    router.replace("/dashboard/billing")
  }, [params, router])

  async function upgrade(plan: PlanId) {
    setLoadingPlan(plan)
    try {
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (!res.ok || !data.authorization_url) {
        toast.error(data.error ?? "Could not start checkout")
        setLoadingPlan(null)
        return
      }
      // Open Paystack checkout in a new tab to avoid redirect blocking
      const win = window.open(data.authorization_url, "_blank")
      if (!win) {
        toast.error("Popup was blocked. Please allow popups and try again.")
      }
      setLoadingPlan(null)
    } catch {
      toast.error("Network error. Please try again.")
      setLoadingPlan(null)
    }
  }

  const order: PlanId[] = ["free", "pro", "unlimited"]

  return (
    <div className="grid gap-6 pt-5 lg:grid-cols-3">
      {order.map((id) => {
        const plan = PLANS[id]
        const isCurrent = usage.plan === id
        return (
          <Card
            key={id}
            className={
              plan.highlight
                ? "relative border-primary shadow-sm"
                : "relative"
            }
          >
            {plan.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="gap-1">
                  <Sparkles className="size-3" />
                  Most popular
                </Badge>
              </div>
            )}
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                {isCurrent && <Badge variant="secondary">Current</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">{plan.tagline}</p>
              <div className="flex items-baseline gap-1 pt-2">
                <span className="font-serif text-3xl font-bold">
                  {plan.priceNgn === 0 ? "Free" : formatNgn(plan.priceNgn)}
                </span>
                {plan.priceNgn > 0 && (
                  <span className="text-sm text-muted-foreground">/month</span>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <ul className="space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {id === "free" ? (
                <Button variant="outline" className="w-full" disabled>
                  {isCurrent ? "Your current plan" : "Free forever"}
                </Button>
              ) : isCurrent ? (
                <Button variant="outline" className="w-full" disabled>
                  Active plan
                </Button>
              ) : (
                <Button
                  className="w-full"
                  variant={plan.highlight ? "default" : "outline"}
                  onClick={() => upgrade(id)}
                  disabled={loadingPlan !== null}
                >
                  {loadingPlan === id ? "Redirecting..." : `Upgrade to ${plan.name}`}
                </Button>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
