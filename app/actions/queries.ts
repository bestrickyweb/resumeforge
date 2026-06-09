'use server'

import { db } from '@/lib/db'
import { tailoredCv, application, subscription } from '@/lib/db/schema'
import { getUserId } from '@/lib/session'
import { and, desc, eq, gte, sql } from 'drizzle-orm'
import { PLANS, type PlanId, planCvLimit } from '@/lib/plans'

export interface UsageInfo {
  plan: PlanId
  status: string
  limit: number // Infinity allowed
  used: number
  remaining: number // Infinity allowed
}

export async function getSubscription(userId: string) {
  const rows = await db
    .select()
    .from(subscription)
    .where(eq(subscription.userId, userId))
    .limit(1)

  if (rows.length === 0) {
    await db.insert(subscription).values({ userId, plan: 'free' }).onConflictDoNothing()
    return { plan: 'free' as PlanId, status: 'active' }
  }
  return {
    plan: (rows[0].plan as PlanId) ?? 'free',
    status: rows[0].status,
  }
}

export async function getUsage(): Promise<UsageInfo> {
  const userId = await getUserId()
  const sub = await getSubscription(userId)
  const limit = planCvLimit(sub.plan)

  // Count CVs generated in the current calendar month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tailoredCv)
    .where(
      and(
        eq(tailoredCv.userId, userId),
        sub.plan === 'free'
          ? sql`true`
          : gte(tailoredCv.createdAt, startOfMonth),
      ),
    )

  const used = Number(count)
  return {
    plan: sub.plan,
    status: sub.status,
    limit,
    used,
    remaining: limit === Infinity ? Infinity : Math.max(0, limit - used),
  }
}

export async function getTailoredCvs() {
  const userId = await getUserId()
  return db
    .select()
    .from(tailoredCv)
    .where(eq(tailoredCv.userId, userId))
    .orderBy(desc(tailoredCv.createdAt))
}

export async function getTailoredCvById(id: number) {
  let userId: string
  try {
    userId = await getUserId()
  } catch {
    return null
  }
  const rows = await db
    .select()
    .from(tailoredCv)
    .where(and(eq(tailoredCv.id, id), eq(tailoredCv.userId, userId)))
    .limit(1)
  return rows[0] ?? null
}

export async function getPreviousCvText(): Promise<string | null> {
  const userId = await getUserId()
  const rows = await db
    .select({ originalCv: tailoredCv.originalCv })
    .from(tailoredCv)
    .where(eq(tailoredCv.userId, userId))
    .orderBy(desc(tailoredCv.createdAt))
    .limit(1)

  return rows[0]?.originalCv ?? null
}

export async function getApplications() {
  const userId = await getUserId()
  return db
    .select()
    .from(application)
    .where(eq(application.userId, userId))
    .orderBy(desc(application.updatedAt))
}

export async function getApplicationStats() {
  const userId = await getUserId()
  const apps = await db
    .select({ status: application.status })
    .from(application)
    .where(eq(application.userId, userId))

  const byStatus: Record<string, number> = {
    saved: 0,
    applied: 0,
    interview: 0,
    offer: 0,
    rejected: 0,
  }
  for (const a of apps) {
    byStatus[a.status] = (byStatus[a.status] ?? 0) + 1
  }
  return { total: apps.length, byStatus }
}

export async function getDashboardStats() {
  const userId = await getUserId()
  const apps = await db
    .select()
    .from(application)
    .where(eq(application.userId, userId))

  const cvs = await db
    .select({ id: tailoredCv.id })
    .from(tailoredCv)
    .where(eq(tailoredCv.userId, userId))

  const byStatus = apps.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1
    return acc
  }, {})

  const interviews = (byStatus['interview'] ?? 0) + (byStatus['offer'] ?? 0)

  return {
    totalCvs: cvs.length,
    totalApplications: apps.length,
    interviews,
    inProgress:
      (byStatus['saved'] ?? 0) + (byStatus['applied'] ?? 0),
  }
}
