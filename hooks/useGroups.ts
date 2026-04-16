"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/components/AuthContext"

interface User {
  id: string
  display_name: string
  avatar_url: string
  level: number
}

interface GroupMember {
  id: string
  role: "owner" | "admin" | "moderator" | "member"
  joined_at: string
  user: User
}

interface Group {
  id: string
  name: string
  description: string | null
  avatar_url: string | null
  cover_url: string | null
  is_private: boolean
  category: string | null
  owner: User | null
  members: GroupMember[]
  member_count: number
  is_member: boolean
  user_role: string | null
  created_at: string
}

interface GroupsResponse {
  groups: Group[]
  total: number
  page: number
  limit: number
}

// Demo groups data
const demoGroups: Group[] = [
  {
    id: "1",
    name: "NFT Collectors",
    description: "A community for NFT enthusiasts and collectors",
    avatar_url: "/images/groups/nft-collectors.jpg",
    cover_url: "/images/groups/nft-cover.jpg",
    is_private: false,
    category: "Art",
    owner: {
      id: "demo-1",
      display_name: "CryptoArtist",
      avatar_url: "/images/avatars/avatar_02.png",
      level: 45,
    },
    members: [],
    member_count: 1234,
    is_member: true,
    user_role: "member",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "DeFi Developers",
    description: "Building the future of decentralized finance",
    avatar_url: "/images/groups/defi-dev.jpg",
    cover_url: "/images/groups/defi-cover.jpg",
    is_private: false,
    category: "Technology",
    owner: {
      id: "demo-2",
      display_name: "DeFiBuilder",
      avatar_url: "/images/avatars/avatar_03.png",
      level: 67,
    },
    members: [],
    member_count: 892,
    is_member: false,
    user_role: null,
    created_at: new Date().toISOString(),
  },
]

export function useGroups(options?: { my?: boolean; category?: string; page?: number; limit?: number }) {
  const { isAuthenticated } = useAuth()

  return useQuery({
    queryKey: ["groups", options, isAuthenticated],
    queryFn: async (): Promise<GroupsResponse> => {
      // Show demo groups for unauthenticated users
      if (!isAuthenticated) {
        const filtered = options?.my
          ? demoGroups.filter((g) => g.is_member)
          : demoGroups
        return {
          groups: filtered,
          total: filtered.length,
          page: options?.page || 1,
          limit: options?.limit || 20,
        }
      }

      // For authenticated users, fetch real data
      const params = new URLSearchParams()
      if (options?.my) params.set("my", "true")
      if (options?.category) params.set("category", options.category)
      if (options?.page) params.set("page", String(options.page))
      if (options?.limit) params.set("limit", String(options.limit))

      const response = await fetch(`/api/groups?${params}`, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch groups")
      }

      return response.json()
    },
    staleTime: 30000,
  })
}

export function useGroup(groupId: string) {
  const { isAuthenticated } = useAuth()

  return useQuery({
    queryKey: ["group", groupId, isAuthenticated],
    queryFn: async () => {
      // Show demo group for unauthenticated users
      if (!isAuthenticated) {
        const group = demoGroups.find((g) => g.id === groupId)
        if (!group) throw new Error("Group not found")
        return { group }
      }

      const response = await fetch(`/api/groups/${groupId}`, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch group")
      }

      return response.json()
    },
    enabled: !!groupId,
  })
}

export function useCreateGroup() {
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuth()

  return useMutation({
    mutationFn: async (data: {
      name: string
      description?: string
      category?: string
      is_private?: boolean
      avatar_url?: string
      cover_url?: string
    }) => {
      if (!isAuthenticated) {
        throw new Error("Must be logged in to create groups")
      }

      const response = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create group")
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] })
    },
  })
}

export function useJoinGroup() {
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuth()

  return useMutation({
    mutationFn: async (groupId: string) => {
      if (!isAuthenticated) {
        throw new Error("Must be logged in to join groups")
      }

      const response = await fetch(`/api/groups/${groupId}/members`, {
        method: "POST",
        credentials: "include",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to join group")
      }

      return response.json()
    },
    onSuccess: (_, groupId) => {
      queryClient.invalidateQueries({ queryKey: ["group", groupId] })
      queryClient.invalidateQueries({ queryKey: ["groups"] })
    },
  })
}

export function useLeaveGroup() {
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuth()

  return useMutation({
    mutationFn: async (groupId: string) => {
      if (!isAuthenticated) {
        throw new Error("Must be logged in to leave groups")
      }

      const response = await fetch(`/api/groups/${groupId}/members`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to leave group")
      }

      return response.json()
    },
    onSuccess: (_, groupId) => {
      queryClient.invalidateQueries({ queryKey: ["group", groupId] })
      queryClient.invalidateQueries({ queryKey: ["groups"] })
    },
  })
}
