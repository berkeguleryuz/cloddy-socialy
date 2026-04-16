"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/components/AuthContext"

interface User {
  id: string
  display_name: string
  avatar_url: string
  level: number
}

interface EventParticipant {
  id: string
  status: "going" | "interested"
  user: User
}

interface Event {
  id: string
  title: string
  description: string | null
  image_url: string | null
  event_date: string
  location: string | null
  organizer: User | null
  participants: EventParticipant[]
  user_status: "going" | "interested" | null
  going_count: number
  interested_count: number
  created_at: string
}

interface EventsResponse {
  events: Event[]
  total: number
  page: number
  limit: number
}

// Demo events data
const demoEvents: Event[] = [
  {
    id: "1",
    title: "Web3 Hackathon 2024",
    description: "Join us for a 48-hour hackathon building the future of Web3",
    image_url: "/images/events/hackathon.jpg",
    event_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    location: "San Francisco, CA",
    organizer: {
      id: "demo-1",
      display_name: "Web3 Foundation",
      avatar_url: "/images/avatars/avatar_04.png",
      level: 89,
    },
    participants: [],
    user_status: "going",
    going_count: 256,
    interested_count: 412,
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    title: "NFT Art Exhibition",
    description: "Experience the best digital art in an immersive gallery",
    image_url: "/images/events/nft-exhibition.jpg",
    event_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    location: "New York, NY",
    organizer: {
      id: "demo-2",
      display_name: "Digital Art Collective",
      avatar_url: "/images/avatars/avatar_05.png",
      level: 56,
    },
    participants: [],
    user_status: null,
    going_count: 189,
    interested_count: 523,
    created_at: new Date().toISOString(),
  },
]

export function useEvents(options?: { upcoming?: boolean; my?: boolean; page?: number; limit?: number }) {
  const { isAuthenticated } = useAuth()

  return useQuery({
    queryKey: ["events", options, isAuthenticated],
    queryFn: async (): Promise<EventsResponse> => {
      // Show demo events for unauthenticated users
      if (!isAuthenticated) {
        let filtered = [...demoEvents]
        if (options?.upcoming) {
          filtered = filtered.filter((e) => new Date(e.event_date) > new Date())
        }
        if (options?.my) {
          filtered = filtered.filter((e) => e.user_status !== null)
        }
        return {
          events: filtered,
          total: filtered.length,
          page: options?.page || 1,
          limit: options?.limit || 20,
        }
      }

      // For authenticated users, fetch real data
      const params = new URLSearchParams()
      if (options?.upcoming) params.set("upcoming", "true")
      if (options?.my) params.set("my", "true")
      if (options?.page) params.set("page", String(options.page))
      if (options?.limit) params.set("limit", String(options.limit))

      const response = await fetch(`/api/events?${params}`, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch events")
      }

      return response.json()
    },
    staleTime: 30000,
  })
}

export function useEvent(eventId: string) {
  const { isAuthenticated } = useAuth()

  return useQuery({
    queryKey: ["event", eventId, isAuthenticated],
    queryFn: async () => {
      // Show demo event for unauthenticated users
      if (!isAuthenticated) {
        const event = demoEvents.find((e) => e.id === eventId)
        if (!event) throw new Error("Event not found")
        return { event }
      }

      const response = await fetch(`/api/events/${eventId}`, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch event")
      }

      return response.json()
    },
    enabled: !!eventId,
  })
}

export function useCreateEvent() {
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuth()

  return useMutation({
    mutationFn: async (data: {
      title: string
      description?: string
      event_date: string
      location?: string
      image_url?: string
    }) => {
      if (!isAuthenticated) {
        throw new Error("Must be logged in to create events")
      }

      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create event")
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] })
    },
  })
}

export function useRespondToEvent() {
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuth()

  return useMutation({
    mutationFn: async ({ eventId, status }: { eventId: string; status: "going" | "interested" }) => {
      if (!isAuthenticated) {
        throw new Error("Must be logged in to respond to events")
      }

      const response = await fetch(`/api/events/${eventId}/participants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to respond to event")
      }

      return response.json()
    },
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ["event", eventId] })
      queryClient.invalidateQueries({ queryKey: ["events"] })
    },
  })
}

export function useCancelEventResponse() {
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuth()

  return useMutation({
    mutationFn: async (eventId: string) => {
      if (!isAuthenticated) {
        throw new Error("Must be logged in to cancel event response")
      }

      const response = await fetch(`/api/events/${eventId}/participants`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to cancel response")
      }

      return response.json()
    },
    onSuccess: (_, eventId) => {
      queryClient.invalidateQueries({ queryKey: ["event", eventId] })
      queryClient.invalidateQueries({ queryKey: ["events"] })
    },
  })
}
