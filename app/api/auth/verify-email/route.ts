import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { hashToken, isTokenExpired } from '@/lib/auth/tokens'
import { sendWelcomeEmail } from '@/lib/auth/email'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.redirect(new URL('/auth/error?reason=missing_token', request.url))
    }

    const supabase = await createAdminClient()

    if (!supabase) {
      return NextResponse.redirect(new URL('/auth/error?reason=server_error', request.url))
    }

    // Hash the token to compare with stored hash
    const tokenHash = hashToken(token)

    // Find user with this verification token
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, email, email_verification_token, email_verification_expires_at, display_name, username, email_verified')
      .eq('email_verification_token', tokenHash)
      .single()

    if (fetchError || !user) {
      return NextResponse.redirect(new URL('/auth/error?reason=invalid_token', request.url))
    }

    const userData = user as any

    // Check if already verified
    if (userData.email_verified) {
      return NextResponse.redirect(new URL('/?verified=already', request.url))
    }

    // Check if token has expired
    if (isTokenExpired(userData.email_verification_expires_at)) {
      return NextResponse.redirect(new URL('/auth/error?reason=expired_token', request.url))
    }

    // Verify the email
    const { error: updateError } = await (supabase as any)
      .from('users')
      .update({
        email_verified: true,
        email_verification_token: null,
        email_verification_expires_at: null,
        // Increase profile completion for verifying email
        profile_completion: Math.min((userData.profile_completion || 0) + 10, 100),
      })
      .eq('id', userData.id)

    if (updateError) {
      console.error('Error verifying email:', updateError)
      return NextResponse.redirect(new URL('/auth/error?reason=server_error', request.url))
    }

    // Send welcome email
    await sendWelcomeEmail(userData.email, userData.display_name || userData.username)

    // Redirect to app with success message
    return NextResponse.redirect(new URL('/?verified=success', request.url))
  } catch (error) {
    console.error('Error verifying email:', error)
    return NextResponse.redirect(new URL('/auth/error?reason=server_error', request.url))
  }
}

// POST endpoint for resending verification email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
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

    // Find user
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, email, email_verified, display_name, username')
      .eq('email', email.toLowerCase())
      .single()

    if (fetchError || !user) {
      // Don't reveal if email exists
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a verification link will be sent.',
      })
    }

    const postUserData = user as any

    if (postUserData.email_verified) {
      return NextResponse.json({
        success: true,
        message: 'Email is already verified.',
      })
    }

    // Generate new verification token
    const { generateEmailVerificationToken } = await import('@/lib/auth/tokens')
    const { sendVerificationEmail } = await import('@/lib/auth/email')

    const { token, hash, expiresAt } = generateEmailVerificationToken()

    // Update user with new token
    await (supabase as any)
      .from('users')
      .update({
        email_verification_token: hash,
        email_verification_expires_at: expiresAt.toISOString(),
      })
      .eq('id', postUserData.id)

    // Send verification email
    await sendVerificationEmail(postUserData.email, token, postUserData.display_name || postUserData.username)

    return NextResponse.json({
      success: true,
      message: 'Verification email sent! Please check your inbox.',
    })
  } catch (error) {
    console.error('Error resending verification:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
