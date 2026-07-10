'use client'

import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { importLinkedInProfile, optimizeLinkedInProfile } from '@/app/actions/linkedin'

export function LinkedInOptimizer() {
  const [profileText, setProfileText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    headline?: string
    about?: string
    skills?: string[]
    score?: number
  } | null>(null)
  const [imported, setImported] = useState(false)

  async function onImport(e: React.FormEvent) {
    e.preventDefault()
    if (!profileText.trim()) {
      toast.error('Please paste your LinkedIn profile text or URL.')
      return
    }
    setLoading(true)
    const res = await importLinkedInProfile({ urlOrText: profileText })
    setLoading(false)
    if (res.ok) {
      setImported(true)
      toast.success('LinkedIn profile imported.')
    } else {
      toast.error(res.error ?? 'Could not import profile.')
    }
  }

  async function onOptimize() {
    setLoading(true)
    const res = await optimizeLinkedInProfile({})
    setLoading(false)
    if (res.ok) {
      setResult({
        headline: res.headline,
        about: res.about,
        skills: res.skills,
        score: res.score,
      })
      toast.success('Profile optimized.')
    } else {
      toast.error(res.error ?? 'Could not optimize profile.')
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onImport} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">LinkedIn profile text or URL</label>
          <Textarea
            value={profileText}
            onChange={(e) => setProfileText(e.target.value)}
            placeholder="Paste your LinkedIn headline, about section, and skills here..."
            className="min-h-40 resize-y"
          />
        </div>
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {imported ? 'Profile imported. You can now optimize it.' : 'Import your profile to enable optimization.'}
          </p>
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Importing...
              </>
            ) : (
              'Import profile'
            )}
          </Button>
        </div>
      </form>

      {imported && (
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-heading text-lg font-bold">Optimize profile</p>
              <p className="text-sm text-muted-foreground">
                Get AI suggestions to improve your headline, about, and skills.
              </p>
            </div>
            <Button onClick={onOptimize} disabled={loading} className="w-full sm:w-auto">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Optimizing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" /> Optimize
                </>
              )}
            </Button>
          </div>

          {result && (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="relative h-14 w-14">
                  <svg className="h-14 w-14 -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r={28} fill="none" strokeWidth="8" className="stroke-muted" />
                    <circle cx="40" cy="40" r={28} fill="none" strokeWidth="8" strokeLinecap="round" strokeDasharray={2 * Math.PI * 28} strokeDashoffset={2 * Math.PI * 28 - ((result.score ?? 0) / 100) * 2 * Math.PI * 28} className="stroke-primary transition-all" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center font-heading text-base font-extrabold">{result.score ?? 0}%</span>
                </div>
                <p className="text-sm text-muted-foreground">Profile optimization score</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Suggested headline</p>
                  <p className="rounded-xl border border-border bg-background p-3 text-sm">{result.headline}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Suggested about</p>
                  <p className="rounded-xl border border-border bg-background p-3 text-sm whitespace-pre-wrap">{result.about}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold">Suggested skills</p>
                <div className="flex flex-wrap gap-2">
                  {result.skills?.map((s) => (
                    <span key={s} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
