import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { moderateContentAI } from '@/lib/moderation'

// GET posts feed
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    const supabase = await createClient()

    if (!supabase) {
      // Return empty posts if no database
      return NextResponse.json({ posts: [], total: 0 })
    }

    const { data: posts, error, count } = await (supabase as any)
      .from('posts')
      .select(
        `
        *,
        author:users(id, display_name, avatar_url, level, wallet_address)
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching posts:', error)
      return NextResponse.json(
        { error: 'Failed to fetch posts' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      posts: posts || [],
      total: count || 0,
      page,
      limit,
    })
  } catch (error) {
    console.error('Error in GET /api/posts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST create a new post
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
    const { content, post_type = 'text', visibility = 'public', media = [] } = body

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
          error: 'Your post contains content that violates our community guidelines.',
          flags: moderation.flags.map(f => f.type),
        },
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

    // Use cleaned content if available, otherwise original
    const finalContent = moderation.cleanedContent || content.trim()

    // Create post
    const { data: post, error } = await (supabase as any)
      .from('posts')
      .insert({
        author_id: session.userId,
        content: finalContent,
        post_type,
        visibility,
        is_flagged: moderation.shouldFlag,
        moderation_flags: moderation.shouldFlag ? moderation.flags.map(f => f.type) : null,
      })
      .select(
        `
        *,
        author:users(id, display_name, avatar_url, level, wallet_address)
      `
      )
      .single()

    if (error) {
      console.error('Error creating post:', error)
      return NextResponse.json(
        { error: 'Failed to create post' },
        { status: 500 }
      )
    }

    // Add media if provided
    if (media.length > 0) {
      const mediaInserts = media.map((m: { type: string; url: string }, index: number) => ({
        post_id: post.id,
        media_type: m.type,
        url: m.url,
        order_index: index,
      }))

      await (supabase as any).from('post_media').insert(mediaInserts)
    }

    return NextResponse.json({ post }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/posts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
