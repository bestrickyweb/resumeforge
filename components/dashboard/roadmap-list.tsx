'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Map, Plus, Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { bandBadgeClass, bandLabel, interviewBand } from '@/lib/utils'

interface RoadmapSummary {
  id: number
  targetRole: string
  readinessScore: number
  estimatedWeeks: number | null
  status: string
  createdAt: string
  hoursPerWeek: number
}

export function RoadmapList() {
  const [roadmaps, setRoadmaps] = useState<RoadmapSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch('/api/roadmaps')
        if (res.ok) {
          const data = await res.json()
          if (!cancelled) setRoadmaps(data.roadmaps ?? [])
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  async function onDelete(id: number) {
    const res = await fetch(`/api/roadmaps/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setRoadmaps((prev) => prev.filter((r) => r.id !== id))
      toast.success('Roadmap deleted')
    } else {
      toast.error('Could not delete roadmap')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (roadmaps.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center gap-4 p-8 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Map className="h-6 w-6" />
        </span>
        <div>
          <p className="font-medium">No roadmaps yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Generate a career roadmap to see your personalized learning plan here.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/roadmap">
            <Plus className="mr-2 h-4 w-4" /> Generate your first roadmap
          </Link>
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {roadmaps.map((r) => {
        const band = interviewBand(r.readinessScore)
        return (
          <Card key={r.id} className="flex items-center justify-between gap-4 p-4">
            <div className="min-w-0 flex-1">
              <p className="font-medium">{r.targetRole}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                {r.estimatedWeeks ? ` · ${r.estimatedWeeks} weeks · ${r.hoursPerWeek} hrs/week` : ''}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${bandBadgeClass[band]}`}>
                  {bandLabel[band]}
                </span>
                <Badge variant="outline" className="text-[10px]">
                  {r.status}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/dashboard/roadmap/${r.id}`}>
                <Button variant="outline" size="sm">View</Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(r.id)}
                aria-label="Delete roadmap"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
