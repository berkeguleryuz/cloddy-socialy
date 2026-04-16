"use client"

import { useEffect, useCallback, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/components/AuthContext"
import { createClient } from "@/lib/supabase/client"

type RealtimeEvent = "INSERT" | "UPDATE" | "DELETE" | "*"

interface SubscriptionConfig {
  table: string
  event?: RealtimeEvent
  filter?: string
  queryKey: string[]
}

/**
 * Hook for subscribing to Supabase realtime changes
 * Automatically invalidates React Query cache when changes occur
 */
export function useRealtimeSubscription(config: SubscriptionConfig) {
  const { isDemo, user } = useAuth()
  const queryClient = useQueryClient()
  const supabase = createClient()

  // Extract config values for stable dependencies
  const { table, event, filter, queryKey } = config
  const queryKeyStr = JSON.stringify(queryKey)

  useEffect(() => {
    if (isDemo || !user?.id) return

    const channel = (supabase as any)
      .channel(`${table}-changes`)
      .on(
        "postgres_changes",
        {
          event: event || "*",
          schema: "public",
          table: table,
          filter: filter,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: JSON.parse(queryKeyStr) })
        }
      )
      .subscribe()

    return () => {
      (supabase as any).removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemo, user?.id, table, event, filter, queryKeyStr])
}

/**
 * Hook for subscribing to multiple realtime channels
 */
export function useMultipleRealtimeSubscriptions(configs: SubscriptionConfig[]) {
  const { isDemo, user } = useAuth()
  const queryClient = useQueryClient()
  const supabase = createClient()

  useEffect(() => {
    if (isDemo || !user?.id) return

    const channels = configs.map((config, index) => {
      return (supabase as any)
        .channel(`${config.table}-changes-${index}`)
        .on(
          "postgres_changes",
          {
            event: config.event || "*",
            schema: "public",
            table: config.table,
            filter: config.filter,
          },
          () => {
            queryClient.invalidateQueries({ queryKey: config.queryKey })
          }
        )
        .subscribe()
    })

    return () => {
      channels.forEach((channel) => {
        (supabase as any).removeChannel(channel)
      })
    }
  }, [isDemo, user?.id, configs, supabase, queryClient])
}

/**
 * Hook for subscribing to presence (online status)
 */
export function usePresence(channelName: string) {
  const { isDemo, user } = useAuth()
  const supabase = createClient()

  const trackPresence = useCallback(
    async (status: "online" | "away" | "offline") => {
      if (isDemo || !user?.id) return

      const channel = (supabase as any).channel(channelName)
      await channel.track({
        user_id: user.id,
        status,
        online_at: new Date().toISOString(),
      })
    },
    [isDemo, user?.id, channelName, supabase]
  )

  useEffect(() => {
    if (isDemo || !user?.id) return

    const channel = (supabase as any)
      .channel(channelName)
      .on("presence", { event: "sync" }, () => {
        // Presence state synced - can be used for online users list
        // const presenceState = channel.presenceState()
      })
      .on("presence", { event: "join" }, ({ key, newPresences }: { key: string; newPresences: any[] }) => {
        // User joined - can trigger notification or update UI
        void key; void newPresences; // Acknowledge unused params
      })
      .on("presence", { event: "leave" }, ({ key, leftPresences }: { key: string; leftPresences: any[] }) => {
        // User left - can update UI
        void key; void leftPresences; // Acknowledge unused params
      })
      .subscribe(async (status: string) => {
        if (status === "SUBSCRIBED") {
          await trackPresence("online")
        }
      })

    return () => {
      trackPresence("offline")
      ;(supabase as any).removeChannel(channel)
    }
  }, [isDemo, user?.id, channelName, supabase, trackPresence])

  return { trackPresence }
}

/**
 * Hook for real-time notifications
 */
export function useRealtimeNotifications() {
  const { isDemo, user } = useAuth()
  const queryClient = useQueryClient()
  const supabase = createClient()

  useEffect(() => {
    if (isDemo || !user?.id) return

    const channel = (supabase as any)
      .channel(`notifications:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload: any) => {
          // Invalidate notifications cache
          queryClient.invalidateQueries({ queryKey: ["notifications"] })

          // Optionally show a toast or play a sound
          if (typeof window !== "undefined" && "Notification" in window) {
            if (Notification.permission === "granted") {
              const notification = payload.new
              new Notification(notification.title || "New Notification", {
                body: notification.message,
                icon: "/favicon.ico",
              })
            }
          }
        }
      )
      .subscribe()

    return () => {
      (supabase as any).removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemo, user?.id])
}

/**
 * Hook for real-time friend activity
 */
export function useRealtimeFriendActivity() {
  const { isDemo, user } = useAuth()
  const queryClient = useQueryClient()
  const supabase = createClient()

  useEffect(() => {
    if (isDemo || !user?.id) return

    const channel = (supabase as any)
      .channel(`friends:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "friendships",
          filter: `requester_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["friends"] })
          queryClient.invalidateQueries({ queryKey: ["friendRequests"] })
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "friendships",
          filter: `addressee_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["friends"] })
          queryClient.invalidateQueries({ queryKey: ["friendRequests"] })
        }
      )
      .subscribe()

    return () => {
      (supabase as any).removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemo, user?.id])
}

