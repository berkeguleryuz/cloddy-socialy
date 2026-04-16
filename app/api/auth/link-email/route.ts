import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getSession, createHybridSessionToken, setSessionCookie, toAuthUser } from '@/lib/auth/session'
import { hashPassword, validatePasswordStrength } from '@/lib/auth/password'
import { generateEmailVerificationToken } from '@/lib/auth/tokens'
import { sendVerificationEmail } from '@/lib/auth/email'
import { LinkEmailSchema, validateRequest } from '@/lib/validation/schemas'

export async function POST(request: NextRequest) {
  try {
    // Get current session
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Only web3 users can link email
    if (session.authMethod !== 'web3') {
      return NextResponse.json(
        { error: 'Email is already linked to this account' },
        { status: 400 }
      )
    }

    const body = await request.json()

    // Validate request body
    const validation = validateRequest(LinkEmailSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const { email, password } = validation.data

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

    // Check if email is already used by another account
    const { data: existingEmail } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    const existingEmailData = existingEmail as any

    if (existingEmailData && existingEmailData.id !== session.userId) {
      return NextResponse.json(
        { error: 'This email is already linked to another account' },
        { status: 409 }
      )
    }

    // Get current user
    const { data: currentUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.userId)
      .single()

    if (fetchError || !currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const currentUserData = currentUser as any

    // Hash password
    const passwordHash = await hashPassword(password)

    // Generate email verification token
    const { token: verificationToken, hash: tokenHash, expiresAt } = generateEmailVerificationToken()

    // Link email to current user
    const { data: updatedUser, error: updateError } = await (supabase as any)
      .from('users')
      .update({
        email,
        password_hash: passwordHash,
        auth_method: 'both',
        email_verified: false,
        email_verification_token: tokenHash,
        email_verification_expires_at: expiresAt.toISOString(),
        // Increase profile completion for linking email
        profile_completion: Math.min((currentUserData.profile_completion || 0) + 10, 100),
      })
      .eq('id', session.userId)
      .select()
      .single()

    if (updateError) {
      console.error('Error linking email:', updateError)
      return NextResponse.json(
        { error: 'Failed to link email' },
        { status: 500 }
      )
    }

    // Send verification email
    const emailResult = await sendVerificationEmail(email, verificationToken, currentUserData.display_name)
    if (!emailResult.success) {
      console.warn('Failed to send verification email:', emailResult.error)
    }

    // Create new hybrid session
    const sessionToken = await createHybridSessionToken(
      session.userId,
      email,
      session.walletAddress!,
      session.chainId!
    )
    await setSessionCookie(sessionToken)

    // Convert to auth user format
    const authUser = toAuthUser(updatedUser)

    return NextResponse.json({
      success: true,
      user: authUser,
      requiresVerification: true,
      message: 'Email linked successfully! Please check your inbox to verify your email.',
    })
  } catch (error) {
    console.error('Error linking email:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
