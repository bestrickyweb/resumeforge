'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Sparkles, Loader2, Lock, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { tailorCv } from '@/app/actions/tailor'
import type { UsageInfo } from '@/app/actions/queries'
import { CvUpload } from '@/components/dashboard/cv-upload'

export function TailorForm({
  usage,
  previousCvText,
}: {
  usage: UsageInfo
  previousCvText: string | null
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [jobTitle, setJobTitle] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [originalCv, setOriginalCv] = useState('')
  const [usingPrevious, setUsingPrevious] = useState(false)

  useEffect(() => {
    if (previousCvText) {
      setOriginalCv(previousCvText)
      setUsingPrevious(true)
    }
  }, [previousCvText])

  const locked = usage.remaining !== Infinity && usage.remaining <= 0

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const cvToUse = originalCv || ''
    const result = await tailorCv({
      jobDescription,
      originalCv: cvToUse,
      jobTitleHint: jobTitle,
    })
    if (result.ok && result.cvId) {
      toast.success('Your CV has been tailored!')
      router.push(`/dashboard/cvs/${result.cvId}`)
    } else {
      setLoading(false)
      toast.error(result.error ?? 'Something went wrong.')
    }
  }

  if (locked) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Lock className="h-6 w-6" />
        </span>
        <h2 className="mt-4 font-heading text-xl font-bold">
          You&apos;ve reached your limit
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          {usage.plan === 'free'
            ? 'You have used all 3 free tailored CVs. Upgrade to keep tailoring and unlock cover letters.'
            : 'You have reached your monthly limit. Upgrade for more tailored CVs.'}
        </p>
        <Button asChild className="mt-6">
          <Link href="/dashboard/billing">View plans</Link>
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="jobTitle">Role / job title (optional)</Label>
        <Input
          id="jobTitle"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          placeholder="e.g. Product Manager"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="jobDescription">Job description</Label>
          <Textarea
            id="jobDescription"
            required
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job posting here..."
            className="min-h-64 resize-y"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="originalCv">Your current CV</Label>
          {usingPrevious && (
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm">
              <FileText className="h-4 w-4 text-primary" />
              <span className="flex-1">Using your most recent saved CV</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setOriginalCv('')
                  setUsingPrevious(false)
                }}
              >
                Replace
              </Button>
            </div>
          )}
          <CvUpload
            onExtracted={(text) => {
              setOriginalCv(text)
              setUsingPrevious(false)
            }}
          />
          <Textarea
            id="originalCv"
            required
            value={originalCv}
            onChange={(e) => setOriginalCv(e.target.value)}
            placeholder="Upload a file above, or paste your current CV as plain text..."
            className="min-h-64 resize-y"
          />
        </div>
      </div>

      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {usage.remaining === Infinity
            ? 'Unlimited tailoring on your plan.'
            : `${usage.remaining} ${usage.remaining === 1 ? 'CV' : 'CVs'} remaining.`}
        </p>
        <Button type="submit" size="lg" disabled={loading} className="w-full sm:w-auto">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Tailoring your
              CV...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" /> Tailor my CV
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
