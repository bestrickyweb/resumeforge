'use client'

import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { getPendingRemindersCount } from '@/app/actions/reminders'

export function ReminderBadge() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let active = true
    async function load() {
      const n = await getPendingRemindersCount()
      if (active) setCount(n)
    }
    load()
    const t = setInterval(load, 60_000)
    return () => {
      active = false
      clearInterval(t)
    }
  }, [])

  if (count <= 0) return null

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground"
      title={`${count} pending follow-up reminder${count === 1 ? '' : 's'}`}
    >
      <Bell className="h-3 w-3" />
      {count}
    </span>
  )
}
