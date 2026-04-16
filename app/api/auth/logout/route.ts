import { NextResponse } from 'next/server'
import { clearSessionCookie } from '@/lib/auth/session'

export async function POST() {
  try {
    // Clear session cookie - this is the primary way to log out
    // Session invalidation in database is optional and will happen via expiration
    await clearSessionCookie()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error during logout:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
