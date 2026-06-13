import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { SeoLandingPageConfig } from '@/lib/seo'

type SeoLandingPageProps = {
  config: SeoLandingPageConfig
}

export default function SeoLandingPage({ config }: SeoLandingPageProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <main>
        <section className="mx-auto max-w-5xl px-4 py-16 text-center md:py-24">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            ResumeForge AI
          </p>
          <h1 className="mt-4 text-balance font-heading text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
            {config.h1}
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-pretty text-lg leading-relaxed text-muted-foreground">
            {config.description}
          </p>
          <div className="mt-8">
            <Button asChild size="lg" className="h-12 px-7 text-base">
              <Link href="/sign-up">
                Tailor My Resume Free
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <ul className="mx-auto mt-8 flex max-w-2xl flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
            {config.benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                {benefit}
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-secondary/40 py-20">
          <div className="mx-auto grid max-w-5xl gap-8 px-4 md:grid-cols-3">
            {config.steps.map((step) => (
              <div
                key={step.title}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <h3 className="font-heading text-lg font-bold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="mx-auto max-w-5xl px-4 py-20">
          {config.h2s.map((heading, index) => (
            <section key={heading} className="mb-16 last:mb-0">
              <h2 className="text-balance font-heading text-3xl font-extrabold tracking-tight md:text-4xl">
                {heading}
              </h2>
              <p className="mt-4 max-w-3xl text-pretty text-lg leading-relaxed text-muted-foreground">
                {index === 0
                  ? 'ResumeForge compares your CV with the target job description, identifies missing keywords, and rewrites your experience so each application feels specific, relevant, and ATS-friendly.'
                  : index === 1
                    ? 'Every tailored CV includes an estimated before and after match score so you can see how keyword alignment improves before you apply.'
                    : 'Upload your resume, paste the job description, and generate a polished job-specific version in under a minute.'}
              </p>
            </section>
          ))}
        </div>

        <section className="bg-secondary/40 py-20">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="text-balance font-heading text-3xl font-extrabold tracking-tight md:text-4xl">
              Questions About {config.primaryKeyword}
            </h2>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {config.faqs.map((faq) => (
                <div
                  key={faq.question}
                  className="rounded-2xl border border-border bg-card p-6"
                >
                  <h3 className="font-heading text-base font-bold">
                    {faq.question}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
