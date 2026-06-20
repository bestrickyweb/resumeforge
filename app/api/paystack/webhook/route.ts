import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { subscription } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

const secret = process.env.PAYSTACK_SECRET_KEY

function verifySignature(body: string, signature: string | null): boolean {
  if (!signature || !secret) return false
  const crypto = require("crypto")
  const hash = crypto.createHmac("sha512", secret).update(body).digest("hex")
  return hash === signature
}

export async function POST(req: Request) {
  const signature = req.headers.get("x-paystack-signature")
  const body = await req.text()

  if (!verifySignature(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  const event = JSON.parse(body)

  if (event.event === "charge.success") {
    const data = event.data
    const reference = data.reference
    const customerId = data.customer?.id
    const authorizationCode = data.authorization?.authorization_code

    if (reference && authorizationCode) {
      const rows = await db
        .select()
        .from(subscription)
        .where(eq(subscription.paystackReference, reference))
        .limit(1)

      if (rows.length > 0) {
        const periodEnd = new Date()
        periodEnd.setMonth(periodEnd.getMonth() + 1)

        await db
          .update(subscription)
          .set({
            status: "active",
            authorizationCode,
            paystackCustomerId: customerId ?? null,
            currentPeriodEnd: periodEnd,
            updatedAt: new Date(),
          })
          .where(eq(subscription.paystackReference, reference))
      }
    }
  }

  if (event.event === "charge.failed") {
    const data = event.data
    const reference = data.reference

    if (reference) {
      await db
        .update(subscription)
        .set({
          status: "past_due",
          updatedAt: new Date(),
        })
        .where(eq(subscription.paystackReference, reference))
    }
  }

  if (event.event === "subscription.not_renewed" || event.event === "subscription.disable") {
    const data = event.data
    const subscriptionCode = data.subscription_code

    if (subscriptionCode) {
      await db
        .update(subscription)
        .set({
          status: "cancelled",
          updatedAt: new Date(),
        })
        .where(eq(subscription.paystackReference, subscriptionCode))
    }
  }

  return NextResponse.json({ received: true })
}