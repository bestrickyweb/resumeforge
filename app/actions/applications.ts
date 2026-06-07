'use server'

import { db } from '@/lib/db'
import { application } from '@/lib/db/schema'
import { getUserId } from '@/lib/session'
import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export const APPLICATION_STATUSES = [
  'saved',
  'applied',
  'interview',
  'offer',
  'rejected',
] as const

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]

export async function createApplication(input: {
  company: string
  role: string
  status?: ApplicationStatus
  jobUrl?: string
  location?: string
  salary?: string
  notes?: string
  cvId?: number
}) {
  const userId = await getUserId()
  if (!input.company.trim() || !input.role.trim()) {
    return { ok: false, error: 'Company and role are required.' }
  }
  await db.insert(application).values({
    userId,
    company: input.company.trim(),
    role: input.role.trim(),
    status: input.status ?? 'saved',
    jobUrl: input.jobUrl?.trim() || null,
    location: input.location?.trim() || null,
    salary: input.salary?.trim() || null,
    notes: input.notes?.trim() || null,
    cvId: input.cvId ?? null,
    appliedAt: input.status === 'applied' ? new Date() : null,
  })
  revalidatePath('/dashboard/tracker')
  revalidatePath('/dashboard')
  return { ok: true }
}

export async function updateApplicationStatus(
  id: number,
  status: ApplicationStatus,
) {
  const userId = await getUserId()
  await db
    .update(application)
    .set({
      status,
      updatedAt: new Date(),
      ...(status === 'applied' ? { appliedAt: new Date() } : {}),
    })
    .where(and(eq(application.id, id), eq(application.userId, userId)))
  revalidatePath('/dashboard/tracker')
  revalidatePath('/dashboard')
}

export async function updateApplication(
  id: number,
  input: {
    company: string
    role: string
    status: ApplicationStatus
    jobUrl?: string
    location?: string
    salary?: string
    notes?: string
  },
) {
  const userId = await getUserId()
  await db
    .update(application)
    .set({
      company: input.company.trim(),
      role: input.role.trim(),
      status: input.status,
      jobUrl: input.jobUrl?.trim() || null,
      location: input.location?.trim() || null,
      salary: input.salary?.trim() || null,
      notes: input.notes?.trim() || null,
      updatedAt: new Date(),
    })
    .where(and(eq(application.id, id), eq(application.userId, userId)))
  revalidatePath('/dashboard/tracker')
  revalidatePath('/dashboard')
  return { ok: true }
}

export async function deleteApplication(id: number) {
  const userId = await getUserId()
  await db
    .delete(application)
    .where(and(eq(application.id, id), eq(application.userId, userId)))
  revalidatePath('/dashboard/tracker')
  revalidatePath('/dashboard')
}
