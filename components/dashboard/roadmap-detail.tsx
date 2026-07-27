'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { RoadmapTabs } from '@/components/dashboard/roadmap-tabs'
import type { CareerRoadmap } from '@/app/actions/roadmap'

type ProgressMap = Record<string, 'not_started' | 'in_progress' | 'completed'>

export function RoadmapDetail({ roadmap }: { roadmap: CareerRoadmap & { id: number; createdAt: string; estimatedWeeks?: number | null; hoursPerWeek?: number | null; completionDate?: string | null } }) {
  const [localStatus, setLocalStatus] = useState<ProgressMap>({})

  useEffect(() => {
    let cancelled = false
    async function loadProgress() {
      try {
        const res = await fetch(`/api/roadmaps/${roadmap.id}/progress`)
        if (res.ok) {
          const data = await res.json()
          const map: ProgressMap = {}
          for (const p of data.progress ?? []) {
            map[p.skillName] = p.status
          }
          if (!cancelled) setLocalStatus(map)
        }
      } catch {
        // ignore
      }
    }
    loadProgress()
    return () => { cancelled = true }
  }, [roadmap.id])

  const handleProgressChange = useCallback(async (skillName: string, status: 'not_started' | 'in_progress' | 'completed') => {
    setLocalStatus((prev) => ({ ...prev, [skillName]: status }))
    try {
      const res = await fetch(`/api/roadmaps/${roadmap.id}/progress`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillName, status }),
      })
      if (!res.ok) {
        toast.error('Could not update progress')
      }
    } catch {
      toast.error('Could not update progress')
    }
  }, [roadmap.id])

  return (
    <div className="space-y-4">
      <RoadmapTabs
        roadmap={roadmap}
        hoursPerWeek={roadmap.hoursPerWeek ?? undefined}
        showProgress
        initialProgress={localStatus}
        onProgressChange={handleProgressChange}
      />
      <div className="flex justify-end">
        <Button asChild variant="outline">
          <Link href="/dashboard/roadmap">New Analysis</Link>
        </Button>
      </div>
    </div>
  )
}
