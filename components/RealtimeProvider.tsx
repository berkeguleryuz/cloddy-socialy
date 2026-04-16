"use client"

import { useEffect } from "react"
import { useAuth } from "./AuthContext"
import {
  useRealtimeNotifications,
  useRealtimeFriendActivity,
  useGlobalPresence,
} from "@/hooks/useRealtime"

/**
 * Global realtime provider that initializes all background subscriptions
 * Wraps the app to provide real-time updates for notifications, friends, and presence
 */
export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isDemo } = useAuth()

  // Initialize realtime subscriptions when authenticated
  return (
    <>
      {isAuthenticated && !isDemo && <RealtimeSubscriptions />}
      {children}
    </>
  )
}

/**
 * Internal component that sets up all realtime subscriptions
 * Only rendered when user is authenticated
 */
function RealtimeSubscriptions() {
  // Subscribe to notifications
  useRealtimeNotifications()

  // Subscribe to friend activity
  useRealtimeFriendActivity()

  // Track global presence
  useGlobalPresence()

  // Request notification permission
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        // Don't immediately request - wait for user interaction
        const requestPermission = () => {
          Notification.requestPermission()
          document.removeEventListener("click", requestPermission)
        }
        document.addEventListener("click", requestPermission, { once: true })
      }
    }
  }, [])

  return null
}

export default RealtimeProvider
