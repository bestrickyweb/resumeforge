import { headers } from 'next/headers'
import { auth } from '@/lib/auth'

export async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function getSessionUser() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user ?? null
}

// Alias used across the dashboard and API routes.
export const getCurrentUser = getSessionUser
