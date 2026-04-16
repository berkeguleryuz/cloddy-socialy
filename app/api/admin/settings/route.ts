import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin, requireSuperAdmin } from '@/lib/admin/middleware'
import { getSession } from '@/lib/auth/session'
import { logSettingChange } from '@/lib/admin/auditLog'

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

    const { data: settings, error } = await supabase
      .from('system_settings')
      .select('*')
      .order('category')
      .order('key')

    if (error) {
      console.error('Error fetching settings:', error)
      return NextResponse.json(
        { error: 'Failed to fetch settings' },
        { status: 500 }
      )
    }

    // Group settings by category
    const grouped = (settings || []).reduce((acc, setting: any) => {
      const category = setting.category || 'general'
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push({
        key: setting.key,
        value: setting.value,
        description: setting.description,
        isPublic: setting.is_public,
        updatedAt: setting.updated_at,
      })
      return acc
    }, {} as Record<string, any[]>)

    return NextResponse.json({ settings: grouped })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  const authError = await requireSuperAdmin(request)
  if (authError) return authError

  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { key, value } = body

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: 'Key and value are required' },
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

    // Get old value for audit log
    const { data: oldSetting } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', key)
      .single()

    // Update setting
    const { data: setting, error } = await (supabase as any)
      .from('system_settings')
      .update({
        value,
        updated_by: session.userId,
        updated_at: new Date().toISOString(),
      })
      .eq('key', key)
      .select()
      .single()

    if (error) {
      console.error('Error updating setting:', error)
      return NextResponse.json(
        { error: 'Failed to update setting' },
        { status: 500 }
      )
    }

    // Log the change
    await logSettingChange(session.userId, key, (oldSetting as any)?.value, value)

    return NextResponse.json({
      success: true,
      setting,
    })
  } catch (error) {
    console.error('Error updating setting:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
