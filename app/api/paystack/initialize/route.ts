import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/session"
import { PLANS, type PlanId } from "@/lib/plans"

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const secret = process.env.PAYSTACK_SECRET_KEY
  if (!secret) {
    return NextResponse.json(
      { error: "Payments are not configured yet." },
      { status: 500 },
    )
  }

  const { plan } = (await req.json()) as { plan: PlanId }
  if (plan !== "pro" && plan !== "unlimited") {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
  }

  const selected = PLANS[plan]
  const origin = new URL(req.url).origin

  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: user.email,
      amount: selected.priceNgn * 100, // kobo
      currency: "NGN",
      callback_url: `${origin}/api/paystack/verify`,
      metadata: {
        userId: user.id,
        plan,
        cancel_action: `${origin}/dashboard/billing`,
      },
    }),
  })

  const data = await res.json()
  if (!data.status) {
    console.log("[v0] paystack init failed:", data.message)
    return NextResponse.json(
      { error: data.message ?? "Could not start payment" },
      { status: 502 },
    )
  }

  return NextResponse.json({ authorization_url: data.data.authorization_url })
}
