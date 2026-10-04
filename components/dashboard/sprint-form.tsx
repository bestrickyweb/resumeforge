'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createSprint } from '@/app/actions/sprint'

export function SprintForm() {
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const result = await createSprint({
      goalRole: formData.get('goalRole') as string,
      durationWeeks: parseInt(formData.get('durationWeeks') as string) || 12,
      targetApplications: parseInt(formData.get('targetApplications') as string) || 10,
      targetInterviews: parseInt(formData.get('targetInterviews') as string) || 3,
    })
    setLoading(false)
    if (result.ok) {
      toast.success('Sprint started!')
      window.location.href = '/dashboard/interview?tab=career-sprint'
    } else {
      toast.error(result.error ?? 'Could not create sprint')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="goalRole">Target role</Label>
        <Input id="goalRole" name="goalRole" required minLength={3} placeholder="e.g. Product Manager" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="durationWeeks">Duration (weeks)</Label>
          <Input id="durationWeeks" name="durationWeeks" type="number" min={4} max={24} defaultValue={12} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="targetApplications">Target applications</Label>
          <Input id="targetApplications" name="targetApplications" type="number" min={1} defaultValue={10} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="targetInterviews">Target interviews</Label>
          <Input id="targetInterviews" name="targetInterviews" type="number" min={1} defaultValue={3} />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Starting...' : 'Start Sprint'}
      </Button>
    </form>
  )
}
