import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { subscription } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { PLANS, type PlanId } from "@/lib/plans"
import { getCurrentUser } from "@/lib/session"

export async function POST(req: Request) {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const secret = process.env.PAYSTACK_SECRET_KEY
  if (!secret) {
    return NextResponse.json(
      { error: "Payments are not configured" },
      { status: 500 },
    )
  }

  const body = await req.json()
  const { plan: targetPlan } = body as { plan: PlanId }

  if (!targetPlan) {
    return NextResponse.json({ error: "Missing plan" }, { status: 400 })
  }

  const userId = currentUser.id

  const subRows = await db
    .select()
    .from(subscription)
    .where(eq(subscription.userId, userId))
    .limit(1)

  const sub = subRows[0]
  if (!sub || !sub.authorizationCode) {
    return NextResponse.json({ error: "No valid payment method on file" }, { status: 400 })
  }

  const plan = PLANS[targetPlan as PlanId]
  if (!plan || plan.priceNgn <= 0) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
  }

  const res = await fetch("https://api.paystack.co/transaction/charge_authorization", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      authorization: sub.authorizationCode,
      email: currentUser.email,
      amount: plan.priceNgn * 100,
      reference: `${userId}_${Date.now()}`,
    }),
  })

  const data = await res.json()

  if (!data.status) {
    return NextResponse.json({ error: data.message ?? "Charge failed" }, { status: 400 })
  }

  const periodEnd = new Date()
  periodEnd.setMonth(periodEnd.getMonth() + 1)

  await db
    .update(subscription)
    .set({
      plan: targetPlan,
      status: "active",
      paystackReference: data.data.reference,
      authorizationCode: data.data.authorization?.authorization_code ?? sub.authorizationCode,
      paystackCustomerId: data.data.customer?.id ?? sub.paystackCustomerId,
      currentPeriodEnd: periodEnd,
      updatedAt: new Date(),
    })
    .where(eq(subscription.userId, userId))

  return NextResponse.json({ success: true })
}