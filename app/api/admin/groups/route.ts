import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin/middleware'

export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const privacy = searchParams.get('privacy')

    const supabase = await createAdminClient()
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    const offset = (page - 1) * limit

    let query = supabase
      .from('groups')
      .select(`
        *,
        creator:users!created_by(display_name)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })

    if (privacy) {
      query = query.eq('privacy', privacy)
    }

    query = query.range(offset, offset + limit - 1)

    const { data: groups, error, count } = await query

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
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error) {
    console.error('Error fetching groups:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
