import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'

// GET friends list
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

    if (!supabase) {
      return NextResponse.json({ friends: [], requests: [] })
    }

    // Parallel fetch: accepted friendships AND pending requests
    const [friendshipsResult, requestsResult] = await Promise.all([
      (supabase as any)
        .from('friendships')
        .select(
          `
          id,
          status,
          created_at,
          requester:users!friendships_requester_id_fkey(id, display_name, avatar_url, level, wallet_address),
          addressee:users!friendships_addressee_id_fkey(id, display_name, avatar_url, level, wallet_address)
        `
        )
        .eq('status', 'accepted')
        .or(`requester_id.eq.${session.userId},addressee_id.eq.${session.userId}`),
      (supabase as any)
        .from('friendships')
        .select(
          `
          id,
          created_at,
          requester:users!friendships_requester_id_fkey(id, display_name, avatar_url, level, wallet_address)
        `
        )
        .eq('addressee_id', session.userId)
        .eq('status', 'pending')
    ])

    if (friendshipsResult.error) {
      console.error('Error fetching friends:', friendshipsResult.error)
      return NextResponse.json(
        { error: 'Failed to fetch friends' },
        { status: 500 }
      )
    }

    // Transform to get friend user
    const friends = (friendshipsResult.data || []).map((f: any) => ({
      id: f.id,
      status: f.status,
      created_at: f.created_at,
      user: f.requester.id === session.userId ? f.addressee : f.requester,
    }))

    if (requestsResult.error) {
      console.error('Error fetching requests:', requestsResult.error)
    }

    return NextResponse.json({
      friends,
      requests: requestsResult.data || [],
    })
  } catch (error) {
    console.error('Error in GET /api/friends:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST send friend request
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { user_id } = body

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    if (user_id === session.userId) {
      return NextResponse.json(
        { error: 'Cannot send friend request to yourself' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    // Check if friendship already exists
    const { data: existing } = await (supabase as any)
      .from('friendships')
      .select('id, status')
      .or(
        `and(requester_id.eq.${session.userId},addressee_id.eq.${user_id}),and(requester_id.eq.${user_id},addressee_id.eq.${session.userId})`
      )
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Friendship already exists', status: existing.status },
        { status: 409 }
      )
    }

    // Create friend request
    const { data: friendship, error } = await (supabase as any)
      .from('friendships')
      .insert({
        requester_id: session.userId,
        addressee_id: user_id,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating friendship:', error)
      return NextResponse.json(
        { error: 'Failed to send friend request' },
        { status: 500 }
      )
    }

    // Create notification (non-blocking - fire and forget)
    (supabase as any).from('notifications').insert({
      user_id,
      type: 'friend_request',
      title: 'New Friend Request',
      message: 'You have a new friend request!',
      data: { friendship_id: friendship.id, from_user_id: session.userId },
    }).then(() => {}).catch(console.error)

    return NextResponse.json({ friendship }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/friends:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH accept/decline friend request
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
    const { friendship_id, action } = body

    if (!friendship_id || !action) {
      return NextResponse.json(
        { error: 'Friendship ID and action are required' },
        { status: 400 }
      )
    }

    if (!['accept', 'decline'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    // Verify the user is the addressee
    const { data: friendship, error: fetchError } = await (supabase as any)
      .from('friendships')
      .select('*')
      .eq('id', friendship_id)
      .eq('addressee_id', session.userId)
      .eq('status', 'pending')
      .single()

    if (fetchError || !friendship) {
      return NextResponse.json(
        { error: 'Friend request not found' },
        { status: 404 }
      )
    }

    if (action === 'accept') {
      const { data: updated, error } = await (supabase as any)
        .from('friendships')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', friendship_id)
        .select()
        .single()

      if (error) {
        return NextResponse.json(
          { error: 'Failed to accept friend request' },
          { status: 500 }
        )
      }

      return NextResponse.json({ friendship: updated })
    } else {
      // Decline = delete the request
      await (supabase as any)
        .from('friendships')
        .delete()
        .eq('id', friendship_id)

      return NextResponse.json({ success: true })
    }
  } catch (error) {
    console.error('Error in PATCH /api/friends:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE remove friend
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const friendshipId = searchParams.get('id')

    if (!friendshipId) {
      return NextResponse.json(
        { error: 'Friendship ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    // Verify the user is part of this friendship
    const { error } = await (supabase as any)
      .from('friendships')
      .delete()
      .eq('id', friendshipId)
      .or(`requester_id.eq.${session.userId},addressee_id.eq.${session.userId}`)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to remove friend' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/friends:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
