'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Loader2, Target, Check, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { buildResume, type BuildResumeResult } from '@/app/actions/build-resume'
import { CvUpload } from '@/components/dashboard/cv-upload'
import { RoastView } from '@/components/dashboard/roast-view'
import { RESUME_TEMPLATES, type ResumeTemplate } from '@/lib/resume-templates'
import { getTemplatesByTier } from '@/lib/resume-templates'
import type { UsageInfo } from '@/app/actions/queries'

const PAGE_OPTIONS = [
  { value: '1-page', label: '1 page', helper: 'Recommended for 0–5 years of experience.' },
  { value: '2-page', label: '2 pages', helper: 'Use if you have 5+ years or extensive leadership experience.' },
] as const

const TIER_ORDER: Record<string, number> = { free: 1, pro: 2, unlimited: 3 }
const TIER_LABEL: Record<string, string> = { free: 'Free', pro: 'Pro', unlimited: 'Unlimited' }
const TIER_COLOR: Record<string, string> = { free: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300', pro: 'bg-primary/10 text-primary', unlimited: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' }

export function BuildResumeForm({ usage }: { usage: UsageInfo }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [targetRole, setTargetRole] = useState('')
  const [yearsOfExperience, setYearsOfExperience] = useState('')
  const [industry, setIndustry] = useState('')
  const [previousCv, setPreviousCv] = useState('')
  const [achievements, setAchievements] = useState('')
  const [pagePreference, setPagePreference] = useState<'1-page' | '2-page'>('1-page')
  const [fileName, setFileName] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('google')
  const [scanResult, setScanResult] = useState<NonNullable<BuildResumeResult['scan']> | null>(null)
  const [roastOpen, setRoastOpen] = useState(false)
  const [builtCvText, setBuiltCvText] = useState<string | null>(null)

  const cvRemaining = usage.features.cvTailoring.remaining
  const templateRemaining = usage.features.resumeTemplate?.remaining ?? 0
  const aiScanLimit = usage.features.aiResumeScan?.limit ?? 0
  const aiScanRemaining = usage.features.aiResumeScan?.remaining ?? 0
  const aiScanAvailable = aiScanLimit !== 0 && aiScanRemaining > 0
  const availableTemplates = getTemplatesByTier(usage.plan)

  const canUseTemplate = (template: ResumeTemplate): boolean => {
    const userLevel = TIER_ORDER[usage.plan as string] ?? 1
    const templateLevel = TIER_ORDER[template.tier] ?? 1
    return userLevel >= templateLevel
  }

  const handleTemplateSelect = (slug: string) => {
    const template = RESUME_TEMPLATES.find((t) => t.slug === slug)
    if (!template) return
    if (!canUseTemplate(template)) {
      router.push('/dashboard/billing')
      return
    }
    setSelectedTemplate(slug)
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setScanResult(null)

    const years = Number(yearsOfExperience)
    if (!targetRole.trim()) {
      toast.error('Please enter a target role.')
      setLoading(false)
      return
    }
    if (!years || years < 0) {
      toast.error('Please enter a valid number of years of experience.')
      setLoading(false)
      return
    }

    const result = await buildResume({
      targetRole,
      yearsOfExperience: years,
      industry: industry.trim(),
      previousCv: previousCv || undefined,
      achievements: achievements.trim() || undefined,
      pagePreference,
      templateSlug: selectedTemplate,
      targetRoleRaw: targetRole,
    })

    if (result.ok && result.cvId) {
      toast.success('Your resume has been built!')
      if (result.scan) {
        setScanResult(result.scan)
      }
      if (result.builtCv) {
        setBuiltCvText(result.builtCv)
      }
      setLoading(false)
    } else {
      setLoading(false)
      toast.error(result.error ?? 'Something went wrong.')
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-heading font-bold">Choose a template</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Each template follows a different industry format. Pick the style that best matches your target role.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {availableTemplates.map((template) => {
            const unlocked = canUseTemplate(template)
            const isLocked = !unlocked
            return (
              <button
                key={template.slug}
                type="button"
                onClick={() => handleTemplateSelect(template.slug)}
                disabled={isLocked}
                className={`relative flex flex-col rounded-xl border p-4 text-left transition-all ${
                  selectedTemplate === template.slug && unlocked
                    ? 'border-primary bg-primary/5 ring-2 ring-primary ring-offset-2 ring-offset-background'
                    : 'border-border hover:border-border hover:bg-muted/30'
                } ${isLocked ? 'cursor-not-allowed opacity-60' : ''}`}
              >
                {isLocked && (
                  <div className="absolute top-2 right-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{template.name}</h3>
                  <span className={`text-xs font-semibold ${TIER_COLOR[template.tier]} rounded-full px-2 py-0.5`}>
                    {TIER_LABEL[template.tier]}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-3 flex-1">
                  {template.description}
                </p>
                {selectedTemplate === template.slug && unlocked && (
                  <Check className="mt-2 h-4 w-4 text-primary self-start" />
                )}
              </button>
            )
          })}
        </div>

        {!canUseTemplate(RESUME_TEMPLATES.find((t) => t.slug === selectedTemplate) ?? RESUME_TEMPLATES[0]) && (
          <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
            <span className="font-semibold text-primary">Upgrade required</span>
            <span className="text-muted-foreground"> — This template is only available on </span>
            <span className="font-medium">{TIER_LABEL[RESUME_TEMPLATES.find((t) => t.slug === selectedTemplate)?.tier ?? 'pro']}</span>
            <span className="text-muted-foreground"> or higher.</span>
            <Button
              variant="link"
              className="ml-2 h-auto p-0 text-primary"
              onClick={() => router.push('/dashboard/billing')}
            >
              Upgrade now
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="targetRole">Target role *</Label>
        <Input
          id="targetRole"
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          placeholder="e.g. Senior Software Engineer"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="industry">Industry / Field</Label>
        <Input
          id="industry"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          placeholder="e.g. SaaS, Fintech, Healthcare"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="yearsOfExperience">Years of experience *</Label>
        <Input
          id="yearsOfExperience"
          type="number"
          min="0"
          max="50"
          value={yearsOfExperience}
          onChange={(e) => setYearsOfExperience(e.target.value)}
          placeholder="e.g. 3"
          required
        />
        <p className="text-xs text-muted-foreground">
          We recommend 1 page for 0–5 years, and 2 pages for 6+ years.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Resume length</Label>
        <div className="grid gap-3 sm:grid-cols-2">
          {PAGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setPagePreference(option.value)}
              className={`flex flex-col rounded-xl border px-4 py-3 text-left transition-colors ${
                pagePreference === option.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-muted-foreground/30'
              }`}
            >
              <span
                className={`text-sm font-semibold ${
                  pagePreference === option.value ? 'text-primary' : 'text-foreground'
                }`}
              >
                {option.label}
              </span>
              <span className="mt-0.5 text-xs text-muted-foreground">{option.helper}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="previousCv">Previous resume (optional)</Label>
        <CvUpload
          onExtracted={(text) => {
            setPreviousCv(text)
            setFileName(null)
          }}
        />
        {fileName && (
          <p className="text-xs text-muted-foreground">
            Using uploaded file. You can still edit the extracted text below.
          </p>
        )}
        <Textarea
          id="previousCv"
          value={previousCv}
          onChange={(e) => setPreviousCv(e.target.value)}
          placeholder="Upload a file above, or paste your current resume as plain text here..."
          className="min-h-40 resize-y"
        />
        <p className="text-xs text-muted-foreground">
          We'll pull facts and achievements from this — we won't invent anything new.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="achievements">Key achievements to highlight (optional)</Label>
        <Textarea
          id="achievements"
          value={achievements}
          onChange={(e) => setAchievements(e.target.value)}
          placeholder="e.g. Increased revenue by 30%, Led a team of 12, Reduced costs by $200K..."
          className="min-h-24 resize-y"
        />
        <p className="text-xs text-muted-foreground">
          Add any metrics or wins you want us to make sure stand out.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Usage limits</h3>
            <p className="text-xs text-muted-foreground">
              {cvRemaining === Infinity
                ? 'Unlimited builds'
                : `${cvRemaining} build${cvRemaining === 1 ? '' : 's'} remaining this period`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Templates used</p>
             <p className="font-semibold">
               {templateRemaining === Infinity
                 ? 'Unlimited'
                 : `${Math.max(0, (usage.features.resumeTemplate?.limit ?? 0) - templateRemaining)} / ${usage.features.resumeTemplate?.limit ?? 0}`}
             </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Build a professional, ATS-safe resume from scratch with AI assistance.
        </p>
        <Button type="submit" size="lg" disabled={loading} className="w-full sm:w-auto">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Building your
              resume...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" /> Build my resume
            </>
          )}
        </Button>
      </div>

      {scanResult && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
          <h3 className="font-heading font-bold">AI Quality Scan Results</h3>
          <p className="mt-1 text-sm text-muted-foreground">{scanResult.summary}</p>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">ATS Readiness</p>
              <p className="mt-1 font-heading text-2xl font-extrabold">{scanResult.atsReadinessScore}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Format Safety</p>
              <p className="mt-1 font-heading text-2xl font-extrabold">{scanResult.formatSafetyScore}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Quantification</p>
              <p className="mt-1 font-heading text-2xl font-extrabold">{scanResult.quantificationScore}%</p>
            </div>
          </div>

          {scanResult.issues.length > 0 && (
            <div className="mt-4 space-y-3">
              {scanResult.issues.slice(0, 5).map((issue, i) => (
                <div key={i} className="rounded-lg border border-border bg-card p-3">
                  <div className="flex items-start justify-between">
                    <p className="font-medium text-sm">{issue.issue}</p>
                    <span className={`text-[10px] font-semibold uppercase ${
                      issue.severity === 'critical'
                        ? 'text-destructive'
                        : issue.severity === 'high'
                          ? 'text-orange-600'
                          : issue.severity === 'medium'
                            ? 'text-yellow-600'
                            : 'text-muted-foreground'
                    }`}>
                      {issue.severity}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground"><strong>Fix:</strong> {issue.fix}</p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex gap-2">
            <Button size="sm" onClick={() => router.push('/dashboard/cvs')}>
              View your CV
            </Button>
            {builtCvText && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRoastOpen(true)}
              >
                <Sparkles className="mr-2 h-4 w-4" /> Roast my resume
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                window.location.href = '/dashboard/interview?tab=career-roadmap'
              }}
            >
              Generate career roadmap
            </Button>
          </div>
        </div>
      )}

      {builtCvText && (
        <RoastView
          cvText={builtCvText}
          open={roastOpen}
          onOpenChange={setRoastOpen}
        />
      )}
    </form>
  )
}
