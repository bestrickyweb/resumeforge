'use server'

import { generateText, Output } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'
import { db } from '@/lib/db'
import { interviewSession, application } from '@/lib/db/schema'
import { getUserId } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import { and, eq } from 'drizzle-orm'
import { getUsage } from '@/app/actions/queries'

const tailorModel = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  ? google('gemini-2.5-flash')
  : 'openai/gpt-5-mini'

const questionSchema = z.object({
  question: z.string(),
  category: z.string().describe('e.g. behavioral, technical, situational'),
  idealAnswerOutline: z.string(),
})

const questionSetSchema = z.object({
  questions: z.array(questionSchema).min(3).max(6),
})

export type InterviewQuestion = z.infer<typeof questionSchema>
export type InterviewSessionRow = {
  id: number
  jobTitle: string
  company: string | null
  questions: InterviewQuestion[]
  userAnswers: string[]
  aiFeedback: string[]
  overallScore: number | null
  mode: string
}

export async function generateInterviewQuestions(input: {
  jobTitle: string
  company?: string
  cvText: string
}) {
  const userId = await getUserId()

  const usage = await getUsage()
  const feature = usage.features.mockInterview
  if (feature.limit !== Infinity && feature.remaining <= 0) {
    return { ok: false as const, error: 'You have reached your mock interview limit for this period.' }
  }

  if (!input.jobTitle.trim() || !input.cvText.trim()) {
    return { ok: false as const, error: 'Please provide a job title and your CV text.' }
  }

  try {
    const { experimental_output } = await generateText({
      model: tailorModel,
      system:
        'You are an interview coach. Generate interview questions tailored to the role and candidate. ' +
        'Include a brief ideal answer outline for each question.',
      prompt:
        `JOB TITLE: ${input.jobTitle}\n` +
        `COMPANY: ${input.company ?? 'Unknown'}\n` +
        `CANDIDATE CV:\n${input.cvText}\n\n` +
        'Generate 5 relevant interview questions with ideal answer outlines.',
      experimental_output: Output.object({ schema: questionSetSchema }),
    })

    const out = experimental_output

    const [row] = await db
      .insert(interviewSession)
      .values({
        userId,
        applicationId: null,
        jobTitle: input.jobTitle,
        company: input.company ?? null,
        questions: JSON.stringify(out.questions),
        userAnswers: JSON.stringify([]),
        aiFeedback: JSON.stringify([]),
        mode: 'mock',
      })
      .returning({ id: interviewSession.id })

    return { ok: true as const, sessionId: row.id, questions: out.questions }
  } catch (err) {
    console.log('[v0] generateInterviewQuestions error:', err instanceof Error ? err.message : err)
    return { ok: false as const, error: 'Could not generate interview questions.' }
  }
}

export async function submitMockAnswer(sessionId: number, questionIndex: number, answer: string) {
  const userId = await getUserId()
  const [session] = await db
    .select()
    .from(interviewSession)
    .where(and(eq(interviewSession.id, sessionId), eq(interviewSession.userId, userId)))
    .limit(1)

  if (!session) {
    return { ok: false as const, error: 'Session not found' }
  }

  const questions: InterviewQuestion[] = JSON.parse(session.questions)
  if (questionIndex < 0 || questionIndex >= questions.length) {
    return { ok: false as const, error: 'Invalid question index' }
  }

  const userAnswers: string[] = JSON.parse(session.userAnswers)
  userAnswers[questionIndex] = answer

  await db
    .update(interviewSession)
    .set({ userAnswers: JSON.stringify(userAnswers) })
    .where(eq(interviewSession.id, sessionId))

  revalidatePath('/dashboard/interview')
  return { ok: true as const }
}

export async function scoreInterviewSession(sessionId: number) {
  const userId = await getUserId()
  const [session] = await db
    .select()
    .from(interviewSession)
    .where(and(eq(interviewSession.id, sessionId), eq(interviewSession.userId, userId)))
    .limit(1)

  if (!session) {
    return { ok: false as const, error: 'Session not found' }
  }

  const questions: InterviewQuestion[] = JSON.parse(session.questions)
  const userAnswers: string[] = JSON.parse(session.userAnswers)

  const unanswered = questions.find((_, idx) => !userAnswers[idx])
  if (unanswered) {
    return { ok: false as const, error: 'Please answer all questions before scoring.' }
  }

  const feedbackSchema = z.object({
    feedback: z.string().describe('Constructive feedback on the answer'),
    score: z.number().max(100).describe('0-100 score for the answer relative to ideal outline'),
  })

  try {
    const { experimental_output } = await generateText({
      model: tailorModel,
      system: 'You are an interview coach. Score the candidate answers against the ideal answer outlines.',
      prompt:
        questions
          .map((q, i) => `Q${i + 1}: ${q.question}\nIdeal outline: ${q.idealAnswerOutline}\nAnswer: ${userAnswers[i]}`)
          .join('\n\n') +
        '\n\nProvide feedback and scores for each answer in structured JSON.',
      experimental_output: Output.object({
        schema: z.object({
          results: z.array(feedbackSchema).length(questions.length),
        }),
      }),
    })

    const results = experimental_output.results
    const scores = results.map((r: { score: number }) => r.score)
    const overallScore = Math.round(scores.reduce((sum: number, s: number) => sum + s, 0) / scores.length)
    const feedback = results.map((r: { feedback: string }) => r.feedback)

    await db
      .update(interviewSession)
      .set({
        aiFeedback: JSON.stringify(feedback),
        overallScore,
      })
      .where(eq(interviewSession.id, sessionId))

    revalidatePath('/dashboard/interview')
    return { ok: true as const, overallScore, feedback }
  } catch (err) {
    console.log('[v0] scoreInterviewSession error:', err instanceof Error ? err.message : err)
    return { ok: false as const, error: 'Could not score session.' }
  }
}

const debriefSchema = z.object({
  thankYouEmail: z.string().describe('A concise, professional thank-you email to the interviewer'),
  debrief: z.string().describe('A short post-interview debrief: what went well, what to improve'),
})

export async function generateInterviewDebrief(sessionId: number) {
  const userId = await getUserId()
  const [session] = await db
    .select()
    .from(interviewSession)
    .where(and(eq(interviewSession.id, sessionId), eq(interviewSession.userId, userId)))
    .limit(1)

  if (!session) {
    return { ok: false as const, error: 'Session not found' }
  }

  try {
    const { experimental_output } = await generateText({
      model: tailorModel,
      system:
        'You are a career coach. Given an interview session, write a thank-you email and a short debrief. ' +
        'Never fabricate details; base it on the role, company, and feedback provided.',
      prompt:
        `ROLE: ${session.jobTitle}\n` +
        `COMPANY: ${session.company ?? 'the company'}\n` +
        `AI FEEDBACK:\n${(JSON.parse(session.aiFeedback) as string[]).join('\n')}\n\n` +
        'Write a thank-you email and a debrief.',
      experimental_output: Output.object({ schema: debriefSchema }),
    })

    const out = experimental_output
    return { ok: true as const, thankYouEmail: out.thankYouEmail, debrief: out.debrief }
  } catch (err) {
    console.log('[v0] generateInterviewDebrief error:', err instanceof Error ? err.message : err)
    return { ok: false as const, error: 'Could not generate debrief.' }
  }
}

