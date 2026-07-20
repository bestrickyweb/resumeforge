'use server'

import { db } from '@/lib/db'
import { reminder, application } from '@/lib/db/schema'
import { getUserId } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import { and, desc, eq, sql } from 'drizzle-orm'
import { getUsage } from '@/app/actions/queries'

export type ReminderRow = {
  id: number
  applicationId: number
  type: string
  scheduledAt: Date
  status: string
}

export async function getReminders() {
  const userId = await getUserId()
  const rows = await db
    .select()
    .from(reminder)
    .where(eq(reminder.userId, userId))
    .orderBy(desc(reminder.scheduledAt))
  return rows as ReminderRow[]
}

export async function setReminder(input: {
  applicationId: number
  type: 'follow_up' | 'ghost_check' | 'interview_prep'
  scheduledAt: string
}) {
  const userId = await getUserId()
  const scheduled = new Date(input.scheduledAt)
  await db.insert(reminder).values({
    userId,
    applicationId: input.applicationId,
    type: input.type,
    scheduledAt: scheduled,
    status: 'pending',
  })
  await db
    .update(application)
    .set({
      nextReminderAt: scheduled,
      lastContactAt: new Date(),
      followUpCount: sql`${application.followUpCount} + 1`,
    })
    .where(eq(application.id, input.applicationId))
    .catch(() => undefined)
  revalidatePath('/dashboard/applications')
  revalidatePath('/dashboard')
  return { ok: true }
}

export async function dismissReminder(id: number) {
  const userId = await getUserId()
  await db
    .update(reminder)
    .set({ status: 'dismissed' })
    .where(and(eq(reminder.id, id), eq(reminder.userId, userId)))
  revalidatePath('/dashboard/applications')
  revalidatePath('/dashboard')
  return { ok: true }
}

export async function getPendingRemindersCount() {
  const userId = await getUserId()
  const now = new Date().toISOString()
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(reminder)
    .where(
      and(
        eq(reminder.userId, userId),
        eq(reminder.status, 'pending'),
        sql`${reminder.scheduledAt} <= ${now}`,
      ),
    )
  return Number(count)
}
