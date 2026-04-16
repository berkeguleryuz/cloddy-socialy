import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireStaff } from '@/lib/admin/middleware'
import { getSession } from '@/lib/auth/session'
import { logReportAction } from '@/lib/admin/auditLog'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireStaff(request)
  if (authError) return authError

  try {
    const { id } = await params
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status, resolutionNotes } = body

    if (!status || !['reviewed', 'resolved', 'dismissed'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status is required (reviewed, resolved, dismissed)' },
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

    const { data: report, error } = await (supabase as any)
      .from('content_reports')
      .update({
        status,
        reviewed_by: session.userId,
        reviewed_at: new Date().toISOString(),
        resolution_notes: resolutionNotes || null,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating report:', error)
      return NextResponse.json(
        { error: 'Failed to update report' },
        { status: 500 }
      )
    }

    // Log the action
    await logReportAction(
      session.userId,
      id,
      status === 'dismissed' ? 'dismissed' : 'resolved',
      resolutionNotes
    )

    return NextResponse.json({
      success: true,
      report,
      message: `Report ${status}`,
    })
  } catch (error) {
    console.error('Error updating report:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
