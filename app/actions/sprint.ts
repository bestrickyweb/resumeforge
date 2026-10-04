'use server'

import { generateText, Output } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'
import { getUserId } from '@/lib/session'
import { getUsage } from '@/app/actions/queries'
import { db } from '@/lib/db'
import { careerSprint, weeklyCheckin, careerRoadmap } from '@/lib/db/schema'
import { and, desc, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

const plannerModel = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  ? google('gemini-2.5-flash')
  : 'openai/gpt-5-mini'

const milestoneSchema = z.object({
  week: z.number().describe('Week number (1-indexed).'),
  title: z.string().describe('Milestone title.'),
  description: z.string().describe('What the user should accomplish.'),
  category: z.enum(['application', 'skill', 'interview', 'networking']).describe('Milestone type.'),
})

const sprintPlanSchema = z.object({
  name: z.string().describe('Sprint name (e.g. 90-Day Product Manager Sprint).'),
  goalRole: z.string().describe('The target role for this sprint.'),
  milestones: z.array(milestoneSchema).describe('Key milestones across the sprint weeks.'),
  skillFocus: z.array(z.string()).describe('Primary skills to develop during the sprint.'),
})

export type SprintPlan = z.infer<typeof sprintPlanSchema>

export interface Sprint {
  id: number
  userId: string
  name: string
  goalRole: string
  startDate: Date
  endDate: Date
  targetApplications: number
  targetInterviews: number
  status: 'active' | 'completed' | 'paused'
  weeklyCheckins: string
  milestoneLog: string
  createdAt: Date
}

export async function createSprint(input: {
  goalRole: string
  durationWeeks: number
  targetApplications: number
  targetInterviews: number
}) {
  const userId = await getUserId()

  const usage = await getUsage()
  const feature = usage.features.skillsGap
  if (feature.limit !== Infinity && feature.remaining <= 0) {
    return {
      ok: false as const,
      error: usage.plan === 'free'
        ? 'Upgrade your plan to use career sprints.'
        : 'You have reached your limit for this feature.',
    }
  }

  if (!input.goalRole || input.goalRole.trim().length < 3) {
    return { ok: false as const, error: 'Please provide a goal role (at least 3 characters).' }
  }

  const durationWeeks = Math.max(4, Math.min(24, input.durationWeeks ?? 12))
  const startDate = new Date()
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + durationWeeks * 7)

  let milestones: SprintPlan['milestones'] = []
  let skillFocus: string[] = []

  try {
    const roadmaps = await db
      .select({
        targetRole: careerRoadmap.targetRole,
        missingSkills: careerRoadmap.missingSkills,
        learningPlan: careerRoadmap.learningPlan,
        phases: careerRoadmap.phases,
        readinessScore: careerRoadmap.readinessScore,
      })
      .from(careerRoadmap)
      .where(eq(careerRoadmap.userId, userId))
      .orderBy(desc(careerRoadmap.createdAt))
      .limit(1)

    if (roadmaps.length > 0 && roadmaps[0].missingSkills) {
      const lastRoadmap = roadmaps[0]
      const missingSkills = JSON.parse(lastRoadmap.missingSkills) as Array<{ name: string }>
      const phases = lastRoadmap.phases ? JSON.parse(lastRoadmap.phases) : []

      const { experimental_output } = await generateText({
        model: plannerModel,
        system:
          'You are a career coach. Given a user\'s career roadmap data and a goal role, ' +
          'create a structured 90-day sprint plan with milestones, skill focus areas, and weekly targets. ' +
          'Return the plan as JSON only.',
        prompt: `GOAL ROLE: ${input.goalRole}

DURATION: ${durationWeeks} weeks

EXISTING READINESS SCORE: ${lastRoadmap.readinessScore ?? 'N/A'}

MISSING SKILLS: ${JSON.stringify(missingSkills.slice(0, 10))}

PHASES: ${JSON.stringify(phases.slice(0, 6))}

Create a sprint plan with:
1. A sprint name
2. ${Math.min(8, durationWeeks)} milestones spread across the weeks
3. ${Math.min(6, missingSkills.length)} skill focus areas

Return as JSON:`,
        experimental_output: Output.object({ schema: sprintPlanSchema }),
      })

      milestones = experimental_output.milestones
      skillFocus = experimental_output.skillFocus
    }
  } catch {
    // Fall back to generated milestones if AI fails
  }

  if (milestones.length === 0) {
    const weekInterval = Math.max(1, Math.floor(durationWeeks / 4))
    milestones = [
      { week: 1, title: 'Sprint Launch', description: 'Set up your job target, update CV, and begin applications.', category: 'application' },
      { week: weekInterval, title: 'Skill Building Block', description: 'Complete core skill development and start networking.', category: 'skill' },
      { week: Math.floor(durationWeeks / 2), title: 'Mid-Sprint Review', description: 'Assess progress, adjust strategy, and intensify interview prep.', category: 'interview' },
      { week: Math.floor(durationWeeks * 0.75), title: 'Interview Push', description: 'Maximize interview practice and increase application volume.', category: 'interview' },
      { week: durationWeeks, title: 'Sprint Finale', description: 'Final push - close out remaining targets and evaluate outcomes.', category: 'application' },
    ]
  }

  if (skillFocus.length === 0) {
    skillFocus = [input.goalRole]
  }

  const name = `90-Day ${input.goalRole} Sprint`

  const [sprint] = await db
    .insert(careerSprint)
    .values({
      userId,
      name,
      goalRole: input.goalRole,
      startDate,
      endDate,
      targetApplications: input.targetApplications,
      targetInterviews: input.targetInterviews,
      status: 'active',
      weeklyCheckins: '[]',
      milestoneLog: JSON.stringify(milestones),
    })
    .returning()

  revalidatePath('/dashboard/interview')
  revalidatePath('/dashboard')

  return {
    ok: true as const,
    sprint: {
      ...sprint,
      startDate: sprint.startDate as Date,
      endDate: sprint.endDate as Date,
      createdAt: sprint.createdAt as Date,
    },
    milestones,
    skillFocus,
  }
}

