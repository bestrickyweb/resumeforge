import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { careerRoadmap, roadmapProgress } from '@/lib/db/schema'
import { getUserId } from '@/lib/session'
import { and, eq, sql, desc } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const userId = await getUserId()
    const rows = await db
      .select({
        id: careerRoadmap.id,
        targetRole: careerRoadmap.targetRole,
        readinessScore: careerRoadmap.readinessScore,
        estimatedWeeks: careerRoadmap.estimatedWeeks,
        hoursPerWeek: careerRoadmap.hoursPerWeek,
        status: careerRoadmap.status,
        createdAt: careerRoadmap.createdAt,
      })
      .from(careerRoadmap)
      .where(eq(careerRoadmap.userId, userId))
      .orderBy(desc(careerRoadmap.createdAt))

    const enriched = await Promise.all(
      rows.map(async (r) => {
        const progress = await db
          .select({
            status: roadmapProgress.status,
            count: sql<number>`count(*)::int`,
          })
          .from(roadmapProgress)
          .where(
            and(
              eq(roadmapProgress.roadmapId, r.id),
              eq(roadmapProgress.userId, userId),
            ),
          )
          .groupBy(roadmapProgress.status)

        const completed = progress.find((p) => p.status === 'completed')?.count ?? 0
        const total = progress.reduce((sum, p) => sum + p.count, 0)

        return { ...r, completedSkills: completed, totalSkills: total }
      }),
    )

    return NextResponse.json({ roadmaps: enriched })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
