import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'

// GET events list
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const upcoming = searchParams.get('upcoming') === 'true'
    const myEvents = searchParams.get('my') === 'true'
    const offset = (page - 1) * limit

    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json({ events: [], total: 0 })
    }

    let query = (supabase as any)
      .from('events')
      .select(`
        *,
        organizer:users!events_organizer_id_fkey(id, display_name, avatar_url, level),
        participants:event_participants(count)
      `, { count: 'exact' })

    if (upcoming) {
      query = query.gte('event_date', new Date().toISOString())
      query = query.order('event_date', { ascending: true })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    if (myEvents) {
      // Get events user is participating in
      const { data: participations } = await (supabase as any)
        .from('event_participants')
        .select('event_id')
        .eq('user_id', session.userId)

      if (participations && participations.length > 0) {
        const eventIds = participations.map((p: any) => p.event_id)
        query = query.in('id', eventIds)
      } else {
        return NextResponse.json({ events: [], total: 0, page, limit })
      }
    }

    const { data: events, error, count } = await query
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching events:', error)
      return NextResponse.json(
        { error: 'Failed to fetch events' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      events: events || [],
      total: count || 0,
      page,
      limit,
    })
  } catch (error) {
    console.error('Error in GET /api/events:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST create a new event
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, description, event_date, location, image_url } = body

    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Event title is required' },
        { status: 400 }
      )
    }

    if (!event_date) {
      return NextResponse.json(
        { error: 'Event date is required' },
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

    // Create event
    const { data: event, error } = await (supabase as any)
      .from('events')
      .insert({
        title: title.trim(),
        description: description?.trim(),
        event_date,
        location: location?.trim(),
        image_url,
        organizer_id: session.userId,
      })
      .select(`
        *,
        organizer:users!events_organizer_id_fkey(id, display_name, avatar_url, level)
      `)
      .single()

    if (error) {
      console.error('Error creating event:', error)
      return NextResponse.json(
        { error: 'Failed to create event' },
        { status: 500 }
      )
    }

    // Organizer is automatically "going"
    await (supabase as any).from('event_participants').insert({
      event_id: event.id,
      user_id: session.userId,
      status: 'going',
    })

    return NextResponse.json({ event }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/events:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
