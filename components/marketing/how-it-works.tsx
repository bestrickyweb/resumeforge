import { ClipboardPaste, Sparkles, Download } from 'lucide-react'

const steps = [
  {
    icon: ClipboardPaste,
    title: 'Paste the job & your CV',
    desc: 'Drop in the job description and your current CV. No formatting fuss — plain text works perfectly.',
  },
  {
    icon: Sparkles,
    title: 'Let ResumeForge tailor it',
    desc: 'Our AI rewrites your summary, weaves in the right keywords, and reorders achievements to match the role.',
  },
  {
    icon: Download,
    title: 'Apply with confidence',
    desc: 'Get your ATS match score, an optional cover letter, and a polished CV ready to send. Then track it.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-secondary/40 py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            How it works
          </p>
          <h2 className="mt-2 text-balance font-heading text-3xl font-extrabold tracking-tight md:text-4xl">
            Tailor Your Resume to Any Job Description
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="relative rounded-2xl border border-border bg-card p-7"
            >
              <span className="absolute right-6 top-6 font-heading text-4xl font-extrabold text-primary/10">
                0{i + 1}
              </span>
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <step.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 font-heading text-lg font-bold">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
