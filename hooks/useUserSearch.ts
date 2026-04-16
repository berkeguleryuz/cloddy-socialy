"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/components/AuthContext"
import { useState, useEffect } from "react"

interface User {
  id: string
  display_name: string
  avatar_url: string | null
  level: number
  wallet_address: string
  bio: string | null
  tagline: string | null
}

interface UsersResponse {
  users: User[]
  total: number
  page: number
  limit: number
}

// Demo users for search
const demoUsers: User[] = [
  {
    id: "demo-user-2",
    display_name: "Neko Bebop",
    avatar_url: "/images/avatars/avatar_03.png",
    level: 16,
    wallet_address: "0x1234...5678",
    bio: "Gaming enthusiast and NFT collector",
    tagline: "Level up your life!",
  },
  {
    id: "demo-user-3",
    display_name: "Sarah Diamond",
    avatar_url: "/images/avatars/avatar_08.png",
    level: 19,
    wallet_address: "0x2345...6789",
    bio: "Web3 developer and streamer",
    tagline: "Building the future",
  },
  {
    id: "demo-user-4",
    display_name: "Destroy Dex",
    avatar_url: "/images/avatars/avatar_07.png",
    level: 32,
    wallet_address: "0x3456...7890",
    bio: "Pro gamer and content creator",
    tagline: "Destroy the competition",
  },
  {
    id: "demo-user-5",
    display_name: "The Green Goo",
    avatar_url: "/images/avatars/avatar_05.png",
    level: 12,
    wallet_address: "0x4567...8901",
    bio: "NFT artist and collector",
    tagline: "Art is life",
  },
]

export function useUserSearch(options?: { page?: number; limit?: number }) {
  const { isDemo, isAuthenticated } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const query = useQuery({
    queryKey: ["users-search", debouncedQuery, options],
    queryFn: async (): Promise<UsersResponse> => {
      if (isDemo) {
        const filtered = debouncedQuery.trim()
          ? demoUsers.filter(
              (u) =>
                u.display_name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
                u.wallet_address.toLowerCase().includes(debouncedQuery.toLowerCase())
            )
          : demoUsers

        return {
          users: filtered,
          total: filtered.length,
          page: options?.page || 1,
          limit: options?.limit || 20,
        }
      }

      const params = new URLSearchParams()
      if (debouncedQuery.trim()) params.set("q", debouncedQuery.trim())
      if (options?.page) params.set("page", String(options.page))
      if (options?.limit) params.set("limit", String(options.limit))

      const response = await fetch(`/api/users?${params}`, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to search users")
      }

      return response.json()
    },
    enabled: isAuthenticated,
    staleTime: 10000,
  })

  return {
    ...query,
    searchQuery,
    setSearchQuery,
  }
}

export function useUserProfile(userId: string) {
  const { isDemo, isAuthenticated } = useAuth()

  return useQuery({
    queryKey: ["user-profile", userId],
    queryFn: async () => {
      if (isDemo) {
        const user = demoUsers.find((u) => u.id === userId)
        if (!user) throw new Error("User not found")
        return {
          user: {
            ...user,
            cover_url: "/images/covers/cover_01.jpg",
            xp: 1250,
            created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
            is_current_user: false,
            friendship_status: "none",
            friendship_id: null,
            stats: {
              posts: 42,
              friends: 156,
            },
          },
        }
      }

      const response = await fetch(`/api/users/${userId}`, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch user profile")
      }

      return response.json()
    },
    enabled: isAuthenticated && !!userId,
  })
}
