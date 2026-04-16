"use client"

import { toast } from "sonner"

/**
 * Toast utility hook with pre-configured styles for Cloddy
 */
export function useToast() {
  const success = (message: string, description?: string) => {
    toast.success(message, {
      description,
      duration: 4000,
    })
  }

  const error = (message: string, description?: string) => {
    toast.error(message, {
      description,
      duration: 5000,
    })
  }

  const info = (message: string, description?: string) => {
    toast.info(message, {
      description,
      duration: 4000,
    })
  }

  const warning = (message: string, description?: string) => {
    toast.warning(message, {
      description,
      duration: 4000,
    })
  }

  const loading = (message: string) => {
    return toast.loading(message)
  }

  const dismiss = (toastId?: string | number) => {
    toast.dismiss(toastId)
  }

  const promise = <T>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: unknown) => string)
    }
  ) => {
    return toast.promise(promise, messages)
  }

  // Achievement/XP toast with custom styling
  const achievement = (title: string, xp?: number) => {
    toast.success(title, {
      description: xp ? `+${xp} XP` : undefined,
      icon: '🏆',
      duration: 5000,
    })
  }

  // Level up toast
  const levelUp = (level: number) => {
    toast.success(`Level ${level} Reached!`, {
      description: 'Congratulations on leveling up!',
      icon: '🎉',
      duration: 6000,
    })
  }

  // Badge earned toast
  const badgeEarned = (badgeName: string) => {
    toast.success('Badge Earned!', {
      description: badgeName,
      icon: '🎖️',
      duration: 5000,
    })
  }

  return {
    success,
    error,
    info,
    warning,
    loading,
    dismiss,
    promise,
    achievement,
    levelUp,
    badgeEarned,
    // Direct access to toast for custom usage
    toast,
  }
}

// Export standalone functions for use outside of React components
export { toast }

// Helper for API responses
export function showApiError(error: unknown) {
  const message = error instanceof Error ? error.message : 'Something went wrong'
  toast.error('Error', { description: message })
}

export function showApiSuccess(message: string) {
  toast.success(message)
}
