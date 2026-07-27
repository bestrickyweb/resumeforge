import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/dashboard/page-header'
import { RoadmapDetail } from '@/components/dashboard/roadmap-detail'

export const metadata = { title: 'Roadmap Details | ResumeForge' }
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function RoadmapDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const roadmapId = Number(id)
  if (!Number.isInteger(roadmapId)) return notFound()

  let roadmap
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/roadmaps/${roadmapId}`, {
      cache: 'no-store',
    })
    if (!res.ok) return notFound()
    const data = await res.json()
    roadmap = data.roadmap
  } catch {
    return notFound()
  }

  if (!roadmap) return notFound()

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
      <PageHeader
        title={roadmap.targetRole}
        description={`Career roadmap created on ${new Date(roadmap.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
      />
      <div className="mt-8">
        <RoadmapDetail roadmap={roadmap} />
      </div>
    </div>
  )
}
