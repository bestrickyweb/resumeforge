import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { careerRoadmap } from '@/lib/db/schema'
import { getUserId } from '@/lib/session'
import { and, eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await getUserId()
    const { id } = await params
    const roadmapId = Number(id)

    const rows = await db
      .select()
      .from(careerRoadmap)
      .where(and(eq(careerRoadmap.id, roadmapId), eq(careerRoadmap.userId, userId)))
      .limit(1)

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const roadmap = rows[0]
    return NextResponse.json({
      roadmap: {
        ...roadmap,
        phases: JSON.parse(roadmap.phases ?? '[]'),
        missingSkills: JSON.parse(roadmap.missingSkills ?? '[]'),
        learningPlan: JSON.parse(roadmap.learningPlan ?? '[]'),
        portfolioProjects: JSON.parse(roadmap.portfolioProjects ?? '[]'),
      },
    })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await getUserId()
    const { id } = await params
    const roadmapId = Number(id)

    const existing = await db
      .select()
      .from(careerRoadmap)
      .where(and(eq(careerRoadmap.id, roadmapId), eq(careerRoadmap.userId, userId)))
      .limit(1)

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await db.delete(careerRoadmap).where(eq(careerRoadmap.id, roadmapId))

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
