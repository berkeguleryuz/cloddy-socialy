import { NextRequest, NextResponse } from 'next/server'
import { SiweMessage } from 'siwe'
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { createAdminClient } from '@/lib/supabase/server'
import { createSessionToken, setSessionCookie, toAuthUser } from '@/lib/auth/session'
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/middleware/rateLimit'
import { SIWEVerifySchema, validateRequest } from '@/lib/validation/schemas'

// Create a public client for ENS resolution
const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
})

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(`auth:${clientIP}`, RATE_LIMITS.auth)

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many authentication attempts. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
            'X-RateLimit-Remaining': '0',
          },
        }
      )
    }

    const body = await request.json()

    // Validate request body with Zod
    const validation = validateRequest(SIWEVerifySchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const { message, signature } = validation.data

    // Parse and verify the SIWE message
    let siweMessage: SiweMessage
    try {
      siweMessage = new SiweMessage(message)
    } catch {
      return NextResponse.json(
        { error: 'Invalid SIWE message format' },
        { status: 400 }
      )
    }

    // Verify the signature
    try {
      const verifyResult = await siweMessage.verify({
        signature,
        domain: siweMessage.domain,
        nonce: siweMessage.nonce,
      })

      if (!verifyResult.success) {
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        )
      }
    } catch (verifyError) {
      console.error('Signature verification failed:', verifyError)
      return NextResponse.json(
        { error: 'Signature verification failed' },
        { status: 401 }
      )
    }

    const walletAddress = siweMessage.address.toLowerCase()
    const chainId = siweMessage.chainId

    // Try to resolve ENS name
    let ensName: string | null = null
    try {
      ensName = await publicClient.getEnsName({
        address: walletAddress as `0x${string}`,
      })
    } catch {
      // ENS resolution failed, continue without it
    }

    // Get or create user in database
    let user: {
      id: string
      wallet_address: string
      ens_name: string | null
      display_name: string | null
      avatar_url: string | null
      level: number
      experience_points: number
      is_verified: boolean
      profile_completion: number
    }

    const supabase = await createAdminClient()

    if (supabase) {
      try {
        // Verify nonce exists and is not expired
        const { data: nonceData } = await (supabase as any)
          .from('siwe_nonces')
          .select('*')
          .eq('nonce', siweMessage.nonce)
          .gt('expires_at', new Date().toISOString())
          .single()

        // Delete used nonce (fire-and-forget - non-blocking)
        if (nonceData) {
          (supabase as any)
            .from('siwe_nonces')
            .delete()
            .eq('nonce', siweMessage.nonce)
            .then(() => {})
            .catch(console.error)
        }

        // Check if user exists
        const { data: existingUser, error: fetchError } = await (supabase as any)
          .from('users')
          .select('*')
          .eq('wallet_address', walletAddress)
          .single()

        if (existingUser) {
          // Update last seen and ENS if changed
          const { data: updatedUser, error: updateError } = await (supabase as any)
            .from('users')
            .update({
              last_seen_at: new Date().toISOString(),
              ens_name: ensName || existingUser.ens_name,
            })
            .eq('id', existingUser.id)
            .select()
            .single()

          if (updateError) throw updateError
          user = updatedUser
        } else {
          // Create new user
          const { data: newUser, error: createError } = await (supabase as any)
            .from('users')
            .insert({
              wallet_address: walletAddress,
              ens_name: ensName,
              display_name: ensName || null,
              avatar_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${walletAddress}`,
              level: 1,
              experience_points: 0,
            })
            .select()
            .single()

          if (createError) throw createError
          user = newUser
        }
      } catch (dbError) {
        console.error('Database operation failed:', dbError)
        // In production, we should fail the auth if database is unavailable
        // Only allow mock users in development mode
        if (process.env.NODE_ENV === 'production') {
          return NextResponse.json(
            { error: 'Database unavailable. Please try again later.' },
            { status: 503 }
          )
        }
        // Development only: Create a mock user with clear indication
        console.warn('⚠️ Using mock user due to database failure - DEVELOPMENT ONLY')
        const mockId = crypto.randomUUID()
        user = {
          id: mockId,
          wallet_address: walletAddress,
          ens_name: ensName,
          display_name: ensName || `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
          avatar_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${walletAddress}`,
          level: 1,
          experience_points: 0,
          is_verified: false,
          profile_completion: 10,
        }
      }
    } else {
      // No Supabase client - only allow in development
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          { error: 'Database not configured' },
          { status: 503 }
        )
      }
      // Development only: Create a mock user
      console.warn('⚠️ Using mock user - Supabase not configured - DEVELOPMENT ONLY')
      const mockId = crypto.randomUUID()
      user = {
        id: mockId,
        wallet_address: walletAddress,
        ens_name: ensName,
        display_name: ensName || `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
        avatar_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${walletAddress}`,
        level: 1,
        experience_points: 0,
        is_verified: false,
        profile_completion: 10,
      }
    }

    // Create session token
    const sessionToken = await createSessionToken(user.id, walletAddress, chainId)

    // Set session cookie
    await setSessionCookie(sessionToken)

    // Convert to auth user format
    const authUser = toAuthUser(user)

    return NextResponse.json({
      success: true,
      user: authUser,
    })
  } catch (error) {
    console.error('Error verifying signature:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
