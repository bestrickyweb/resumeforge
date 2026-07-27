import { PageHeader } from '@/components/dashboard/page-header'
import { RoadmapList } from '@/components/dashboard/roadmap-list'

export const metadata = { title: 'My Roadmaps | ResumeForge' }
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function RoadmapsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
      <PageHeader
        title="My Roadmaps"
        description="Review your saved career roadmaps and track your progress."
      />
      <div className="mt-8">
        <RoadmapList />
      </div>
    </div>
  )
}
