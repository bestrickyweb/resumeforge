import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getTailoredCvById, getPipelineConversion } from '@/app/actions/queries'
import { CvDetail } from '@/components/dashboard/cv-detail'

export const dynamic = 'force-dynamic'

export default async function CvDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const cvId = Number(id)

  // Validate that the ID is a valid number
  if (!id || isNaN(cvId)) {
    notFound()
  }

  const cv = await getTailoredCvById(cvId)

  if (!cv) {
    notFound()
  }

  const conversion = await getPipelineConversion()

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link href="/dashboard/cvs">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to my CVs
        </Link>
      </Button>
      <CvDetail cv={cv} conversion={conversion} />
    </div>
  )
}
