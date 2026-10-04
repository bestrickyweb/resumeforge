import { PageHeader } from '@/components/dashboard/page-header'
import { BuildResumeForm } from '@/components/dashboard/build-resume-form'
import { getUsage } from '@/app/actions/queries'
import type { UsageInfo } from '@/app/actions/queries'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function BuildResumePage() {
  const usage = await getUsage()

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8">
      <PageHeader
        title="Build a Resume"
        description="Generate a professional, interview-winning resume from scratch — or improve your existing one."
      />
      <div className="mt-8">
        <BuildResumeForm usage={usage as UsageInfo} />
      </div>
    </div>
  )
}
