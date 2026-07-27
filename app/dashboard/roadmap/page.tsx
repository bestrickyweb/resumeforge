import { PageHeader } from '@/components/dashboard/page-header'
import { RoadmapPanel } from '@/components/dashboard/roadmap-panel'

export const metadata = { title: 'Career Roadmap | ResumeForge' }
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function RoadmapPage({
  searchParams,
}: {
  searchParams: Promise<{ jobTitle?: string; jobDescription?: string }>
}) {
  const params = await searchParams
  const jobTitle = params?.jobTitle ?? ''
  const jobDescription = params?.jobDescription ?? ''

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
      <PageHeader
        title="Career Roadmap"
        description="Analyze your fit for a role and get a personalized learning plan with a timeline."
      />
      <div className="mt-8">
        <RoadmapPanel
          initialJobTitle={jobTitle}
          initialJobDescription={jobDescription}
        />
      </div>
    </div>
  )
}
