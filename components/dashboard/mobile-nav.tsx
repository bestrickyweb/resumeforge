'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu } from 'lucide-react'
import { Logo } from '@/components/logo'
import { DashboardNav } from '@/components/dashboard/dashboard-nav'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export function MobileNav({
  user,
}: {
  user: { name: string; email: string }
}) {
  const [open, setOpen] = useState(false)

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4 lg:hidden">
      <Link href="/dashboard">
        <Logo />
      </Link>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger aria-label="Open menu">
          <Menu className="h-6 w-6" />
        </DialogTrigger>
        <DialogContent className="left-0 top-0 h-full max-w-[18rem] translate-x-0 translate-y-0 rounded-none border-r p-0 data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left sm:max-w-[18rem]">
          <DialogTitle className="sr-only">Navigation</DialogTitle>
          <div className="h-full" onClick={() => setOpen(false)}>
            <DashboardNav user={user} />
          </div>
        </DialogContent>
      </Dialog>
    </header>
  )
}
