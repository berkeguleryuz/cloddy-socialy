import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin/middleware'
import { getSession } from '@/lib/auth/session'
import { logUserSuspension, recordAuditLog, AUDIT_ACTIONS } from '@/lib/admin/auditLog'

export async function POST(
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

    // Can't suspend yourself
    if (session.userId === id) {
      return NextResponse.json(
        { error: 'Cannot suspend yourself' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { reason, suspensionType, duration } = body

    if (!reason || !suspensionType) {
      return NextResponse.json(
        { error: 'Reason and suspension type are required' },
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

    // Calculate end date for temporary suspensions
    let endsAt: Date | null = null
    if (suspensionType === 'temporary' && duration) {
      endsAt = new Date(Date.now() + duration * 60 * 60 * 1000) // duration in hours
    }

    // Create suspension record
    const { data: suspension, error } = await supabase
      .from('user_suspensions')
      .insert({
        user_id: id,
        suspended_by: session.userId,
        reason,
        suspension_type: suspensionType,
        ends_at: endsAt?.toISOString() || null,
        is_active: true,
      } as any)
      .select()
      .single()

    if (error) {
      console.error('Error creating suspension:', error)
      return NextResponse.json(
        { error: 'Failed to suspend user' },
        { status: 500 }
      )
    }

    // Log the action
    await logUserSuspension(session.userId, id, reason, suspensionType, endsAt || undefined)

    return NextResponse.json({
      success: true,
      suspension,
      message: `User has been ${suspensionType === 'permanent' ? 'permanently' : 'temporarily'} suspended.`,
    })
  } catch (error) {
    console.error('Error suspending user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Lift/remove suspension
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

    const body = await request.json()
    const { reason } = body

    const supabase = await createAdminClient()
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    // Update all active suspensions for this user
    const { data, error } = await (supabase as any)
      .from('user_suspensions')
      .update({
        is_active: false,
        lifted_by: session.userId,
        lifted_at: new Date().toISOString(),
        lift_reason: reason || 'Suspension lifted by admin',
      })
      .eq('user_id', id)
      .eq('is_active', true)
      .select()

    if (error) {
      console.error('Error lifting suspension:', error)
      return NextResponse.json(
        { error: 'Failed to lift suspension' },
        { status: 500 }
      )
    }

    // Log the action
    await recordAuditLog({
      actor_id: session.userId,
      action: AUDIT_ACTIONS.USER_UNSUSPENDED,
      target_type: 'user',
      target_id: id,
      metadata: { reason: reason || 'Suspension lifted by admin' },
    })

    return NextResponse.json({
      success: true,
      message: 'Suspension has been lifted.',
    })
  } catch (error) {
    console.error('Error lifting suspension:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
