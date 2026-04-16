import { NextRequest, NextResponse } from 'next/server'
import { SiweMessage } from 'siwe'
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { createAdminClient } from '@/lib/supabase/server'
import { getSession, createHybridSessionToken, setSessionCookie, toAuthUser } from '@/lib/auth/session'
import { SIWEVerifySchema, validateRequest } from '@/lib/validation/schemas'

// Create a public client for ENS resolution
const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
})

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

    // Only email users can link wallets
    if (session.authMethod !== 'email') {
      return NextResponse.json(
        { error: 'Wallet is already linked to this account' },
        { status: 400 }
      )
    }

    const body = await request.json()

    // Validate request body
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

    const supabase = await createAdminClient()

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    // Check if wallet is already linked to another account
    const { data: existingWallet } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', walletAddress)
      .single()

    const existingWalletData = existingWallet as any

    if (existingWalletData && existingWalletData.id !== session.userId) {
      return NextResponse.json(
        { error: 'This wallet is already linked to another account' },
        { status: 409 }
      )
    }

    // Try to resolve ENS name
    let ensName: string | null = null
    try {
      ensName = await publicClient.getEnsName({
        address: walletAddress as `0x${string}`,
      })
    } catch {
      // ENS resolution failed, continue without it
    }

    // Link wallet to current user
    const { data: updatedUser, error: updateError } = await (supabase as any)
      .from('users')
      .update({
        wallet_address: walletAddress,
        ens_name: ensName,
        auth_method: 'both',
        // Increase profile completion for linking wallet
        profile_completion: Math.min(100, 20), // We'd need to calculate this properly
      })
      .eq('id', session.userId)
      .select()
      .single()

    if (updateError) {
      console.error('Error linking wallet:', updateError)
      return NextResponse.json(
        { error: 'Failed to link wallet' },
        { status: 500 }
      )
    }

    // Create new hybrid session
    const sessionToken = await createHybridSessionToken(
      session.userId,
      session.email!,
      walletAddress,
      chainId
    )
    await setSessionCookie(sessionToken)

    // Convert to auth user format
    const authUser = toAuthUser(updatedUser)

    return NextResponse.json({
      success: true,
      user: authUser,
      message: 'Wallet linked successfully!',
    })
  } catch (error) {
    console.error('Error linking wallet:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
