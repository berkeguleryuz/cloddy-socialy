import { createAuthenticationAdapter } from '@rainbow-me/rainbowkit'
import { createSiweMessage } from 'viem/siwe'

// Create the RainbowKit authentication adapter for SIWE
export const createSiweAuthAdapter = () => {
  return createAuthenticationAdapter({
    // Get nonce from our API
    getNonce: async () => {
      const response = await fetch('/api/auth/nonce', {
        method: 'GET',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to get nonce')
      }

      const { nonce } = await response.json()
      return nonce
    },

    // Create SIWE message using viem's createSiweMessage
    createMessage: ({ nonce, address, chainId }) => {
      return createSiweMessage({
        domain: window.location.host,
        address: address as `0x${string}`,
        statement: 'Sign in to Cloddy with your wallet to access your account.',
        uri: window.location.origin,
        version: '1',
        chainId,
        nonce,
      })
    },

    // Verify signature with our API
    verify: async ({ message, signature }) => {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          message,
          signature,
        }),
      })

      return response.ok
    },

    // Sign out
    signOut: async () => {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    },
  })
}

// Export singleton adapter instance
let authAdapter: ReturnType<typeof createSiweAuthAdapter> | null = null

export function getAuthAdapter() {
  if (!authAdapter) {
    authAdapter = createSiweAuthAdapter()
  }
  return authAdapter
}
