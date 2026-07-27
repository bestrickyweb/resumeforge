import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { careerRoadmap } from '@/lib/db/schema'
import { getUserId } from '@/lib/session'
import { eq, desc } from 'drizzle-orm'

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

    return NextResponse.json({ roadmaps: rows })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
