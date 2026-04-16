import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/middleware'
import { getAuditLogs, AuditAction } from '@/lib/admin/auditLog'

export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const actorId = searchParams.get('actorId') || undefined
    const action = searchParams.get('action') as AuditAction | undefined
    const targetType = searchParams.get('targetType') || undefined
    const targetId = searchParams.get('targetId') || undefined
    const startDate = searchParams.get('startDate')
      ? new Date(searchParams.get('startDate')!)
      : undefined
    const endDate = searchParams.get('endDate')
      ? new Date(searchParams.get('endDate')!)
      : undefined

    const result = await getAuditLogs({
      page,
      limit,
      actorId,
      action,
      targetType,
      targetId,
      startDate,
      endDate,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
