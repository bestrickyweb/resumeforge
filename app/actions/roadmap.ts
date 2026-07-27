'use server'

import { generateText, Output } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'
import { getUserId } from '@/lib/session'
import { getUsage } from '@/app/actions/queries'
import { db } from '@/lib/db'
import {
  careerRoadmap,
  roadmapProgress,
} from '@/lib/db/schema'
import { and, desc, eq } from 'drizzle-orm'
import { analyzeJobFit } from '@/app/actions/fit'

const tailorModel = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  ? google('gemini-2.5-flash')
  : 'openai/gpt-5-mini'

const gapSchema = z.object({
  name: z.string().describe('Skill name, normalized (e.g. react, typescript, testing).'),
  severity: z
    .enum(['critical', 'important', 'nice-to-have'])
    .describe('How important this gap is for the target role.'),
  category: z
    .string()
    .describe('Category: technical, soft, domain, or certification.'),
  estimatedHours: z
    .number()
    .describe('Realistic hours needed for someone at the user level to reach proficiency.'),
  difficulty: z.enum(['low', 'medium', 'high']).describe('Learning difficulty.'),
  whyItMatters: z
    .string()
    .describe('1-2 sentences on why this skill matters for the target role.'),
  resources: z.array(
    z.object({
      type: z
        .enum(['course', 'book', 'docs', 'project', 'certification'])
        .describe('Resource type.'),
      title: z.string().describe('Specific resource title.'),
      provider: z.string().optional().describe('e.g. Coursera, Udemy, freeCodeCamp.'),
      url: z.string().optional().describe('Direct link if known.'),
      estimatedHours: z.number().optional().describe('Hours for this resource.'),
    }),
  ),
  prerequisites: z
    .array(z.string())
    .describe('Skills to learn first, if any.'),
})

const scheduleItemSchema = z.object({
  startWeek: z.number().describe('Week number (1-indexed).'),
  endWeek: z.number().describe('End week number.'),
  skill: z.string().describe('Primary skill focus for this block.'),
  hoursPerWeek: z.number().describe('Hours the user will spend this block.'),
  totalHours: z.number().describe('Total hours across this block.'),
  milestone: z.string().describe('What the user should achieve or know by the end.'),
})

const phaseSchema = z.object({
  name: z.string().describe('Phase name (e.g. Foundation, Depth, Proof).'),
  startWeek: z.number(),
  endWeek: z.number(),
  focus: z.string().describe('What this phase covers.'),
})

const portfolioProjectSchema = z.object({
  title: z.string(),
  description: z.string(),
  skillsDemonstrated: z.array(z.string()),
  estimatedHours: z.number(),
})

const roadmapOutputSchema = z.object({
  targetRole: z.string().describe('The target role being analyzed.'),
  readinessScore: z
    .number()
    .max(100)
    .describe('Current fit score 0-100 based on resume vs job description.'),
  interviewReadinessBand: z
    .enum(['below-cliff', 'competitive', 'strong'])
    .describe('Derived from readinessScore: below-cliff (<70), competitive (70-84), strong (85+).'),
  matchedSkills: z.array(
    z.object({
      name: z.string(),
      proficiency: z.string().optional(),
      years: z.number().optional(),
    }),
  ),
  missingSkills: z.array(gapSchema),
  categoryScores: z
    .record(z.string(), z.number())
    .describe('Scores by category: technical, soft, domain, certification.'),
  timeline: z.object({
    totalWeeks: z.number(),
    projectedFitScore: z.number().max(100),
    completionDate: z.string().describe('ISO date string for estimated completion.'),
    isRealistic: z.boolean().describe('True if the plan fits within the user deadline, if provided.'),
    schedule: z.array(scheduleItemSchema),
    phases: z.array(phaseSchema),
  }),
  portfolioProjects: z.array(portfolioProjectSchema),
  summary: z.string().describe('2-3 sentence summary of the roadmap.'),
})

export type CareerRoadmap = z.infer<typeof roadmapOutputSchema>

