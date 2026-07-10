'use server'

import { db } from '@/lib/db'
import { tailoredCv, application, subscription } from '@/lib/db/schema'
import { getUserId } from '@/lib/session'
import { and, desc, eq, gte, sql } from 'drizzle-orm'
import { unstable_cache } from 'next/cache'
import {
  PLANS,
  PLAN_FEATURE_LIMITS,
  type PlanId,
  type PlanFeatureKey,
  type PlanFeatureLimit,
  type PlanFeatureMap,
  planCvLimit,
} from '@/lib/plans'

export interface UsageInfo {
  plan: PlanId
  status: string
  limit: number
  used: number
  remaining: number
  features: PlanFeatureMap
}

export interface SubscriptionInfo {
  plan: PlanId
  status: string
  authorizationCode: string | null
  paystackCustomerId: string | null
}

export async function getSubscription(userId: string): Promise<SubscriptionInfo> {
  const rows = await db
    .select()
    .from(subscription)
    .where(eq(subscription.userId, userId))
    .limit(1)

  if (rows.length === 0) {
    await db.insert(subscription).values({ userId, plan: 'free' }).onConflictDoNothing()
    return { plan: 'free' as PlanId, status: 'active', authorizationCode: null, paystackCustomerId: null }
  }
  return {
    plan: (rows[0].plan as PlanId) ?? 'free',
    status: rows[0].status,
    authorizationCode: rows[0].authorizationCode,
    paystackCustomerId: rows[0].paystackCustomerId,
  }
}

export async function getUsage(): Promise<UsageInfo> {
  const userId = await getUserId()
  const sub = await getSubscription(userId)
  const plan = (sub.plan as PlanId) ?? 'free'

  const features = await buildFeatureUsage(plan, userId)

  const cv = features.cvTailoring
  return {
    plan,
    status: sub.status,
    limit: cv.limit,
    used: cv.used,
    remaining: cv.remaining,
    features,
  }
}

async function countMonthlyCvs(userId: string, plan: PlanId): Promise<number> {
  if (plan === 'free') {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(tailoredCv)
      .where(eq(tailoredCv.userId, userId))
    return Number(count)
  }

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tailoredCv)
    .where(
      and(
        eq(tailoredCv.userId, userId),
        gte(tailoredCv.createdAt, startOfMonth),
      ),
    )
  return Number(count)
}

async function countApplications(userId: string): Promise<number> {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(application)
    .where(eq(application.userId, userId))
  return Number(count)
}

async function buildFeatureUsage(
  plan: PlanId,
  userId: string,
): Promise<PlanFeatureMap> {
  const plans = PLAN_FEATURE_LIMITS
  const [
    cvCount,
    appCount,
  ] = await Promise.all([
    countMonthlyCvs(userId, plan),
    countApplications(userId),
  ])

  const keys = [
    'cvTailoring',
    'coverLetter',
    'applicationTracker',
    'mockInterview',
    'linkedInOptimizer',
    'achievementsScanner',
    'salaryBenchmarking',
    'followUpReminder',
    'jobFitAnalyzer',
    'jobImport',
    'chromeExtension',
    'skillsGap',
    'interviewCopilot',
    'autoApply',
  ] as const satisfies readonly PlanFeatureKey[]

  const map = {} as PlanFeatureMap
  for (const key of keys) {
    const limit = plans[plan]?.[key] ?? 0
    const used = key === 'cvTailoring'
      ? cvCount
      : key === 'applicationTracker'
        ? appCount
        : 0
    const remaining = limit === Infinity ? Infinity : Math.max(0, limit - used)
    map[key] = { used, limit, remaining }
  }
  return map
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
  return unstable_cache(
    async () => {
      const apps = await db
        .select({ status: application.status })
        .from(application)
        .where(eq(application.userId, userId))

      const byStatus: Record<string, number> = {
        saved: 0,
        applied: 0,
        screen: 0,
        assessment: 0,
        interview: 0,
        offer: 0,
        accepted: 0,
        declined: 0,
        rejected: 0,
      }
      for (const a of apps) {
        byStatus[a.status] = (byStatus[a.status] ?? 0) + 1
      }
      return { total: apps.length, byStatus }
    },
    ['application-stats', userId],
    { revalidate: 60 },
  )()
}

export async function getDashboardStats() {
  const userId = await getUserId()
  return unstable_cache(
    async () => {
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
          (byStatus['saved'] ?? 0) +
          (byStatus['applied'] ?? 0) +
          (byStatus['screen'] ?? 0) +
          (byStatus['assessment'] ?? 0),
      }
    },
    ['dashboard-stats', userId],
    { revalidate: 60 },
  )()
}
