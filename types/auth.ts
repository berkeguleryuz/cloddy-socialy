// Authentication types

export type AuthMode = 'demo' | 'web3' | 'email' | 'unauthenticated'

export type AuthMethod = 'web3' | 'email' | 'both'

export type AuthStatus =
  | 'unauthenticated'    // No wallet connected, no session
  | 'connecting'         // Wallet connection in progress
  | 'connected'          // Wallet connected, not signed in
  | 'signing'            // SIWE signature in progress
  | 'authenticated'      // Fully authenticated with session
  | 'demo'               // Demo mode (existing behavior)

export interface AuthUser {
  id: string
  name: string
  email: string | null
  avatar: string
  level: number
  walletAddress?: string
  ens?: string
  bio?: string
  tagline?: string
  experiencePoints?: number
  isVerified?: boolean
  profileCompletion?: number
  emailVerified?: boolean
  authMethod?: AuthMethod
}

export interface AuthState {
  mode: AuthMode
  status: AuthStatus
  user: AuthUser | null
  walletAddress: string | null
  chainId: number | null
}

export interface Session {
  userId: string
  walletAddress?: string | null
  email?: string | null
  chainId?: number | null
  authMethod: AuthMethod
  issuedAt: number
  expiresAt: number
}

// User roles
export type UserRole = 'user' | 'moderator' | 'admin' | 'super_admin'

export interface UserRoleInfo {
  id: string
  userId: string
  role: UserRole
  grantedBy?: string
  grantedAt: Date
}

export interface SiweMessage {
  domain: string
  address: string
  statement: string
  uri: string
  version: string
  chainId: number
  nonce: string
  issuedAt: string
  expirationTime?: string
}

// API Response types
export interface NonceResponse {
  nonce: string
}

export interface VerifyRequest {
  message: string
  signature: string
}

export interface VerifyResponse {
  success: boolean
  user?: AuthUser
  error?: string
}

export interface SessionResponse {
  authenticated: boolean
  user?: AuthUser
  session?: Session
}

// Email Auth Request/Response types
export interface EmailRegisterRequest {
  email: string
  password: string
  username?: string
  displayName?: string
}

export interface EmailLoginRequest {
  email: string
  password: string
}

export interface EmailAuthResponse {
  success: boolean
  user?: AuthUser
  error?: string
  requiresVerification?: boolean
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  password: string
}

export interface LinkWalletRequest {
  message: string
  signature: string
}

export interface LinkEmailRequest {
  email: string
  password: string
}

// Account status
export interface AccountStatus {
  isLocked: boolean
  lockedUntil?: Date
  loginAttempts: number
  isSuspended: boolean
  suspensionReason?: string
  suspensionEndsAt?: Date
}
