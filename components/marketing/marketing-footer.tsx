import Link from 'next/link'
import { Logo } from '@/components/logo'

const cols = [
  {
    title: 'Product',
    links: [
      { label: 'Resume Builder', href: '/resume-builder' },
      { label: 'Resume Tailoring', href: '/resume-tailoring' },
      { label: 'ATS Resume Checker', href: '/ats-resume-builder' },
      { label: 'Cover Letter Generator', href: '/cover-letter-generator' },
      { label: 'LinkedIn Optimization', href: '/linkedin-profile-optimization' },
      { label: 'Resume Templates', href: '/resume-templates' },
      { label: 'Pricing', href: '/pricing' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'AI Resume Builder', href: '/ai-resume-builder' },
      { label: 'Resume Optimizer', href: '/resume-optimizer' },
      { label: 'Resume Keyword Optimizer', href: '/resume-keyword-optimizer' },
      { label: 'Job Description Matcher', href: '/job-description-matcher' },
      { label: 'ATS Resume Checker', href: '/ats-resume-checker' },
      { label: 'CV Builder', href: '/cv-builder' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Contact', href: '#' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '#' },
      { label: 'Terms', href: '#' },
      { label: 'Refund policy', href: '#' },
    ],
  },
]

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-[1.5fr_1fr_1fr_1fr_1.2fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Tailored resumes, ATS-ready applications, and a LinkedIn profile
            that gets noticed. Built in Nigeria, for Nigerian job seekers
            chasing local and remote roles.
          </p>
        </div>

        {cols.map((col) => (
          <div key={col.title}>
            <h4 className="font-heading text-sm font-bold">{col.title}</h4>
            <ul className="mt-4 flex flex-col gap-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row">
           <p>© {new Date().getFullYear()} Tailorvance. All rights reserved.</p>
          <p className="flex items-center gap-2">
            Secured payments by
            <span className="font-semibold text-foreground">Paystack</span>
          </p>
        </div>
      </div>
    </footer>
  )
}

