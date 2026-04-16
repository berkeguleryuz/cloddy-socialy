import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireStaff } from '@/lib/admin/middleware'

export async function GET(request: NextRequest) {
  // Check admin permissions
  const authError = await requireStaff(request)
  if (authError) return authError

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role')
    const status = searchParams.get('status') // 'active', 'suspended'
    const authMethod = searchParams.get('authMethod')

    const supabase = await createAdminClient()
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    const offset = (page - 1) * limit

    // Build query
    let query = supabase
      .from('users')
      .select(`
        *,
        roles:user_roles(role),
        suspensions:user_suspensions(id, is_active)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })

    // Apply search filter
    if (search) {
      query = query.or(`display_name.ilike.%${search}%,email.ilike.%${search}%,username.ilike.%${search}%,wallet_address.ilike.%${search}%`)
    }

    // Apply auth method filter
    if (authMethod) {
      query = query.eq('auth_method', authMethod)
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: users, error, count } = await query

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      )
    }

    // Transform users data
    const transformedUsers = users?.map((user: any) => ({
      id: user.id,
      display_name: user.display_name,
      displayName: user.display_name,
      username: user.username,
      email: user.email,
      wallet_address: user.wallet_address,
      walletAddress: user.wallet_address,
      avatar_url: user.avatar_url,
      avatar: user.avatar_url,
      level: user.level,
      xp: user.experience_points,
      experiencePoints: user.experience_points,
      auth_method: user.auth_method || 'web3',
      authMethod: user.auth_method || 'web3',
      email_verified: user.email_verified,
      emailVerified: user.email_verified,
      created_at: user.created_at,
      createdAt: user.created_at,
      last_seen_at: user.last_seen_at,
      lastSeenAt: user.last_seen_at,
      roles: user.roles?.map((r: any) => r.role) || [],
      is_suspended: user.suspensions?.some((s: any) => s.is_active) || false,
      isSuspended: user.suspensions?.some((s: any) => s.is_active) || false,
    }))

    // If role filter, filter client-side (could optimize with join)
    let filteredUsers = transformedUsers
    if (role) {
      filteredUsers = transformedUsers?.filter((u) => u.roles.includes(role))
    }
    if (status === 'suspended') {
      filteredUsers = transformedUsers?.filter((u) => u.isSuspended)
    } else if (status === 'active') {
      filteredUsers = transformedUsers?.filter((u) => !u.isSuspended)
    }

    return NextResponse.json({
      users: filteredUsers || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
