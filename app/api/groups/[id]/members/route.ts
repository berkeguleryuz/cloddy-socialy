import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'

// GET group members
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

    const { id: groupId } = await params
    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json({ members: [] })
    }

    const { data: members, error } = await (supabase as any)
      .from('group_memberships')
      .select(`
        id,
        role,
        joined_at,
        user:users(id, display_name, avatar_url, level, wallet_address)
      `)
      .eq('group_id', groupId)
      .order('joined_at', { ascending: true })

    if (error) {
      console.error('Error fetching members:', error)
      return NextResponse.json(
        { error: 'Failed to fetch members' },
        { status: 500 }
      )
    }

    return NextResponse.json({ members: members || [] })
  } catch (error) {
    console.error('Error in GET /api/groups/[id]/members:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST join group
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

    const { id: groupId } = await params
    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    // Check if group exists and is not private
    const { data: group } = await (supabase as any)
      .from('groups')
      .select('id, is_private')
      .eq('id', groupId)
      .single()

    if (!group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      )
    }

    if (group.is_private) {
      return NextResponse.json(
        { error: 'This is a private group. Request an invite.' },
        { status: 403 }
      )
    }

    // Check if already a member
    const { data: existing } = await (supabase as any)
      .from('group_memberships')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', session.userId)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Already a member' },
        { status: 409 }
      )
    }

    // Join group
    const { data: membership, error } = await (supabase as any)
      .from('group_memberships')
      .insert({
        group_id: groupId,
        user_id: session.userId,
        role: 'member',
      })
      .select()
      .single()

    if (error) {
      console.error('Error joining group:', error)
      return NextResponse.json(
        { error: 'Failed to join group' },
        { status: 500 }
      )
    }

    return NextResponse.json({ membership }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/groups/[id]/members:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE leave group or remove member
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

    const { id: groupId } = await params
    const { searchParams } = new URL(request.url)
    const targetUserId = searchParams.get('userId') || session.userId

    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    // If removing someone else, check permissions
    if (targetUserId !== session.userId) {
      const { data: membership } = await (supabase as any)
        .from('group_memberships')
        .select('role')
        .eq('group_id', groupId)
        .eq('user_id', session.userId)
        .single()

      if (!membership || !['owner', 'admin', 'moderator'].includes(membership.role)) {
        return NextResponse.json(
          { error: 'Permission denied' },
          { status: 403 }
        )
      }
    }

    // Check if trying to leave as owner
    const { data: group } = await (supabase as any)
      .from('groups')
      .select('owner_id')
      .eq('id', groupId)
      .single()

    if (group?.owner_id === targetUserId) {
      return NextResponse.json(
        { error: 'Owner cannot leave the group. Transfer ownership first.' },
        { status: 400 }
      )
    }

    const { error } = await (supabase as any)
      .from('group_memberships')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', targetUserId)

    if (error) {
      console.error('Error removing member:', error)
      return NextResponse.json(
        { error: 'Failed to remove member' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/groups/[id]/members:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH update member role
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

    const { id: groupId } = await params
    const body = await request.json()
    const { user_id, role } = body

    if (!user_id || !role) {
      return NextResponse.json(
        { error: 'User ID and role are required' },
        { status: 400 }
      )
    }

    if (!['admin', 'moderator', 'member'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
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

    // Check if current user is owner or admin
    const { data: membership } = await (supabase as any)
      .from('group_memberships')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', session.userId)
      .single()

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }

    // Cannot change owner's role
    const { data: group } = await (supabase as any)
      .from('groups')
      .select('owner_id')
      .eq('id', groupId)
      .single()

    if (group?.owner_id === user_id) {
      return NextResponse.json(
        { error: 'Cannot change owner role' },
        { status: 400 }
      )
    }

    const { data: updated, error } = await (supabase as any)
      .from('group_memberships')
      .update({ role })
      .eq('group_id', groupId)
      .eq('user_id', user_id)
      .select()
      .single()

    if (error) {
      console.error('Error updating member role:', error)
      return NextResponse.json(
        { error: 'Failed to update member role' },
        { status: 500 }
      )
    }

    return NextResponse.json({ membership: updated })
  } catch (error) {
    console.error('Error in PATCH /api/groups/[id]/members:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
