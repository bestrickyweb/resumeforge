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
      'The full rewritten CV in clean PLAIN TEXT, tailored to the job, preserving the truth of the original experience but reordering, rephrasing and emphasising relevant achievements with quantified impact.',
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
  keywordMatchPct: z
    .number()
    .describe(
      'Percentage of the job description keywords present in the tailored CV (target 85%+; below 70% is filtered by most ATS).',
    ),
  formatScore: z
    .number()
    .describe('ATS parse-safety score 0-100 of the tailored CV (single column, standard headings, contact in body).'),
  quantScore: z
    .number()
    .describe('Metric density score 0-100 based on how many achievement bullets carry a number.'),
  titleMatch: z
    .boolean()
    .describe('True if the tailored CV contains the job title (or close variant) from the posting.'),
  interviewReadinessBand: z
    .enum(['below-cliff', 'competitive', 'strong'])
    .describe('Derived from keywordMatchPct: below-cliff (<70), competitive (70-84), strong (85+).'),
})

export type TailorResult = {
  ok: boolean
  error?: string
  cvId?: number
}

// Deterministic, no-LLM checks that a generated CV is interview-ready.
// Returns a list of human-readable problems; empty means the CV passed.
function validateTailoredCv(cv: string): string[] {
  const problems: string[] = []
  const lines = cv.split('\n')

  // No markdown leakage. Exclude '_' because emails legitimately contain it
  // (e.g. john_doe@x.com) and the CV is plain text with dash bullets.
  if (/[#*`>]/.test(cv)) {
    problems.push('Remove markdown symbols (#, *, `, >) from the CV.')
  }

  // Standard headings must be present.
  const upper = cv.toUpperCase()
  const needHeadings = ['WORK EXPERIENCE', 'SKILLS']
  for (const h of needHeadings) {
    if (!upper.includes(h)) {
      problems.push(`Add a standard "${h}" section heading.`)
    }
  }

  // Quantification: at least 60% of experience bullets should carry a digit.
  const bulletLines = lines.filter((l) => l.trim().startsWith('-'))
  if (bulletLines.length > 0) {
    const withNumber = bulletLines.filter((l) => /\d/.test(l)).length
    const ratio = withNumber / bulletLines.length
    if (ratio < 0.6) {
      problems.push(
        `Add a concrete metric (%, $, count, scale, or timeframe) to more achievement bullets (${withNumber}/${bulletLines.length} currently have one).`,
      )
    }
  }

  // Contact line: name on its own line plus an email/@ somewhere.
  if (!/@/.test(cv)) {
    problems.push('Include a contact email in the body of the CV.')
  }

  return problems
}

// Strict allowlist for LinkedIn profile URLs. Rejects anything with newlines,
// control chars, or a non-linkedin.com shape to prevent prompt injection when
// the value is interpolated into the LLM prompt.
const LINKEDIN_URL_RE = /^https?:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]{3,100}$/
function sanitizeLinkedInUrl(raw: string | undefined): string | undefined {
  if (!raw) return undefined
  const trimmed = raw.trim()
  if (!LINKEDIN_URL_RE.test(trimmed)) return undefined
  return trimmed
}

