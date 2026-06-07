import Image from 'next/image'
import { Star } from 'lucide-react'

const testimonials = [
  {
    quote:
      'I sent the same CV everywhere for months with zero replies. After tailoring it with ResumeForge, I got three interview invites in two weeks — and an offer from a fintech in Lagos.',
    name: 'Adaeze O.',
    role: 'Product Analyst, Lagos',
    avatar: '/avatar-1.png',
  },
  {
    quote:
      'The match score was a wake-up call. My CV scored 38% for a role I was sure I was perfect for. ResumeForge fixed it to 90% and the recruiter actually called.',
    name: 'Tunde A.',
    role: 'Backend Engineer, Remote',
    avatar: '/avatar-2.png',
  },
  {
    quote:
      'As a career switcher the cover letters alone were worth it. I finally sound confident and relevant instead of generic. Landed a role in customer success.',
    name: 'Chioma E.',
    role: 'Customer Success, Abuja',
    avatar: '/avatar-3.png',
  },
]

export function Testimonials() {
  return (
    <section className="bg-secondary/40 py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance font-heading text-3xl font-extrabold tracking-tight md:text-4xl">
            Real interviews. Real offers.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Job seekers across Nigeria are turning applications into interviews.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="flex flex-col rounded-2xl border border-border bg-card p-6"
            >
              <div className="flex items-center gap-0.5 text-accent">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-pretty text-sm leading-relaxed text-foreground/90">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <Image
                  src={t.avatar || '/placeholder.svg'}
                  alt={t.name}
                  width={44}
                  height={44}
                  className="h-11 w-11 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
