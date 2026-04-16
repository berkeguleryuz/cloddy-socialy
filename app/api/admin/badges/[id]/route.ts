import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin/middleware'
import { getSession } from '@/lib/auth/session'
import { recordAuditLog, AUDIT_ACTIONS } from '@/lib/admin/auditLog'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin(request)
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

    const { data: badge, error } = await supabase
      .from('badges')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching badge:', error)
      return NextResponse.json(
        { error: 'Failed to fetch badge' },
        { status: 500 }
      )
    }

    return NextResponse.json({ badge })
  } catch (error) {
    console.error('Error fetching badge:', error)
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
    const { name, description, image_url, category, rarity, xp_reward, is_active } = body

    const supabase = await createAdminClient()
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    const updateData: Record<string, any> = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (image_url !== undefined) updateData.image_url = image_url
    if (category !== undefined) updateData.category = category
    if (rarity !== undefined) updateData.rarity = rarity
    if (xp_reward !== undefined) updateData.xp_reward = xp_reward
    if (is_active !== undefined) updateData.is_active = is_active
    updateData.updated_at = new Date().toISOString()

    const { data: badge, error } = await (supabase as any)
      .from('badges')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating badge:', error)
      return NextResponse.json(
        { error: 'Failed to update badge' },
        { status: 500 }
      )
    }

    // Log the action
    await recordAuditLog({
      actor_id: session.userId,
      action: AUDIT_ACTIONS.BADGE_UPDATED,
      target_type: 'badge',
      target_id: id,
      metadata: updateData,
    })

    return NextResponse.json({
      success: true,
      badge,
    })
  } catch (error) {
    console.error('Error updating badge:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    const supabase = await createAdminClient()
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    // Get badge name for audit log
    const { data: badge } = await supabase
      .from('badges')
      .select('name')
      .eq('id', id)
      .single()

    const { error } = await supabase
      .from('badges')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting badge:', error)
      return NextResponse.json(
        { error: 'Failed to delete badge' },
        { status: 500 }
      )
    }

    // Log the action
    await recordAuditLog({
      actor_id: session.userId,
      action: AUDIT_ACTIONS.BADGE_DELETED,
      target_type: 'badge',
      target_id: id,
      metadata: { name: (badge as any)?.name },
    })

    return NextResponse.json({
      success: true,
      message: 'Badge deleted',
    })
  } catch (error) {
    console.error('Error deleting badge:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