/**
 * Hook for real-time messages in a conversation
 */
export function useRealtimeMessages(conversationId: string | null) {
  const { isDemo, user } = useAuth()
  const queryClient = useQueryClient()
  const supabase = createClient()

  useEffect(() => {
    if (isDemo || !user?.id || !conversationId) return

    const channel = (supabase as any)
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload: any) => {
          // Invalidate messages cache for this conversation
          queryClient.invalidateQueries({ queryKey: ["messages", conversationId] })

          // Also invalidate conversations list to update last message
          queryClient.invalidateQueries({ queryKey: ["conversations"] })

          // Play notification sound for new messages from others
          if (payload.new?.sender_id !== user.id) {
            playMessageSound()
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          // Handle read receipts
          queryClient.invalidateQueries({ queryKey: ["messages", conversationId] })
        }
      )
      .subscribe()

    return () => {
      (supabase as any).removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemo, user?.id, conversationId])
}

/**
 * Hook for global online presence with database sync
 */
export function useGlobalPresence() {
  const { isDemo, user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (isDemo || !user?.id) return

    // Update online status in database
    const updateOnlineStatus = async (isOnline: boolean) => {
      try {
        await (supabase as any)
          .from('users')
          .update({
            is_online: isOnline,
            last_seen_at: new Date().toISOString(),
          })
          .eq('id', user.id)
      } catch (error) {
        console.error('Failed to update online status:', error)
      }
    }

    // Set online on mount
    updateOnlineStatus(true)

    // Handle visibility change (tab switch)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateOnlineStatus(true)
      } else {
        // Don't set offline immediately - user might just be switching tabs
        // The heartbeat will handle actual offline detection
      }
    }

    // Handle before unload (tab close)
    const handleBeforeUnload = () => {
      // Use sendBeacon for reliable offline update
      const data = JSON.stringify({ user_id: user.id, is_online: false })
      navigator.sendBeacon('/api/users/status', data)
    }

    // Heartbeat to keep online status fresh (every 30 seconds)
    const heartbeatInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        updateOnlineStatus(true)
      }
    }, 30000)

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      updateOnlineStatus(false)
      clearInterval(heartbeatInterval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemo, user?.id])
}

/**
 * Hook for tracking online users in a specific context (e.g., a group or event)
 */
export function useOnlineUsers(contextType: 'global' | 'group' | 'event', contextId?: string) {
  const { isDemo, user } = useAuth()
  const supabase = createClient()
  const [onlineUsers, setOnlineUsers] = useState<Record<string, { user_id: string; status: string; online_at: string }>>({})

  useEffect(() => {
    if (isDemo || !user?.id) return

    const channelName = contextId ? `presence:${contextType}:${contextId}` : `presence:${contextType}`

    const channel = (supabase as any)
      .channel(channelName)
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState()
        const users: Record<string, any> = {}

        Object.entries(state).forEach(([key, presences]: [string, any]) => {
          if (Array.isArray(presences) && presences.length > 0) {
            users[key] = presences[0]
          }
        })

        setOnlineUsers(users)
      })
      .subscribe(async (status: string) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            user_id: user.id,
            status: "online",
            online_at: new Date().toISOString(),
          })
        }
      })

    return () => {
      channel.untrack()
      ;(supabase as any).removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemo, user?.id, contextType, contextId])

  return { onlineUsers, onlineCount: Object.keys(onlineUsers).length }
}

/**
 * Hook for real-time typing indicators
 */
export function useTypingIndicator(conversationId: string | null) {
  const { isDemo, user } = useAuth()
  const supabase = createClient()
  const [typingUsers, setTypingUsers] = useState<string[]>([])

  const setTyping = useCallback(
    async (isTyping: boolean) => {
      if (isDemo || !user?.id || !conversationId) return

      const channel = (supabase as any).channel(`typing:${conversationId}`)

      if (isTyping) {
        await channel.track({
          user_id: user.id,
          typing: true,
          started_at: new Date().toISOString(),
        })
      } else {
        await channel.untrack()
      }
    },
    [isDemo, user?.id, conversationId, supabase]
  )

  useEffect(() => {
    if (isDemo || !user?.id || !conversationId) return

    const channel = (supabase as any)
      .channel(`typing:${conversationId}`)
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState()
        const typing: string[] = []

        Object.values(state).forEach((presences: any) => {
          if (Array.isArray(presences)) {
            presences.forEach((p: any) => {
              if (p.typing && p.user_id !== user.id) {
                typing.push(p.user_id)
              }
            })
          }
        })

        setTypingUsers(typing)
      })
      .subscribe()

    return () => {
      ;(supabase as any).removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemo, user?.id, conversationId])

  return { typingUsers, setTyping }
}

// Helper function to play notification sound
function playMessageSound() {
  if (typeof window === 'undefined') return

  try {
    const audio = new Audio('/sounds/message.mp3')
    audio.volume = 0.3
    audio.play().catch(() => {
      // Autoplay blocked - ignore
    })
  } catch {
    // Audio not supported
  }
}

