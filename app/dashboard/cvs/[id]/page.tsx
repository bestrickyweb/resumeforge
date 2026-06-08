import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getTailoredCvById } from '@/app/actions/queries'
import { CvDetail } from '@/components/dashboard/cv-detail'

export const dynamic = 'force-dynamic'
export const revalidate = 0 // No caching for user-specific data

export default async function CvDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const cv = await getTailoredCvById(Number(id))

  if (!cv) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link href="/dashboard/cvs">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to my CVs
        </Link>
      </Button>
      <CvDetail cv={cv} />
    </div>
  )
}
