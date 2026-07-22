'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Sparkles,
  FileText,
  KanbanSquare,
  CreditCard,
  LogOut,
  Mic,
  Crosshair,
  User,
  Loader2,
} from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/tailor', label: 'Tailor a CV', icon: Sparkles },
  { href: '/dashboard/cvs', label: 'My CVs', icon: FileText },
  { href: '/dashboard/applications', label: 'Applications', icon: KanbanSquare },
  { href: '/dashboard/interview', label: 'Interview Studio', icon: Mic },
  { href: '/dashboard/fit', label: 'Job Fit', icon: Crosshair },
  { href: '/dashboard/profile', label: 'LinkedIn', icon: User },
  { href: '/dashboard/billing', label: 'Billing', icon: CreditCard },
]

export function DashboardNav({
  user,
}: {
  user: { name: string; email: string }
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)

  async function onSignOut() {
    setSigningOut(true)
    try {
      await authClient.signOut()
      router.push('/')
      router.refresh()
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <aside className="flex h-full w-full flex-col">
      <div className="px-6 py-5">
        <Link href="/dashboard">
          <Logo />
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {nav.map((item) => {
          const active =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {user.name?.[0]?.toUpperCase() ?? 'U'}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onSignOut}
          disabled={signingOut}
          className="mt-1 w-full justify-start text-muted-foreground"
        >
          {signingOut ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing out...
            </>
          ) : (
            <>
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </>
          )}
        </Button>
      </div>
    </aside>
  )
}
