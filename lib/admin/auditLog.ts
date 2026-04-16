import { createAdminClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

// Audit log action types
export const AUDIT_ACTIONS = {
  // User actions
  USER_CREATED: 'user_created',
  USER_UPDATED: 'user_updated',
  USER_DELETED: 'user_deleted',
  USER_SUSPENDED: 'user_suspended',
  USER_UNSUSPENDED: 'user_unsuspended',
  USER_ROLE_ASSIGNED: 'user_role_assigned',
  USER_ROLE_REMOVED: 'user_role_removed',

  // Content actions
  POST_DELETED: 'post_deleted',
  COMMENT_DELETED: 'comment_deleted',
  POST_FEATURED: 'post_featured',
  POST_UNFEATURED: 'post_unfeatured',

  // Report actions
  REPORT_CREATED: 'report_created',
  REPORT_RESOLVED: 'report_resolved',
  REPORT_DISMISSED: 'report_dismissed',

  // Badge actions
  BADGE_CREATED: 'badge_created',
  BADGE_UPDATED: 'badge_updated',
  BADGE_DELETED: 'badge_deleted',
  BADGE_AWARDED: 'badge_awarded',
  BADGE_REVOKED: 'badge_revoked',

  // Quest actions
  QUEST_CREATED: 'quest_created',
  QUEST_UPDATED: 'quest_updated',
  QUEST_DELETED: 'quest_deleted',

  // Event actions
  EVENT_UPDATED: 'event_updated',
  EVENT_DELETED: 'event_deleted',

  // Group actions
  GROUP_UPDATED: 'group_updated',
  GROUP_DELETED: 'group_deleted',
  GROUP_VERIFICATION_CHANGED: 'group_verification_changed',

  // Settings actions
  SETTING_UPDATED: 'setting_updated',

  // Auth actions
  ADMIN_LOGIN: 'admin_login',
  ADMIN_LOGOUT: 'admin_logout',
} as const

export type AuditAction = typeof AUDIT_ACTIONS[keyof typeof AUDIT_ACTIONS]

export interface AuditLogEntry {
  actor_id: string
  action: AuditAction | string  // Allow string for flexibility
  target_type?: string
  target_id?: string
  metadata?: Record<string, unknown>
  ip_address?: string
  user_agent?: string
}

/**
 * Get client IP and user agent from headers
 */
async function getRequestInfo(): Promise<{ ip: string | null; userAgent: string | null }> {
  try {
    const headersList = await headers()
    const forwardedFor = headersList.get('x-forwarded-for')
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : headersList.get('x-real-ip')
    const userAgent = headersList.get('user-agent')
    return { ip, userAgent }
  } catch {
    return { ip: null, userAgent: null }
  }
}

/**
 * Record an audit log entry
 */
export async function recordAuditLog(entry: AuditLogEntry): Promise<{ success: boolean; error?: string }> {
  const supabase = await createAdminClient()
  if (!supabase) return { success: false, error: 'Database not configured' }

  const { ip, userAgent } = await getRequestInfo()

  const { error } = await supabase.from('audit_logs').insert({
    actor_id: entry.actor_id,
    action: entry.action,
    target_type: entry.target_type || null,
    target_id: entry.target_id || null,
    metadata: entry.metadata || {},
    ip_address: entry.ip_address || ip || null,
    user_agent: entry.user_agent || userAgent || null,
    created_at: new Date().toISOString(),
  } as any)

  if (error) {
    console.error('Error recording audit log:', error)
    return { success: false, error: 'Failed to record audit log' }
  }

  return { success: true }
}

/**
 * Get audit logs with pagination and filters
 */
export async function getAuditLogs(options: {
  page?: number
  limit?: number
  actorId?: string
  action?: AuditAction
  targetType?: string
  targetId?: string
  startDate?: Date
  endDate?: Date
}): Promise<{
  data: any[]
  total: number
  page: number
  totalPages: number
}> {
  const supabase = await createAdminClient()
  if (!supabase) return { data: [], total: 0, page: 1, totalPages: 0 }

  const page = options.page || 1
  const limit = options.limit || 50
  const offset = (page - 1) * limit

  let query = supabase
    .from('audit_logs')
    .select('*, actor:users!actor_id(id, display_name, email, wallet_address, avatar_url)', { count: 'exact' })
    .order('created_at', { ascending: false })

  // Apply filters
  if (options.actorId) {
    query = query.eq('actor_id', options.actorId)
  }
  if (options.action) {
    query = query.eq('action', options.action)
  }
  if (options.targetType) {
    query = query.eq('target_type', options.targetType)
  }
  if (options.targetId) {
    query = query.eq('target_id', options.targetId)
  }
  if (options.startDate) {
    query = query.gte('created_at', options.startDate.toISOString())
  }
  if (options.endDate) {
    query = query.lte('created_at', options.endDate.toISOString())
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching audit logs:', error)
    return { data: [], total: 0, page, totalPages: 0 }
  }

  const total = count || 0
  const totalPages = Math.ceil(total / limit)

  return {
    data: data || [],
    total,
    page,
    totalPages,
  }
}

/**
 * Convenience functions for common audit actions
 */

export async function logUserSuspension(
  actorId: string,
  userId: string,
  reason: string,
  suspensionType: string,
  endsAt?: Date
) {
  return recordAuditLog({
    actor_id: actorId,
    action: AUDIT_ACTIONS.USER_SUSPENDED,
    target_type: 'user',
    target_id: userId,
    metadata: { reason, suspension_type: suspensionType, ends_at: endsAt?.toISOString() },
  })
}

export async function logRoleChange(
  actorId: string,
  userId: string,
  role: string,
  action: 'assigned' | 'removed'
) {
  return recordAuditLog({
    actor_id: actorId,
    action: action === 'assigned' ? AUDIT_ACTIONS.USER_ROLE_ASSIGNED : AUDIT_ACTIONS.USER_ROLE_REMOVED,
    target_type: 'user',
    target_id: userId,
    metadata: { role },
  })
}

export async function logContentDeletion(
  actorId: string,
  contentType: 'post' | 'comment',
  contentId: string,
  reason?: string
) {
  return recordAuditLog({
    actor_id: actorId,
    action: contentType === 'post' ? AUDIT_ACTIONS.POST_DELETED : AUDIT_ACTIONS.COMMENT_DELETED,
    target_type: contentType,
    target_id: contentId,
    metadata: { reason },
  })
}

export async function logReportAction(
  actorId: string,
  reportId: string,
  action: 'resolved' | 'dismissed',
  notes?: string
) {
  return recordAuditLog({
    actor_id: actorId,
    action: action === 'resolved' ? AUDIT_ACTIONS.REPORT_RESOLVED : AUDIT_ACTIONS.REPORT_DISMISSED,
    target_type: 'report',
    target_id: reportId,
    metadata: { notes },
  })
}

export async function logSettingChange(
  actorId: string,
  settingKey: string,
  oldValue: unknown,
  newValue: unknown
) {
  return recordAuditLog({
    actor_id: actorId,
    action: AUDIT_ACTIONS.SETTING_UPDATED,
    target_type: 'setting',
    target_id: settingKey,
    metadata: { old_value: oldValue, new_value: newValue },
  })
}
