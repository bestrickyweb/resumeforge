'use client'

import { useState } from 'react'
import { MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FeedbackModal } from '@/components/dashboard/feedback-modal'

export function FeedbackBanner() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MessageSquare className="h-4 w-4" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-medium">Help us improve ResumeForge</p>
            <p className="mt-1 text-xs text-muted-foreground">
              We are iterating fast. This is a one-time question — your feedback directly shapes new features.
            </p>
            <Button size="sm" className="mt-3" variant="secondary" onClick={() => setModalOpen(true)}>
              Share feedback
            </Button>
          </div>
        </div>
      </div>
      <FeedbackModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  )
}
