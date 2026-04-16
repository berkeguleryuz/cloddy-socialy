import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin/middleware'
import { getSession } from '@/lib/auth/session'
import { recordAuditLog, AUDIT_ACTIONS } from '@/lib/admin/auditLog'

export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  try {
    const supabase = await createAdminClient()
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    const { data: badges, error } = await supabase
      .from('badges')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching badges:', error)
      return NextResponse.json(
        { error: 'Failed to fetch badges' },
        { status: 500 }
      )
    }

    return NextResponse.json({ badges: badges || [] })
  } catch (error) {
    console.error('Error fetching badges:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, image_url, category, rarity, xp_reward } = body

    if (!name || !description) {
      return NextResponse.json(
        { error: 'Name and description are required' },
        { status: 400 }
      )
    }

    const supabase = await createAdminClient()
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    const { data: badge, error } = await supabase
      .from('badges')
      .insert({
        name,
        description,
        image_url: image_url || null,
        category: category || 'achievement',
        rarity: rarity || 'common',
        xp_reward: xp_reward || 0,
        is_active: true,
        created_by: session.userId,
      } as any)
      .select()
      .single()

    if (error) {
      console.error('Error creating badge:', error)
      return NextResponse.json(
        { error: 'Failed to create badge' },
        { status: 500 }
      )
    }

    const badgeData = badge as any

    // Log the action
    await recordAuditLog({
      actor_id: session.userId,
      action: AUDIT_ACTIONS.BADGE_CREATED,
      target_type: 'badge',
      target_id: badgeData.id,
      metadata: { name, category, rarity },
    })

    return NextResponse.json({
      success: true,
      badge,
    })
  } catch (error) {
    console.error('Error creating badge:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
