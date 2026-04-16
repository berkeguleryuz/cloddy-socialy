import { NextRequest, NextResponse } from 'next/server'
import { getSession, toAuthUser } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'

// GET current user profile
export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = await createClient()

    if (supabase) {
      const { data: user, error } = await (supabase as any)
        .from('users')
        .select('*')
        .eq('id', session.userId)
        .single()

      if (error) {
        console.error('Error fetching user:', error)
        return NextResponse.json(
          { error: 'Failed to fetch user' },
          { status: 500 }
        )
      }

      return NextResponse.json({ user: toAuthUser(user) })
    }

    // Return session-based user if no database
    const walletAddr = session.walletAddress || ''
    return NextResponse.json({
      user: {
        id: session.userId,
        name: walletAddr ? `${walletAddr.slice(0, 6)}...${walletAddr.slice(-4)}` : 'User',
        email: null,
        avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${walletAddr || session.userId}`,
        level: 1,
        walletAddress: session.walletAddress,
      },
    })
  } catch (error) {
    console.error('Error in GET /api/users/me:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH update current user profile
export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { display_name, bio, tagline, avatar_url, cover_url } = body

    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    const { data: user, error } = await (supabase as any)
      .from('users')
      .update({
        display_name,
        bio,
        tagline,
        avatar_url,
        cover_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating user:', error)
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      )
    }

    return NextResponse.json({ user: toAuthUser(user) })
  } catch (error) {
    console.error('Error in PATCH /api/users/me:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
