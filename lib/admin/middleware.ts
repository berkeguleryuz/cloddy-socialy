import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { isStaff, isAdmin, isSuperAdmin, hasPermission, Permission } from './permissions'

/**
 * Admin middleware to protect admin routes
 * Returns null if authorized, or a NextResponse with error if not
 */
export async function requireAdmin(request: NextRequest): Promise<NextResponse | null> {
  const session = await getSession()

  if (!session) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  const isUserAdmin = await isAdmin(session.userId)

  if (!isUserAdmin) {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    )
  }

  return null
}

/**
 * Middleware to require staff access (moderator or higher)
 */
export async function requireStaff(request: NextRequest): Promise<NextResponse | null> {
  const session = await getSession()

  if (!session) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  const isUserStaff = await isStaff(session.userId)

  if (!isUserStaff) {
    return NextResponse.json(
      { error: 'Staff access required' },
      { status: 403 }
    )
  }

  return null
}

/**
 * Middleware to require super admin access
 */
export async function requireSuperAdmin(request: NextRequest): Promise<NextResponse | null> {
  const session = await getSession()

  if (!session) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  const isUserSuperAdmin = await isSuperAdmin(session.userId)

  if (!isUserSuperAdmin) {
    return NextResponse.json(
      { error: 'Super admin access required' },
      { status: 403 }
    )
  }

  return null
}

/**
 * Middleware to require a specific permission
 */
export async function requirePermission(
  request: NextRequest,
  permission: Permission
): Promise<NextResponse | null> {
  const session = await getSession()

  if (!session) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  const hasRequiredPermission = await hasPermission(session.userId, permission)

  if (!hasRequiredPermission) {
    return NextResponse.json(
      { error: `Permission required: ${permission}` },
      { status: 403 }
    )
  }

  return null
}

/**
 * Get authenticated admin user ID
 */
export async function getAdminUserId(): Promise<string | null> {
  const session = await getSession()
  if (!session) return null

  const isUserStaff = await isStaff(session.userId)
  if (!isUserStaff) return null

  return session.userId
}
