"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/components/AuthContext"
import { createClient } from "@/lib/supabase/client"

// Demo friends data
const demoFriends = [
  {
    id: "friend-1",
    user: {
      id: "demo-user-2",
      display_name: "Neko Bebop",
      avatar_url: "/images/avatars/avatar_03.png",
      level: 16,
      is_online: true,
    },
    status: "accepted",
  },
  {
    id: "friend-2",
    user: {
      id: "demo-user-3",
      display_name: "Sarah Diamond",
      avatar_url: "/images/avatars/avatar_08.png",
      level: 19,
      is_online: false,
    },
    status: "accepted",
  },
  {
    id: "friend-3",
    user: {
      id: "demo-user-4",
      display_name: "Destroy Dex",
      avatar_url: "/images/avatars/avatar_07.png",
      level: 32,
      is_online: true,
    },
    status: "accepted",
  },
]

const demoFriendRequests = [
  {
    id: "request-1",
    from_user: {
      id: "demo-user-5",
      display_name: "The Green Goo",
      avatar_url: "/images/avatars/avatar_05.png",
      level: 12,
    },
    message: "Hey! Let's be friends and play together!",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
]

export function useFriends() {
  const { isAuthenticated, user } = useAuth()
  const supabase = createClient()
  const queryClient = useQueryClient()

  // Fetch friends list
  const {
    data: friends,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["friends", user?.id, isAuthenticated],
    queryFn: async () => {
      // Show demo friends for unauthenticated users
      if (!isAuthenticated || !user?.id) {
        return demoFriends
      }

      // Get friendships where current user is either requester or addressee
      const { data, error } = await (supabase as any)
        .from("friendships")
        .select(
          `
          id,
          status,
          requester:users!friendships_requester_id_fkey(id, display_name, avatar_url, level),
          addressee:users!friendships_addressee_id_fkey(id, display_name, avatar_url, level)
        `
        )
        .eq("status", "accepted")
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)

      if (error) throw error

      // Transform to get the friend user (the one that's not current user)
      return (data || []).map((friendship: { id: string; status: string; requester: { id: string }; addressee: { id: string } }) => ({
        id: friendship.id,
        status: friendship.status,
        user:
          friendship.requester.id === user.id
            ? friendship.addressee
            : friendship.requester,
      }))
    },
  })

  // Fetch friend requests
  const { data: friendRequests } = useQuery({
    queryKey: ["friendRequests", user?.id, isAuthenticated],
    queryFn: async () => {
      // Show demo friend requests for unauthenticated users
      if (!isAuthenticated || !user?.id) {
        return demoFriendRequests
      }

      const { data, error } = await (supabase as any)
        .from("friendships")
        .select(
          `
          id,
          created_at,
          from_user:users!friendships_requester_id_fkey(id, display_name, avatar_url, level)
        `
        )
        .eq("addressee_id", user.id)
        .eq("status", "pending")

      if (error) throw error
      return data
    },
  })

  // Send friend request
  const sendFriendRequest = useMutation({
    mutationFn: async (toUserId: string) => {
      if (!isAuthenticated || !user) {
        throw new Error("Must be logged in to send friend requests")
      }

      const { data, error } = await (supabase as any)
        .from("friendships")
        .insert({
          requester_id: user.id,
          addressee_id: toUserId,
          status: "pending",
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] })
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] })
    },
  })

  // Accept friend request
  const acceptFriendRequest = useMutation({
    mutationFn: async (friendshipId: string) => {
      if (!isAuthenticated) {
        throw new Error("Must be logged in to accept friend requests")
      }

      const { data, error } = await (supabase as any)
        .from("friendships")
        .update({ status: "accepted" })
        .eq("id", friendshipId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] })
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] })
    },
  })

  // Decline friend request
  const declineFriendRequest = useMutation({
    mutationFn: async (friendshipId: string) => {
      if (!isAuthenticated) {
        throw new Error("Must be logged in to decline friend requests")
      }

      const { error } = await (supabase as any)
        .from("friendships")
        .delete()
        .eq("id", friendshipId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] })
    },
  })

  // Remove friend
  const removeFriend = useMutation({
    mutationFn: async (friendshipId: string) => {
      if (!isAuthenticated) {
        throw new Error("Must be logged in to remove friends")
      }

      const { error } = await (supabase as any)
        .from("friendships")
        .delete()
        .eq("id", friendshipId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] })
    },
  })

  return {
    friends,
    friendRequests,
    isLoading,
    error,
    sendFriendRequest: sendFriendRequest.mutate,
    acceptFriendRequest: acceptFriendRequest.mutate,
    declineFriendRequest: declineFriendRequest.mutate,
    removeFriend: removeFriend.mutate,
    isSendingRequest: sendFriendRequest.isPending,
  }
}
