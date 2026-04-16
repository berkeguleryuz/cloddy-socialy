import { NextRequest, NextResponse } from 'next/server'
import { getSession, toAuthUser } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'

// GET users list (search)
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
    const query = searchParams.get('q') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json({ users: [], total: 0 })
    }

    let dbQuery = (supabase as any)
      .from('users')
      .select('id, display_name, avatar_url, level, wallet_address, bio, tagline', { count: 'exact' })
      .neq('id', session.userId) // Exclude current user
      .order('level', { ascending: false })

    if (query.trim()) {
      // Search by display_name or wallet_address
      dbQuery = dbQuery.or(`display_name.ilike.%${query}%,wallet_address.ilike.%${query}%`)
    }

    const { data: users, error, count } = await dbQuery
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      users: users || [],
      total: count || 0,
      page,
      limit,
    })
  } catch (error) {
    console.error('Error in GET /api/users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
