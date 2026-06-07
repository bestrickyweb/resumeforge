"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import {
  createApplication,
  updateApplication,
} from "@/app/actions/applications"
import {
  APPLICATION_STATUSES,
  STATUS_LABELS,
  type ApplicationStatus,
} from "@/lib/applications"

type Application = {
  id: number
  company: string
  role: string
  status: string
  jobUrl: string | null
  location: string | null
  salary: string | null
  notes: string | null
}

export function ApplicationDialog({
  open,
  onOpenChange,
  application,
  cvs,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  application: Application | null
  cvs: { id: number; jobTitle: string; company: string | null }[]
}) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [form, setForm] = useState({
    company: "",
    role: "",
    status: "saved" as ApplicationStatus,
    jobUrl: "",
    location: "",
    salary: "",
    notes: "",
  })

  useEffect(() => {
    if (open) {
      setForm({
        company: application?.company ?? "",
        role: application?.role ?? "",
        status: (application?.status as ApplicationStatus) ?? "saved",
        jobUrl: application?.jobUrl ?? "",
        location: application?.location ?? "",
        salary: application?.salary ?? "",
        notes: application?.notes ?? "",
      })
    }
  }, [open, application])

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.company.trim() || !form.role.trim()) {
      toast.error("Company and role are required")
      return
    }
    setPending(true)
    const res = application
      ? await updateApplication(application.id, form)
      : await createApplication(form)
    setPending(false)
    if (res && res.ok === false) {
      const message =
        "error" in res && typeof res.error === "string"
          ? res.error
          : "Something went wrong"
      toast.error(message)
      return
    }
    toast.success(application ? "Application updated" : "Application added")
    onOpenChange(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {application ? "Edit application" : "Add application"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={form.company}
                onChange={(e) => set("company", e.target.value)}
                placeholder="Paystack"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={form.role}
                onChange={(e) => set("role", e.target.value)}
                placeholder="Product Manager"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => set("status", v as ApplicationStatus)}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {APPLICATION_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="Lagos / Remote"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="salary">Salary (optional)</Label>
              <Input
                id="salary"
                value={form.salary}
                onChange={(e) => set("salary", e.target.value)}
                placeholder="₦600k/mo"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="jobUrl">Job link (optional)</Label>
              <Input
                id="jobUrl"
                type="url"
                value={form.jobUrl}
                onChange={(e) => set("jobUrl", e.target.value)}
                placeholder="https://"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Referral from Ada, interview scheduled for Friday..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : application ? "Save changes" : "Add application"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
