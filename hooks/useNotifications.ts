"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { useAuth } from "@/components/AuthContext"
import { createClient } from "@/lib/supabase/client"

// Demo notifications
const demoNotifications = [
  {
    id: "notif-1",
    type: "friend_request",
    title: "Friend Request",
    message: "The Green Goo wants to be your friend!",
    is_read: false,
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    data: {
      user_id: "demo-user-5",
      user_name: "The Green Goo",
      user_avatar: "/images/avatars/avatar_05.png",
    },
  },
  {
    id: "notif-2",
    type: "like",
    title: "New Like",
    message: "Neko Bebop liked your post",
    is_read: false,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    data: {
      post_id: "1",
      user_name: "Neko Bebop",
    },
  },
  {
    id: "notif-3",
    type: "comment",
    title: "New Comment",
    message: "Sarah Diamond commented on your post",
    is_read: true,
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    data: {
      post_id: "1",
      user_name: "Sarah Diamond",
    },
  },
  {
    id: "notif-4",
    type: "badge",
    title: "Badge Earned!",
    message: 'You earned the "Social Butterfly" badge',
    is_read: true,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    data: {
      badge_name: "Social Butterfly",
      badge_image: "/images/badges/badge_social.png",
    },
  },
]

export function useNotifications() {
  const { isAuthenticated, user } = useAuth()
  const supabase = createClient()
  const queryClient = useQueryClient()

  // Fetch notifications
  const {
    data: notifications,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["notifications", user?.id, isAuthenticated],
    queryFn: async () => {
      // Show demo notifications for unauthenticated users
      if (!isAuthenticated || !user?.id) {
        return demoNotifications
      }

      const { data, error } = await (supabase as any)
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50)

      if (error) throw error
      return data
    },
  })

  // Get unread count
  const unreadCount = notifications?.filter((n: { is_read: boolean }) => !n.is_read).length || 0

  // Mark notification as read
  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      if (!isAuthenticated) {
        return
      }

      const { error } = await (supabase as any)
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })

  // Mark all as read
  const markAllAsRead = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated || !user?.id) {
        return
      }

      const { error } = await (supabase as any)
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })

  // Delete notification
  const deleteNotification = useMutation({
    mutationFn: async (notificationId: string) => {
      if (!isAuthenticated) {
        return
      }

      const { error } = await (supabase as any)
        .from("notifications")
        .delete()
        .eq("id", notificationId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })

  // Real-time subscription for new notifications
  // Note: supabase and queryClient are stable singletons, no need in deps
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return

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
        () => {
          queryClient.invalidateQueries({ queryKey: ["notifications"] })
        }
      )
      .subscribe()

    return () => {
      (supabase as any).removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id])

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead: markAsRead.mutate,
    markAllAsRead: markAllAsRead.mutate,
    deleteNotification: deleteNotification.mutate,
  }
}
