'use client'

import { useState } from 'react'
import { Sparkles, Loader2, Target } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CvUpload } from '@/components/dashboard/cv-upload'
import { generateCareerRoadmap } from '@/app/actions/roadmap'
import { RoadmapTabs } from '@/components/dashboard/roadmap-tabs'
import type { CareerRoadmap } from '@/app/actions/roadmap'

export function RoadmapPanel() {
  const [loading, setLoading] = useState(false)
  const [jobTitle, setJobTitle] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [cvText, setCvText] = useState('')
  const [hoursPerWeek, setHoursPerWeek] = useState(5)
  const [targetDeadline, setTargetDeadline] = useState('')
  const [result, setResult] = useState<{ ok: boolean; roadmap?: CareerRoadmap; error?: string } | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    const res = await generateCareerRoadmap({
      jobDescription,
      cvText,
      hoursPerWeek,
      targetDeadline: targetDeadline || undefined,
      targetRole: jobTitle || undefined,
    })

    setLoading(false)
    if (res.ok && res.roadmap) {
      setResult({ ok: true, roadmap: res.roadmap })
      toast.success('Your career roadmap is ready!')
    } else {
      setResult({ ok: false, error: res.error ?? 'Could not generate roadmap.' })
      toast.error(res.error ?? 'Could not generate roadmap.')
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="jobTitle">Target role (optional)</Label>
        <Input
          id="jobTitle"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          placeholder="e.g. Senior Frontend Engineer"
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
          <CvUpload onExtracted={(text) => setCvText(text)} />
          <Textarea
            id="originalCv"
            required
            value={cvText}
            onChange={(e) => setCvText(e.target.value)}
            placeholder="Upload a file above, or paste your current CV as plain text..."
            className="min-h-64 resize-y"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="hoursPerWeek">Hours you can study per week</Label>
          <Input
            id="hoursPerWeek"
            type="number"
            min={1}
            max={40}
            value={hoursPerWeek}
            onChange={(e) => setHoursPerWeek(Number(e.target.value))}
          />
          <p className="text-xs text-muted-foreground">
            Be realistic. 3–10 hrs/week is sustainable for most people.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="targetDeadline">Target deadline (optional)</Label>
          <Input
            id="targetDeadline"
            type="date"
            value={targetDeadline}
            onChange={(e) => setTargetDeadline(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            When do you want to be ready to apply?
          </p>
        </div>
      </div>

      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Get a fit score, gap breakdown, and a personalized week-by-week learning plan.
        </p>
        <Button type="submit" size="lg" disabled={loading} className="w-full sm:w-auto">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Building your roadmap...
            </>
          ) : (
            <>
              <Target className="mr-2 h-4 w-4" /> Generate roadmap
            </>
          )}
        </Button>
      </div>

      {result?.error && !result.ok && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {result.error}
        </div>
      )}

      {result?.ok && result.roadmap && (
        <RoadmapTabs roadmap={result.roadmap} hoursPerWeek={hoursPerWeek} />
      )}
    </form>
  )
}
