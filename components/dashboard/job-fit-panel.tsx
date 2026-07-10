'use client'

import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { analyzeJobFit } from '@/app/actions/fit'

export function JobFitPanel() {
  const [jobDescription, setJobDescription] = useState('')
  const [cvText, setCvText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    matchScore?: number
    matchedSkills?: string[]
    missingSkills?: string[]
    sectionScores?: { experience: number; skills: number; education: number; keywords: number }
    summary?: string
  } | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await analyzeJobFit({ jobDescription, cvText })
    setLoading(false)
    if (res.ok) {
      setResult({
        matchScore: res.matchScore,
        matchedSkills: res.matchedSkills,
        missingSkills: res.missingSkills,
        sectionScores: res.sectionScores,
        summary: res.summary,
      })
    } else {
      toast.error(res.error ?? 'Could not analyze job fit')
    }
  }

  function ScoreRing({ value }: { value: number }) {
    const r = 28
    const c = 2 * Math.PI * r
    const offset = c - (value / 100) * c
    return (
      <div className="relative h-16 w-16">
        <svg className="h-16 w-16 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={r} fill="none" strokeWidth="8" className="stroke-muted" />
          <circle cx="40" cy="40" r={r} fill="none" strokeWidth="8" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset} className="stroke-primary transition-all" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-heading text-base font-extrabold">{value}%</span>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Job description</label>
          <Textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job posting here..."
            required
            className="min-h-64 resize-y"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Your CV text</label>
          <Textarea
            value={cvText}
            onChange={(e) => setCvText(e.target.value)}
            placeholder="Paste your CV here..."
            required
            className="min-h-64 resize-y"
          />
        </div>
      </div>

      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">Get a match score and skill gap breakdown.</p>
        <Button type="submit" size="lg" disabled={loading} className="w-full sm:w-auto">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing fit...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" /> Analyze fit
            </>
          )}
        </Button>
      </div>

      {result && (
        <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <ScoreRing value={result.matchScore ?? 0} />
            <div>
              <p className="font-heading text-lg font-bold">Overall match</p>
              <p className="text-sm text-muted-foreground">{result.summary}</p>
            </div>
          </div>

          {result.sectionScores && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Object.entries(result.sectionScores).map(([key, value]) => (
                <div key={key} className="rounded-xl border border-border bg-background p-3 text-center">
                  <p className="text-xs text-muted-foreground capitalize">{key}</p>
                  <p className="mt-1 font-heading text-xl font-extrabold">{value}%</p>
                </div>
              ))}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-semibold">Matched skills</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {result.matchedSkills?.map((s) => (
                  <li key={s} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold">Missing skills</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {result.missingSkills?.map((s) => (
                  <li key={s} className="rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">{s}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}
