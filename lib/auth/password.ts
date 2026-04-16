import bcrypt from 'bcryptjs'

// Cost factor for bcrypt (12 is recommended for production)
const SALT_ROUNDS = 12

/**
 * Hash a plaintext password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

/**
 * Compare a plaintext password with a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Validate password strength
 * Returns an array of validation errors, or empty array if valid
 */
export function validatePasswordStrength(password: string, minLength = 8): string[] {
  const errors: string[] = []

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`)
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  return errors
}

/**
 * Check if password meets minimum requirements
 */
export function isPasswordValid(password: string, minLength = 8): boolean {
  return validatePasswordStrength(password, minLength).length === 0
}
