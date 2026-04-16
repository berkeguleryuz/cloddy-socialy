"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/components/AuthContext"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@/types/database"

export function useUser(userId?: string) {
  const { user: authUser, isDemo } = useAuth()
  const supabase = createClient()
  const queryClient = useQueryClient()

  const targetUserId = userId || authUser?.id

  // Fetch user profile
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user", targetUserId],
    queryFn: async () => {
      if (isDemo || !targetUserId) {
        // Return demo user data
        return {
          id: "demo-user",
          wallet_address: "0x0000000000000000000000000000000000000000",
          display_name: "Marina Valentine",
          email: "marina@demo.com",
          avatar_url: "/images/avatars/avatar_01.png",
          level: 24,
          experience_points: 4250,
          bio: "Gaming enthusiast and community builder. Love connecting with fellow gamers!",
          tagline: "Level up your social experience",
          is_verified: true,
          profile_completion: 85,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_seen_at: new Date().toISOString(),
        } as User
      }

      const { data, error } = await (supabase as any)
        .from("users")
        .select("*")
        .eq("id", targetUserId)
        .single()

      if (error) throw error
      return data as User
    },
    enabled: !!targetUserId,
  })

  // Update user profile
  const updateProfile = useMutation({
    mutationFn: async (updates: Partial<User>) => {
      if (isDemo) {
        throw new Error("Cannot update profile in demo mode")
      }

      const { data, error } = await (supabase as any)
        .from("users")
        .update(updates)
        .eq("id", targetUserId!)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", targetUserId] })
    },
  })

  return {
    user,
    isLoading,
    error,
    updateProfile: updateProfile.mutate,
    isUpdating: updateProfile.isPending,
  }
}

export function useCurrentUser() {
  const { user } = useAuth()
  return useUser(user?.id)
}
