import { cache } from 'react'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'

// Request-scoped memoization: better-auth's getSession hits the DB + verifies a
// session token. These helpers are called several times per request (layout,
// page, and each data loader), so without caching we do N redundant DB round
// trips to a remote Postgres on every dashboard render. `cache` dedupes them
// within a single request.
const getSession = cache(async () => {
  try {
    return await auth.api.getSession({ headers: await headers() })
  } catch {
    return null
  }
})

export async function getUserId() {
  const session = await getSession()
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function getSessionUser() {
  const session = await getSession()
  return session?.user ?? null
}

// Alias used across the dashboard and API routes.
export const getCurrentUser = getSessionUser
