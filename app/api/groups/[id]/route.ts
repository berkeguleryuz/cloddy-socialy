import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'

// GET single group
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

    const { data: group, error } = await (supabase as any)
      .from('groups')
      .select(`
        *,
        owner:users!groups_owner_id_fkey(id, display_name, avatar_url, level),
        members:group_memberships(
          id,
          role,
          joined_at,
          user:users(id, display_name, avatar_url, level)
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching group:', error)
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      )
    }

    // Check if current user is a member
    const userMembership = group.members?.find(
      (m: any) => m.user?.id === session.userId
    )

    return NextResponse.json({
      group: {
        ...group,
        is_member: !!userMembership,
        user_role: userMembership?.role || null,
        member_count: group.members?.length || 0,
      },
    })
  } catch (error) {
    console.error('Error in GET /api/groups/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH update group
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
    const { name, description, category, is_private, avatar_url, cover_url } = body

    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    // Check if user is owner or admin
    const { data: membership } = await (supabase as any)
      .from('group_memberships')
      .select('role')
      .eq('group_id', id)
      .eq('user_id', session.userId)
      .single()

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }

    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    if (name !== undefined) updateData.name = name.trim()
    if (description !== undefined) updateData.description = description?.trim()
    if (category !== undefined) updateData.category = category
    if (is_private !== undefined) updateData.is_private = is_private
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url
    if (cover_url !== undefined) updateData.cover_url = cover_url

    const { data: group, error } = await (supabase as any)
      .from('groups')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating group:', error)
      return NextResponse.json(
        { error: 'Failed to update group' },
        { status: 500 }
      )
    }

    return NextResponse.json({ group })
  } catch (error) {
    console.error('Error in PATCH /api/groups/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE group
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

    // Check if user is owner
    const { data: group } = await (supabase as any)
      .from('groups')
      .select('owner_id')
      .eq('id', id)
      .single()

    if (!group || group.owner_id !== session.userId) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }

    const { error } = await (supabase as any)
      .from('groups')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting group:', error)
      return NextResponse.json(
        { error: 'Failed to delete group' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/groups/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
