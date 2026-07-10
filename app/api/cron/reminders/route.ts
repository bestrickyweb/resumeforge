import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { reminder, application } from '@/lib/db/schema'
import { and, eq, lte, sql } from 'drizzle-orm'

// Simple token gate so the endpoint can be called by a scheduler (Vercel Cron,
// GitHub Action, etc.) without exposing it to the public.
const CRON_SECRET = process.env.CRON_SECRET ?? process.env.PAYSTACK_SECRET_KEY ?? ''

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const auth = req.nextUrl.searchParams.get('secret') ?? req.headers.get('authorization') ?? ''
  if (CRON_SECRET && auth !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const due = await db
    .select()
    .from(reminder)
    .where(and(eq(reminder.status, 'pending'), lte(reminder.scheduledAt, now)))

  const processed: number[] = []

  for (const r of due) {
    // Touch the related application so the tracker reflects activity.
    await db
      .update(application)
      .set({ lastContactAt: now })
      .where(eq(application.id, r.applicationId))
      .catch(() => undefined)

    await db
      .update(reminder)
      .set({ status: 'sent', sentAt: now })
      .where(eq(reminder.id, r.id))

    processed.push(r.id)
  }

  return NextResponse.json({ ok: true, processed })
}

// Keep a POST alias for schedulers that prefer it.
export const POST = GET
