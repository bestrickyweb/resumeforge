import { db } from '@/lib/db'
import { usageEvent } from '@/lib/db/schema'
import { and, eq, gte, sql } from 'drizzle-orm'
import type { PlanFeatureKey, PlanId } from '@/lib/plans'

// Kept out of a 'use server' file on purpose: anything exported from one is a
// publicly callable endpoint.

// Free limits reset every Monday (matches the "per week" pricing copy);
// paid limits reset on the 1st of each calendar month.
export function usagePeriodStart(plan: PlanId, now = new Date()): Date {
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  if (plan === 'free') {
    const day = start.getDay()
    start.setDate(start.getDate() + (day === 0 ? -6 : 1 - day))
  } else {
    start.setDate(1)
  }
  return start
}

export async function recordUsage(userId: string, feature: PlanFeatureKey) {
  try {
    await db.insert(usageEvent).values({ userId, feature })
  } catch (err) {
    // Never fail the user's request because metering failed (e.g. the
    // usage_event migration has not been applied yet).
    console.error('recordUsage failed:', err instanceof Error ? err.message : err)
  }
}

export async function countUsageEvents(
  userId: string,
  since: Date,
): Promise<Partial<Record<PlanFeatureKey, number>>> {
  try {
    const rows = await db
      .select({ feature: usageEvent.feature, count: sql<number>`count(*)::int` })
      .from(usageEvent)
      .where(and(eq(usageEvent.userId, userId), gte(usageEvent.createdAt, since)))
      .groupBy(usageEvent.feature)
    return Object.fromEntries(rows.map((r) => [r.feature, Number(r.count)]))
  } catch (err) {
    console.error('countUsageEvents failed:', err instanceof Error ? err.message : err)
    return {}
  }
}
