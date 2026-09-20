'use server'
import { generateText, Output } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'
import { getUserId } from '@/lib/session'
import { db } from '@/lib/db'
import { referralRequest } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const roastModel = process.env.GOOGLE_GENERATIVE_AI_API_KEY ? google('gemini-2.5-flash') : 'openai/gpt-5-mini'

const referralSchema = z.object({
  connectionMessage: z.string(),
  followUpMessage: z.string(),
  referralAsk: z.string(),
  suggestedReferrerName: z.string(),
})

export type ReferralResult = {
  ok: boolean
  error?: string
  connectionMessage?: string
  followUpMessage?: string
  referralAsk?: string
  suggestedReferrerName?: string
  referralId?: number
}

export async function generateReferralRequest(input: {
  cvText: string
  jobDescription?: string
  targetCompany: string
  referrerName?: string
  referrerRole?: string
  referrerLinkedInUrl?: string
}): Promise<ReferralResult> {
  const userId = await getUserId()

  const cvText = input.cvText.trim()
  if (cvText.length < 40) {
    return { ok: false, error: 'Please provide your CV text.' }
  }

  const targetCompany = input.targetCompany.trim()
  if (!targetCompany) {
    return { ok: false, error: 'Please specify the target company.' }
  }

  const referrerName = input.referrerName?.trim()
  const referrerRole = input.referrerRole?.trim()
  const referrerLinkedInUrl = input.referrerLinkedInUrl?.trim()

  try {
    const { experimental_output } = await generateText({
      model: roastModel,
      system:
        'You are a professional networking expert specializing in referral requests. You craft warm, specific, and compelling referral request messages that increase response rates. You also suggest the best person to ask and why. Return structured JSON only.',
      prompt:
        `CV:\n${cvText}\n\n` +
        `Target Company: ${targetCompany}\n\n` +
        (input.jobDescription ? `Job Description:\n${input.jobDescription}\n\n` : '') +
        (referrerName ? `Existing Referrer Name: ${referrerName}\n\n` : '') +
        (referrerRole ? `Referrer Role: ${referrerRole}\n\n` : '') +
        (referrerLinkedInUrl ? `Referrer LinkedIn: ${referrerLinkedInUrl}\n\n` : '') +
        'Generate a referral request package. Return structured JSON only.',
      experimental_output: Output.object({ schema: referralSchema }),
    })

    const out = experimental_output

    const [row] = await db
      .insert(referralRequest)
      .values({
        userId,
        tailoredCvId: null,
        applicationId: null,
        referrerName: referrerName || out.suggestedReferrerName,
        referrerLinkedInUrl: referrerLinkedInUrl || null,
        referrerRole: referrerRole || null,
        connectionMessage: out.connectionMessage,
        followUpMessage: out.followUpMessage,
        status: 'draft',
      })
      .returning({ id: referralRequest.id })

    return {
      ok: true,
      connectionMessage: out.connectionMessage,
      followUpMessage: out.followUpMessage,
      referralAsk: out.referralAsk,
      suggestedReferrerName: out.suggestedReferrerName,
      referralId: row.id,
    }
  } catch (err) {
    console.log('[v0] generateReferralRequest error:', err instanceof Error ? err.message : err)
    return { ok: false, error: 'Could not generate referral request right now. Please try again.' }
  }
}

export async function updateReferralStatus(id: number, status: string) {
  const userId = await getUserId()
  await db
    .update(referralRequest)
    .set({ status, respondedAt: status === 'responded' ? new Date() : undefined })
    .where(eq(referralRequest.id, id))
}