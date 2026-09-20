'use client'

import { useState } from 'react'
import { Copy, Check, Users, Mail, Send, MessageSquare } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { generateReferralRequest } from '@/app/actions/referral'

export function ReferralDialog({ cvText, jobDescription, tailoredCvId }: { cvText: string; jobDescription?: string; tailoredCvId?: number }) {
  const [open, setOpen] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [referrerName, setReferrerName] = useState('')
  const [referrerRole, setReferrerRole] = useState('')
  const [referrerLinkedInUrl, setReferrerLinkedInUrl] = useState('')
  const [targetCompany, setTargetCompany] = useState('')
  const [result, setResult] = useState<{
    connectionMessage: string
    followUpMessage: string
    referralAsk: string
    suggestedReferrerName: string
  } | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  async function handleGenerate() {
    setGenerating(true)
    const res = await generateReferralRequest({
      cvText,
      jobDescription,
      targetCompany,
      referrerName: referrerName || undefined,
      referrerRole: referrerRole || undefined,
      referrerLinkedInUrl: referrerLinkedInUrl || undefined,
    })
    setGenerating(false)
    if (res.ok && !res.error) {
      setResult({
        connectionMessage: res.connectionMessage || '',
        followUpMessage: res.followUpMessage || '',
        referralAsk: res.referralAsk || '',
        suggestedReferrerName: res.suggestedReferrerName || '',
      })
      toast.success('Referral request generated!')
    } else {
      toast.error(res.error || 'Failed to generate referral')
    }
  }

  async function copyText(text: string, key: string) {
    await navigator.clipboard.writeText(text)
    setCopied(key)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Send className="mr-2 h-4 w-4" /> Request Referral
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Referral Request Composer
            </DialogTitle>
            <DialogDescription>
              Generate a compelling referral request to increase your response rate 4-8x.
            </DialogDescription>
          </DialogHeader>

          {!result ? (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Target Company</Label>
                <Input
                  value={targetCompany}
                  onChange={e => setTargetCompany(e.target.value)}
                  placeholder="e.g. Google, Microsoft, Stripe..."
                />
              </div>

              <div className="space-y-2">
                <Label>Referrer Name (optional)</Label>
                <Input
                  value={referrerName}
                  onChange={e => setReferrerName(e.target.value)}
                  placeholder="If you know someone at the company"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Referrer Role</Label>
                  <Input
                    value={referrerRole}
                    onChange={e => setReferrerRole(e.target.value)}
                    placeholder="e.g. Senior Engineer"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Referrer LinkedIn URL</Label>
                  <Input
                    value={referrerLinkedInUrl}
                    onChange={e => setReferrerLinkedInUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={handleGenerate} disabled={generating || !targetCompany}>
                  {generating && <Mail className="mr-2 h-4 w-4 animate-spin" />}
                  Generate Referral
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Suggested Referrer</p>
                <p className="text-sm font-semibold">{result.suggestedReferrerName}</p>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5" />
                    Connection Message
                  </Label>
                  <div className="relative">
                    <pre className="max-h-[15vh] overflow-y-auto rounded-xl border border-border bg-muted/40 p-4 text-sm whitespace-pre-wrap">
                      {result.connectionMessage}
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2"
                      onClick={() => copyText(result.connectionMessage, 'connection')}
                    >
                      {copied === 'connection' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MessageSquare className="h-3.5 w-3.5" />
                    Follow-up Message
                  </Label>
                  <div className="relative">
                    <pre className="max-h-[15vh] overflow-y-auto rounded-xl border border-border bg-muted/40 p-4 text-sm whitespace-pre-wrap">
                      {result.followUpMessage}
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2"
                      onClick={() => copyText(result.followUpMessage, 'followup')}
                    >
                      {copied === 'followup' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Send className="h-3.5 w-3.5" />
                    Referral Ask
                  </Label>
                  <div className="relative">
                    <pre className="max-h-[15vh] overflow-y-auto rounded-xl border border-border bg-muted/40 p-4 text-sm whitespace-pre-wrap">
                      {result.referralAsk}
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2"
                      onClick={() => copyText(result.referralAsk, 'referralask')}
                    >
                      {copied === 'referralask' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => { setResult(null); setOpen(false) }}>
                  Close
                </Button>
                <Button onClick={() => setOpen(false)}>Done</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}