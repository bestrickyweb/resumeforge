import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, CheckCircle2, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-16 md:grid-cols-2 md:pb-24 md:pt-24">
        <div className="flex flex-col items-start">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
            <span className="flex h-2 w-2 rounded-full bg-primary" />
            Built for the Nigerian job market
          </div>

          <h1 className="text-balance font-heading text-4xl font-extrabold leading-tight tracking-tight md:text-5xl lg:text-6xl">
            ATS Optimized Resume Builder Powered by AI
          </h1>

          <p className="mt-5 max-w-md text-pretty text-lg leading-relaxed text-muted-foreground">
            ATS Resume Builder That Tailors Your CV to Any Job Description.
            Upload your resume, paste a job description, and generate an ATS
            optimized version in less than a minute. Increase keyword matching
            and improve your chances of landing interviews.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 px-7 text-base">
              <Link href="/sign-up">
                Tailor My Resume Free <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 px-7 text-base"
            >
              <a href="#how-it-works">See how it works</a>
            </Button>
          </div>

          <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2">
            {['3 free tailored CVs', 'No card required', 'Paystack secure'].map(
              (item) => (
                <li
                  key={item}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground"
                >
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  {item}
                </li>
              ),
            )}
          </ul>

          <div className="mt-8 flex items-center gap-3">
            <div className="flex -space-x-2">
              {['/avatar-1.png', '/avatar-2.png', '/avatar-3.png'].map((src) => (
                <Image
                  key={src}
                  src={src || '/placeholder.svg'}
                  alt=""
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-full border-2 border-background object-cover"
                />
              ))}
            </div>
            <div className="text-sm">
              <div className="flex items-center gap-0.5 text-accent">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <p className="text-muted-foreground">
                Loved by 12,000+ job seekers
              </p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 -z-10 rounded-3xl bg-primary/5" />
          <Image
            src="/hero-dashboard.png"
            alt="ResumeForge dashboard showing a CV optimized with an ATS match score of 92%"
            width={720}
            height={540}
            priority
            className="w-full rounded-2xl border border-border shadow-2xl"
          />
        </div>
      </div>
    </section>
  )
}
