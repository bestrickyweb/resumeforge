'use server'

import { db } from '@/lib/db'
import { feedback, user } from '@/lib/db/schema'
import { getUserId } from '@/lib/session'
import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const feedbackSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10, 'Please share a little more detail (at least 10 characters).'),
})

export async function submitFeedback(input: { rating: number; comment: string }) {
  const userId = await getUserId()

  const parsed = feedbackSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? 'Invalid feedback.' }
  }

  const { rating, comment } = parsed.data

  try {
    await db.insert(feedback).values({ userId, rating, comment })
    await db
      .update(user)
      .set({ feedbackSubmittedAt: new Date() })
      .where(eq(user.id, userId))

    revalidatePath('/dashboard')
    return { ok: true as const }
  } catch (err) {
    console.log('[v0] submitFeedback error:', err instanceof Error ? err.message : err)
    return { ok: false as const, error: 'Could not submit feedback. Please try again.' }
  }
}
