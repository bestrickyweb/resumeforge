const stats = [
  { value: '75%', label: 'of CVs rejected by ATS before a human reads them' },
  { value: '3x', label: 'more interview callbacks with a tailored CV' },
  { value: '45s', label: 'average time to tailor a CV with ResumeForge' },
  { value: '12k+', label: 'Nigerian job seekers already onboard' },
]

export function Stats() {
  return (
    <section className="border-y border-border bg-secondary/40">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-12 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <p className="font-heading text-3xl font-extrabold text-primary md:text-4xl">
              {s.value}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
