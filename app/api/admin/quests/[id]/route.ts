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

    const { data: quest, error } = await supabase
      .from('quests')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching quest:', error)
      return NextResponse.json(
        { error: 'Failed to fetch quest' },
        { status: 500 }
      )
    }

    return NextResponse.json({ quest })
  } catch (error) {
    console.error('Error fetching quest:', error)
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
    const { title, description, category, difficulty, xp_reward, requirements, is_daily, is_weekly, is_active } = body

    const supabase = await createAdminClient()
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    const updateData: Record<string, any> = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (category !== undefined) updateData.category = category
    if (difficulty !== undefined) updateData.difficulty = difficulty
    if (xp_reward !== undefined) updateData.xp_reward = xp_reward
    if (requirements !== undefined) updateData.requirements = requirements
    if (is_daily !== undefined) updateData.is_daily = is_daily
    if (is_weekly !== undefined) updateData.is_weekly = is_weekly
    if (is_active !== undefined) updateData.is_active = is_active
    updateData.updated_at = new Date().toISOString()

    const { data: quest, error } = await (supabase as any)
      .from('quests')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating quest:', error)
      return NextResponse.json(
        { error: 'Failed to update quest' },
        { status: 500 }
      )
    }

    // Log the action
    await recordAuditLog({
      actor_id: session.userId,
      action: AUDIT_ACTIONS.QUEST_UPDATED,
      target_type: 'quest',
      target_id: id,
      metadata: updateData,
    })

    return NextResponse.json({
      success: true,
      quest,
    })
  } catch (error) {
    console.error('Error updating quest:', error)
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

    // Get quest title for audit log
    const { data: quest } = await supabase
      .from('quests')
      .select('title')
      .eq('id', id)
      .single()

    const { error } = await supabase
      .from('quests')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting quest:', error)
      return NextResponse.json(
        { error: 'Failed to delete quest' },
        { status: 500 }
      )
    }

    // Log the action
    await recordAuditLog({
      actor_id: session.userId,
      action: AUDIT_ACTIONS.QUEST_DELETED,
      target_type: 'quest',
      target_id: id,
      metadata: { title: (quest as any)?.title },
    })

    return NextResponse.json({
      success: true,
      message: 'Quest deleted',
    })
  } catch (error) {
    console.error('Error deleting quest:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
