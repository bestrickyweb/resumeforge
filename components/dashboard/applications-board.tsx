"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import { Plus, MoreVertical, MapPin, ExternalLink, Briefcase, Bell, Clock } from "lucide-react"
import { toast } from "sonner"
import {
  updateApplicationStatus,
  deleteApplication,
} from "@/app/actions/applications"
import { setReminder } from "@/app/actions/reminders"
import { type ApplicationStatus } from "@/lib/applications"
import { ReminderBadge } from "./reminder-badge"
import { ApplicationDialog } from "./application-dialog"

type Application = {
  id: number
  company: string
  role: string
  status: string
  jobUrl: string | null
  location: string | null
  salary: string | null
  notes: string | null
  cvId: number | null
  appliedAt: Date | null
  nextReminderAt: Date | null
  followUpCount: number | null
}

type Stats = { total: number; byStatus: Record<string, number> }
type CvOption = { id: number; jobTitle: string; company: string | null }

const COLUMNS: { id: ApplicationStatus; label: string; tone: string }[] = [
  { id: "saved", label: "Saved", tone: "bg-muted text-muted-foreground" },
  { id: "applied", label: "Applied", tone: "bg-secondary text-secondary-foreground" },
  { id: "screen", label: "Screening", tone: "bg-accent/15 text-accent-foreground" },
  { id: "assessment", label: "Assessment", tone: "bg-accent/15 text-accent-foreground" },
  { id: "interview", label: "Interview", tone: "bg-primary/15 text-primary" },
  { id: "offer", label: "Offer", tone: "bg-primary/15 text-primary" },
  { id: "accepted", label: "Accepted", tone: "bg-success/15 text-success" },
  { id: "declined", label: "Declined", tone: "bg-muted text-muted-foreground" },
  { id: "rejected", label: "Rejected", tone: "bg-destructive/10 text-destructive" },
]

export function ApplicationsBoard({
  applications,
  stats,
  cvs,
}: {
  applications: Application[]
  stats: Stats
  cvs: CvOption[]
}) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Application | null>(null)

  function openNew() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(app: Application) {
    setEditing(app)
    setDialogOpen(true)
  }

  async function move(app: Application, status: ApplicationStatus) {
    await updateApplicationStatus(app.id, status)
    toast.success(`Moved ${app.company} to ${status}`)
    router.refresh()
  }

  async function remove(app: Application) {
    await deleteApplication(app.id)
    toast.success("Application removed")
    router.refresh()
  }

  async function scheduleFollowUp(app: Application, days: number) {
    const when = new Date()
    when.setDate(when.getDate() + days)
    const res = await setReminder({
      applicationId: app.id,
      type: "follow_up",
      scheduledAt: when.toISOString(),
    })
    if (res.ok) {
      toast.success(`Reminder set for ${when.toLocaleDateString()}`)
      router.refresh()
    } else {
      toast.error("Could not set reminder")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <ReminderBadge />
          {COLUMNS.map((c) => (
            <Badge key={c.id} variant="outline" className="gap-1.5 font-normal">
              <span className="font-semibold text-foreground">
                {stats.byStatus[c.id] ?? 0}
              </span>
              {c.label}
            </Badge>
          ))}
        </div>
        <Button onClick={openNew} className="shrink-0">
          <Plus className="mr-1.5 size-4" />
          Add application
        </Button>
      </div>

      {applications.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 p-12 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <Briefcase className="size-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">No applications yet</p>
            <p className="text-sm text-muted-foreground">
              Track every role you apply to so nothing slips through the cracks.
            </p>
          </div>
          <Button onClick={openNew} variant="outline">
            <Plus className="mr-1.5 size-4" />
            Add your first application
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {COLUMNS.map((col) => {
            const items = applications.filter((a) => a.status === col.id)
            return (
              <div key={col.id} className="flex flex-col gap-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-sm font-semibold">{col.label}</h3>
                  <span className="text-xs text-muted-foreground">{items.length}</span>
                </div>
                <div className="flex flex-col gap-3">
                  {items.map((app) => (
                    <Card key={app.id} className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-medium leading-tight">{app.role}</p>
                          <p className="truncate text-sm text-muted-foreground">
                            {app.company}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-7 shrink-0"
                              >
                                <MoreVertical className="size-4" />
                                <span className="sr-only">Application options</span>
                              </Button>
                            }
                          />
                          <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEdit(app)}>
                                Edit details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                  <Bell className="mr-2 size-4" /> Set follow-up reminder
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                  <DropdownMenuItem onClick={() => scheduleFollowUp(app, 3)}>
                                    In 3 days
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => scheduleFollowUp(app, 7)}>
                                    In 7 days
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => scheduleFollowUp(app, 14)}>
                                    In 14 days
                                  </DropdownMenuItem>
                                </DropdownMenuSubContent>
                              </DropdownMenuSub>
                              {COLUMNS.filter((c) => c.id !== app.status).map((c) => (
                                <DropdownMenuItem
                                  key={c.id}
                                  onClick={() => move(app, c.id)}
                                >
                                  Move to {c.label}
                                </DropdownMenuItem>
                              ))}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => remove(app)}
                              >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {(app.location || app.salary) && (
                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                          {app.location && (
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="size-3" />
                              {app.location}
                            </span>
                          )}
                          {app.salary && <span>{app.salary}</span>}
                        </div>
                      )}

                      {app.jobUrl && (
                        <a
                          href={app.jobUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                        >
                          View posting
                          <ExternalLink className="size-3" />
                        </a>
                      )}

                      {app.nextReminderAt && new Date(app.nextReminderAt) > new Date() && (
                        <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          <Clock className="size-3" />
                          Reminder {new Date(app.nextReminderAt).toLocaleDateString()}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <ApplicationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        application={editing}
        cvs={cvs}
      />
    </div>
  )
}
