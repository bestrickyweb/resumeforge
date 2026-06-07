import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/session'
import { DashboardNav } from '@/components/dashboard/dashboard-nav'
import { MobileNav } from '@/components/dashboard/mobile-nav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getSessionUser()
  if (!user) redirect('/sign-in')

  const safeUser = { name: user.name ?? 'User', email: user.email ?? '' }

  return (
    <div className="flex min-h-screen flex-col bg-secondary/30 lg:flex-row">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border bg-background lg:block">
        <DashboardNav user={safeUser} />
      </aside>
      <MobileNav user={safeUser} />
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        {children}
      </main>
    </div>
  )
}
