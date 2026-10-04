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
import { getTemplate, DEFAULT_TEMPLATE_SLUG } from '@/lib/resume-templates'
import { scanResumeQuality, type ResumeScanResult } from '@/app/actions/resume-scan'

const buildModel = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  ? google('gemini-2.5-flash')
  : 'openai/gpt-5-mini'

const buildSchema = z.object({
  summary: z
    .string()
    .describe(
      'A tight, scannable professional summary (2-3 sentences max) highlighting the target role, core expertise, and top quantified achievement.',
    ),
  builtCv: z
    .string()
    .describe(
      'The full resume in clean PLAIN TEXT, ATS-safe, following Google/Meta best practices. Reverse chronological work experience, quantified achievement bullets, action verbs, CAR format. Single column, no tables/images/markdown. Standard ALL CAPS headings.',
    ),
  keywords: z
    .array(z.string())
    .describe('Top 8-12 hard skills and keywords tailored to the target role for ATS matching.'),
  matchScore: z
    .number()
    .describe('Overall quality/ATS-readiness score 0-100. Be honest: most freshly built CVs score 75-90 after polishing.'),
  formatScore: z
    .number()
    .describe('ATS parse-safety score 0-100 (standard headings, contact in body, single column, plain text).'),
  quantScore: z
    .number()
    .describe('Metric density score 0-100 based on how many achievement bullets carry concrete numbers.'),
})

export type BuildResumeResult = {
  ok: boolean
  error?: string
  cvId?: number
  builtCv?: string
  scan?: ResumeScanResult['scan']
  templateUsed?: string
}

