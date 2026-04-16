import { SignJWT, jwtVerify, type JWTPayload } from 'jose'
import { cookies } from 'next/headers'
import type { Session, AuthUser, AuthMethod } from '@/types/auth'

// Session configuration
const SESSION_COOKIE_NAME = 'cloddy-session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days in seconds

// Get secret key for JWT signing
function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET || 'default-secret-key-for-development-only-32chars'
  return new TextEncoder().encode(secret)
}

export interface SessionPayload extends JWTPayload {
  userId: string
  walletAddress?: string | null
  email?: string | null
  chainId?: number | null
  authMethod: AuthMethod
}

// Create a new session token for Web3 auth
export async function createSessionToken(
  userId: string,
  walletAddress: string,
  chainId: number
): Promise<string> {
  const payload: SessionPayload = {
    userId,
    walletAddress,
    chainId,
    authMethod: 'web3',
  }

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecretKey())

  return token
}

// Create a new session token for email auth
export async function createEmailSessionToken(
  userId: string,
  email: string
): Promise<string> {
  const payload: SessionPayload = {
    userId,
    email,
    walletAddress: null,
    chainId: null,
    authMethod: 'email',
  }

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecretKey())

  return token
}

// Create a session token for hybrid auth (both email and wallet)
export async function createHybridSessionToken(
  userId: string,
  email: string,
  walletAddress: string,
  chainId: number
): Promise<string> {
  const payload: SessionPayload = {
    userId,
    email,
    walletAddress,
    chainId,
    authMethod: 'both',
  }

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecretKey())

  return token
}

// Verify and decode a session token
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey())
    return payload as SessionPayload
  } catch {
    return null
  }
}

// Get session from cookies (server-side)
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!token) {
    return null
  }

  return verifySessionToken(token)
}

// Set session cookie (server-side)
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies()

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  })
}

// Clear session cookie (server-side)
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies()

  cookieStore.delete(SESSION_COOKIE_NAME)
}

// Convert database user to auth user
export function toAuthUser(dbUser: {
  id: string
  wallet_address?: string | null
  display_name?: string | null
  username?: string | null
  email?: string | null
  avatar_url?: string | null
  ens_name?: string | null
  bio?: string | null
  tagline?: string | null
  level?: number
  experience_points?: number
  is_verified?: boolean
  profile_completion?: number
  email_verified?: boolean
  auth_method?: string | null
}): AuthUser {
  // Determine display name: prefer display_name, then username, then ENS, then truncated wallet, then email prefix
  let name = dbUser.display_name || dbUser.username || dbUser.ens_name
  if (!name && dbUser.wallet_address) {
    name = truncateAddress(dbUser.wallet_address)
  }
  if (!name && dbUser.email) {
    name = dbUser.email.split('@')[0]
  }
  if (!name) {
    name = 'Anonymous'
  }

  // Generate avatar: prefer avatar_url, then generate from wallet or email
  let avatar = dbUser.avatar_url
  if (!avatar) {
    const seed = dbUser.wallet_address || dbUser.email || dbUser.id
    avatar = generateAvatarUrl(seed)
  }

  return {
    id: dbUser.id,
    name,
    email: dbUser.email ?? null,
    avatar,
    level: dbUser.level || 1,
    walletAddress: dbUser.wallet_address ?? undefined,
    ens: dbUser.ens_name ?? undefined,
    bio: dbUser.bio ?? undefined,
    tagline: dbUser.tagline ?? undefined,
    experiencePoints: dbUser.experience_points,
    isVerified: dbUser.is_verified,
    profileCompletion: dbUser.profile_completion,
    emailVerified: dbUser.email_verified,
    authMethod: (dbUser.auth_method as AuthUser['authMethod']) ?? undefined,
  }
}

// Helper to truncate wallet address
export function truncateAddress(address: string): string {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// Generate avatar URL from any seed (using DiceBear)
export function generateAvatarUrl(seed: string): string {
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${seed}`
}
