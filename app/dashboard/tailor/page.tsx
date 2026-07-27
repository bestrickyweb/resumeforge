import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/dashboard/page-header'
import { TailorForm } from '@/components/dashboard/tailor-form'
import { getUsage, getPreviousCvText } from '@/app/actions/queries'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function TailorPage({
  searchParams,
}: {
  searchParams: Promise<{ jobTitle?: string; jobDescription?: string }>
}) {
  const [usage, previousCvText, params] = await Promise.all([
    getUsage(),
    getPreviousCvText(),
    searchParams,
  ])

  const jobTitle = params?.jobTitle ?? ''
  const jobDescription = params?.jobDescription ?? ''

  if (jobDescription) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
        <PageHeader
          title="Tailor a CV"
          description="Optimize your CV for this specific role."
        />
        <div className="mt-8">
          <TailorForm
            usage={usage}
            previousCvText={previousCvText}
            initialJobTitle={jobTitle}
            initialJobDescription={jobDescription}
          />
        </div>
      </div>
    )
  }

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
