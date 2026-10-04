'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Loader2, Lock, CheckCircle2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { scanResume } from '@/app/actions/ats-scanner'
import type { UsageInfo } from '@/app/actions/queries'
import { CvUpload } from '@/components/dashboard/cv-upload'

export function AtsScannerForm({
  usage,
  previousCvText,
}: {
  usage: UsageInfo
  previousCvText: string | null
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [jobDescription, setJobDescription] = useState('')
  const [originalCv, setOriginalCv] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [usingPrevious, setUsingPrevious] = useState(false)
  const [result, setResult] = useState<AtsScanResult | null>(null)

  useState(() => {
    if (previousCvText) {
      setOriginalCv(previousCvText)
      setUsingPrevious(true)
    }
  })

  const scannerRemaining = usage.features.atsScanner.remaining
  const locked = scannerRemaining !== Infinity && scannerRemaining <= 0

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    const cvToUse = originalCv || ''
    const res = await scanResume({
      jobDescription,
      cvText: cvToUse,
    })
    setResult(res)
    setLoading(false)
    if (res.ok && res.scan) {
      toast.success('ATS scan complete')
    } else {
      toast.error(res.error ?? 'Something went wrong.')
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
            ? 'You have used all free ATS scans this week. Upgrade to keep scanning.'
            : 'You have reached your monthly limit. Upgrade for more scans.'}
        </p>
        <Button asChild className="mt-6">
          <a href="/dashboard/billing">View plans</a>
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
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
          {scannerRemaining === Infinity
            ? 'Unlimited scans on your plan.'
            : `${scannerRemaining} scan${scannerRemaining === 1 ? '' : 's'} remaining.`}
        </p>
        <Button type="submit" size="lg" disabled={loading} className="w-full sm:w-auto">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Scanning...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" /> Scan my resume
            </>
          )}
        </Button>
      </div>

      {result && !result.ok && (
        <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          {result.error}
        </div>
      )}

      {result && result.ok && result.scan && (
        <div className="grid gap-4 rounded-2xl border border-border bg-card p-6 sm:grid-cols-2 lg:grid-cols-4">
          <ScoreCard label="Overall ATS score" value={result.scan.overallScore} />
          <ScoreCard label="Keyword match" value={result.scan.keywordMatchPct} />
          <ScoreCard label="Format safety" value={result.scan.formatScore} />
          <ScoreCard label="Quantification" value={result.scan.quantScore} />
        </div>
      )}

      {result && result.ok && result.scan && (
        <div className="grid gap-4">
          <ResultList label="Missing keywords" items={result.scan.missingKeywords} />
          <ResultList label="Format issues" items={result.scan.formatIssues} />
          <ResultList label="Improvement tips" items={result.scan.improvementTips} />
        </div>
      )}
    </form>
  )
}

function ScoreCard({ label, value }: { label: string; value: number }) {
  const color = value >= 85 ? 'text-green-600' : value >= 70 ? 'text-yellow-600' : 'text-red-600'
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
    </div>
  )
}

function ResultList({ label, items }: { label: string; items: string[] }) {
  if (!items.length) return null
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-sm font-semibold">{label}</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
        {items.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

type AtsScanResult = {
  ok: boolean
  error?: string
  scan?: {
    overallScore: number
    keywordMatchPct: number
    formatScore: number
    quantScore: number
    titleMatch: boolean
    missingKeywords: string[]
    formatIssues: string[]
    improvementTips: string[]
    interviewBand: 'below-cliff' | 'competitive' | 'strong'
  }
}
