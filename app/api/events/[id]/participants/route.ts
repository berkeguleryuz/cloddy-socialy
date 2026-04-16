import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'

// GET event participants
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: eventId } = await params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // going, interested, or null for all

    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json({ participants: [] })
    }

    let query = (supabase as any)
      .from('event_participants')
      .select(`
        id,
        status,
        user:users(id, display_name, avatar_url, level)
      `)
      .eq('event_id', eventId)

    if (status) {
      query = query.eq('status', status)
    }

    const { data: participants, error } = await query

    if (error) {
      console.error('Error fetching participants:', error)
      return NextResponse.json(
        { error: 'Failed to fetch participants' },
        { status: 500 }
      )
    }

    return NextResponse.json({ participants: participants || [] })
  } catch (error) {
    console.error('Error in GET /api/events/[id]/participants:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST respond to event (going/interested)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: eventId } = await params
    const body = await request.json()
    const { status } = body

    if (!status || !['going', 'interested'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status is required (going or interested)' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    // Check if already responding
    const { data: existing } = await (supabase as any)
      .from('event_participants')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', session.userId)
      .single()

    if (existing) {
      // Update existing response
      const { data: participation, error } = await (supabase as any)
        .from('event_participants')
        .update({ status })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) {
        return NextResponse.json(
          { error: 'Failed to update response' },
          { status: 500 }
        )
      }

      return NextResponse.json({ participation })
    }

    // Create new response
    const { data: participation, error } = await (supabase as any)
      .from('event_participants')
      .insert({
        event_id: eventId,
        user_id: session.userId,
        status,
      })
      .select()
      .single()

    if (error) {
      console.error('Error responding to event:', error)
      return NextResponse.json(
        { error: 'Failed to respond to event' },
        { status: 500 }
      )
    }

    return NextResponse.json({ participation }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/events/[id]/participants:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE remove response
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: eventId } = await params
    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    const { error } = await (supabase as any)
      .from('event_participants')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', session.userId)

    if (error) {
      console.error('Error removing response:', error)
      return NextResponse.json(
        { error: 'Failed to remove response' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/events/[id]/participants:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
