import {
  ScanSearch,
  FileText,
  KanbanSquare,
  Gauge,
  Languages,
  ShieldCheck,
} from 'lucide-react'

const features = [
  {
    icon: ScanSearch,
    title: 'ATS keyword matching',
    desc: 'We scan the job description for the exact terms recruiters filter on and surface what your CV is missing.',
  },
  {
    icon: Gauge,
    title: 'Match score before & after',
    desc: 'See a clear percentage of how well your CV fits the role — and watch it climb after tailoring.',
  },
  {
    icon: FileText,
    title: 'Instant cover letters',
    desc: 'Generate a tailored cover letter that speaks to the role and company, ready to attach.',
  },
  {
    icon: KanbanSquare,
    title: 'Application tracker',
    desc: 'Track every role from saved to offer in one board so nothing slips through the cracks.',
  },
  {
    icon: Languages,
    title: 'Local context aware',
    desc: 'Tuned for Nigerian and remote-first roles, NYSC, and the phrasing local recruiters expect.',
  },
  {
    icon: ShieldCheck,
    title: 'Your data stays yours',
    desc: 'Your CV is private and encrypted. We never sell your data or share it with employers.',
  },
]

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-4 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
          Features
        </p>
        <h2 className="mt-2 text-balance font-heading text-3xl font-extrabold tracking-tight md:text-4xl">
          Everything you need to get hired faster
        </h2>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-lg"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <f.icon className="h-5 w-5" />
            </span>
            <h3 className="mt-4 font-heading text-lg font-bold">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
