import { randomBytes, createHash } from 'crypto'

// Token expiry times
export const TOKEN_EXPIRY = {
  EMAIL_VERIFICATION: 24 * 60 * 60 * 1000, // 24 hours in ms
  PASSWORD_RESET: 60 * 60 * 1000, // 1 hour in ms
  SESSION: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
} as const

/**
 * Generate a cryptographically secure random token
 * Returns both the plain token (to send to user) and the hash (to store in DB)
 */
export function generateSecureToken(): { token: string; hash: string } {
  // Generate 32 random bytes and convert to hex (64 chars)
  const token = randomBytes(32).toString('hex')
  // Hash the token for storage
  const hash = hashToken(token)
  return { token, hash }
}

/**
 * Hash a token for secure storage
 */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

/**
 * Generate email verification token and expiry
 */
export function generateEmailVerificationToken(): {
  token: string
  hash: string
  expiresAt: Date
} {
  const { token, hash } = generateSecureToken()
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY.EMAIL_VERIFICATION)
  return { token, hash, expiresAt }
}

/**
 * Generate password reset token and expiry
 */
export function generatePasswordResetToken(): {
  token: string
  hash: string
  expiresAt: Date
} {
  const { token, hash } = generateSecureToken()
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY.PASSWORD_RESET)
  return { token, hash, expiresAt }
}

/**
 * Verify a token against its hash
 */
export function verifyToken(plainToken: string, storedHash: string): boolean {
  const computedHash = hashToken(plainToken)
  return computedHash === storedHash
}

/**
 * Check if a token has expired
 */
export function isTokenExpired(expiresAt: Date | string | null): boolean {
  if (!expiresAt) return true
  const expiry = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt
  return expiry.getTime() < Date.now()
}

/**
 * Generate a nonce for CSRF protection or other one-time use
 */
export function generateNonce(): string {
  return randomBytes(16).toString('hex')
}

/**
 * Generate a short numeric code (for OTP/verification codes)
 */
export function generateNumericCode(length = 6): string {
  const max = Math.pow(10, length) - 1
  const min = Math.pow(10, length - 1)
  const code = Math.floor(Math.random() * (max - min + 1)) + min
  return code.toString()
}
