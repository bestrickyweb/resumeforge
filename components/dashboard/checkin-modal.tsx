'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import {
  submitWeeklyCheckin,
} from '@/app/actions/sprint'

const MOODS = [
  { value: 1, emoji: "😫", label: "Drained" },
  { value: 2, emoji: "😕", label: "Struggling" },
  { value: 3, emoji: "😐", label: "Okay" },
  { value: 4, emoji: "🙂", label: "Good" },
  { value: 5, emoji: "🤩", label: "Great" },
]

export function CheckinModal({
  open,
  onOpenChange,
  sprintId,
  sprintStartDate,
  currentWeek,
  milestones,
  onSubmitted,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  sprintId: number
  sprintStartDate: string
  currentWeek: number
  milestones: any[]
  onSubmitted: () => void
}) {
  const [mood, setMood] = useState<number>(3)
  const [applicationsSent, setApplicationsSent] = useState<string>('0')
  const [interviewsAttended, setInterviewsAttended] = useState<string>('0')
  const [offersReceived, setOffersReceived] = useState<string>('0')
  const [skillsCompleted, setSkillsCompleted] = useState<string[]>([])
  const [blockers, setBlockers] = useState<string>('')
  const [nextWeekFocus, setNextWeekFocus] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const skillOptions = Array.from(new Set(
    (milestones || []).flatMap((m: any) => [m.title, m.description])
      .concat(['resume', 'networking', 'interview', 'portfolio', 'negotiation', 'job search'])
  )).slice(0, 12)

  function toggleSkill(skill: string) {
    setSkillsCompleted(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    )
  }

  async function handleSubmit() {
    setLoading(true)
    try {
      const weekNumber = Math.max(1, currentWeek)
      const res = await submitWeeklyCheckin(sprintId, {
        weekNumber,
        applicationsSent: parseInt(applicationsSent) || 0,
        interviewsAttended: parseInt(interviewsAttended) || 0,
        offersReceived: parseInt(offersReceived) || 0,
        skillsCompleted,
        blockers: blockers || undefined,
        nextWeekFocus: nextWeekFocus || undefined,
        mood,
      })
      if (res.ok) {
        toast.success('Check-in submitted!')
        onSubmitted()
        onOpenChange(false)
        resetForm()
      } else {
        toast.error('Failed to submit check-in')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setMood(3)
    setApplicationsSent('0')
    setInterviewsAttended('0')
    setOffersReceived('0')
    setSkillsCompleted([])
    setBlockers('')
    setNextWeekFocus('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Weekly Check-in</DialogTitle>
          <DialogDescription>Reflect on your sprint progress this week.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Mood selector */}
          <div className="space-y-2">
            <Label>How was your week?</Label>
            <div className="flex items-center gap-2">
              {MOODS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMood(m.value)}
                  className={`flex flex-col items-center gap-1 rounded-lg border px-3 py-2 transition-colors ${
                    mood === m.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  <span className="text-xl">{m.emoji}</span>
                  <span className="text-[10px] text-muted-foreground">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Numbers */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="applications">Applications sent</Label>
              <Input
                id="applications"
                type="number"
                min={0}
                value={applicationsSent}
                onChange={(e) => setApplicationsSent(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="interviews">Interviews attended</Label>
              <Input
                id="interviews"
                type="number"
                min={0}
                value={interviewsAttended}
                onChange={(e) => setInterviewsAttended(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="offers">Offers received</Label>
              <Input
                id="offers"
                type="number"
                min={0}
                value={offersReceived}
                onChange={(e) => setOffersReceived(e.target.value)}
              />
            </div>
          </div>

          {/* Skills completed */}
          <div className="space-y-2">
            <Label>Skills completed this week</Label>
            <div className="flex flex-wrap gap-2">
              {skillOptions.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                    skillsCompleted.includes(skill)
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {/* Blockers */}
          <div className="space-y-1.5">
            <Label htmlFor="blockers">Blockers</Label>
            <Textarea
              id="blockers"
              placeholder="What's stopping you?"
              value={blockers}
              onChange={(e) => setBlockers(e.target.value)}
            />
          </div>

          {/* Next week focus */}
          <div className="space-y-1.5">
            <Label htmlFor="nextWeekFocus">Focus for next week</Label>
            <Textarea
              id="nextWeekFocus"
              placeholder="What do you want to prioritize?"
              value={nextWeekFocus}
              onChange={(e) => setNextWeekFocus(e.target.value)}
            />
          </div>

          <Button className="w-full" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Check-in'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
