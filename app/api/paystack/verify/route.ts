import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { subscription } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import type { PlanId } from "@/lib/plans"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const reference = url.searchParams.get("reference")
  const origin = url.origin

  if (!reference) {
    return NextResponse.redirect(`${origin}/dashboard/billing?status=error`)
  }

  const secret = process.env.PAYSTACK_SECRET_KEY
  if (!secret) {
    return NextResponse.redirect(`${origin}/dashboard/billing?status=error`)
  }

  const res = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${secret}` } },
  )
  const data = await res.json()

  if (!data.status || data.data?.status !== "success") {
    return NextResponse.redirect(`${origin}/dashboard/billing?status=failed`)
  }

  const meta = data.data.metadata ?? {}
  const userId: string | undefined = meta.userId
  const plan: PlanId = meta.plan === "unlimited" ? "unlimited" : "pro"

  if (!userId) {
    return NextResponse.redirect(`${origin}/dashboard/billing?status=error`)
  }

  const periodEnd = new Date()
  periodEnd.setMonth(periodEnd.getMonth() + 1)

  await db
    .insert(subscription)
    .values({
      userId,
      plan,
      status: "active",
      paystackReference: reference,
      currentPeriodEnd: periodEnd,
    })
    .onConflictDoUpdate({
      target: subscription.userId,
      set: {
        plan,
        status: "active",
        paystackReference: reference,
        currentPeriodEnd: periodEnd,
        updatedAt: new Date(),
      },
    })

  return NextResponse.redirect(`${origin}/dashboard/billing?status=success`)
}
