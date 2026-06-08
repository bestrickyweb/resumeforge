import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/session"
import { getApplications, getApplicationStats, getTailoredCvs } from "@/app/actions/queries"
import { PageHeader } from "@/components/dashboard/page-header"
import { ApplicationsBoard } from "@/components/dashboard/applications-board"

export const metadata = { title: "Application Tracker | ResumeForge" }
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ApplicationsPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/sign-in")

  const [applications, stats, cvs] = await Promise.all([
    getApplications(),
    getApplicationStats(),
    getTailoredCvs(),
  ])

  return (
    <div className="space-y-8">
      <PageHeader
        title="Application Tracker"
        description="Keep every job application organized from saved to offer."
      />
      <ApplicationsBoard
        applications={applications}
        stats={stats}
        cvs={cvs.map((c) => ({ id: c.id, jobTitle: c.jobTitle, company: c.company }))}
      />
    </div>
  )
}
