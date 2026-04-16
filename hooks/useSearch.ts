"use client"

import { useState, useCallback, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/components/AuthContext"

export type SearchType = "all" | "users" | "posts" | "groups" | "events"

export interface SearchResult {
  id: string
  type: "user" | "post" | "group" | "event"
  name: string
  avatar?: string
  description?: string
  // User specific
  level?: number
  isOnline?: boolean
  // Post specific
  authorName?: string
  authorId?: string
  createdAt?: string
  // Group specific
  isPrivate?: boolean
  membersCount?: number
  cover?: string
  // Event specific
  startDate?: string
  location?: string
  participantsCount?: number
}

export interface SearchResults {
  users?: SearchResult[]
  posts?: SearchResult[]
  groups?: SearchResult[]
  events?: SearchResult[]
}

interface UseSearchOptions {
  type?: SearchType
  limit?: number
  debounceMs?: number
}

// Demo search results
const demoResults: SearchResults = {
  users: [
    {
      id: "demo-1",
      type: "user",
      name: "Marina Valentine",
      avatar: "/images/avatars/avatar_01.png",
      level: 24,
      description: "Gaming enthusiast and streamer",
      isOnline: true,
    },
    {
      id: "demo-2",
      type: "user",
      name: "Nick Grissom",
      avatar: "/images/avatars/avatar_02.png",
      level: 18,
      description: "Digital artist and designer",
      isOnline: false,
    },
  ],
  posts: [
    {
      id: "demo-p1",
      type: "post",
      name: "Just finished my latest gaming session! Check out my new high score...",
      authorName: "Marina Valentine",
      authorId: "demo-1",
      avatar: "/images/avatars/avatar_01.png",
      createdAt: new Date().toISOString(),
    },
  ],
  groups: [
    {
      id: "demo-g1",
      type: "group",
      name: "Cosplayers of the World",
      avatar: "/images/avatars/avatar_05.png",
      description: "A community for cosplay enthusiasts",
      membersCount: 139,
      isPrivate: false,
    },
  ],
  events: [
    {
      id: "demo-e1",
      type: "event",
      name: "Gaming Marathon 2024",
      avatar: "/images/covers/cover_01.png",
      description: "24-hour gaming marathon for charity",
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      location: "Online",
      participantsCount: 156,
    },
  ],
}

export function useSearch(options: UseSearchOptions = {}) {
  const { type = "all", limit = 10, debounceMs = 300 } = options
  const { isDemo } = useAuth()

  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Debounced search
  const search = useCallback(
    (searchQuery: string) => {
      setQuery(searchQuery)

      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }

      if (searchQuery.length >= 2) {
        debounceRef.current = setTimeout(() => {
          setDebouncedQuery(searchQuery)
        }, debounceMs)
      } else {
        setDebouncedQuery("")
      }
    },
    [debounceMs]
  )

  // Fetch search results
  const { data, isLoading, error } = useQuery({
    queryKey: ["search", debouncedQuery, type, limit],
    queryFn: async () => {
      if (isDemo) {
        // Filter demo results by query
        const filterResults = (results: SearchResult[] | undefined) =>
          results?.filter(
            (r) =>
              r.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
              r.description?.toLowerCase().includes(debouncedQuery.toLowerCase())
          )

        return {
          query: debouncedQuery,
          type,
          results: {
            users: type === "all" || type === "users" ? filterResults(demoResults.users) : undefined,
            posts: type === "all" || type === "posts" ? filterResults(demoResults.posts) : undefined,
            groups: type === "all" || type === "groups" ? filterResults(demoResults.groups) : undefined,
            events: type === "all" || type === "events" ? filterResults(demoResults.events) : undefined,
          },
          totalCount: 0,
          hasMore: false,
        }
      }

      const params = new URLSearchParams({
        q: debouncedQuery,
        type,
        limit: String(limit),
      })

      const response = await fetch(`/api/search?${params}`)
      if (!response.ok) {
        throw new Error("Search failed")
      }

      return response.json()
    },
    enabled: debouncedQuery.length >= 2,
    staleTime: 1000 * 60, // 1 minute
  })

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery("")
    setDebouncedQuery("")
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
  }, [])

  // Get all results as a flat array
  const allResults: SearchResult[] = [
    ...(data?.results?.users || []),
    ...(data?.results?.posts || []),
    ...(data?.results?.groups || []),
    ...(data?.results?.events || []),
  ]

  return {
    query,
    search,
    clearSearch,
    results: data?.results as SearchResults | undefined,
    allResults,
    isLoading: isLoading && debouncedQuery.length >= 2,
    error,
    hasResults: allResults.length > 0,
    hasMore: data?.hasMore || false,
    totalCount: data?.totalCount || 0,
  }
}
