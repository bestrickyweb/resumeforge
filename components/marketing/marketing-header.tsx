'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/logo'

const links = [
  { href: '/resume-builder', label: 'Resume Builder' },
  { href: '/ats-resume-builder', label: 'ATS Checker' },
  { href: '/resume-tailoring', label: 'Resume Tailoring' },
  { href: '/pricing', label: 'Pricing' },
]

const secondaryLinks = [
  { href: '/cover-letter-generator', label: 'Cover Letter' },
  { href: '/linkedin-profile-optimization', label: 'LinkedIn' },
  { href: '/resume-templates', label: 'Templates' },
]

const mobileLinks = [
  ...links,
  ...secondaryLinks,
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/#faq', label: 'FAQ' },
]

export function MarketingHeader() {
  const [open, setOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1.5 md:gap-2 lg:gap-6 lg:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
          <div
            className="relative"
            onMouseEnter={() => setMoreOpen(true)}
            onMouseLeave={() => setMoreOpen(false)}
          >
            <button
              type="button"
              onClick={() => setMoreOpen(!moreOpen)}
              className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              aria-label="More services"
            >
              More <ChevronDown className="h-3 w-3" />
            </button>
            {moreOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 rounded-lg border border-border bg-card p-2 shadow-lg">
                {secondaryLinks.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    className="block rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary"
                  >
                    {l.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Button asChild variant="ghost" size="sm">
            <Link href="/sign-in">Log in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/resume-builder">Build my resume</Link>
          </Button>
        </div>

        <button
          className="lg:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-1">
            {mobileLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="py-3 text-sm font-medium text-muted-foreground"
              >
                {l.label}
              </a>
            ))}
            <div className="mt-3 flex flex-col gap-2">
              <Button asChild variant="outline" size="sm" className="h-10">
                <Link href="/sign-in">Log in</Link>
              </Button>
              <Button asChild size="sm" className="h-10">
                <Link href="/resume-builder">Build my resume</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
