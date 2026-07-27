import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { roadmapProgress, careerRoadmap } from '@/lib/db/schema'
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
      .from(roadmapProgress)
      .where(
        and(
          eq(roadmapProgress.roadmapId, roadmapId),
          eq(roadmapProgress.userId, userId),
        ),
      )
      .orderBy(roadmapProgress.createdAt)

    return NextResponse.json({ progress: rows })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await getUserId()
    const { id } = await params
    const roadmapId = Number(id)

    const body = await req.json()
    const { skillName, status, hoursSpent } = body as {
      skillName: string
      status: 'not_started' | 'in_progress' | 'completed'
      hoursSpent?: number
    }

    if (!skillName || !status) {
      return NextResponse.json({ error: 'skillName and status are required' }, { status: 400 })
    }

    const existing = await db
      .select()
      .from(roadmapProgress)
      .where(
        and(
          eq(roadmapProgress.roadmapId, roadmapId),
          eq(roadmapProgress.skillName, skillName),
          eq(roadmapProgress.userId, userId),
        ),
      )
      .limit(1)

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Progress item not found' }, { status: 404 })
    }

    const updates: Record<string, unknown> = { status }
    if (status === 'in_progress' && !existing[0].startedAt) {
      updates.startedAt = new Date()
    }
    if (status === 'completed') {
      updates.completedAt = new Date()
      if (typeof hoursSpent === 'number') {
        updates.hoursSpent = hoursSpent
      }
    }

    await db
      .update(roadmapProgress)
      .set(updates)
      .where(eq(roadmapProgress.id, existing[0].id))

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