function validateBuiltCv(cv: string): string[] {
  const problems: string[] = []
  const upper = cv.toUpperCase()

  if (/[#*`>]/.test(cv)) {
    problems.push('Remove markdown symbols (#, *, `, >) from the CV.')
  }

  const needHeadings = ['WORK EXPERIENCE', 'SKILLS']
  for (const h of needHeadings) {
    if (!upper.includes(h)) {
      problems.push(`Add a standard "${h}" section heading.`)
    }
  }

  const bulletLines = cv.split('\n').filter((l) => l.trim().startsWith('-'))
  if (bulletLines.length > 0) {
    const withNumber = bulletLines.filter((l) => /\d/.test(l)).length
    const ratio = withNumber / bulletLines.length
    if (ratio < 0.5) {
      problems.push(
        `Add concrete numbers to more achievement bullets (${withNumber}/${bulletLines.length} currently have one).`,
      )
    }
  }

  if (!/@/.test(cv)) {
    problems.push('Include a contact email in the body of the CV.')
  }

  return problems
}

export async function buildResume(input: {
  targetRole: string
  yearsOfExperience: number
  industry: string
  previousCv?: string
  achievements?: string
  pagePreference: '1-page' | '2-page'
  templateSlug?: string
  targetRoleRaw?: string
}): Promise<BuildResumeResult> {
  const userId = await getUserId()

  const usage = await getUsage()
  const cvRemaining = usage.features.cvTailoring.remaining
  if (cvRemaining !== Infinity && cvRemaining <= 0) {
    return {
      ok: false,
      error:
        usage.plan === 'free'
          ? 'You have used all 3 free CVs this week. Upgrade to keep building.'
          : 'You have reached your monthly limit. Upgrade your plan for more.',
    }
  }

  const templateSlug = input.templateSlug ?? DEFAULT_TEMPLATE_SLUG
  const template = getTemplate(templateSlug)
  const templateUsage = usage.features.resumeTemplate ?? { used: 0, limit: 0, remaining: 0 }
  if (templateUsage.limit !== Infinity && templateUsage.remaining <= 0) {
    return {
      ok: false,
      error:
        usage.plan === 'free'
          ? 'You have used your free template builds. Upgrade to keep building.'
          : 'You have reached your limit for template-based builds. Upgrade your plan.',
    }
  }

  if (!template) {
    return { ok: false, error: 'Selected template is not available on your plan.' }
  }

  const targetRole = input.targetRole.trim()
  const industry = input.industry.trim()
  const previousCv = (input.previousCv || '').trim()
  const achievements = (input.achievements || '').trim()

  if (targetRole.length < 2) {
    return { ok: false, error: 'Please enter a target role.' }
  }

  try {
    const [userRow] = await db
      .select({ name: user.name })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1)
    const userName = userRow?.name?.trim() || 'User'

    const pageGuidance =
      input.pagePreference === '2-page'
        ? 'Since the user has chosen a 2-page format, use both pages fully. Include more detailed project descriptions, additional responsibilities, and a more comprehensive skills section.'
        : `IMPORTANT: The user has selected 1-page format. Keep the resume to exactly 1 page. This is critical for ${input.yearsOfExperience} years of experience. Use ultra-concise bullets (6-8 for work experience), merge related items, and eliminate any fluff. Every line must carry signal.`

    const experienceContext = previousCv
      ? `PREVIOUS RESUME / BACKGROUND INFORMATION (use this as the source of truth for roles, companies, dates, and achievements — never invent new jobs or degrees):\n${previousCv}\n\n`
      : ''

    const extraAchievements = achievements
      ? `KEY ACHIEVEMENTS / HIGHLIGHTS THE USER WANTS TO EMPHASIZE:\n${achievements}\n\n`
      : ''

    const systemPrompt =
      `You are a world-class CV architect who has reviewed 10,000+ resumes for Google, Meta, Amazon, and top startups. ` +
      `Your resumes get callbacks because they follow the exact formatting and content patterns those companies expect. ` +
      `You write in the Claude style: concise, scannable, no fluff, every line earns its place. ` +
      `You never fabricate jobs, degrees, or qualifications. You extract and reframe truth from the candidate's background. ` +
      `\n\n` +
      `RESUME PRINCIPLES (Google / Meta / FAANG proven):\n` +
      `1. REVERSE CHRONOLOGICAL: Most recent role first. This is what recruiters and ATS expect.\n` +
      `2. CAR FORMAT (Context-Action-Result) for bullets: What was the situation? What did YOU do? What was the quantified outcome?\n` +
      `3. ACTION VERBS: Start every bullet with a strong verb (Led, Built, Drove, Launched, Optimized, Scaled, Reduced, Increased...).\n` +
      `4. QUANTIFY EVERYTHING: Add %, $, count, team size, timeframe, scale. "approximately X" is acceptable if exact figures aren't known.\n` +
      `5. TAILOR TO TARGET ROLE: Mirror the exact role title. Front-load relevant skills and achievements.\n` +
      `6. CLAUDE-STYLE CONCISENESS: Scannable, punchy, no jargon-filler. "Managed a team" → "Led 6-engineer team".\n` +
      `7. ATS SAFETY (critical): Output PURE PLAIN TEXT only. Single column. No tables, text boxes, columns, images, icons, graphics. ` +
      `Standard ALL CAPS headings: CONTACT, PROFESSIONAL SUMMARY, WORK EXPERIENCE, EDUCATION, SKILLS, CERTIFICATIONS, PROJECTS (if space permits). ` +
      `Place name, email, phone, LinkedIn in the document BODY (never header/footer). ` +
       `Separate sections with a blank line. Use simple dash bullets. No markdown whatsoever. ` +
      `\n\n` +
      `TEMPLATE STYLE:\n` +
      `${template.aiGuidance}\n\n` +
      `\n\n` +
      `LENGTH RULES:\n` +
      pageGuidance +
      `\n\n` +
      `For ${input.yearsOfExperience} years of experience, the standard expectation is ${input.pagePreference}. ` +
      `Do not pad or truncate unnaturally. Rich, quantified bullets beat more vague ones.`

    const prompt =
      `Build a professional resume for this candidate.\n\n` +
      `TARGET ROLE: ${targetRole}\n` +
      `INDUSTRY: ${industry}\n` +
      `YEARS OF EXPERIENCE: ${input.yearsOfExperience}\n` +
      `PAGE FORMAT: ${input.pagePreference}\n\n` +
      experienceContext +
      extraAchievements +
      `Generate a resume that follows all the principles above. Use the candidate's actual background. Return structured output.`

    const { experimental_output } = await generateText({
      model: buildModel,
      system: systemPrompt,
      prompt,
      experimental_output: Output.object({ schema: buildSchema }),
    })

    let out = experimental_output
    const problems = validateBuiltCv(out.builtCv)
    if (problems.length > 0) {
      const { experimental_output: retryOut } = await generateText({
        model: buildModel,
        system: systemPrompt,
        prompt:
          `Fix ALL of these issues in the resume:\n- ` +
          problems.join('\n- ') +
          '\n\nGenerate the corrected structured output.',
        experimental_output: Output.object({ schema: buildSchema }),
      })
      out = retryOut
    }

    const [row] = await db
      .insert(tailoredCv)
      .values({
        userId,
        userName,
        jobTitle: targetRole,
        company: null,
        jobDescription: `Build resume for ${targetRole} in ${industry}`,
        originalCv: previousCv || 'Built from scratch',
        tailoredCv: out.builtCv,
        coverLetter: null,
        summary: out.summary,
        keywords: JSON.stringify(out.keywords ?? []),
        matchBefore: 0,
        matchAfter: Math.round(out.matchScore ?? 80),
        keywordMatchPct: Math.round(out.matchScore ?? 80),
        formatScore: Math.round(out.formatScore ?? 90),
        quantScore: Math.round(out.quantScore ?? 75),
        titleMatch: true,
         interviewBand: 'competitive',
         template: templateSlug,
       })
      .returning({ id: tailoredCv.id })

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/cvs')
    revalidatePath(`/dashboard/cvs/${row.id}`)

    let scan: ResumeScanResult['scan'] | undefined
    const aiScanFeature = usage.features.aiResumeScan ?? { used: 0, limit: 0, remaining: 0 }
    const aiScanEnabled = aiScanFeature.limit !== 0
    if (aiScanEnabled) {
      try {
        const scanResult = await scanResumeQuality({
          cvText: out.builtCv,
          targetRole: input.targetRoleRaw || targetRole,
        })
        if (scanResult.ok && scanResult.scan) {
          scan = scanResult.scan
        }
      } catch { /* non-blocking */ }
    }

    return {
      ok: true,
      cvId: row.id,
      builtCv: out.builtCv,
      scan,
      templateUsed: templateSlug,
    }
  } catch (err) {
    console.log('[v0] buildResume error:', err instanceof Error ? err.message : err)
    return {
      ok: false,
      error: 'We could not build your resume right now. Please try again in a moment.',
    }
  }
}