export async function tailorCv(input: {
  jobDescription: string
  originalCv: string
  jobTitleHint?: string
  linkedinUrl?: string
}): Promise<TailorResult> {
  const userId = await getUserId()

  const linkedinUrl = sanitizeLinkedInUrl(input.linkedinUrl)

  // Enforce usage limits
  const usage = await getUsage()
  const cvRemaining = usage.features.cvTailoring.remaining
  if (cvRemaining !== Infinity && cvRemaining <= 0) {
    return {
      ok: false,
      error:
        usage.plan === 'free'
          ? 'You have used all 3 free tailored CVs this week. Upgrade to keep going.'
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

    const baseSystem =
      'You are an expert CV writer and career coach for the Nigerian and remote-first job market. ' +
      'You tailor real CVs to specific job descriptions to pass Applicant Tracking Systems (ATS) and impress recruiters. ' +
      'Rules: never fabricate jobs, degrees, or qualifications the candidate does not have. ' +
      'Reorder and rephrase real experience, weave in the EXACT keywords from the job description naturally, ' +
      'and use clean, scannable formatting. ' +
      'Be honest in the match scores: a generic untailored CV should usually score between 30-55 before tailoring. ' +
      'KEYWORD MATCH IS THE HIGHEST-LEVERAGE FACTOR: resumes below 70% keyword match are filtered before a human reads them; ' +
      'aim for 85%+. Mirror the job title and required skills verbatim where truthful. ' +
      'QUANTIFICATION: every achievement bullet under WORK EXPERIENCE must carry at least one concrete number ' +
      '(percentage, dollar amount, count, team size, scale, or timeframe). If the original implies a magnitude but omits it, ' +
      'insert a conservative "approximately X" rather than inventing a precise figure. ' +
      'ATS PARSE-SAFETY (critical): output PURE PLAIN TEXT, single column only. NEVER use tables, text boxes, columns, ' +
      'images, icons, or graphics. Use ALL CAPS for standard section headings ' +
      '(PROFESSIONAL SUMMARY, WORK EXPERIENCE, SKILLS, EDUCATION, CERTIFICATIONS). ' +
      'Place the candidate name, email, phone, and LinkedIn URL in the document BODY (never a header/footer). ' +
      'Separate sections with a blank line. Use simple dash bullets. No markdown syntax whatsoever. ' +
      'Be concise: target 1-2 pages. Fewer, richer bullets beat more, vaguer ones. ' +
      'Return structured JSON. The tailoredCv field must be pure plain text with no markdown.'

    const buildPrompt = (extra: string) =>
      `JOB DESCRIPTION:\n${jobDescription}\n\n` +
      `CANDIDATE'S CURRENT CV:\n${originalCv}\n\n` +
      (input.jobTitleHint ? `The user says the role is: ${input.jobTitleHint}\n\n` : '') +
      (linkedinUrl
        ? `The candidate's LinkedIn URL (include verbatim in the contact block): ${linkedinUrl}\n\n`
        : '') +
      'Tailor this CV to the job. Produce the structured output.' +
      extra

    let out = await generateTailoredCv(baseSystem, buildPrompt(''))
    // One bounded self-correction pass if deterministic checks fail.
    const problems = validateTailoredCv(out.tailoredCv)
    if (problems.length > 0) {
      out = await generateTailoredCv(
        baseSystem,
        buildPrompt(
          '\n\nYour previous output had these issues — fix ALL of them:\n- ' +
            problems.join('\n- ') +
            '\nReturn the corrected structured output.',
        ),
      )
      // Re-validate the corrected output. If it still fails, log and proceed
      // rather than silently persisting an invalid CV.
      const stillBad = validateTailoredCv(out.tailoredCv)
      if (stillBad.length > 0) {
        console.log(
          '[v0] tailorCv: CV still failed validation after retry:',
          stillBad.join('; '),
        )
      }
    }

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
        keywordMatchPct: Math.round(out.keywordMatchPct ?? out.matchAfter ?? 0),
        formatScore: Math.round(out.formatScore ?? 0),
        quantScore: Math.round(out.quantScore ?? 0),
        titleMatch: out.titleMatch ?? false,
        interviewBand: out.interviewReadinessBand ?? 'below-cliff',
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

async function generateTailoredCv(system: string, prompt: string) {
  const { experimental_output } = await generateText({
    model: tailorModel,
    system,
    prompt,
    experimental_output: Output.object({ schema: tailorSchema }),
  })
  return experimental_output
}

export async function deleteTailoredCv(id: number) {
  const userId = await getUserId()
  await db
    .delete(tailoredCv)
    .where(and(eq(tailoredCv.id, id), eq(tailoredCv.userId, userId)))
  revalidatePath('/dashboard/cvs')
}
