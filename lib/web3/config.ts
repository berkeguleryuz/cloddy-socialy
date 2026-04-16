import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { baseSepolia } from 'wagmi/chains'

// Supported chains configuration - Only Base Sepolia for now
export const supportedChains = [baseSepolia] as const

// WalletConnect Project ID - get from https://cloud.walletconnect.com
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

if (!projectId) {
  if (typeof window !== 'undefined') {
    console.warn(
      '⚠️ NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set. ' +
      'Wallet connections may not work properly. ' +
      'Get a project ID from https://cloud.walletconnect.com'
    )
  }
}

// Use a placeholder only for build time - actual connections will fail without proper ID
const safeProjectId = projectId || 'missing-project-id'

// Create wagmi config using RainbowKit's default config
export const wagmiConfig = getDefaultConfig({
  appName: 'Cloddy',
  projectId: safeProjectId,
  chains: supportedChains,
  ssr: true, // Enable SSR for Next.js
})

// Chain ID helpers
export const CHAIN_IDS = {
  BASE_SEPOLIA: 84532,
} as const

// Get chain name by ID
export function getChainName(chainId: number): string {
  const chainNames: Record<number, string> = {
    [CHAIN_IDS.BASE_SEPOLIA]: 'Base Sepolia',
  }
  return chainNames[chainId] || 'Unknown'
}

// Check if chain is supported
export function isSupportedChain(chainId: number): boolean {
  return chainId === CHAIN_IDS.BASE_SEPOLIA
}
