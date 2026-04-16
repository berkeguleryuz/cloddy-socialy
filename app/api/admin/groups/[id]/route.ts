import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin/middleware'
import { getSession } from '@/lib/auth/session'
import { recordAuditLog } from '@/lib/admin/auditLog'

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
    const { is_verified, is_active } = body

    const supabase = await createAdminClient()
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    const updateData: Record<string, any> = {}
    if (is_verified !== undefined) updateData.is_verified = is_verified
    if (is_active !== undefined) updateData.is_active = is_active
    updateData.updated_at = new Date().toISOString()

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

    // Log the action
    await recordAuditLog({
      actor_id: session.userId,
      action: is_verified !== undefined ? 'group_verification_changed' : 'group_updated',
      target_type: 'group',
      target_id: id,
      metadata: updateData,
    })

    return NextResponse.json({
      success: true,
      group,
    })
  } catch (error) {
    console.error('Error updating group:', error)
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

    // Get group name for audit log
    const { data: group } = await supabase
      .from('groups')
      .select('name')
      .eq('id', id)
      .single()

    const { error } = await supabase
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

    // Log the action
    await recordAuditLog({
      actor_id: session.userId,
      action: 'group_deleted',
      target_type: 'group',
      target_id: id,
      metadata: { name: (group as any)?.name },
    })

    return NextResponse.json({
      success: true,
      message: 'Group deleted',
    })
  } catch (error) {
    console.error('Error deleting group:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
