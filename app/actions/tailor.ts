'use server'

import { generateText, Output } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'
import { db } from '@/lib/db'
import { tailoredCv, user } from '@/lib/db/schema'
import { getUserId } from '@/lib/session'
import { getUsage } from '@/app/actions/queries'
import { revalidatePath } from 'next/cache'
import { and, eq } from 'drizzle-orm'

// Use a free Gemini key when available (set GOOGLE_GENERATIVE_AI_API_KEY),
// otherwise fall back to the Vercel AI Gateway model string.
const tailorModel = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  ? google('gemini-2.5-flash')
  : 'openai/gpt-5-mini'

const tailorSchema = z.object({
  jobTitle: z.string().describe('The job title extracted from the posting'),
  company: z
    .string()
    .nullable()
    .describe('The hiring company name if present, else null'),
  summary: z
    .string()
    .describe('A 2-3 sentence professional summary tailored to this role'),
  tailoredCv: z
    .string()
    .describe(
      'The full rewritten CV in clean markdown, tailored to the job, preserving the truth of the original experience but reordering, rephrasing and emphasising relevant achievements with quantified impact.',
    ),
  coverLetter: z
    .string()
    .describe('A concise, professional cover letter tailored to the role'),
  keywords: z
    .array(z.string())
    .describe('The key ATS keywords from the job that are now reflected in the CV'),
  matchBefore: z
    .number()
    .describe('Estimated ATS match score (0-100) of the ORIGINAL CV for this job'),
  matchAfter: z
    .number()
    .describe('Estimated ATS match score (0-100) of the TAILORED CV for this job'),
})

export type TailorResult = {
  ok: boolean
  error?: string
  cvId?: number
}

export async function tailorCv(input: {
  jobDescription: string
  originalCv: string
  jobTitleHint?: string
}): Promise<TailorResult> {
  const userId = await getUserId()

  // Enforce usage limits
  const usage = await getUsage()
  const cvRemaining = usage.features.cvTailoring.remaining
  if (cvRemaining !== Infinity && cvRemaining <= 0) {
    return {
      ok: false,
      error:
        usage.plan === 'free'
          ? 'You have used all 3 free tailored CVs. Upgrade to keep going.'
          : 'You have reached your monthly limit. Upgrade your plan for more.',
    }
  }

  const jobDescription = input.jobDescription.trim()
  const originalCv = input.originalCv.trim()

  if (jobDescription.length < 40 || originalCv.length < 40) {
    return {
      ok: false,
      error: 'Please paste a fuller job description and CV (at least a few lines each).',
    }
  }

  try {
    const [userRow] = await db
      .select({ name: user.name })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1)
    const userName = userRow?.name?.trim() || 'User'

    const { experimental_output } = await generateText({
      model: tailorModel,
      system:
        'You are an expert CV writer and career coach for the Nigerian and remote-first job market. ' +
        'You tailor real CVs to specific job descriptions to pass Applicant Tracking Systems (ATS) and impress recruiters. ' +
        'Rules: never fabricate jobs, degrees, or qualifications the candidate does not have. ' +
        'Reorder and rephrase real experience, weave in the exact keywords from the job description naturally, ' +
        'quantify achievements where the original implies them, and use clean, scannable formatting. ' +
        'Be honest in the match scores: a generic untailored CV should usually score between 30-55 before tailoring. ' +
        'CRITICAL FORMATTING RULES: Output the CV as PURE PLAIN TEXT only. ' +
        'NEVER use markdown symbols: no #, ##, ###, ####, **, *, -, >, or any markdown syntax. ' +
        'Use ALL CAPS for section headers (e.g., PROFESSIONAL SUMMARY, WORK EXPERIENCE, SKILLS, EDUCATION). ' +
        'Separate sections with a blank line. ' +
        'Use simple bullet points with a dash (-) or just plain paragraphs. ' +
        'The output must look like a professional plain-text resume that an ATS can parse. ' +
        'Do NOT include any markdown formatting whatsoever.',
      prompt:
        `JOB DESCRIPTION:\n${jobDescription}\n\n` +
        `CANDIDATE'S CURRENT CV:\n${originalCv}\n\n` +
        (input.jobTitleHint ? `The user says the role is: ${input.jobTitleHint}\n\n` : '') +
        'Tailor this CV to the job. Produce the structured output.',
      experimental_output: Output.object({ schema: tailorSchema }),
    })

    const out = experimental_output

    const [row] = await db
      .insert(tailoredCv)
      .values({
        userId,
        userName,
        jobTitle: input.jobTitleHint?.trim() || out.jobTitle || 'Untitled role',
        company: out.company ?? null,
        jobDescription,
        originalCv,
        tailoredCv: out.tailoredCv,
        coverLetter: out.coverLetter,
        summary: out.summary,
        keywords: JSON.stringify(out.keywords ?? []),
        matchBefore: Math.round(out.matchBefore ?? 0),
        matchAfter: Math.round(out.matchAfter ?? 0),
      })
      .returning({ id: tailoredCv.id })

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/cvs')
    revalidatePath(`/dashboard/cvs/${row.id}`)
    return { ok: true, cvId: row.id }
  } catch (err) {
    console.log('[v0] tailorCv error:', err instanceof Error ? err.message : err)
    return {
      ok: false,
      error: 'We could not tailor your CV right now. Please try again in a moment.',
    }
  }
}

export async function deleteTailoredCv(id: number) {
  const userId = await getUserId()
  await db
    .delete(tailoredCv)
    .where(and(eq(tailoredCv.id, id), eq(tailoredCv.userId, userId)))
  revalidatePath('/dashboard/cvs')
}
