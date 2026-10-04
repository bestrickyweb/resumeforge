import { PageHeader } from '@/components/dashboard/page-header'
import { AtsScannerForm } from '@/components/dashboard/ats-scanner-form'
import { getUsage, getPreviousCvText } from '@/app/actions/queries'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AtsScannerPage() {
  const [usage, previousCvText] = await Promise.all([
    getUsage(),
    getPreviousCvText(),
  ])

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
      <PageHeader
        title="ATS Resume Scanner"
        description="Paste your CV and a job description to see how well your resume matches the role."
      />
      <div className="mt-8">
        <AtsScannerForm usage={usage} previousCvText={previousCvText} />
      </div>
    </div>
  )
}
