import Link from 'next/link'
import { FileText, Plus, Sparkles } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/page-header'
import { Button } from '@/components/ui/button'
import { getTailoredCvs } from '@/app/actions/queries'

export default async function CvsPage() {
  const cvs = await getTailoredCvs()

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
      <PageHeader
        title="My CVs"
        description="Every CV you've tailored, ready to review and reuse."
        action={
          <Button asChild>
            <Link href="/dashboard/tailor">
              <Sparkles className="mr-2 h-4 w-4" /> Tailor a CV
            </Link>
          </Button>
        }
      />

      {cvs.length === 0 ? (
        <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <FileText className="h-6 w-6" />
          </span>
          <p className="mt-4 font-medium">No tailored CVs yet</p>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            Tailor your first CV to a job description and it will appear here.
          </p>
          <Button asChild className="mt-5">
            <Link href="/dashboard/tailor">
              <Plus className="mr-2 h-4 w-4" /> Tailor your first CV
            </Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {cvs.map((cv) => (
            <Link
              key={cv.id}
              href={`/dashboard/cvs/${cv.id}`}
              className="group rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate font-heading font-bold group-hover:text-primary">
                    {cv.jobTitle}
                  </h3>
                  <p className="truncate text-sm text-muted-foreground">
                    {cv.company || 'Tailored CV'}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  {cv.matchAfter}%
                </span>
              </div>
              <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                {cv.summary}
              </p>
              <p className="mt-4 text-xs text-muted-foreground">
                Tailored{' '}
                {new Date(cv.createdAt).toLocaleDateString('en-NG', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
