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

    const { data: quests, error } = await supabase
      .from('quests')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching quests:', error)
      return NextResponse.json(
        { error: 'Failed to fetch quests' },
        { status: 500 }
      )
    }

    return NextResponse.json({ quests: quests || [] })
  } catch (error) {
    console.error('Error fetching quests:', error)
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
    const { title, description, category, difficulty, xp_reward, requirements, is_daily, is_weekly } = body

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
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

    const { data: quest, error } = await supabase
      .from('quests')
      .insert({
        title,
        description,
        category: category || 'social',
        difficulty: difficulty || 'easy',
        xp_reward: xp_reward || 50,
        requirements: requirements || {},
        is_daily: is_daily || false,
        is_weekly: is_weekly || false,
        is_active: true,
        created_by: session.userId,
      } as any)
      .select()
      .single()

    if (error) {
      console.error('Error creating quest:', error)
      return NextResponse.json(
        { error: 'Failed to create quest' },
        { status: 500 }
      )
    }

    const questData = quest as any

    // Log the action
    await recordAuditLog({
      actor_id: session.userId,
      action: AUDIT_ACTIONS.QUEST_CREATED,
      target_type: 'quest',
      target_id: questData.id,
      metadata: { title, category, difficulty },
    })

    return NextResponse.json({
      success: true,
      quest,
    })
  } catch (error) {
    console.error('Error creating quest:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
