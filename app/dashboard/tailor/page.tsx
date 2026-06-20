import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/dashboard/page-header'
import { TailorForm } from '@/components/dashboard/tailor-form'
import { getUsage, getPreviousCvText } from '@/app/actions/queries'

export default async function TailorPage() {
  const usage = await getUsage()
  const previousCvText = await getPreviousCvText()

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
      <PageHeader
        title="Tailor a CV"
        description="Paste the job description and your current CV. We'll optimize it to beat the ATS."
      />
      <div className="mt-8">
        <TailorForm usage={usage} previousCvText={previousCvText} />
      </div>
    </div>
  )
}
