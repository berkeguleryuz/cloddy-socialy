import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { createAdminClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/middleware/rateLimit'

// Generate a cryptographically secure nonce
function generateNonce(): string {
  return randomBytes(16).toString('hex')
}

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(`nonce:${clientIP}`, RATE_LIMITS.nonce)

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
            'X-RateLimit-Remaining': '0',
          },
        }
      )
    }
    const nonce = generateNonce()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

    // Try to store nonce in Supabase if configured
    const supabase = await createAdminClient()

    if (supabase) {
      try {
        // Clean up expired nonces first
        await (supabase as any)
          .from('siwe_nonces')
          .delete()
          .lt('expires_at', new Date().toISOString())

        // Store new nonce
        await (supabase as any)
          .from('siwe_nonces')
          .insert({
            nonce,
            expires_at: expiresAt.toISOString(),
          })
      } catch (dbError) {
        console.warn('Failed to store nonce in database:', dbError)
      }
    }

    return NextResponse.json({ nonce })
  } catch (error) {
    console.error('Error generating nonce:', error)
    return NextResponse.json(
      { error: 'Failed to generate nonce' },
      { status: 500 }
    )
  }
}
