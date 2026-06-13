import { X, Check } from 'lucide-react'

const before = [
  'Generic objective copied from a template',
  'Missing keywords the ATS scans for',
  'Same CV sent to every single role',
  'Achievements buried in dense paragraphs',
  'Rejected automatically — score 41%',
]

const after = [
  'Sharp summary aligned to the exact role',
  'Every must-have keyword naturally included',
  'Tailored to each job in under a minute',
  'Quantified wins formatted for scanners',
  'Shortlisted — ATS match score 92%',
]

export function BeforeAfter() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-balance font-heading text-3xl font-extrabold tracking-tight md:text-4xl">
          Increase ATS Match Scores Instantly
        </h2>
        <p className="mt-3 text-pretty text-muted-foreground">
          Recruiters in Lagos, Abuja and beyond use ATS software to filter
          hundreds of applicants. Here is what changes when ResumeForge tailors
          your CV.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 md:p-8">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-destructive/10 px-3 py-1 text-sm font-semibold text-destructive">
            <X className="h-4 w-4" /> Before — generic CV
          </div>
          <ul className="flex flex-col gap-3">
            {before.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm">
                <X className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                <span className="text-foreground/80">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 md:p-8">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
            <Check className="h-4 w-4" /> After — tailored with ResumeForge
          </div>
          <ul className="flex flex-col gap-3">
            {after.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="font-medium text-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
