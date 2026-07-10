import { PageHeader } from '@/components/dashboard/page-header'
import { JobFitPanel } from '@/components/dashboard/job-fit-panel'

export const metadata = { title: 'Job Fit Analyzer | ResumeForge' }
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function FitPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
      <PageHeader
        title="Job Fit Analyzer"
        description="See how well your CV matches a job before you apply."
      />
      <div className="mt-8">
        <JobFitPanel />
      </div>
    </div>
  )
}
