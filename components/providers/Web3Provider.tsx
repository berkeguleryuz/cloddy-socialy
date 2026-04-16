"use client"

import { ReactNode, useState, useEffect, useCallback } from 'react'
import {
  RainbowKitProvider,
  RainbowKitAuthenticationProvider,
  createAuthenticationAdapter,
  darkTheme,
  type Theme,
  type AuthenticationStatus,
} from '@rainbow-me/rainbowkit'
import { WagmiProvider, useAccount } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createSiweMessage } from 'viem/siwe'

import { wagmiConfig } from '@/lib/web3/config'

import '@rainbow-me/rainbowkit/styles.css'

// Custom Cloddy theme for RainbowKit
const cloddyTheme: Theme = {
  ...darkTheme({
    accentColor: '#6c5ce7',
    accentColorForeground: 'white',
    borderRadius: 'large',
    fontStack: 'system',
    overlayBlur: 'small',
  }),
  colors: {
    ...darkTheme().colors,
    accentColor: '#6c5ce7',
    accentColorForeground: 'white',
    actionButtonBorder: 'rgba(255, 255, 255, 0.1)',
    actionButtonBorderMobile: 'rgba(255, 255, 255, 0.1)',
    actionButtonSecondaryBackground: 'rgba(255, 255, 255, 0.1)',
    closeButton: 'rgba(255, 255, 255, 0.7)',
    closeButtonBackground: 'rgba(255, 255, 255, 0.1)',
    connectButtonBackground: '#1a1c23',
    connectButtonBackgroundError: '#ff5252',
    connectButtonInnerBackground: 'linear-gradient(to right, #6c5ce7, #8b5cf6)',
    connectButtonText: 'white',
    connectButtonTextError: 'white',
    connectionIndicator: '#00d9a0',
    downloadBottomCardBackground: '#1a1c23',
    downloadTopCardBackground: '#2a2d36',
    error: '#ff5252',
    generalBorder: 'rgba(255, 255, 255, 0.1)',
    generalBorderDim: 'rgba(255, 255, 255, 0.05)',
    menuItemBackground: 'rgba(255, 255, 255, 0.05)',
    modalBackdrop: 'rgba(0, 0, 0, 0.7)',
    modalBackground: '#1a1c23',
    modalBorder: 'rgba(255, 255, 255, 0.1)',
    modalText: 'white',
    modalTextDim: 'rgba(255, 255, 255, 0.5)',
    modalTextSecondary: 'rgba(255, 255, 255, 0.7)',
    profileAction: 'rgba(255, 255, 255, 0.1)',
    profileActionHover: 'rgba(255, 255, 255, 0.15)',
    profileForeground: '#2a2d36',
    selectedOptionBorder: '#6c5ce7',
    standby: '#ffc107',
  },
  fonts: {
    body: 'Inter, system-ui, sans-serif',
  },
  radii: {
    actionButton: '12px',
    connectButton: '12px',
    menuButton: '12px',
    modal: '16px',
    modalMobile: '16px',
  },
  shadows: {
    connectButton: '0 4px 20px rgba(108, 92, 231, 0.3)',
    dialog: '0 8px 40px rgba(0, 0, 0, 0.5)',
    profileDetailsAction: '0 2px 8px rgba(0, 0, 0, 0.2)',
    selectedOption: '0 0 0 2px #6c5ce7',
    selectedWallet: '0 0 0 2px #6c5ce7',
    walletLogo: '0 2px 8px rgba(0, 0, 0, 0.2)',
  },
}

// Create QueryClient
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (typeof window === 'undefined') {
    return makeQueryClient()
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

interface Web3ProviderProps {
  children: ReactNode
}

// Inner component that has access to wagmi hooks
function RainbowKitWithAuth({ children }: { children: ReactNode }) {
  const [authStatus, setAuthStatus] = useState<AuthenticationStatus>('unauthenticated')
  const [mounted, setMounted] = useState(false)
  const { address, isConnected } = useAccount()

  // Check for existing session on mount
  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch('/api/auth/session', {
          credentials: 'include',
        })
        if (response.ok) {
          const data = await response.json()
          if (data.authenticated && data.session?.walletAddress?.toLowerCase() === address?.toLowerCase()) {
            setAuthStatus('authenticated')
            return
          }
        }
        setAuthStatus('unauthenticated')
      } catch {
        setAuthStatus('unauthenticated')
      }
    }

    if (isConnected && address) {
      checkSession()
    } else {
      setAuthStatus('unauthenticated')
    }
  }, [isConnected, address])

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Create authentication adapter
  const authenticationAdapter = createAuthenticationAdapter({
    getNonce: async () => {
      const response = await fetch('/api/auth/nonce', {
        credentials: 'include',
      })
      if (!response.ok) throw new Error('Failed to get nonce')
      const { nonce } = await response.json()
      return nonce
    },

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

    verify: async ({ message, signature }) => {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message, signature }),
      })

      if (response.ok) {
        setAuthStatus('authenticated')
        // Dispatch event for AuthContext to pick up
        window.dispatchEvent(new CustomEvent('web3-auth-success'))
        return true
      }
      return false
    },

    signOut: async () => {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
      setAuthStatus('unauthenticated')
      window.dispatchEvent(new CustomEvent('web3-auth-logout'))
    },
  })

  return (
    <RainbowKitAuthenticationProvider
      adapter={authenticationAdapter}
      status={authStatus}
    >
      <RainbowKitProvider
        theme={cloddyTheme}
        modalSize="compact"
        appInfo={{
          appName: 'Cloddy',
          learnMoreUrl: 'https://cloddy.app',
        }}
      >
        {mounted ? children : null}
      </RainbowKitProvider>
    </RainbowKitAuthenticationProvider>
  )
}

export function Web3Provider({ children }: Web3ProviderProps) {
  const queryClient = getQueryClient()

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitWithAuth>{children}</RainbowKitWithAuth>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
