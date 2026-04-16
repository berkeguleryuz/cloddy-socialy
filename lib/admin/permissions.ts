import { createAdminClient } from '@/lib/supabase/server'
import type { UserRole } from '@/types/auth'

// Role hierarchy - higher number = more permissions
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  user: 0,
  moderator: 1,
  admin: 2,
  super_admin: 3,
}

// Permission definitions
export const PERMISSIONS = {
  // User management
  VIEW_USERS: ['moderator', 'admin', 'super_admin'],
  EDIT_USERS: ['admin', 'super_admin'],
  SUSPEND_USERS: ['admin', 'super_admin'],
  DELETE_USERS: ['super_admin'],
  MANAGE_ROLES: ['super_admin'],

  // Content moderation
  VIEW_REPORTS: ['moderator', 'admin', 'super_admin'],
  RESOLVE_REPORTS: ['moderator', 'admin', 'super_admin'],
  DELETE_CONTENT: ['moderator', 'admin', 'super_admin'],
  FEATURE_CONTENT: ['admin', 'super_admin'],

  // Badge management
  VIEW_BADGES: ['moderator', 'admin', 'super_admin'],
  CREATE_BADGES: ['admin', 'super_admin'],
  EDIT_BADGES: ['admin', 'super_admin'],
  DELETE_BADGES: ['super_admin'],

  // Quest management
  VIEW_QUESTS: ['moderator', 'admin', 'super_admin'],
  CREATE_QUESTS: ['admin', 'super_admin'],
  EDIT_QUESTS: ['admin', 'super_admin'],
  DELETE_QUESTS: ['super_admin'],

  // Event management
  VIEW_EVENTS: ['moderator', 'admin', 'super_admin'],
  EDIT_EVENTS: ['admin', 'super_admin'],
  DELETE_EVENTS: ['admin', 'super_admin'],

  // Group management
  VIEW_GROUPS: ['moderator', 'admin', 'super_admin'],
  EDIT_GROUPS: ['admin', 'super_admin'],
  DELETE_GROUPS: ['admin', 'super_admin'],

  // System settings
  VIEW_SETTINGS: ['admin', 'super_admin'],
  EDIT_SETTINGS: ['super_admin'],

  // Audit logs
  VIEW_AUDIT_LOGS: ['admin', 'super_admin'],

  // Dashboard
  VIEW_DASHBOARD: ['moderator', 'admin', 'super_admin'],
  VIEW_ANALYTICS: ['admin', 'super_admin'],
} as const

export type Permission = keyof typeof PERMISSIONS

/**
 * Get all roles for a user
 */
export async function getUserRoles(userId: string): Promise<UserRole[]> {
  const supabase = await createAdminClient()
  if (!supabase) return ['user']

  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)

  if (error || !data || data.length === 0) {
    return ['user']
  }

  return data.map((r) => (r as any).role as UserRole)
}

/**
 * Get the highest role for a user
 */
export async function getHighestRole(userId: string): Promise<UserRole> {
  const roles = await getUserRoles(userId)

  let highest: UserRole = 'user'
  let highestLevel = 0

  for (const role of roles) {
    const level = ROLE_HIERARCHY[role] || 0
    if (level > highestLevel) {
      highestLevel = level
      highest = role
    }
  }

  return highest
}

/**
 * Check if a user has a specific role
 */
export async function hasRole(userId: string, role: UserRole): Promise<boolean> {
  const roles = await getUserRoles(userId)
  return roles.includes(role)
}

/**
 * Check if a user has a specific permission
 */
export async function hasPermission(userId: string, permission: Permission): Promise<boolean> {
  const roles = await getUserRoles(userId)
  const allowedRoles = PERMISSIONS[permission]

  return roles.some((role) => allowedRoles.includes(role as any))
}

/**
 * Check if user has at least moderator role (can access admin panel)
 */
export async function isStaff(userId: string): Promise<boolean> {
  const highestRole = await getHighestRole(userId)
  return ROLE_HIERARCHY[highestRole] >= ROLE_HIERARCHY.moderator
}

/**
 * Check if user is admin or super_admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const highestRole = await getHighestRole(userId)
  return ROLE_HIERARCHY[highestRole] >= ROLE_HIERARCHY.admin
}

/**
 * Check if user is super_admin
 */
export async function isSuperAdmin(userId: string): Promise<boolean> {
  return hasRole(userId, 'super_admin')
}

/**
 * Assign a role to a user
 */
export async function assignRole(
  userId: string,
  role: UserRole,
  grantedBy: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createAdminClient()
  if (!supabase) return { success: false, error: 'Database not configured' }

  // Check if granter has permission
  const granterIsSuperAdmin = await isSuperAdmin(grantedBy)
  if (!granterIsSuperAdmin) {
    return { success: false, error: 'Only super admins can assign roles' }
  }

  const { error } = await supabase
    .from('user_roles')
    .upsert(
      {
        user_id: userId,
        role,
        granted_by: grantedBy,
        granted_at: new Date().toISOString(),
      } as any,
      { onConflict: 'user_id,role' }
    )

  if (error) {
    console.error('Error assigning role:', error)
    return { success: false, error: 'Failed to assign role' }
  }

  return { success: true }
}

/**
 * Remove a role from a user
 */
export async function removeRole(
  userId: string,
  role: UserRole,
  removedBy: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createAdminClient()
  if (!supabase) return { success: false, error: 'Database not configured' }

  // Check if remover has permission
  const removerIsSuperAdmin = await isSuperAdmin(removedBy)
  if (!removerIsSuperAdmin) {
    return { success: false, error: 'Only super admins can remove roles' }
  }

  // Prevent removing super_admin from self
  if (userId === removedBy && role === 'super_admin') {
    return { success: false, error: 'Cannot remove super_admin role from yourself' }
  }

  const { error } = await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', userId)
    .eq('role', role)

  if (error) {
    console.error('Error removing role:', error)
    return { success: false, error: 'Failed to remove role' }
  }

  return { success: true }
}

/**
 * Initialize super admin from environment variable
 * Call this on app startup
 */
export async function initializeSuperAdmin(): Promise<void> {
  const superAdminWallet = process.env.SUPER_ADMIN_WALLET?.toLowerCase()
  if (!superAdminWallet) return

  const supabase = await createAdminClient()
  if (!supabase) return

  // Find user with this wallet
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('wallet_address', superAdminWallet)
    .single()

  if (!user) return

  const userData = user as any

  // Check if already super_admin
  const { data: existingRole } = await supabase
    .from('user_roles')
    .select('id')
    .eq('user_id', userData.id)
    .eq('role', 'super_admin')
    .single()

  if (existingRole) return

  // Assign super_admin role
  await supabase.from('user_roles').insert({
    user_id: userData.id,
    role: 'super_admin',
    granted_by: userData.id, // Self-granted via env
    granted_at: new Date().toISOString(),
  } as any)

  console.log('Super admin initialized from environment variable')
}
