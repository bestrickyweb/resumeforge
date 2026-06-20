import { headers } from 'next/headers'
import { auth } from '@/lib/auth'

export async function getUserId() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) throw new Error('Unauthorized')
    return session.user.id
  } catch {
    throw new Error('Unauthorized')
  }
}

export async function getSessionUser() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    return session?.user ?? null
  } catch {
    return null
  }
}

// Alias used across the dashboard and API routes.
export const getCurrentUser = getSessionUser
