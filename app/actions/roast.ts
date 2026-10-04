'use server'
import { generateText, Output } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'
import { getUserId } from '@/lib/session'
import { getUsage } from '@/app/actions/queries'
import { db } from '@/lib/db'
import { roastSession } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const roastModel = process.env.GOOGLE_GENERATIVE_AI_API_KEY ? google('gemini-2.5-flash') : 'openai/gpt-5-mini'

const roastLineSchema = z.object({
  severity: z.enum(['critical', 'major', 'minor']),
  category: z.string(),
  quote: z.string(),
  critique: z.string(),
  fix: z.string(),
})

const roastSchema = z.object({
  overallScore: z.number().max(100),
  grade: z.enum(['F', 'D', 'C', 'B', 'A', 'A+']),
  roastLines: z.array(roastLineSchema),
  topFixes: z.array(z.string()),
  hiddenKiller: z.string().optional(),
})

export type RoastResult = {
  ok: true
  score: number
  grade: string
  roastLines: { severity: 'critical' | 'major' | 'minor'; category: string; quote: string; critique: string; fix: string }[]
  topFixes: string[]
  hiddenKiller?: string
  roastId: number
} | {
  ok: false
  error: string
}

export async function roastCv(input: { cvText: string; jobDescription?: string }): Promise<RoastResult> {
  const userId = await getUserId()

  const usage = await getUsage()
  const feature = usage.features.achievementsScanner
  if (feature.limit !== Infinity && feature.remaining <= 0) {
    return {
      ok: false,
      error: usage.plan === 'free' ? 'You have used all your free roasts this period. Upgrade to continue.' : 'You have reached your roast limit. Upgrade your plan.',
    }
  }

  const cvText = input.cvText.trim()
  if (cvText.length < 40) {
    return { ok: false, error: 'Please paste a fuller CV (at least a few lines).' }
  }

  const jobDesc = input.jobDescription?.trim()

  try {
    const { experimental_output } = await generateText({
      model: roastModel,
      system:
        'You are a brutally honest but constructively helpful career coach. You roast CVs — pointing out exactly what is wrong, why it hurts the candidate, and how to fix it. Be blunt, do not sugarcoat, but always include a concrete fix for every criticism. Grade the CV with a letter grade (A+ to F) based on overall quality. Return structured JSON only.',
      prompt:
        `JOB DESCRIPTION:\n${jobDesc || 'None provided.'}\n\n` +
        `CV TO ROAST:\n${cvText}\n\n` +
        'Analyze this CV. Return the structured JSON output.',
      experimental_output: Output.object({ schema: roastSchema }),
    })

    const out = experimental_output
    const issuesJson = JSON.stringify(out.roastLines.map((_, i) => i))

    const [row] = await db
      .insert(roastSession)
      .values({
        userId,
        cvText,
        jobDescription: jobDesc || null,
        score: Math.round(out.overallScore),
        grade: out.grade,
        issues: issuesJson,
        fixedIssueIds: '[]',
        fixedCvId: null,
      })
      .returning({ id: roastSession.id })

    return {
      ok: true,
      score: Math.round(out.overallScore),
      grade: out.grade,
      roastLines: out.roastLines,
      topFixes: out.topFixes,
      hiddenKiller: out.hiddenKiller,
      roastId: row.id,
    }
  } catch (err) {
    console.log('[v0] roastCv error:', err instanceof Error ? err.message : err)
    return { ok: false, error: 'We could not roast your CV right now. Please try again.' }
  }
}

export async function fixRoastIssues(input: { roastId: number; issueIndices: number[]; cvText: string; jobDescription?: string }) {
  const userId = await getUserId()

  const [session] = await db
    .select()
    .from(roastSession)
    .where(eq(roastSession.id, input.roastId))
    .limit(1)

  if (!session) {
    return { ok: false, error: 'Roast session not found.' }
  }

  const jobDesc = input.jobDescription?.trim()

  try {
    const fixedIssues = session.issues !== '[]' ? JSON.parse(session.issues) : []
    const indices = input.issueIndices
    const selectedIssues = indices.map(i => fixedIssues[i]).filter(Boolean)

    const { experimental_output } = await generateText({
      model: roastModel,
      system:
        'You are an expert CV editor. The user has identified specific issues in their CV and wants you to fix ONLY those issues. Apply the fixes precisely. Return the complete corrected CV as plain text with no markdown. Preserve all truthful content — only improve wording, structure, and impact.',
      prompt:
        `ORIGINAL CV:\n${input.cvText}\n\n` +
        `ISSUES TO FIX:\n${JSON.stringify(selectedIssues, null, 2)}\n\n` +
        (jobDesc ? `JOB DESCRIPTION (for context):\n${jobDesc}\n\n` : '') +
        'Return the corrected CV as plain text. Fix only the listed issues.',
      experimental_output: Output.object({ schema: z.object({ fixedCv: z.string() }) }),
    })

    const fixedCv = experimental_output.fixedCv

    await db.update(roastSession).set({
      fixedIssueIds: JSON.stringify(indices),
    }).where(eq(roastSession.id, input.roastId))

    return { ok: true, fixedCv }
  } catch (err) {
    console.log('[v0] fixRoastIssues error:', err instanceof Error ? err.message : err)
    return { ok: false, error: 'Could not fix issues right now. Please try again.' }
  }
}