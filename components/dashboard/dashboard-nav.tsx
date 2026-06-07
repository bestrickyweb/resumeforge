'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Sparkles,
  FileText,
  KanbanSquare,
  CreditCard,
  LogOut,
} from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/tailor', label: 'Tailor a CV', icon: Sparkles },
  { href: '/dashboard/cvs', label: 'My CVs', icon: FileText },
  { href: '/dashboard/tracker', label: 'Applications', icon: KanbanSquare },
  { href: '/dashboard/billing', label: 'Billing', icon: CreditCard },
]

export function DashboardNav({
  user,
}: {
  user: { name: string; email: string }
}) {
  const pathname = usePathname()
  const router = useRouter()

  async function signOut() {
    await authClient.signOut()
    router.push('/')
    router.refresh()
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
          onClick={signOut}
          className="mt-1 w-full justify-start text-muted-foreground"
        >
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </Button>
      </div>
    </aside>
  )
}
