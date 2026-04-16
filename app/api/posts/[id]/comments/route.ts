import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { moderateContentAI } from '@/lib/moderation'

// GET comments for a post
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
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json({ comments: [], total: 0 })
    }

    const { data: comments, error, count } = await (supabase as any)
      .from('comments')
      .select(`
        id,
        content,
        created_at,
        user:users(id, display_name, avatar_url, level)
      `, { count: 'exact' })
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching comments:', error)
      return NextResponse.json(
        { error: 'Failed to fetch comments' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      comments: comments || [],
      total: count || 0,
      page,
      limit,
    })
  } catch (error) {
    console.error('Error in GET /api/posts/[id]/comments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST create a comment
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
    const body = await request.json()
    const { content } = body

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    // Content moderation check (AI-powered with regex fallback)
    const moderation = await moderateContentAI(content)

    if (moderation.shouldBlock) {
      return NextResponse.json(
        {
          error: 'Your comment contains content that violates our community guidelines.',
          flags: moderation.flags.map(f => f.type),
        },
        { status: 400 }
      )
    }

    const finalContent = moderation.cleanedContent || content.trim()

    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    // Parallel: Create comment AND fetch post author (for notification)
    const [commentResult, postResult] = await Promise.all([
      (supabase as any)
        .from('comments')
        .insert({
          post_id: postId,
          user_id: session.userId,
          content: finalContent,
        })
        .select(`
          id,
          content,
          created_at,
          user:users(id, display_name, avatar_url, level)
        `)
        .single(),
      (supabase as any)
        .from('posts')
        .select('author_id')
        .eq('id', postId)
        .single()
    ])

    if (commentResult.error) {
      console.error('Error creating comment:', commentResult.error)
      return NextResponse.json(
        { error: 'Failed to create comment' },
        { status: 500 }
      )
    }

    const comment = commentResult.data
    const post = postResult.data

    // Send notification (non-blocking - fire and forget)
    if (post && post.author_id !== session.userId) {
      (supabase as any).from('notifications').insert({
        user_id: post.author_id,
        type: 'comment',
        title: 'New Comment',
        message: 'Someone commented on your post!',
        data: { post_id: postId, comment_id: comment.id, from_user_id: session.userId },
      }).then(() => {}).catch(console.error)
    }

    return NextResponse.json({ comment }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/posts/[id]/comments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE a comment
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

    const { searchParams } = new URL(request.url)
    const commentId = searchParams.get('commentId')

    if (!commentId) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
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

    // Only allow deleting own comments
    const { error } = await (supabase as any)
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', session.userId)

    if (error) {
      console.error('Error deleting comment:', error)
      return NextResponse.json(
        { error: 'Failed to delete comment' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/posts/[id]/comments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
