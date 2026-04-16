"use client"

import { useState, memo } from 'react'
import { useProfileCompletion, ProfileCompletionItem } from '@/hooks/useProfileCompletion'
import { useAuth } from './AuthContext'

interface ProfileCompletionModalProps {
  isOpen: boolean
  onClose: () => void
  onDismiss: (duration: 'session' | 'day' | 'permanent') => void
}

const ProfileCompletionModal = memo(function ProfileCompletionModal({
  isOpen,
  onClose,
  onDismiss,
}: ProfileCompletionModalProps) {
  const { items, completionPercentage, needsEmail, needsWallet, needsVerification } = useProfileCompletion()
  const { resendVerificationEmail, isSubmitting } = useAuth()
  const [activeAction, setActiveAction] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  if (!isOpen) return null

  const handleResendVerification = async () => {
    setActiveAction('verification')
    const result = await resendVerificationEmail()
    if (result.success) {
      setMessage({ type: 'success', text: 'Verification email sent!' })
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to send email' })
    }
    setActiveAction(null)
    setTimeout(() => setMessage(null), 3000)
  }

  const getActionButton = (item: ProfileCompletionItem) => {
    if (item.completed) return null

    switch (item.type) {
      case 'email':
        if (!needsEmail) return null
        return (
          <button
            onClick={() => {
              onClose()
              // Dispatch event to open add email modal
              window.dispatchEvent(new CustomEvent('open-add-email-modal'))
            }}
            className="px-3 py-1 text-xs font-bold bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors"
          >
            Add Email
          </button>
        )
      case 'wallet':
        if (!needsWallet) return null
        return (
          <button
            onClick={() => {
              onClose()
              // Dispatch event to open connect wallet modal
              window.dispatchEvent(new CustomEvent('open-connect-wallet-modal'))
            }}
            className="px-3 py-1 text-xs font-bold bg-secondary/20 text-secondary rounded-lg hover:bg-secondary/30 transition-colors"
          >
            Connect
          </button>
        )
      case 'verification':
        if (!needsVerification) return null
        return (
          <button
            onClick={handleResendVerification}
            disabled={isSubmitting && activeAction === 'verification'}
            className="px-3 py-1 text-xs font-bold bg-accent-blue/20 text-accent-blue rounded-lg hover:bg-accent-blue/30 transition-colors disabled:opacity-50"
          >
            {isSubmitting && activeAction === 'verification' ? 'Sending...' : 'Resend'}
          </button>
        )
      case 'avatar':
      case 'bio':
        return (
          <button
            onClick={() => {
              onClose()
              window.location.href = '/settings/profile'
            }}
            className="px-3 py-1 text-xs font-bold bg-white/10 text-white/70 rounded-lg hover:bg-white/20 transition-colors"
          >
            Edit
          </button>
        )
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="widget-box w-full max-w-md animate-in zoom-in-95 duration-300">
        {/* Header with gradient */}
        <div className="relative overflow-hidden rounded-t-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary opacity-90" />
          <div className="relative p-6 text-center">
            {/* Progress Circle */}
            <div className="relative w-24 h-24 mx-auto mb-4">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="white"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={251.2}
                  strokeDashoffset={251.2 * (1 - completionPercentage / 100)}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-black text-white">{completionPercentage}%</span>
              </div>
            </div>
            <h2 className="text-xl font-black text-white mb-1">Complete Your Profile</h2>
            <p className="text-white/80 text-sm">Unlock all features and earn bonus XP!</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Message */}
          {message && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${
              message.type === 'success'
                ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                : 'bg-red-500/20 border border-red-500/30 text-red-400'
            }`}>
              {message.text}
            </div>
          )}

          {/* Completion Items */}
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                  item.completed
                    ? 'bg-secondary/10 border border-secondary/30'
                    : 'bg-white/5 border border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Status Icon */}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    item.completed
                      ? 'bg-secondary text-white'
                      : 'bg-white/10 text-text-muted'
                  }`}>
                    {item.completed ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    )}
                  </div>

                  <div>
                    <span className={`text-sm font-medium ${item.completed ? 'text-white' : 'text-text-muted'}`}>
                      {item.label}
                    </span>
                    <span className="ml-2 text-xs text-primary">+{item.points} XP</span>
                  </div>
                </div>

                {/* Action Button */}
                {getActionButton(item)}
              </div>
            ))}
          </div>

          {/* Dismiss Options */}
          <div className="mt-6 pt-4 border-t border-white/10 flex flex-col gap-2">
            <button
              onClick={() => onDismiss('day')}
              className="w-full py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors"
            >
              Remind Me Later
            </button>
            <button
              onClick={() => onDismiss('permanent')}
              className="text-text-muted text-sm hover:text-white transition-colors"
            >
              Don&apos;t show again
            </button>
          </div>
        </div>
      </div>
    </div>
  )
})

export default ProfileCompletionModal
