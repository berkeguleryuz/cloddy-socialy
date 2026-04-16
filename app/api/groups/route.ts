import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'

// GET groups list
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
    const category = searchParams.get('category')
    const myGroups = searchParams.get('my') === 'true'
    const offset = (page - 1) * limit

    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json({ groups: [], total: 0 })
    }

    let query = (supabase as any)
      .from('groups')
      .select(`
        *,
        owner:users!groups_owner_id_fkey(id, display_name, avatar_url),
        members:group_memberships(count)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })

    if (category) {
      query = query.eq('category', category)
    }

    if (myGroups) {
      // Get groups user is member of
      const { data: memberships } = await (supabase as any)
        .from('group_memberships')
        .select('group_id')
        .eq('user_id', session.userId)

      if (memberships && memberships.length > 0) {
        const groupIds = memberships.map((m: any) => m.group_id)
        query = query.in('id', groupIds)
      } else {
        return NextResponse.json({ groups: [], total: 0, page, limit })
      }
    }

    const { data: groups, error, count } = await query
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching groups:', error)
      return NextResponse.json(
        { error: 'Failed to fetch groups' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      groups: groups || [],
      total: count || 0,
      page,
      limit,
    })
  } catch (error) {
    console.error('Error in GET /api/groups:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST create a new group
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
    const { name, description, category, is_private = false, avatar_url, cover_url } = body

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Group name is required' },
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

    // Create group
    const { data: group, error } = await (supabase as any)
      .from('groups')
      .insert({
        name: name.trim(),
        description: description?.trim(),
        category,
        is_private,
        avatar_url,
        cover_url,
        owner_id: session.userId,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating group:', error)
      return NextResponse.json(
        { error: 'Failed to create group' },
        { status: 500 }
      )
    }

    // Add creator as owner member
    await (supabase as any).from('group_memberships').insert({
      group_id: group.id,
      user_id: session.userId,
      role: 'owner',
    })

    return NextResponse.json({ group }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/groups:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
