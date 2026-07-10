'use client'

import { useState } from 'react'
import { Loader2, Sparkles, ArrowRight, CheckCircle2, Copy, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  generateInterviewQuestions,
  submitMockAnswer,
  scoreInterviewSession,
  generateInterviewDebrief,
  type InterviewQuestion,
  type InterviewSessionRow,
} from '@/app/actions/interview'

type Step = 'setup' | 'questions' | 'review'

export function InterviewStudio() {
  const [step, setStep] = useState<Step>('setup')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<number | null>(null)
  const [questions, setQuestions] = useState<InterviewQuestion[]>([])
  const [answers, setAnswers] = useState<string[]>([])
  const [review, setReview] = useState<{ overallScore: number; feedback: string[] } | null>(null)
  const [debrief, setDebrief] = useState<string | null>(null)
  const [thankYouEmail, setThankYouEmail] = useState<string | null>(null)
  const [debriefLoading, setDebriefLoading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [jobTitle, setJobTitle] = useState('')
  const [company, setCompany] = useState('')
  const [cvText, setCvText] = useState('')

  async function onGenerate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await generateInterviewQuestions({ jobTitle, company, cvText })
    setLoading(false)
    if (res.ok && res.questions) {
      setQuestions(res.questions)
      setAnswers(new Array(res.questions.length).fill(''))
      setSessionId(res.sessionId)
      setReview(null)
      setDebrief(null)
      setThankYouEmail(null)
      setStep('questions')
    } else {
      toast.error(res.error ?? 'Could not generate questions')
    }
  }

  async function onAnswer(qIndex: number, answer: string) {
    setAnswers((prev) => {
      const next = [...prev]
      next[qIndex] = answer
      return next
    })
  }

  async function onScore() {
    if (!sessionId) return
    if (answers.some((a) => !a.trim())) {
      toast.error('Please answer all questions before scoring.')
      return
    }
    setLoading(true)
    const res = await scoreInterviewSession(sessionId)
    setLoading(false)
    if (res.ok) {
      setReview({ overallScore: res.overallScore, feedback: res.feedback })
      setStep('review')
    } else {
      toast.error(res.error ?? 'Could not score session')
    }
  }

  async function onGenerateDebrief() {
    if (!sessionId) return
    setDebriefLoading(true)
    const res = await generateInterviewDebrief(sessionId)
    setDebriefLoading(false)
    if (res.ok) {
      setThankYouEmail(res.thankYouEmail ?? null)
      setDebrief(res.debrief ?? null)
      toast.success('Debrief ready')
    } else {
      toast.error(res.error ?? 'Could not generate debrief')
    }
  }

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopied((c) => (c === key ? null : c)), 1500)
  }

  return (
    <div className="space-y-6">
      {step === 'setup' && (
        <form onSubmit={onGenerate} className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="jobTitle">Target role</Label>
              <Input
                id="jobTitle"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Product Manager"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="company">Company (optional)</Label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Paystack"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="cvText">Your current CV</Label>
            <Textarea
              id="cvText"
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              placeholder="Paste your CV so questions are tailored to your background..."
              required
              className="min-h-48 resize-y"
            />
          </div>
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">We&apos;ll generate 5 role-specific questions with ideal answer outlines.</p>
            <Button type="submit" size="lg" disabled={loading} className="w-full sm:w-auto">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" /> Start interview
                </>
              )}
            </Button>
          </div>
        </form>
      )}

      {step === 'questions' && (
        <div className="space-y-5">
          {questions.map((q, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-5">
              <p className="text-sm text-muted-foreground">Question {i + 1} · {q.category}</p>
              <p className="mt-2 font-medium">{q.question}</p>
              <Textarea
                className="mt-4 min-h-32 resize-y"
                placeholder="Type your answer..."
                value={answers[i] ?? ''}
                onChange={(e) => onAnswer(i, e.target.value)}
              />
            </div>
          ))}
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              {answers.filter((a) => a.trim()).length}/{questions.length} answered
            </p>
            <Button onClick={onScore} disabled={loading} className="w-full sm:w-auto">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Scoring...
                </>
              ) : (
                <>
                  Finish & score <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {step === 'review' && review && (
        <div className="space-y-6 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16">
              <svg className="h-16 w-16 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r={28} fill="none" strokeWidth="8" className="stroke-muted" />
                <circle cx="40" cy="40" r={28} fill="none" strokeWidth="8" strokeLinecap="round" strokeDasharray={2 * Math.PI * 28} strokeDashoffset={2 * Math.PI * 28 - (review.overallScore / 100) * 2 * Math.PI * 28} className="stroke-primary transition-all" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center font-heading text-lg font-extrabold">{review.overallScore}%</span>
            </div>
            <div>
              <p className="font-heading text-lg font-bold">Session score</p>
              <p className="text-sm text-muted-foreground">Review feedback for each answer below.</p>
            </div>
          </div>

          <div className="space-y-4">
            {review.feedback.map((fb, i) => (
              <div key={i} className="rounded-xl border border-border bg-background p-4">
                <p className="text-sm font-medium">Q{i + 1} feedback</p>
                <p className="mt-2 text-sm text-muted-foreground">{fb}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-border bg-background p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-heading text-base font-bold">Post-interview debrief</p>
                <p className="text-sm text-muted-foreground">
                  Get a thank-you email and a short debrief from your session.
                </p>
              </div>
              <Button onClick={onGenerateDebrief} disabled={debriefLoading || !sessionId} size="sm">
                {debriefLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" /> Generate debrief
                  </>
                )}
              </Button>
            </div>

            {thankYouEmail && (
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Thank-you email</p>
                  <Button variant="ghost" size="sm" onClick={() => copy(thankYouEmail, 'email')}>
                    {copied === 'email' ? <CheckCircle2 className="mr-1.5 h-4 w-4" /> : <Copy className="mr-1.5 h-4 w-4" />}
                    {copied === 'email' ? 'Copied' : 'Copy'}
                  </Button>
                </div>
                <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-muted/60 p-3 text-sm">{thankYouEmail}</pre>
              </div>
            )}

            {debrief && (
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Debrief notes</p>
                  <Button variant="ghost" size="sm" onClick={() => copy(debrief, 'debrief')}>
                    {copied === 'debrief' ? <CheckCircle2 className="mr-1.5 h-4 w-4" /> : <Copy className="mr-1.5 h-4 w-4" />}
                    {copied === 'debrief' ? 'Copied' : 'Copy'}
                  </Button>
                </div>
                <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-muted/60 p-3 text-sm">{debrief}</pre>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-4">
            <Button variant="outline" onClick={() => setStep('setup')}>
              New session
            </Button>
            <Button onClick={() => setStep('questions')}>
              Retry <CheckCircle2 className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
