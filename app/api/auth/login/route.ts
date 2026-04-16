import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createEmailSessionToken, createHybridSessionToken, setSessionCookie, toAuthUser } from '@/lib/auth/session'
import { verifyPassword } from '@/lib/auth/password'
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/middleware/rateLimit'
import { EmailLoginSchema, validateRequest } from '@/lib/validation/schemas'

// Max login attempts before lockout
const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 15 * 60 * 1000 // 15 minutes

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(`login:${clientIP}`, RATE_LIMITS.emailLogin)

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
          },
        }
      )
    }

    const body = await request.json()

    // Validate request body
    const validation = validateRequest(EmailLoginSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const { email, password } = validation.data

    const supabase = await createAdminClient()

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    // Find user by email
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (fetchError || !user) {
      // Don't reveal whether email exists
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const userData = user as any

    // Check if account is locked
    if (userData.locked_until && new Date(userData.locked_until) > new Date()) {
      const remainingTime = Math.ceil((new Date(userData.locked_until).getTime() - Date.now()) / 1000 / 60)
      return NextResponse.json(
        { error: `Account is temporarily locked. Try again in ${remainingTime} minutes.` },
        { status: 423 }
      )
    }

    // Check if user has a password (web3-only users won't have one)
    if (!userData.password_hash) {
      return NextResponse.json(
        { error: 'This account uses wallet authentication. Please connect your wallet to sign in.' },
        { status: 400 }
      )
    }

    // Check if user is suspended
    const { data: activeSuspension } = await supabase
      .from('user_suspensions')
      .select('*')
      .eq('user_id', userData.id)
      .eq('is_active', true)
      .or('ends_at.is.null,ends_at.gt.now()')
      .single()

    const suspensionData = activeSuspension as any

    if (suspensionData) {
      const message = suspensionData.suspension_type === 'permanent'
        ? 'Your account has been permanently suspended.'
        : `Your account is suspended until ${new Date(suspensionData.ends_at).toLocaleDateString()}.`

      return NextResponse.json(
        { error: message, reason: suspensionData.reason },
        { status: 403 }
      )
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, userData.password_hash)

    if (!isValidPassword) {
      // Increment login attempts
      const newAttempts = (userData.login_attempts || 0) + 1
      const updates: Record<string, unknown> = { login_attempts: newAttempts }

      // Lock account if too many attempts
      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        updates.locked_until = new Date(Date.now() + LOCKOUT_DURATION_MS).toISOString()
        updates.login_attempts = 0
      }

      await (supabase as any)
        .from('users')
        .update(updates)
        .eq('id', userData.id)

      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        return NextResponse.json(
          { error: 'Too many failed attempts. Account locked for 15 minutes.' },
          { status: 423 }
        )
      }

      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Successful login - reset attempts and update last seen (fire-and-forget)
    (supabase as any)
      .from('users')
      .update({
        login_attempts: 0,
        locked_until: null,
        last_seen_at: new Date().toISOString(),
      })
      .eq('id', userData.id)
      .then(() => {})
      .catch(console.error)

    // Create session token based on auth method
    let sessionToken: string

    if (userData.wallet_address && userData.auth_method === 'both') {
      // Hybrid user - create hybrid session
      sessionToken = await createHybridSessionToken(
        userData.id,
        userData.email,
        userData.wallet_address,
        84532 // Default to Base Sepolia
      )
    } else {
      // Email-only user
      sessionToken = await createEmailSessionToken(userData.id, userData.email)
    }

    await setSessionCookie(sessionToken)

    // Convert to auth user format
    const authUser = toAuthUser(userData)

    return NextResponse.json({
      success: true,
      user: authUser,
      requiresVerification: !userData.email_verified,
    })
  } catch (error) {
    console.error('Error during login:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
