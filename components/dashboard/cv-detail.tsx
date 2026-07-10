'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Download, Trash2, Check, KanbanSquare, Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { jsPDF } from 'jspdf'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { deleteTailoredCv } from '@/app/actions/tailor'
import { createApplication } from '@/app/actions/applications'
import { scanAchievements } from '@/app/actions/scan'
import { cn } from '@/lib/utils'

interface CvRow {
  id: number
  userName: string
  jobTitle: string
  company: string | null
  summary: string | null
  tailoredCv: string
  coverLetter: string | null
  originalCv: string
  keywords: string | null
  matchBefore: number
  matchAfter: number
  createdAt: Date
}

function ScoreRing({ value }: { value: number }) {
  const r = 30
  const c = 2 * Math.PI * r
  const offset = c - (value / 100) * c
  return (
    <div className="relative h-20 w-20">
      <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          strokeWidth="8"
          className="stroke-muted"
        />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="stroke-primary transition-all"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-heading text-lg font-extrabold">
        {value}%
      </span>
    </div>
  )
}

export function CvDetail({ cv }: { cv: CvRow }) {
  const router = useRouter()
  const [copied, setCopied] = useState<string | null>(null)
  const [trackOpen, setTrackOpen] = useState(false)
  const [deleting, startDelete] = useTransition()
  const [tracking, startTrack] = useTransition()
  const [downloadFormat, setDownloadFormat] = useState<'txt' | 'pdf'>('txt')
  const [achievementsOpen, setAchievementsOpen] = useState(false)
  const [achievementsLoading, setAchievementsLoading] = useState(false)
  const [achievements, setAchievements] = useState<{ originalBullet: string; hasMetric: boolean; suggestion: string; metricType: string }[]>([])
  const [coverageScore, setCoverageScore] = useState<number | null>(null)

  const keywords: string[] = (() => {
    try {
      return cv.keywords ? JSON.parse(cv.keywords) : []
    } catch {
      return []
    }
  })()

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopied(null), 1500)
  }

  function generateFileName(suffix: string, ext: string): string {
    const namePart = cv.userName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '')
    const titlePart = cv.jobTitle.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '')
    return `${namePart}-${titlePart}-${suffix}.${ext}`
  }

  function downloadTxt(text: string, fileName: string) {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
  }

  function downloadPdf(text: string, fileName: string) {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 15
    const maxLineWidth = pageWidth - margin * 2
    const lineHeight = 5

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)

    const lines = doc.splitTextToSize(text, maxLineWidth)
    let y = margin

    for (const line of lines) {
      if (y > 280) {
        doc.addPage()
        y = margin
      }
      doc.text(line, margin, y)
      y += lineHeight
    }

    doc.save(fileName)
  }

  function download(text: string, suffix: string, format: 'txt' | 'pdf') {
    const ext = format
    const fileName = generateFileName(suffix, ext)
    if (format === 'pdf') {
      downloadPdf(text, fileName)
    } else {
      downloadTxt(text, fileName)
    }
  }

  function onDelete() {
    startDelete(async () => {
      await deleteTailoredCv(cv.id)
      toast.success('CV deleted')
      router.push('/dashboard/cvs')
    })
  }

  function onTrack() {
    startTrack(async () => {
      const res = await createApplication({
        company: cv.company || 'Unknown company',
        role: cv.jobTitle,
        status: 'applied',
        cvId: cv.id,
      })
      if (res.ok) {
        toast.success('Added to your application tracker')
        setTrackOpen(false)
        router.push('/dashboard/applications')
      } else {
        toast.error(res.error ?? 'Could not add application')
      }
    })
  }

  async function onScanAchievements() {
    setAchievementsLoading(true)
    setAchievements([])
    setCoverageScore(null)
    const res = await scanAchievements({ cvText: cv.tailoredCv || cv.originalCv })
    setAchievementsLoading(false)
    if (res.ok && res.achievements) {
      setAchievements(res.achievements)
      setCoverageScore(res.coverageScore ?? null)
      setAchievementsOpen(true)
    } else {
      toast.error(res.error || 'Could not scan achievements')
    }
  }

  const delta = cv.matchAfter - cv.matchBefore

  return (
    <div>
      <div className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <ScoreRing value={cv.matchAfter} />
          <div>
            <h1 className="font-heading text-2xl font-extrabold tracking-tight">
              {cv.jobTitle}
            </h1>
            <p className="text-sm text-muted-foreground">
              {cv.company || 'Tailored CV'}
            </p>
            <p className="mt-1 text-sm">
              <span className="text-muted-foreground">
                ATS match {cv.matchBefore}% →{' '}
              </span>
              <span className="font-semibold text-primary">
                {cv.matchAfter}%
              </span>
              {delta > 0 && (
                <span className="ml-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  +{delta}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={onScanAchievements} variant="outline" size="sm">
            <Sparkles className="mr-2 h-4 w-4" /> Achievements scanner
          </Button>
          <Button onClick={() => setTrackOpen(true)} variant="outline" size="sm">
            <KanbanSquare className="mr-2 h-4 w-4" /> Track application
          </Button>
          <Button
            onClick={onDelete}
            variant="ghost"
            size="sm"
            disabled={deleting}
            className="text-destructive hover:text-destructive"
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {keywords.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-muted-foreground">
            Matched keywords
          </h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {keywords.map((k) => (
              <span
                key={k}
                className="rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary"
              >
                {k}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <Tabs defaultValue="tailored">
          <TabsList>
            <TabsTrigger value="tailored">Tailored CV</TabsTrigger>
            <TabsTrigger value="cover">Cover letter</TabsTrigger>
            <TabsTrigger value="original">Original</TabsTrigger>
          </TabsList>

          <TabsContent value="tailored">
            <DocPanel
              text={cv.tailoredCv}
              onCopy={() => copy(cv.tailoredCv, 'tailored')}
              onDownload={() => download(cv.tailoredCv, 'cv', downloadFormat)}
              copied={copied === 'tailored'}
              format={downloadFormat}
              onFormatChange={setDownloadFormat}
            />
          </TabsContent>
          <TabsContent value="cover">
            <DocPanel
              text={cv.coverLetter || 'No cover letter was generated.'}
              onCopy={() => copy(cv.coverLetter || '', 'cover')}
              onDownload={() => download(cv.coverLetter || '', 'cover-letter', downloadFormat)}
              copied={copied === 'cover'}
              format={downloadFormat}
              onFormatChange={setDownloadFormat}
            />
          </TabsContent>
          <TabsContent value="original">
            <DocPanel text={cv.originalCv} muted />
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={trackOpen} onOpenChange={setTrackOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Track this application</DialogTitle>
            <DialogDescription>
              Add {cv.jobTitle}
              {cv.company ? ` at ${cv.company}` : ''} to your application
              tracker so you can follow its progress.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTrackOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onTrack} disabled={tracking}>
              {tracking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add to tracker
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={achievementsOpen} onOpenChange={setAchievementsOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Achievements scanner</DialogTitle>
            <DialogDescription>
              {coverageScore !== null
                ? `Metric coverage: ${coverageScore}%`
                : 'Scanning your CV for achievement metrics...'}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] space-y-3 overflow-y-auto">
            {achievements.map((item, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-border bg-card p-4"
              >
                <p className="text-sm font-medium">{item.originalBullet}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Status:{' '}
                  <span className={item.hasMetric ? 'text-primary' : 'text-destructive'}>
                    {item.hasMetric ? 'Metric present' : 'Needs metric'}
                  </span>
                </p>
                {!item.hasMetric && (
                  <div className="mt-2 rounded-lg bg-muted/60 p-3 text-xs">
                    <p className="font-semibold">Suggested rewrite</p>
                    <p className="mt-1">{item.suggestion}</p>
                    <p className="mt-1 text-muted-foreground">Metric type: {item.metricType}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function DocPanel({
  text,
  onCopy,
  onDownload,
  copied,
  muted,
  format,
  onFormatChange,
}: {
  text: string
  onCopy?: () => void
  onDownload?: () => void
  copied?: boolean
  muted?: boolean
  format?: 'txt' | 'pdf'
  onFormatChange?: (format: 'txt' | 'pdf') => void
}) {
  return (
    <div className="rounded-xl border border-border bg-card">
      {(onCopy || onDownload) && (
        <div className="flex items-center justify-end gap-2 border-b border-border px-4 py-2">
          {onFormatChange && (
            <Select value={format} onValueChange={(v) => onFormatChange(v as 'txt' | 'pdf')}>
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="txt">TXT</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
              </SelectContent>
            </Select>
          )}
          {onCopy && (
            <Button onClick={onCopy} variant="ghost" size="sm">
              {copied ? (
                <Check className="mr-1.5 h-4 w-4 text-primary" />
              ) : (
                <Copy className="mr-1.5 h-4 w-4" />
              )}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          )}
          {onDownload && (
            <Button onClick={onDownload} variant="ghost" size="sm">
              <Download className="mr-1.5 h-4 w-4" /> Download
            </Button>
          )}
        </div>
      )}
      <pre
        className={cn(
          'overflow-x-auto whitespace-pre-wrap px-5 py-5 font-sans text-sm leading-relaxed',
          muted && 'text-muted-foreground',
        )}
      >
        {text}
      </pre>
    </div>
  )
}
