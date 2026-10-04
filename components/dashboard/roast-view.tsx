'use client'

import { useState, useTransition } from 'react'
import { Copy, Check, Loader2, Sparkles, Zap, AlertCircle, ArrowRight, RefreshCw, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { roastCv, fixRoastIssues } from '@/app/actions/roast'

type RoastStep = 'upload' | 'roast' | 'fix'

interface RoastLine {
  severity: 'critical' | 'major' | 'minor'
  category: string
  quote: string
  critique: string
  fix: string
}

export function RoastView({
  cvText,
  jobDescription,
  open: controlledOpen,
  onOpenChange,
}: {
  cvText?: string
  jobDescription?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [step, setStep] = useState<RoastStep>('upload')
  const [inputText, setInputText] = useState(cvText || '')
  const [inputJobDesc, setInputJobDesc] = useState(jobDescription || '')
  const [roasting, setRoasting] = useState(false)
  const [roastResult, setRoastResult] = useState<{
    score: number
    grade: string
    roastLines: RoastLine[]
    topFixes: string[]
    hiddenKiller?: string
    roastId: number
  } | null>(null)
  const [fixing, setFixing] = useState(false)
  const [selectedIssues, setSelectedIssues] = useState<Set<number>>(new Set())
  const [fixedCv, setFixedCv] = useState('')
  const [copying, setCopying] = useState(false)
  const [isOpen, setIsOpen] = useState(true)
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    onOpenChange?.(open)
    if (open) setStep("upload")
  }

  async function handleRoast() {
    setRoasting(true)
    const res = await roastCv({ cvText: inputText, jobDescription: inputJobDesc || undefined })
    setRoasting(false)
    if (res.ok) {
      setRoastResult(res)
      setStep('roast')
      toast.success(`CV roasted: ${res.grade} (${res.score}%)`)
    } else {
      toast.error(res.error || 'Roast failed')
    }
  }

  async function handleFix() {
    if (!roastResult) return
    setFixing(true)
    const res = await fixRoastIssues({
      roastId: roastResult.roastId,
      issueIndices: Array.from(selectedIssues),
      cvText: inputText,
      jobDescription: inputJobDesc || undefined,
    })
    setFixing(false)
    if (res.ok) {
      setFixedCv(res.fixedCv ?? '')
      toast.success('Issues fixed! Review your improved CV below.')
    } else {
      toast.error(res.error || 'Fix failed')
    }
  }

  function toggleIssue(idx: number) {
    setSelectedIssues(prev => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  async function copyText(text: string) {
    setCopying(true)
    await navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopying(false), 1500)
  }

  const severityColors = {
    critical: 'bg-red-500/10 text-red-600 dark:text-red-400',
    major: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    minor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  }

  const gradeColors: Record<string, string> = {
    'A+': 'bg-emerald-500/10 text-emerald-600',
    'A': 'bg-emerald-500/10 text-emerald-600',
    'B': 'bg-primary/10 text-primary',
    'C': 'bg-amber-500/10 text-amber-600',
    'D': 'bg-orange-500/10 text-orange-600',
    'F': 'bg-red-500/10 text-red-600',
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Resume Roast
          </DialogTitle>
          <DialogDescription>
            Paste your CV and get brutally honest feedback — then fix issues and re-roast.
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Your CV</Label>
              <Textarea
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="Paste your full CV here..."
                className="min-h-[200px] font-sans text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label>Job description (optional)</Label>
              <Textarea
                value={inputJobDesc}
                onChange={e => setInputJobDesc(e.target.value)}
                placeholder="Paste the job posting for targeted feedback..."
                className="min-h-[100px] font-sans text-sm"
              />
            </div>
            <DialogFooter>
              <Button onClick={handleRoast} disabled={roasting || inputText.length < 40}>
                {roasting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Sparkles className="mr-2 h-4 w-4" />
                Roast my CV
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === 'roast' && roastResult && (
          <div className="space-y-5 py-4">
            {/* Score Ring + Grade */}
            <div className="flex items-center gap-5 rounded-xl border border-border bg-card p-5">
              <ScoreRing value={roastResult.score} />
              <div>
                <p className="text-sm text-muted-foreground">Overall score</p>
                <p className="text-3xl font-heading font-extrabold">{roastResult.score}%</p>
                <Badge className={`mt-1 ${gradeColors[roastResult.grade] || ''}`}>
                  {roastResult.grade}
                </Badge>
              </div>
            </div>

            {/* Roast Lines */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">What needs fixing</h3>
              {roastResult.roastLines.map((line, idx) => (
                <div key={idx} className="rounded-xl border border-border bg-card p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge className={severityColors[line.severity]}>
                      {line.severity}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{line.category}</span>
                  </div>
                  {line.quote && (
                    <p className="rounded-lg bg-muted/60 px-3 py-2 text-xs italic text-muted-foreground border-l-2 border-border">
                      &ldquo;{line.quote}&rdquo;
                    </p>
                  )}
                  <p className="text-sm"><span className="font-semibold">Critique:</span> {line.critique}</p>
                  <div className="flex items-start gap-2 rounded-lg bg-primary/5 px-3 py-2">
                    <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <p className="text-sm text-primary"><span className="font-semibold">Fix:</span> {line.fix}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Top Fixes */}
            {roastResult.topFixes.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-semibold mb-2">Top priority fixes</h3>
                <ol className="space-y-1 text-sm">
                  {roastResult.topFixes.map((fix, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="font-bold text-primary">{i + 1}.</span>
                      {fix}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Hidden Killer */}
            {roastResult.hiddenKiller && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                  <div>
                    <p className="text-sm font-semibold text-red-700 dark:text-red-300">Hidden killer</p>
                    <p className="text-sm text-red-600/80 dark:text-red-300/80">{roastResult.hiddenKiller}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Fix Step */}
            <div className="border-t border-border pt-5 space-y-4">
              <h3 className="text-sm font-semibold">Fix selected issues</h3>
              {roastResult.roastLines.length > 0 && (
                <div className="space-y-2">
                  {roastResult.roastLines.map((_, idx) => (
                    <label key={idx} className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2 cursor-pointer hover:bg-muted/50">
                      <input
                        type="checkbox"
                        checked={selectedIssues.has(idx)}
                        onChange={() => toggleIssue(idx)}
                        className="h-4 w-4"
                      />
                      <span className="text-sm">{lineCategoryLabel(roastResult.roastLines[idx].category)}: {roastResult.roastLines[idx].critique.slice(0, 80)}...</span>
                    </label>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Button onClick={handleFix} disabled={fixing || selectedIssues.size === 0}>
                  {fixing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Fix {selectedIssues.size} issue{selectedIssues.size !== 1 ? 's' : ''}
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 'fix' && fixedCv && (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Fixed CV
              </h3>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => copyText(fixedCv)}>
                  {copying ? <Check className="mr-1 h-3 w-3" /> : <Copy className="mr-1 h-3 w-3" />}
                  {copying ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </div>
            <pre className="max-h-[40vh] overflow-y-auto rounded-xl border border-border bg-card p-4 text-xs leading-relaxed whitespace-pre-wrap">
              {fixedCv}
            </pre>

            <div className="flex gap-2">
              <Button onClick={() => { setStep('roast'); setSelectedIssues(new Set()) }}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Roast again
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function ScoreRing({ value }: { value: number }) {
  const r = 30
  const c = 2 * Math.PI * r
  const offset = c - (value / 100) * c
  return (
    <div className="relative h-20 w-20">
      <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} fill="none" strokeWidth="8" className="stroke-muted" />
        <circle
          cx="40" cy="40" r={r} fill="none" strokeWidth="8" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={offset} className="stroke-primary transition-all"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-heading text-lg font-extrabold">
        {value}%
      </span>
    </div>
  )
}

function lineCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    summary: 'Summary',
    experience: 'Experience',
    skills: 'Skills',
    format: 'Format',
    quantified: 'Quantification',
    education: 'Education',
    keywords: 'Keywords',
  }
  return labels[category] || category
}