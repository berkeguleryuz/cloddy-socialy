import { NextResponse } from 'next/server'
import { getSession, toAuthUser, truncateAddress, generateAvatarUrl } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({
        authenticated: false,
        user: null,
      })
    }

    // Try to fetch user from database
    const supabase = await createClient()

    if (supabase) {
      try {
        const { data: dbUser, error } = await (supabase as any)
          .from('users')
          .select('*')
          .eq('id', session.userId)
          .single()

        if (!error && dbUser) {
          const user = toAuthUser(dbUser)
          return NextResponse.json({
            authenticated: true,
            user,
            session: {
              userId: session.userId,
              walletAddress: session.walletAddress,
              email: session.email,
              chainId: session.chainId,
              authMethod: session.authMethod,
            },
          })
        }
      } catch (dbError) {
        console.warn('Database fetch failed:', dbError)
      }
    }

    // Create user from session data if database not available
    // Handle both email and wallet auth
    const identifier = session.walletAddress || session.email || session.userId
    const displayName = session.walletAddress
      ? truncateAddress(session.walletAddress)
      : session.email?.split('@')[0] || 'User'

    const user = {
      id: session.userId,
      name: displayName,
      email: session.email || null,
      avatar: generateAvatarUrl(identifier),
      level: 1,
      walletAddress: session.walletAddress || undefined,
      authMethod: session.authMethod,
    }

    return NextResponse.json({
      authenticated: true,
      user,
      session: {
        userId: session.userId,
        walletAddress: session.walletAddress,
        email: session.email,
        chainId: session.chainId,
        authMethod: session.authMethod,
      },
    })
  } catch (error) {
    console.error('Error getting session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