export async function submitWeeklyCheckin(sprintId: number, input: {
  weekNumber: number
  applicationsSent: number
  interviewsAttended: number
  offersReceived: number
  skillsCompleted: string[]
  blockers?: string
  nextWeekFocus?: string
  mood?: number
}) {
  const userId = await getUserId()

  const [existing] = await db
    .select()
    .from(weeklyCheckin)
    .where(
      and(
        eq(weeklyCheckin.sprintId, sprintId),
        eq(weeklyCheckin.userId, userId),
        eq(weeklyCheckin.weekNumber, input.weekNumber),
      ),
    )
    .limit(1)

  const values = {
    sprintId,
    userId,
    weekNumber: input.weekNumber,
    submittedAt: new Date(),
    applicationsSent: input.applicationsSent,
    interviewsAttended: input.interviewsAttended,
    offersReceived: input.offersReceived,
    skillsCompleted: JSON.stringify(input.skillsCompleted),
    blockers: input.blockers ?? null,
    nextWeekFocus: input.nextWeekFocus ?? null,
    mood: input.mood ?? null,
  }

  if (existing) {
    await db.update(weeklyCheckin).set(values).where(eq(weeklyCheckin.id, existing.id))
  } else {
    await db.insert(weeklyCheckin).values(values)
  }

  const sprint = await db.select().from(careerSprint).where(eq(careerSprint.id, sprintId)).limit(1)
  if (sprint.length > 0) {
    const currentCheckins = sprint[0].weeklyCheckins ? JSON.parse(sprint[0].weeklyCheckins) : []
    const checkinEntry = {
      weekNumber: input.weekNumber,
      submittedAt: new Date().toISOString(),
      applicationsSent: input.applicationsSent,
      interviewsAttended: input.interviewsAttended,
      offersReceived: input.offersReceived,
    }
    const updated = currentCheckins.some((c: { weekNumber: number }) => c.weekNumber === input.weekNumber)
      ? currentCheckins.map((c: { weekNumber: number }) => c.weekNumber === input.weekNumber ? checkinEntry : c)
      : [...currentCheckins, checkinEntry]
    await db.update(careerSprint).set({ weeklyCheckins: JSON.stringify(updated) }).where(eq(careerSprint.id, sprintId))
  }

  revalidatePath('/dashboard/interview')

  return { ok: true as const }
}

