import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'

// GET likes for a post
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

    const { id: postId } = await params
    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json({ likes: [], count: 0 })
    }

    // Parallel fetch: likes list and user's like status
    const [likesResult, userLikeResult] = await Promise.all([
      (supabase as any)
        .from('likes')
        .select(`
          id,
          created_at,
          user:users(id, display_name, avatar_url, level)
        `, { count: 'exact' })
        .eq('post_id', postId)
        .order('created_at', { ascending: false })
        .limit(50),
      (supabase as any)
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', session.userId)
        .single()
    ])

    if (likesResult.error) {
      console.error('Error fetching likes:', likesResult.error)
      return NextResponse.json(
        { error: 'Failed to fetch likes' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      likes: likesResult.data || [],
      count: likesResult.count || 0,
      liked_by_user: !!userLikeResult.data,
    })
  } catch (error) {
    console.error('Error in GET /api/posts/[id]/likes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST like a post
export async function POST(
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

    const { id: postId } = await params
    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    // Check if already liked
    const { data: existing } = await (supabase as any)
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', session.userId)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Already liked' },
        { status: 409 }
      )
    }

    // Parallel: Create like AND fetch post author (for notification)
    const [likeResult, postResult] = await Promise.all([
      (supabase as any)
        .from('likes')
        .insert({
          post_id: postId,
          user_id: session.userId,
        })
        .select()
        .single(),
      (supabase as any)
        .from('posts')
        .select('author_id')
        .eq('id', postId)
        .single()
    ])

    if (likeResult.error) {
      console.error('Error creating like:', likeResult.error)
      return NextResponse.json(
        { error: 'Failed to like post' },
        { status: 500 }
      )
    }

    // Send notification (non-blocking - fire and forget)
    const post = postResult.data
    if (post && post.author_id !== session.userId) {
      (supabase as any).from('notifications').insert({
        user_id: post.author_id,
        type: 'like',
        title: 'New Like',
        message: 'Someone liked your post!',
        data: { post_id: postId, from_user_id: session.userId },
      }).then(() => {}).catch(console.error)
    }

    return NextResponse.json({ like: likeResult.data }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/posts/[id]/likes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE unlike a post
export async function DELETE(
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

    const { id: postId } = await params
    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    const { error } = await (supabase as any)
      .from('likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', session.userId)

    if (error) {
      console.error('Error removing like:', error)
      return NextResponse.json(
        { error: 'Failed to unlike post' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/posts/[id]/likes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
