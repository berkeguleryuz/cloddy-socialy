import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'

// GET single post
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

    const { data: post, error } = await (supabase as any)
      .from('posts')
      .select(`
        *,
        author:users(id, display_name, avatar_url, level, wallet_address),
        likes:likes(count),
        comments:comments(count)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching post:', error)
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Check if current user liked this post
    const { data: userLike } = await (supabase as any)
      .from('likes')
      .select('id')
      .eq('post_id', id)
      .eq('user_id', session.userId)
      .single()

    return NextResponse.json({
      post: {
        ...post,
        liked_by_user: !!userLike,
      },
    })
  } catch (error) {
    console.error('Error in GET /api/posts/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE post
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

    const { id } = await params
    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    // Only allow deleting own posts
    const { error } = await (supabase as any)
      .from('posts')
      .delete()
      .eq('id', id)
      .eq('author_id', session.userId)

    if (error) {
      console.error('Error deleting post:', error)
      return NextResponse.json(
        { error: 'Failed to delete post' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/posts/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH update post
export async function PATCH(
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
    const body = await request.json()
    const { content, visibility } = body

    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    if (content !== undefined) {
      updateData.content = content.trim()
    }
    if (visibility !== undefined) {
      updateData.visibility = visibility
    }

    const { data: post, error } = await (supabase as any)
      .from('posts')
      .update(updateData)
      .eq('id', id)
      .eq('author_id', session.userId)
      .select(`
        *,
        author:users(id, display_name, avatar_url, level, wallet_address)
      `)
      .single()

    if (error) {
      console.error('Error updating post:', error)
      return NextResponse.json(
        { error: 'Failed to update post' },
        { status: 500 }
      )
    }

    return NextResponse.json({ post })
  } catch (error) {
    console.error('Error in PATCH /api/posts/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
