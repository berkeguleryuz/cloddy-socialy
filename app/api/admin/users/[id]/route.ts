import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireStaff, requireAdmin } from '@/lib/admin/middleware'
import { getSession } from '@/lib/auth/session'
import { recordAuditLog, AUDIT_ACTIONS } from '@/lib/admin/auditLog'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireStaff(request)
  if (authError) return authError

  try {
    const { id } = await params

    const supabase = await createAdminClient()
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    // Fetch user with relations
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        *,
        roles:user_roles(id, role, granted_by, granted_at),
        suspensions:user_suspensions(id, reason, suspension_type, starts_at, ends_at, is_active, suspended_by),
        badges:user_badges(id, badge_id, earned_at, badge:badges(name, image_url)),
        posts:posts(id, created_at),
        friendships:friendships(id)
      `)
      .eq('id', id)
      .single()

    if (error || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const userData = user as any

    // Transform user data
    const transformedUser = {
      id: userData.id,
      display_name: userData.display_name,
      displayName: userData.display_name,
      username: userData.username,
      email: userData.email,
      wallet_address: userData.wallet_address,
      walletAddress: userData.wallet_address,
      ens_name: userData.ens_name,
      ensName: userData.ens_name,
      avatar_url: userData.avatar_url,
      avatar: userData.avatar_url,
      cover_url: userData.cover_url,
      cover: userData.cover_url,
      bio: userData.bio,
      tagline: userData.tagline,
      level: userData.level,
      xp: userData.experience_points,
      experiencePoints: userData.experience_points,
      city: userData.city,
      country: userData.country,
      occupation: userData.occupation,
      auth_method: userData.auth_method || 'web3',
      authMethod: userData.auth_method || 'web3',
      email_verified: userData.email_verified,
      emailVerified: userData.email_verified,
      is_verified: userData.is_verified,
      isVerified: userData.is_verified,
      profile_completion: userData.profile_completion,
      profileCompletion: userData.profile_completion,
      created_at: userData.created_at,
      createdAt: userData.created_at,
      updated_at: userData.updated_at,
      updatedAt: userData.updated_at,
      last_seen_at: userData.last_seen_at,
      lastSeenAt: userData.last_seen_at,
      roles: (userData.roles || []).map((r: any) => r.role),
      suspension: (userData.suspensions || []).find((s: any) => s.is_active),
      is_suspended: (userData.suspensions || []).some((s: any) => s.is_active),
      suspensions: userData.suspensions || [],
      badges: userData.badges || [],
      stats: {
        posts: userData.posts?.length || 0,
        friends: userData.friendships?.length || 0,
        badges: userData.badges?.length || 0,
      },
    }

    return NextResponse.json({ user: transformedUser })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  try {
    const { id } = await params
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      displayName,
      username,
      email,
      bio,
      tagline,
      isVerified,
      level,
      experiencePoints,
    } = body

    const supabase = await createAdminClient()
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    // Build update object
    const updates: Record<string, any> = {}
    if (displayName !== undefined) updates.display_name = displayName
    if (username !== undefined) updates.username = username
    if (email !== undefined) updates.email = email
    if (bio !== undefined) updates.bio = bio
    if (tagline !== undefined) updates.tagline = tagline
    if (isVerified !== undefined) updates.is_verified = isVerified
    if (level !== undefined) updates.level = level
    if (experiencePoints !== undefined) updates.experience_points = experiencePoints

    const { data: user, error } = await (supabase as any)
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating user:', error)
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      )
    }

    // Record audit log
    await recordAuditLog({
      actor_id: session.userId,
      action: AUDIT_ACTIONS.USER_UPDATED,
      target_type: 'user',
      target_id: id,
      metadata: { updates },
    })

    return NextResponse.json({ user, success: true })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