export async function generateCareerRoadmap(input: {
  jobDescription: string
  cvText: string
  hoursPerWeek: number
  targetDeadline?: string
  targetRole?: string
}) {
  const userId = await getUserId()

  const usage = await getUsage()
  const feature = usage.features.skillsGap
  if (feature.limit !== Infinity && feature.remaining <= 0) {
    return {
      ok: false as const,
      error:
        usage.plan === 'free'
          ? 'Upgrade your plan to use career roadmaps.'
          : 'You have reached your limit for this feature.',
    }
  }

  const jobDescription = input.jobDescription.trim()
  const cvText = input.cvText.trim()

  if (jobDescription.length < 40 || cvText.length < 40) {
    return { ok: false as const, error: 'Please provide fuller inputs for analysis.' }
  }

  if (!input.hoursPerWeek || input.hoursPerWeek < 1) {
    return { ok: false as const, error: 'Please enter at least 1 hour per week.' }
  }

  try {
    const fitResult = await analyzeJobFit({ jobDescription, cvText })
    if (!fitResult.ok || !fitResult.matchScore) {
      return { ok: false as const, error: fitResult.error ?? 'Could not analyze job fit.' }
    }

    const deadlineNote = input.targetDeadline
      ? `The user wants to be ready by ${input.targetDeadline}. Adjust the schedule to be realistic within that date, and set isRealistic accordingly.`
      : 'No explicit deadline; create a realistic plan based on the hours per week.'

    const { experimental_output } = await generateText({
      model: tailorModel,
      system:
        'You are a career coach and learning planner. Given a job description, a candidate resume, and their weekly availability, ' +
        'produce a structured career roadmap that turns skill gaps into a week-by-week learning plan. ' +
        'Be specific: name exact skills, realistic hour estimates, and concrete resources. ' +
        'Do not inflate scores. If the candidate is already strong, say so and give maintenance/advanced tips. ' +
        deadlineNote,
      prompt: `TARGET ROLE: ${input.targetRole || 'the role in the job description'}

JOB DESCRIPTION:
${jobDescription}

CANDIDATE CV:
${cvText}

CURRENT FIT SCORE: ${fitResult.matchScore}%
MATCHED SKILLS: ${(fitResult.matchedSkills ?? []).join(', ') || 'none detected'}
MISSING SKILLS: ${(fitResult.missingSkills ?? []).join(', ') || 'none detected'}
KEYWORD MATCH: ${fitResult.keywordMatchPct ?? 0}%
INTERVIEW BAND: ${fitResult.interviewReadinessBand ?? 'unknown'}

AVAILABILITY: ${input.hoursPerWeek} hours per week

Build a structured roadmap. Return the roadmap as JSON only.`,
      experimental_output: Output.object({ schema: roadmapOutputSchema }),
    })

    const roadmap = experimental_output

    const schedule = roadmap.timeline.schedule
    const totalWeeks = roadmap.timeline.totalWeeks

    const completionDate = new Date()
    completionDate.setDate(completionDate.getDate() + totalWeeks * 7)

    const now = new Date()
    let deadlineMet = true
    if (input.targetDeadline) {
      const deadline = new Date(input.targetDeadline)
      const weeksUntilDeadline = Math.max(
        0,
        Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 7)),
      )
      deadlineMet = totalWeeks <= weeksUntilDeadline
    }

    const [savedRoadmap] = await db
      .insert(careerRoadmap)
      .values({
        userId,
        jobFitId: null,
        targetRole: input.targetRole || 'Target Role',
        targetCompany: null,
        readinessScore: roadmap.readinessScore,
        hoursPerWeek: input.hoursPerWeek,
        estimatedWeeks: totalWeeks,
        projectedFitScore: roadmap.timeline.projectedFitScore,
        completionDate: deadlineMet ? completionDate : null,
        phases: JSON.stringify(roadmap.timeline.phases),
        missingSkills: JSON.stringify(roadmap.missingSkills),
        learningPlan: JSON.stringify(
          roadmap.missingSkills.map((g) => ({
            skill: g.name,
            estimatedHours: g.estimatedHours,
            difficulty: g.difficulty,
            resources: g.resources,
            prerequisites: g.prerequisites,
          })),
        ),
        portfolioProjects: JSON.stringify(roadmap.portfolioProjects),
        status: 'active',
      })
      .returning()

    const roadmapId = savedRoadmap.id

    const progressRows = roadmap.missingSkills.map((g) => ({
      roadmapId,
      userId,
      skillName: g.name,
      status: 'not_started' as const,
      hoursSpent: 0,
    }))

    if (progressRows.length > 0) {
      await db.insert(roadmapProgress).values(progressRows)
    }

    return {
      ok: true as const,
      roadmap: {
        ...roadmap,
        timeline: {
          ...roadmap.timeline,
          completionDate: completionDate.toISOString(),
          isRealistic: deadlineMet,
        },
        id: roadmapId,
      },
    }
  } catch (err) {
    console.log('[v0] generateCareerRoadmap error:', err instanceof Error ? err.message : err)
    return { ok: false as const, error: 'We could not generate your roadmap right now.' }
  }
}

export async function getCareerRoadmaps() {
  const userId = await getUserId()
  return db
    .select()
    .from(careerRoadmap)
    .where(eq(careerRoadmap.userId, userId))
    .orderBy(desc(careerRoadmap.createdAt))
}

export async function getCareerRoadmapById(id: number) {
  const userId = await getUserId()
  const rows = await db
    .select()
    .from(careerRoadmap)
    .where(and(eq(careerRoadmap.id, id), eq(careerRoadmap.userId, userId)))
    .limit(1)
  return rows[0] ?? null
}

export async function getRoadmapProgress(roadmapId: number) {
  const userId = await getUserId()
  return db
    .select()
    .from(roadmapProgress)
    .where(eq(roadmapProgress.roadmapId, roadmapId))
    .orderBy(desc(roadmapProgress.createdAt))
}

export async function updateRoadmapProgress(input: {
  roadmapId: number
  skillName: string
  status: 'not_started' | 'in_progress' | 'completed'
  hoursSpent?: number
}) {
  const userId = await getUserId()

  const existing = await db
    .select()
    .from(roadmapProgress)
    .where(
      and(
        eq(roadmapProgress.roadmapId, input.roadmapId),
        eq(roadmapProgress.skillName, input.skillName),
        eq(roadmapProgress.userId, userId),
      ),
    )
    .limit(1)

  if (existing.length === 0) {
    return { ok: false as const, error: 'Progress item not found.' }
  }

  const updates: Record<string, unknown> = { status: input.status }
  if (input.status === 'in_progress' && !existing[0].startedAt) {
    updates.startedAt = new Date()
  }
  if (input.status === 'completed') {
    updates.completedAt = new Date()
    if (input.hoursSpent) {
      updates.hoursSpent = input.hoursSpent
    }
  }

  await db
    .update(roadmapProgress)
    .set(updates)
    .where(eq(roadmapProgress.id, existing[0].id))

  return { ok: true as const }
}
