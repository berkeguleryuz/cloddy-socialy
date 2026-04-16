import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'

// GET single event
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

    const { id } = await params
    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    const { data: event, error } = await (supabase as any)
      .from('events')
      .select(`
        *,
        organizer:users!events_organizer_id_fkey(id, display_name, avatar_url, level),
        participants:event_participants(
          id,
          status,
          user:users(id, display_name, avatar_url, level)
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching event:', error)
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Check if current user is participating
    const userParticipation = event.participants?.find(
      (p: any) => p.user?.id === session.userId
    )

    // Count by status
    const goingCount = event.participants?.filter((p: any) => p.status === 'going').length || 0
    const interestedCount = event.participants?.filter((p: any) => p.status === 'interested').length || 0

    return NextResponse.json({
      event: {
        ...event,
        user_status: userParticipation?.status || null,
        going_count: goingCount,
        interested_count: interestedCount,
      },
    })
  } catch (error) {
    console.error('Error in GET /api/events/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH update event
export async function PATCH(
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

    const { id } = await params
    const body = await request.json()
    const { title, description, event_date, location, image_url } = body

    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    // Check if user is organizer
    const { data: event } = await (supabase as any)
      .from('events')
      .select('organizer_id')
      .eq('id', id)
      .single()

    if (!event || event.organizer_id !== session.userId) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }

    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    if (title !== undefined) updateData.title = title.trim()
    if (description !== undefined) updateData.description = description?.trim()
    if (event_date !== undefined) updateData.event_date = event_date
    if (location !== undefined) updateData.location = location?.trim()
    if (image_url !== undefined) updateData.image_url = image_url

    const { data: updated, error } = await (supabase as any)
      .from('events')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        organizer:users!events_organizer_id_fkey(id, display_name, avatar_url, level)
      `)
      .single()

    if (error) {
      console.error('Error updating event:', error)
      return NextResponse.json(
        { error: 'Failed to update event' },
        { status: 500 }
      )
    }

    return NextResponse.json({ event: updated })
  } catch (error) {
    console.error('Error in PATCH /api/events/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE event
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

    const { id } = await params
    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    // Check if user is organizer
    const { data: event } = await (supabase as any)
      .from('events')
      .select('organizer_id')
      .eq('id', id)
      .single()

    if (!event || event.organizer_id !== session.userId) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }

    const { error } = await (supabase as any)
      .from('events')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting event:', error)
      return NextResponse.json(
        { error: 'Failed to delete event' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/events/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
