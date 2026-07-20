'use client'

import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { analyzeJobFit } from '@/app/actions/fit'
import { bandBadgeClass } from '@/lib/utils'

export function JobFitPanel() {
  const [jobDescription, setJobDescription] = useState('')
  const [cvText, setCvText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    matchScore?: number
    keywordMatchPct?: number
    matchedSkills?: string[]
    missingSkills?: string[]
    sectionScores?: { experience: number; skills: number; education: number; keywords: number; formatting: number; quantification: number }
    formatFlags?: string[]
    quantification?: { metricBullets: number; totalBullets: number; coveragePct: number }
    titleMatch?: boolean
    interviewReadinessBand?: 'below-cliff' | 'competitive' | 'strong'
    recommendations?: string[]
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
        keywordMatchPct: res.keywordMatchPct,
        matchedSkills: res.matchedSkills,
        missingSkills: res.missingSkills,
        sectionScores: res.sectionScores,
        formatFlags: res.formatFlags,
        quantification: res.quantification,
        titleMatch: res.titleMatch,
        interviewReadinessBand: res.interviewReadinessBand,
        recommendations: res.recommendations,
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
            <ScoreRing value={result.keywordMatchPct ?? result.matchScore ?? 0} />
            <div>
              <p className="font-heading text-lg font-bold">Keyword match</p>
              {result.interviewReadinessBand && (
                <span
                  className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${bandBadgeClass[result.interviewReadinessBand]}`}
                >
                  {result.interviewReadinessBand === 'strong'
                    ? '85%+ — strong'
                    : result.interviewReadinessBand === 'competitive'
                      ? '70–84% — competitive'
                      : 'Below 70% — likely filtered'}
                </span>
              )}
            </div>
          </div>

          {/* Interview-cliff meter */}
          <div className="relative h-3 w-full rounded-full bg-muted">
            <div className="absolute top-[-4px] h-5 w-0.5 bg-foreground/40" style={{ left: '70%' }} />
            <div
              className={`h-3 rounded-full ${
                (result.keywordMatchPct ?? 0) >= 85
                  ? 'bg-primary'
                  : (result.keywordMatchPct ?? 0) >= 70
                    ? 'bg-amber-500'
                    : 'bg-destructive'
              }`}
              style={{ width: `${Math.min(100, result.keywordMatchPct ?? 0)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>0%</span>
            <span>70% â€” interview cliff</span>
            <span>100%</span>
          </div>

          {result.sectionScores && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {Object.entries(result.sectionScores).map(([key, value]) => (
                <div key={key} className="rounded-xl border border-border bg-background p-3 text-center">
                  <p className="text-xs text-muted-foreground capitalize">{key}</p>
                  <p className="mt-1 font-heading text-xl font-extrabold">{value}%</p>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {result.titleMatch !== undefined && (
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${result.titleMatch ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                Job title {result.titleMatch ? 'matched' : 'not mirrored'}
              </span>
            )}
          </div>

          {result.formatFlags && result.formatFlags.length > 0 && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3">
              <p className="text-xs font-semibold text-destructive">ATS parse issues</p>
              <ul className="mt-1 list-inside list-disc text-xs text-muted-foreground">
                {result.formatFlags.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          )}

          {result.quantification && (
            <p className="text-xs text-muted-foreground">
              Quantification: {result.quantification.metricBullets}/{result.quantification.totalBullets} bullets carry a metric ({result.quantification.coveragePct}%).
            </p>
          )}

          {result.recommendations && result.recommendations.length > 0 && (
            <div className="rounded-xl border border-border bg-background p-3">
              <p className="text-xs font-semibold">Top fixes to get more interviews</p>
              <ol className="mt-1 list-inside list-decimal space-y-1 text-xs text-muted-foreground">
                {result.recommendations.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ol>
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

