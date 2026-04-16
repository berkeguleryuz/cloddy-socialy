import { SiweMessage } from 'siwe'

// Create a SIWE message for signing
export function createSiweMessage(
  address: string,
  chainId: number,
  nonce: string,
  statement: string = 'Sign in to Cloddy with your wallet'
): SiweMessage {
  const domain = typeof window !== 'undefined' ? window.location.host : 'localhost:3000'
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'

  return new SiweMessage({
    domain,
    address,
    statement,
    uri: origin,
    version: '1',
    chainId,
    nonce,
    issuedAt: new Date().toISOString(),
    expirationTime: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours
  })
}

// Parse a SIWE message from string
export function parseSiweMessage(message: string): SiweMessage {
  return new SiweMessage(message)
}

// Verify SIWE message fields
export function verifySiweMessageFields(
  message: SiweMessage,
  expectedDomain: string,
  expectedNonce: string
): { valid: boolean; error?: string } {
  // Check domain
  if (message.domain !== expectedDomain) {
    return { valid: false, error: 'Invalid domain' }
  }

  // Check nonce
  if (message.nonce !== expectedNonce) {
    return { valid: false, error: 'Invalid nonce' }
  }

  // Check expiration
  if (message.expirationTime) {
    const expirationDate = new Date(message.expirationTime)
    if (expirationDate < new Date()) {
      return { valid: false, error: 'Message expired' }
    }
  }

  // Check issued time (not in future)
  if (message.issuedAt) {
    const issuedDate = new Date(message.issuedAt)
    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000)
    if (issuedDate > fiveMinutesFromNow) {
      return { valid: false, error: 'Message issued in future' }
    }
  }

  return { valid: true }
}

// Generate a random nonce
export function generateNonce(): string {
  const array = new Uint8Array(16)
  if (typeof window !== 'undefined') {
    window.crypto.getRandomValues(array)
  } else {
    // Server-side: use crypto module
    const crypto = require('crypto')
    crypto.randomFillSync(array)
  }
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

// Truncate wallet address for display
export function truncateAddress(address: string, chars: number = 4): string {
  if (!address) return ''
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

// Format wallet address with optional ENS
export function formatWalletDisplay(address: string, ens?: string | null): string {
  if (ens) return ens
  return truncateAddress(address)
}
