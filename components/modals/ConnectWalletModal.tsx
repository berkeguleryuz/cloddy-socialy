"use client"

import { useState, useEffect, memo } from 'react'
import { useAuth } from '@/components/AuthContext'
import { useAccount, useSignMessage, useChainId } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { SiweMessage } from 'siwe'

interface ConnectWalletModalProps {
  isOpen: boolean
  onClose: () => void
}

const ConnectWalletModal = memo(function ConnectWalletModal({ isOpen, onClose }: ConnectWalletModalProps) {
  const { linkWallet, isSubmitting } = useAuth()
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { signMessageAsync } = useSignMessage()

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isSigning, setIsSigning] = useState(false)

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setError(null)
      setSuccess(false)
      setIsSigning(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleLinkWallet = async () => {
    if (!address || !chainId) {
      setError('Please connect your wallet first')
      return
    }

    setError(null)
    setIsSigning(true)

    try {
      // Fetch nonce
      const nonceRes = await fetch('/api/auth/nonce')
      const { nonce } = await nonceRes.json()

      // Create SIWE message
      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: 'Link this wallet to your Cloddy account.',
        uri: window.location.origin,
        version: '1',
        chainId,
        nonce,
      })

      const messageString = message.prepareMessage()

      // Sign message
      const signature = await signMessageAsync({
        message: messageString,
      })

      // Link wallet
      const result = await linkWallet(messageString, signature)

      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          onClose()
        }, 2000)
      } else {
        setError(result.error || 'Failed to link wallet')
      }
    } catch (err) {
      console.error('Error linking wallet:', err)
      if (err instanceof Error && err.message.includes('User rejected')) {
        setError('Signature rejected. Please try again.')
      } else {
        setError('Failed to link wallet. Please try again.')
      }
    } finally {
      setIsSigning(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="widget-box w-full max-w-md animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-white">Connect Wallet</h2>
              <p className="text-text-muted text-sm mt-1">
                Link a wallet to access Web3 features
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 text-text-muted hover:text-white hover:bg-white/20 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Wallet Linked!</h3>
              <p className="text-text-muted text-sm">
                You can now use Web3 features with your account.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {!isConnected ? (
                <>
                  {/* Connect Wallet */}
                  <div className="text-center py-4">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                      <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <p className="text-text-muted text-sm mb-4">
                      First, connect your wallet to proceed
                    </p>
                    <ConnectButton />
                  </div>
                </>
              ) : (
                <>
                  {/* Wallet Connected - Sign to Link */}
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">Wallet Connected</p>
                        <p className="text-text-muted text-xs font-mono">
                          {address?.slice(0, 6)}...{address?.slice(-4)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-text-muted text-sm mb-4">
                      Sign a message to link this wallet to your account
                    </p>
                    <button
                      onClick={handleLinkWallet}
                      disabled={isSigning || isSubmitting}
                      className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSigning || isSubmitting ? (
                        <>
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          {isSigning ? 'Waiting for signature...' : 'Linking...'}
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          Sign & Link Wallet
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}

              {/* Benefits */}
              <div className="pt-4 border-t border-white/10">
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
                  Benefits of linking your wallet
                </p>
                <ul className="space-y-2">
                  {[
                    'Access Web3 features & NFTs',
                    'Earn on-chain badges',
                    'Participate in token rewards',
                    'Connect to DeFi protocols',
                  ].map((benefit, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-text-muted">
                      <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

export default ConnectWalletModal
