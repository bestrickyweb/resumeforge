'use server'

import { generateText, Output } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'
import { db } from '@/lib/db'
import { linkedinProfile } from '@/lib/db/schema'
import { getUserId } from '@/lib/session'
import { getUsage } from '@/app/actions/queries'
import { revalidatePath } from 'next/cache'
import { and, eq } from 'drizzle-orm'

const tailorModel = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  ? google('gemini-2.5-flash')
  : 'openai/gpt-5-mini'

const linkedInSchema = z.object({
  headline: z.string(),
  about: z.string(),
  skills: z.array(z.string()),
  suggestions: z.object({
    headline: z.string().describe('Suggested improved headline'),
    about: z.string().describe('Suggested improved about section'),
    skills: z.array(z.string()).describe('Suggested skills to add or emphasize'),
  }),
  score: z.number().max(100).describe('Profile optimization score 0-100'),
})

export type LinkedInOptimizationResult = {
  ok: boolean
  error?: string
  headline?: string
  about?: string
  skills?: string[]
  suggestions?: {
    headline: string
    about: string
    skills: string[]
  }
  score?: number
}

export async function importLinkedInProfile(input: { urlOrText: string }) {
  const userId = await getUserId()

  const text = input.urlOrText.trim()
  if (text.length < 20) {
    return { ok: false as const, error: 'Please provide a longer LinkedIn profile text or URL.' }
  }

  try {
    const { experimental_output } = await generateText({
      model: tailorModel,
      system:
        'You are a LinkedIn profile parser. Extract structured profile data from the provided text. ' +
        'Return the raw extracted headline, about, and skills.',
      prompt: `LINKEDIN PROFILE:\n${text}\n\nExtract headline, about section, and skills.`,
      experimental_output: Output.object({
        schema: z.object({
          headline: z.string(),
          about: z.string(),
          skills: z.array(z.string()),
        }),
      }),
    })

    const parsed = experimental_output

    await db
      .insert(linkedinProfile)
      .values({
        userId,
        rawText: text,
        parsed: JSON.stringify(parsed),
      })
      .onConflictDoUpdate({
        target: linkedinProfile.userId,
        set: {
          rawText: text,
          parsed: JSON.stringify(parsed),
        },
      })

    revalidatePath('/dashboard/profile')
    return {
      ok: true as const,
      headline: parsed.headline,
      about: parsed.about,
      skills: parsed.skills,
    }
  } catch (err) {
    console.log('[v0] importLinkedInProfile error:', err instanceof Error ? err.message : err)
    return { ok: false as const, error: 'Could not parse LinkedIn profile.' }
  }
}

export async function optimizeLinkedInProfile(input: { profileText?: string }) {
  const userId = await getUserId()

  const usage = await getUsage()
  const feature = usage.features.linkedInOptimizer
  if (feature.limit !== Infinity && feature.remaining <= 0) {
    return {
      ok: false as const,
      error:
        usage.plan === 'free'
          ? 'Upgrade your plan to use the LinkedIn optimizer.'
          : 'You have reached your limit for this feature.',
    }
  }

  const [profile] = await db
    .select()
    .from(linkedinProfile)
    .where(eq(linkedinProfile.userId, userId))
    .limit(1)

  if (!profile && !input.profileText) {
    return { ok: false as const, error: 'Please import your LinkedIn profile first.' }
  }

  try {
    const { experimental_output } = await generateText({
      model: tailorModel,
      system:
        'You are a LinkedIn profile coach. Improve the headline, about section, and skills ' +
        'to be more recruiter-friendly while preserving truth.',
      prompt:
        `LINKEDIN PROFILE:\n${profile?.rawText ?? input.profileText}\n\n` +
        'Optimize this profile and return structured JSON with suggestions and a score.',
      experimental_output: Output.object({ schema: linkedInSchema }),
    })

    const out = experimental_output

    await db
      .update(linkedinProfile)
      .set({
        optimizedHeadline: out.suggestions.headline,
        optimizedAbout: out.suggestions.about,
        optimizedSkills: JSON.stringify(out.suggestions.skills),
        scanScore: out.score,
      })
      .where(eq(linkedinProfile.userId, userId))

    revalidatePath('/dashboard/profile')
    return {
      ok: true as const,
      headline: out.suggestions.headline,
      about: out.suggestions.about,
      skills: out.suggestions.skills,
      score: out.score,
    }
  } catch (err) {
    console.log('[v0] optimizeLinkedInProfile error:', err instanceof Error ? err.message : err)
    return { ok: false as const, error: 'Could not optimize LinkedIn profile.' }
  }
}

export async function getLinkedInProfile() {
  const userId = await getUserId()
  const [profile] = await db
    .select()
    .from(linkedinProfile)
    .where(eq(linkedinProfile.userId, userId))
    .limit(1)
  return profile ?? null
}
