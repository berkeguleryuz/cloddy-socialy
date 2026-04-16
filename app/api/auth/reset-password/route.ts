import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { hashToken, isTokenExpired } from '@/lib/auth/tokens'
import { hashPassword, validatePasswordStrength } from '@/lib/auth/password'
import { ResetPasswordSchema, validateRequest } from '@/lib/validation/schemas'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const validation = validateRequest(ResetPasswordSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const { token, password } = validation.data

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

    // Hash the token to compare with stored hash
    const tokenHash = hashToken(token)

    // Find user with this reset token
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, password_reset_token, password_reset_expires_at')
      .eq('password_reset_token', tokenHash)
      .single()

    if (fetchError || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    const userData = user as any

    // Check if token has expired
    if (isTokenExpired(userData.password_reset_expires_at)) {
      return NextResponse.json(
        { error: 'Password reset link has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    // Hash new password
    const newPasswordHash = await hashPassword(password)

    // Update user with new password
    const { error: updateError } = await (supabase as any)
      .from('users')
      .update({
        password_hash: newPasswordHash,
        password_reset_token: null,
        password_reset_expires_at: null,
        // Clear any login lockout
        login_attempts: 0,
        locked_until: null,
      })
      .eq('id', userData.id)

    if (updateError) {
      console.error('Error resetting password:', updateError)
      return NextResponse.json(
        { error: 'Failed to reset password' },
        { status: 500 }
      )
    }

    // Invalidate all existing sessions for this user
    await supabase
      .from('email_sessions')
      .delete()
      .eq('user_id', userData.id)

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully. Please log in with your new password.',
    })
  } catch (error) {
    console.error('Error resetting password:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
