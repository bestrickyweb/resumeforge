import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function FinalCta() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <div className="overflow-hidden rounded-3xl bg-primary px-6 py-16 text-center text-primary-foreground md:px-12">
        <h2 className="mx-auto max-w-2xl text-balance font-heading text-3xl font-extrabold tracking-tight md:text-4xl">
          Your next interview starts with the right CV
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-primary-foreground/80">
          Stop sending CVs into the void. Tailor your first three free — no card
          required — and see how many more callbacks you get.
        </p>
        <Button
          asChild
          size="lg"
          variant="secondary"
          className="mt-8 h-12 px-8 text-base"
        >
          <Link href="/sign-up">
            Tailor my CV free <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  )
}
