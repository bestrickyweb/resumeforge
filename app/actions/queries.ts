'use server'

import { db } from '@/lib/db'
import { tailoredCv, application, subscription, user, feedback, careerRoadmap } from '@/lib/db/schema'
import { getUserId } from '@/lib/session'
import { and, desc, eq, gte, sql } from 'drizzle-orm'
import { unstable_cache } from 'next/cache'
import { type InterviewBand } from '@/lib/utils'
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
  feedbackSubmittedAt: Date | null
}

export interface SubscriptionInfo {
  plan: PlanId
  status: string
  authorizationCode: string | null
  paystackCustomerId: string | null
}

export async function getSubscription(userId: string): Promise<SubscriptionInfo> {
  return unstable_cache(
    async () => {
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
    },
    ['subscription', userId],
    { revalidate: 30 },
  )()
}

export async function getUsage(): Promise<UsageInfo> {
  const userId = await getUserId()
  
  return unstable_cache(
    async () => {
      const sub = await getSubscription(userId)
      const plan = (sub.plan as PlanId) ?? 'free'

      const [userRow] = await db
        .select({ feedbackSubmittedAt: user.feedbackSubmittedAt })
        .from(user)
        .where(eq(user.id, userId))
        .limit(1)

      const features = await buildFeatureUsage(plan, userId)

      const cv = features.cvTailoring
      return {
        plan,
        status: sub.status,
        limit: cv.limit,
        used: cv.used,
        remaining: cv.remaining,
        features,
        feedbackSubmittedAt: userRow?.feedbackSubmittedAt ?? null,
      }
    },
    ['usage', userId],
    { revalidate: 30 },
  )()
}

async function countWeeklyCvs(userId: string, plan: PlanId): Promise<number> {
  const now = new Date()
  const day = now.getDay()
  const diffToMonday = day === 0 ? -6 : 1 - day
  const startOfWeek = new Date(now)
  startOfWeek.setHours(0, 0, 0, 0)
  startOfWeek.setDate(startOfWeek.getDate() + diffToMonday)

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tailoredCv)
    .where(
      and(
        eq(tailoredCv.userId, userId),
        gte(tailoredCv.createdAt, startOfWeek),
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

async function countRoadmaps(userId: string): Promise<number> {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(careerRoadmap)
    .where(eq(careerRoadmap.userId, userId))
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
    roadmapCount,
  ] = await Promise.all([
    countWeeklyCvs(userId, plan),
    countApplications(userId),
    countRoadmaps(userId),
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
        : key === 'skillsGap'
          ? roadmapCount
          : 0
    const remaining = limit === Infinity ? Infinity : Math.max(0, limit - used)
    map[key] = { used, limit, remaining }
  }
  return map
}

export async function getTailoredCvs() {
  const userId = await getUserId()
  return unstable_cache(
    async () => {
      return db
        .select({
          id: tailoredCv.id,
          jobTitle: tailoredCv.jobTitle,
          company: tailoredCv.company,
          summary: tailoredCv.summary,
          createdAt: tailoredCv.createdAt,
          keywordMatchPct: tailoredCv.keywordMatchPct,
          matchAfter: tailoredCv.matchAfter,
          interviewBand: tailoredCv.interviewBand,
        })
        .from(tailoredCv)
        .where(eq(tailoredCv.userId, userId))
        .orderBy(desc(tailoredCv.createdAt))
    },
    ['tailored-cvs', userId],
    { revalidate: 15 },
  )()
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
      const byStatus = await db
        .select({
          status: application.status,
          total: sql<number>`count(*)::int`,
        })
        .from(application)
        .where(eq(application.userId, userId))
        .groupBy(application.status)

      const counts: Record<string, number> = {}
      for (const row of byStatus) {
        counts[row.status] = row.total
      }

      const [{ totalCvs }] = await db
        .select({ totalCvs: sql<number>`count(*)::int` })
        .from(tailoredCv)
        .where(eq(tailoredCv.userId, userId))

      const interviews = (counts['interview'] ?? 0) + (counts['offer'] ?? 0) + (counts['accepted'] ?? 0)

      return {
        totalCvs,
        totalApplications: Object.values(counts).reduce((a, b) => a + b, 0),
        interviews,
        inProgress:
          (counts['saved'] ?? 0) +
          (counts['applied'] ?? 0) +
          (counts['screen'] ?? 0) +
          (counts['assessment'] ?? 0),
      }
    },
    ['dashboard-stats', userId],
    { revalidate: 60 },
  )()
}

export interface PipelineConversion {
  band: InterviewBand
  totalApps: number
  interviews: number
  interviewRate: number
}

export async function getPipelineConversion(): Promise<PipelineConversion[]> {
  const userId = await getUserId()
  return unstable_cache(
    async () => {
      const rows = await db
        .select({
          band: sql<string>`COALESCE(${tailoredCv.interviewBand}, 'below-cliff')`,
          totalApps: sql<number>`COUNT(*)`,
          interviews: sql<number>`COUNT(*) FILTER (WHERE ${application.status} IN ('interview', 'offer', 'accepted'))`,
        })
        .from(tailoredCv)
        .innerJoin(
          application,
          and(eq(application.cvId, tailoredCv.id), eq(application.userId, userId)),
        )
        .where(eq(tailoredCv.userId, userId))
        .groupBy(sql`COALESCE(${tailoredCv.interviewBand}, 'below-cliff')`)
        .orderBy(
          sql`CASE WHEN COALESCE(${tailoredCv.interviewBand}, 'below-cliff') = 'strong' THEN 1 WHEN COALESCE(${tailoredCv.interviewBand}, 'below-cliff') = 'competitive' THEN 2 ELSE 3 END`,
        )

      return rows.map((r) => ({
        band: r.band as InterviewBand,
        totalApps: Number(r.totalApps),
        interviews: Number(r.interviews),
        interviewRate:
          r.totalApps > 0 ? Math.round((Number(r.interviews) / Number(r.totalApps)) * 100) : 0,
      }))
    },
    ['pipeline-conversion', userId],
    { revalidate: 300 },
  )()
}

export async function getCareerRoadmaps() {
  const userId = await getUserId()
  return db
    .select()
    .from(careerRoadmap)
    .where(eq(careerRoadmap.userId, userId))
    .orderBy(desc(careerRoadmap.createdAt))
}
