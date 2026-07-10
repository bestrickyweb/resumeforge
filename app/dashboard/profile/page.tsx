import { PageHeader } from '@/components/dashboard/page-header'
import { LinkedInOptimizer } from '@/components/dashboard/linkedin-optimizer'

export const metadata = { title: 'LinkedIn Profile | ResumeForge' }
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ProfilePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
      <PageHeader
        title="LinkedIn Optimizer"
        description="Import and optimize your LinkedIn profile for recruiters."
      />
      <div className="mt-8">
        <LinkedInOptimizer />
      </div>
    </div>
  )
}
