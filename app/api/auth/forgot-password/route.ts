import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { generatePasswordResetToken } from '@/lib/auth/tokens'
import { sendPasswordResetEmail } from '@/lib/auth/email'
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/middleware/rateLimit'
import { ForgotPasswordSchema, validateRequest } from '@/lib/validation/schemas'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(`forgot-password:${clientIP}`, RATE_LIMITS.passwordReset)

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many password reset requests. Please try again later.' },
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
    const validation = validateRequest(ForgotPasswordSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const { email } = validation.data

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
      .select('id, email, display_name, username, password_hash, auth_method')
      .eq('email', email)
      .single()

    // Always return success to prevent email enumeration
    if (fetchError || !user) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a password reset link will be sent.',
      })
    }

    const userData = user as any

    // Check if user has email auth (not just web3)
    if (userData.auth_method === 'web3' && !userData.password_hash) {
      // User only has wallet auth, can't reset password
      // Still return success to prevent enumeration
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a password reset link will be sent.',
      })
    }

    // Generate password reset token
    const { token, hash, expiresAt } = generatePasswordResetToken()

    // Update user with reset token
    const { error: updateError } = await (supabase as any)
      .from('users')
      .update({
        password_reset_token: hash,
        password_reset_expires_at: expiresAt.toISOString(),
      })
      .eq('id', userData.id)

    if (updateError) {
      console.error('Error setting reset token:', updateError)
      // Don't expose internal error
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a password reset link will be sent.',
      })
    }

    // Send password reset email
    const emailResult = await sendPasswordResetEmail(email, token, userData.display_name || userData.username)

    if (!emailResult.success) {
      console.warn('Failed to send password reset email:', emailResult.error)
    }

    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, a password reset link will be sent.',
    })
  } catch (error) {
    console.error('Error processing password reset request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
