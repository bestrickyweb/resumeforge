import { PageHeader } from '@/components/dashboard/page-header'
import { InterviewStudio } from '@/components/dashboard/interview-studio'

export const metadata = { title: 'Interview Studio | ResumeForge' }
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function InterviewPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
      <PageHeader
        title="Interview Studio"
        description="Practice with AI-generated questions and get feedback."
      />
      <div className="mt-8">
        <InterviewStudio />
      </div>
    </div>
  )
}
