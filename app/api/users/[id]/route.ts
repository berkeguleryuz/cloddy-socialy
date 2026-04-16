import { NextRequest, NextResponse } from 'next/server'
import { getSession, toAuthUser } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'

// GET user profile by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    // Parallel fetch: user, friendship status, posts count, friends count
    const [userResult, friendshipResult, postsResult, friendsResult] = await Promise.all([
      (supabase as any)
        .from('users')
        .select(`
          id,
          display_name,
          email,
          avatar_url,
          cover_url,
          bio,
          tagline,
          level,
          xp,
          wallet_address,
          created_at
        `)
        .eq('id', id)
        .single(),
      (supabase as any)
        .from('friendships')
        .select('id, status, requester_id')
        .or(
          `and(requester_id.eq.${session.userId},addressee_id.eq.${id}),and(requester_id.eq.${id},addressee_id.eq.${session.userId})`
        )
        .single(),
      (supabase as any)
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('author_id', id),
      (supabase as any)
        .from('friendships')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'accepted')
        .or(`requester_id.eq.${id},addressee_id.eq.${id}`),
    ])

    const user = userResult.data
    const friendship = friendshipResult.data

    if (userResult.error || !user) {
      console.error('Error fetching user:', userResult.error)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    let friendshipStatus = 'none'
    if (friendship) {
      if (friendship.status === 'accepted') {
        friendshipStatus = 'friends'
      } else if (friendship.status === 'pending') {
        friendshipStatus = friendship.requester_id === session.userId ? 'request_sent' : 'request_received'
      } else if (friendship.status === 'blocked') {
        friendshipStatus = 'blocked'
      }
    }

    return NextResponse.json({
      user: {
        ...toAuthUser(user),
        bio: user.bio,
        tagline: user.tagline,
        cover_url: user.cover_url,
        xp: user.xp,
        created_at: user.created_at,
        is_current_user: id === session.userId,
        friendship_status: friendshipStatus,
        friendship_id: friendship?.id || null,
        stats: {
          posts: postsResult.count || 0,
          friends: friendsResult.count || 0,
        },
      },
    })
  } catch (error) {
    console.error('Error in GET /api/users/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
