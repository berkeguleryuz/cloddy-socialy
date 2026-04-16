import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '@/components/AuthContext'

// LocalStorage keys
const DISMISSED_KEY = 'cloddy_profile_completion_dismissed'
const DISMISSED_UNTIL_KEY = 'cloddy_profile_completion_dismissed_until'

// Time constants
const DISMISS_DURATION = 24 * 60 * 60 * 1000 // 24 hours

export interface ProfileCompletionItem {
  id: string
  label: string
  completed: boolean
  points: number
  action?: () => void
  type: 'email' | 'wallet' | 'avatar' | 'bio' | 'social' | 'verification'
}

export interface ProfileCompletionState {
  isComplete: boolean
  completionPercentage: number
  items: ProfileCompletionItem[]
  showModal: boolean
  needsEmail: boolean
  needsWallet: boolean
  needsVerification: boolean
  dismiss: (duration?: 'session' | 'day' | 'permanent') => void
  openModal: () => void
  closeModal: () => void
  checkCompletion: () => void
}

export function useProfileCompletion(): ProfileCompletionState {
  const { user, isAuthenticated, isDemo } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [isDismissed, setIsDismissed] = useState(true) // Start dismissed

  // Check if dismissed from storage
  useEffect(() => {
    if (typeof window === 'undefined') return

    const dismissedUntil = localStorage.getItem(DISMISSED_UNTIL_KEY)
    const dismissed = localStorage.getItem(DISMISSED_KEY)

    if (dismissed === 'permanent') {
      setIsDismissed(true)
      return
    }

    if (dismissedUntil) {
      const until = parseInt(dismissedUntil, 10)
      if (Date.now() < until) {
        setIsDismissed(true)
        return
      }
    }

    setIsDismissed(false)
  }, [])

  // Calculate completion items
  const items: ProfileCompletionItem[] = useMemo(() => {
    if (!user) return []

    return [
      {
        id: 'email',
        label: 'Add email address',
        completed: !!user.email,
        points: 15,
        type: 'email' as const,
      },
      {
        id: 'email_verified',
        label: 'Verify email',
        completed: user.emailVerified ?? false,
        points: 10,
        type: 'verification' as const,
      },
      {
        id: 'wallet',
        label: 'Connect wallet',
        completed: !!user.walletAddress,
        points: 20,
        type: 'wallet' as const,
      },
      {
        id: 'avatar',
        label: 'Upload custom avatar',
        completed: user.avatar?.includes('dicebear') === false && !!user.avatar,
        points: 10,
        type: 'avatar' as const,
      },
      {
        id: 'bio',
        label: 'Add a bio',
        completed: !!(user as any).bio && ((user as any).bio as string).length > 10,
        points: 10,
        type: 'bio' as const,
      },
      {
        id: 'tagline',
        label: 'Add a tagline',
        completed: !!(user as any).tagline,
        points: 5,
        type: 'bio' as const,
      },
    ]
  }, [user])

  // Calculate completion percentage
  const completionPercentage = useMemo(() => {
    if (items.length === 0) return 0
    const totalPoints = items.reduce((sum, item) => sum + item.points, 0)
    const earnedPoints = items
      .filter((item) => item.completed)
      .reduce((sum, item) => sum + item.points, 0)
    return Math.round((earnedPoints / totalPoints) * 100)
  }, [items])

  // Check completion needs
  const needsEmail = useMemo(() => {
    return user?.authMethod === 'web3' && !user?.email
  }, [user])

  const needsWallet = useMemo(() => {
    return user?.authMethod === 'email' && !user?.walletAddress
  }, [user])

  const needsVerification = useMemo(() => {
    return !!user?.email && !user?.emailVerified
  }, [user])

  const isComplete = completionPercentage === 100

  // Dismiss handler
  const dismiss = useCallback((duration: 'session' | 'day' | 'permanent' = 'day') => {
    setShowModal(false)
    setIsDismissed(true)

    if (typeof window === 'undefined') return

    if (duration === 'permanent') {
      localStorage.setItem(DISMISSED_KEY, 'permanent')
      localStorage.removeItem(DISMISSED_UNTIL_KEY)
    } else if (duration === 'day') {
      localStorage.setItem(DISMISSED_UNTIL_KEY, String(Date.now() + DISMISS_DURATION))
      localStorage.removeItem(DISMISSED_KEY)
    }
    // 'session' - just set state, no storage
  }, [])

  // Open modal
  const openModal = useCallback(() => {
    setShowModal(true)
  }, [])

  // Close modal
  const closeModal = useCallback(() => {
    setShowModal(false)
  }, [])

  // Check completion and maybe show modal
  const checkCompletion = useCallback(() => {
    if (!isAuthenticated || isDemo || isDismissed || isComplete) {
      return
    }

    // Show modal after a delay if profile is incomplete
    if (completionPercentage < 70) {
      setTimeout(() => {
        if (!isDismissed) {
          setShowModal(true)
        }
      }, 5000) // 5 second delay
    }
  }, [isAuthenticated, isDemo, isDismissed, isComplete, completionPercentage])

  // Auto-check on mount
  useEffect(() => {
    checkCompletion()
  }, [checkCompletion])

  return {
    isComplete,
    completionPercentage,
    items,
    showModal,
    needsEmail,
    needsWallet,
    needsVerification,
    dismiss,
    openModal,
    closeModal,
    checkCompletion,
  }
}