export async function getSprintProgress(sprintId: number) {
  const userId = await getUserId()

  const [sprint] = await db
    .select()
    .from(careerSprint)
    .where(
      and(
        eq(careerSprint.id, sprintId),
        eq(careerSprint.userId, userId),
      ),
    )
    .limit(1)

  if (!sprint) return { ok: false as const, error: 'Sprint not found.' }

  const checkins = await db
    .select()
    .from(weeklyCheckin)
    .where(eq(weeklyCheckin.sprintId, sprintId))
    .orderBy(desc(weeklyCheckin.createdAt))

  const totalApps = checkins.reduce((sum, c) => sum + (c.applicationsSent ?? 0), 0)
  const totalInterviews = checkins.reduce((sum, c) => sum + (c.interviewsAttended ?? 0), 0)
  const totalOffers = checkins.reduce((sum, c) => sum + (c.offersReceived ?? 0), 0)

  let totalSkillsCompleted = new Set<string>()
  for (const c of checkins) {
    if (c.skillsCompleted) {
      try {
        const skills = JSON.parse(c.skillsCompleted) as string[]
        skills.forEach((s) => totalSkillsCompleted.add(s))
      } catch { /* ignore */ }
    }
  }

  const targetApps = sprint.targetApplications ?? 0
  const targetInterviews = sprint.targetInterviews ?? 0

  const applicationsProgress = targetApps > 0 ? Math.min(100, Math.round((totalApps / targetApps) * 100)) : 0
  const interviewsProgress = targetInterviews > 0 ? Math.min(100, Math.round((totalInterviews / targetInterviews) * 100)) : 0
  const skillsList: string[] = Array.from(totalSkillsCompleted)
  const skillsProgress = skillsList.length

  const allTargetsMet = totalApps >= targetApps && totalInterviews >= targetInterviews

  return {
    ok: true as const,
    progress: {
      applications: { current: totalApps, target: targetApps, percent: applicationsProgress },
      interviews: { current: totalInterviews, target: targetInterviews, percent: interviewsProgress },
      skills: { current: skillsProgress, target: null, list: skillsList },
      offers: totalOffers,
      allTargetsMet,
      totalCheckins: checkins.length,
    },
  }
}

export async function getActiveSprint() {
  const userId = await getUserId()

  const rows = await db
    .select()
    .from(careerSprint)
    .where(
      and(
        eq(careerSprint.userId, userId),
        eq(careerSprint.status, 'active'),
      ),
    )
    .orderBy(desc(careerSprint.createdAt))
    .limit(1)

  return rows[0] ?? null
}

export async function pauseSprint(sprintId: number) {
  const userId = await getUserId()

  await db.update(careerSprint).set({ status: 'paused' }).where(
    and(
      eq(careerSprint.id, sprintId),
      eq(careerSprint.userId, userId),
    ),
  )

  revalidatePath('/dashboard/interview')
  revalidatePath('/dashboard')

  return { ok: true as const }
}

export async function resumeSprint(sprintId: number) {
  const userId = await getUserId()

  await db.update(careerSprint).set({ status: 'active' }).where(
    and(
      eq(careerSprint.id, sprintId),
      eq(careerSprint.userId, userId),
    ),
  )

  revalidatePath('/dashboard/interview')
  revalidatePath('/dashboard')

  return { ok: true as const }
}

export async function completeSprint(sprintId: number) {
  const userId = await getUserId()

  await db.update(careerSprint).set({ status: 'completed' }).where(
    and(
      eq(careerSprint.id, sprintId),
      eq(careerSprint.userId, userId),
    ),
  )

  revalidatePath('/dashboard/interview')
  revalidatePath('/dashboard')

  return { ok: true as const }
}
