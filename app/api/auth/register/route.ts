import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createEmailSessionToken, setSessionCookie, toAuthUser, generateAvatarUrl } from '@/lib/auth/session'
import { hashPassword, validatePasswordStrength } from '@/lib/auth/password'
import { generateEmailVerificationToken } from '@/lib/auth/tokens'
import { sendVerificationEmail } from '@/lib/auth/email'
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/middleware/rateLimit'
import { EmailRegisterSchema, validateRequest } from '@/lib/validation/schemas'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(`register:${clientIP}`, RATE_LIMITS.emailRegister)

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
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
    const validation = validateRequest(EmailRegisterSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const { email, password, username, displayName } = validation.data

    // Validate password strength
    const passwordErrors = validatePasswordStrength(password)
    if (passwordErrors.length > 0) {
      return NextResponse.json(
        { error: passwordErrors.join('. ') },
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

    // Check if email already exists
    const { data: existingEmailUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingEmailUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    // Check if username already exists (if provided)
    if (username) {
      const { data: existingUsernameUser } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .single()

      if (existingUsernameUser) {
        return NextResponse.json(
          { error: 'This username is already taken' },
          { status: 409 }
        )
      }
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Generate email verification token
    const { token: verificationToken, hash: tokenHash, expiresAt } = generateEmailVerificationToken()

    // Create user
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        email,
        username: username || null,
        display_name: displayName || username || email.split('@')[0],
        password_hash: passwordHash,
        auth_method: 'email',
        email_verified: false,
        email_verification_token: tokenHash,
        email_verification_expires_at: expiresAt.toISOString(),
        avatar_url: generateAvatarUrl(email),
        level: 1,
        experience_points: 0,
        profile_completion: 10,
      } as any)
      .select()
      .single()

    if (createError) {
      console.error('Error creating user:', createError)
      return NextResponse.json(
        { error: 'Failed to create account' },
        { status: 500 }
      )
    }

    const newUserData = newUser as any

    // Send verification email
    const emailResult = await sendVerificationEmail(email, verificationToken, displayName || username)
    if (!emailResult.success) {
      console.warn('Failed to send verification email:', emailResult.error)
      // Don't fail registration, just log the error
    }

    // Create session (but mark that email verification is required)
    const sessionToken = await createEmailSessionToken(newUserData.id, email)
    await setSessionCookie(sessionToken)

    // Convert to auth user format
    const authUser = toAuthUser(newUserData)

    return NextResponse.json({
      success: true,
      user: authUser,
      requiresVerification: true,
      message: 'Account created! Please check your email to verify your account.',
    })
  } catch (error) {
    console.error('Error during registration:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
