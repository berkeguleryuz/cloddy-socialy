import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireStaff } from '@/lib/admin/middleware'
import { getSession } from '@/lib/auth/session'
import { logReportAction } from '@/lib/admin/auditLog'

export async function GET(request: NextRequest) {
  const authError = await requireStaff(request)
  if (authError) return authError

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') // 'pending', 'reviewed', 'resolved', 'dismissed'
    const contentType = searchParams.get('contentType')

    const supabase = await createAdminClient()
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    const offset = (page - 1) * limit

    let query = supabase
      .from('content_reports')
      .select(`
        *,
        reporter:users!reporter_id(id, display_name, avatar_url),
        reviewer:users!reviewed_by(id, display_name, avatar_url)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    if (contentType) {
      query = query.eq('content_type', contentType)
    }

    query = query.range(offset, offset + limit - 1)

    const { data: reports, error, count } = await query

    if (error) {
      console.error('Error fetching reports:', error)
      return NextResponse.json(
        { error: 'Failed to fetch reports' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      reports: reports || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Create a new report (for users)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { contentType, contentId, reason, description } = body

    if (!contentType || !contentId || !reason) {
      return NextResponse.json(
        { error: 'Content type, content ID, and reason are required' },
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

    // Check if user already reported this content
    const { data: existingReport } = await supabase
      .from('content_reports')
      .select('id')
      .eq('reporter_id', session.userId)
      .eq('content_type', contentType)
      .eq('content_id', contentId)
      .single()

    if (existingReport) {
      return NextResponse.json(
        { error: 'You have already reported this content' },
        { status: 400 }
      )
    }

    const { data: report, error } = await supabase
      .from('content_reports')
      .insert({
        reporter_id: session.userId,
        content_type: contentType,
        content_id: contentId,
        reason,
        description: description || null,
        status: 'pending',
      } as any)
      .select()
      .single()

    if (error) {
      console.error('Error creating report:', error)
      return NextResponse.json(
        { error: 'Failed to create report' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      report,
      message: 'Report submitted successfully',
    })
  } catch (error) {
    console.error('Error creating report:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
