'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/logo'

const links = [
  { href: '/resume-builder', label: 'Resume Builder', dashboard: '/dashboard/build-resume' },
  { href: '/ats-resume-builder', label: 'ATS Checker', dashboard: '/dashboard/ats-scanner' },
  { href: '/resume-tailoring', label: 'Resume Tailoring', dashboard: '/dashboard/tailor' },
  { href: '/pricing', label: 'Pricing', dashboard: '/dashboard/billing' },
]

const secondaryLinks = [
  { href: '/cover-letter-generator', label: 'Cover Letter', dashboard: '/dashboard/tailor' },
  { href: '/linkedin-profile-optimization', label: 'LinkedIn', dashboard: '/dashboard/profile' },
  { href: '/resume-templates', label: 'Templates', dashboard: '/dashboard/build-resume' },
]

function getNavHref(item: typeof links[0], isAuthenticated: boolean) {
  return isAuthenticated ? item.dashboard : item.href
}

export function MarketingHeader() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [open, setOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/get-session', {
          method: 'GET',
          credentials: 'include',
        })
        if (res.ok) {
          const data = await res.json()
          setIsAuthenticated(!!data?.user)
        }
      } catch {
        setIsAuthenticated(false)
      } finally {
        setAuthChecked(true)
      }
    }
    checkAuth()
  }, [])

  const navHref = (item: typeof links[0]) =>
    authChecked ? getNavHref(item, isAuthenticated) : item.href

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
              href={navHref(l)}
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
              <div className="absolute top-full right-0 w-48 pt-2">
                <div className="rounded-lg border border-border bg-card p-2 shadow-lg">
                  {secondaryLinks.map((l) => (
                    <a
                      key={l.href}
                      href={navHref(l)}
                      className="block rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary"
                    >
                      {l.label}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {isAuthenticated ? (
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/sign-in">Log in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/resume-builder">Build my resume</Link>
              </Button>
            </>
          )}
        </div>

        <button
          className="lg:hidden"
          onClick={() => setOpen((o) => !open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-1">
            {[
              ...links,
              ...secondaryLinks,
              { href: '/#how-it-works', label: 'How it works', dashboard: '/#how-it-works' },
              { href: '/#faq', label: 'FAQ', dashboard: '/#faq' },
            ].map((l) => (
              <a
                key={l.href}
                href={navHref(l)}
                onClick={() => setOpen(false)}
                className="py-3 text-sm font-medium text-muted-foreground"
              >
                {l.label}
              </a>
            ))}
            <div className="mt-3 flex flex-col gap-2">
              {isAuthenticated ? (
                <Button asChild size="sm" className="h-10">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button asChild variant="outline" size="sm" className="h-10">
                    <Link href="/sign-in">Log in</Link>
                  </Button>
                  <Button asChild size="sm" className="h-10">
                    <Link href="/resume-builder">Build my resume</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
