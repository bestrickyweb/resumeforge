'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { submitFeedback } from '@/app/actions/feedback'

export function FeedbackModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function onsubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    const res = await submitFeedback({ rating, comment })
    if (res.ok) {
      toast.success('Thanks for your feedback!')
      onOpenChange(false)
      setRating(0)
      setComment('')
    } else {
      toast.error(res.error ?? 'Could not submit feedback.')
    }
    setSubmitting(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <form onSubmit={onsubmit}>
          <DialogHeader>
            <DialogTitle>Help us improve ResumeForge</DialogTitle>
            <DialogDescription>
              This is a one-time question. How would you rate your experience so far?
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="rounded-full p-1 transition-colors hover:bg-muted"
              >
                <Star
                  className={`h-6 w-6 ${star <= rating ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`}
                />
              </button>
            ))}
          </div>

          <div className="mt-4">
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us what you like or what we can improve..."
              className="min-h-24"
              required
            />
          </div>

          <DialogFooter className="mt-4">
            <Button type="submit" disabled={submitting || rating === 0}>
              {submitting ? 'Submitting...' : 'Submit feedback'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
