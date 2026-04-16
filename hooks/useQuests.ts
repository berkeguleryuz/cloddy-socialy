"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/components/AuthContext"

interface Quest {
  id: string
  type: "daily" | "weekly" | "achievement"
  title: string
  description: string
  xp_reward: number
  progress: number
  target: number
  completed: boolean
  claimed?: boolean
  icon: string
}

interface QuestsResponse {
  quests: Quest[]
  daily_reset: string
  weekly_reset: string
}

// Demo quests
const demoQuests: Quest[] = [
  // Daily
  {
    id: "daily-1",
    type: "daily",
    title: "Social Butterfly",
    description: "Send a message to 3 friends",
    xp_reward: 50,
    progress: 2,
    target: 3,
    completed: false,
    icon: "message",
  },
  {
    id: "daily-2",
    type: "daily",
    title: "Content Creator",
    description: "Create a new post",
    xp_reward: 30,
    progress: 1,
    target: 1,
    completed: true,
    icon: "post",
  },
  {
    id: "daily-3",
    type: "daily",
    title: "Engagement Master",
    description: "Like 5 posts from friends",
    xp_reward: 25,
    progress: 3,
    target: 5,
    completed: false,
    icon: "heart",
  },
  // Weekly
  {
    id: "weekly-1",
    type: "weekly",
    title: "Friend Finder",
    description: "Add 3 new friends this week",
    xp_reward: 200,
    progress: 1,
    target: 3,
    completed: false,
    icon: "users",
  },
  {
    id: "weekly-2",
    type: "weekly",
    title: "Event Explorer",
    description: "Attend 2 events",
    xp_reward: 150,
    progress: 0,
    target: 2,
    completed: false,
    icon: "calendar",
  },
  // Achievements
  {
    id: "achievement-1",
    type: "achievement",
    title: "First Steps",
    description: "Complete your profile",
    xp_reward: 100,
    progress: 1,
    target: 1,
    completed: true,
    icon: "profile",
  },
  {
    id: "achievement-2",
    type: "achievement",
    title: "Social Star",
    description: "Reach 100 friends",
    xp_reward: 500,
    progress: 42,
    target: 100,
    completed: false,
    icon: "star",
  },
]

function getNextDailyReset(): string {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  return tomorrow.toISOString()
}

function getNextWeeklyReset(): string {
  const now = new Date()
  const daysUntilMonday = (8 - now.getDay()) % 7 || 7
  const nextMonday = new Date(now)
  nextMonday.setDate(nextMonday.getDate() + daysUntilMonday)
  nextMonday.setHours(0, 0, 0, 0)
  return nextMonday.toISOString()
}

export function useQuests(type?: "daily" | "weekly" | "achievement") {
  const { isAuthenticated } = useAuth()

  return useQuery({
    queryKey: ["quests", type, isAuthenticated],
    queryFn: async (): Promise<QuestsResponse> => {
      // Show demo data for unauthenticated users
      if (!isAuthenticated) {
        const filtered = type
          ? demoQuests.filter((q) => q.type === type)
          : demoQuests

        return {
          quests: filtered,
          daily_reset: getNextDailyReset(),
          weekly_reset: getNextWeeklyReset(),
        }
      }

      // For authenticated users, fetch real data
      const params = new URLSearchParams()
      if (type) params.set("type", type)

      const response = await fetch(`/api/quests?${params}`, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch quests")
      }

      return response.json()
    },
    staleTime: 60000, // Cache for 1 minute
  })
}

export function useDailyQuests() {
  return useQuests("daily")
}

export function useWeeklyQuests() {
  return useQuests("weekly")
}

export function useAchievements() {
  return useQuests("achievement")
}

/**
 * Hook for quest statistics
 */
export function useQuestStats() {
  const { data, isLoading } = useQuests()

  const stats = {
    daily: {
      total: 0,
      completed: 0,
      xpPending: 0,
      xpEarned: 0,
    },
    weekly: {
      total: 0,
      completed: 0,
      xpPending: 0,
      xpEarned: 0,
    },
    achievements: {
      total: 0,
      completed: 0,
      xpPending: 0,
      xpEarned: 0,
    },
  }

  if (data?.quests) {
    data.quests.forEach((quest) => {
      const category =
        quest.type === "daily"
          ? "daily"
          : quest.type === "weekly"
            ? "weekly"
            : "achievements"

      stats[category].total++
      if (quest.completed) {
        stats[category].completed++
        stats[category].xpEarned += quest.xp_reward
      } else {
        stats[category].xpPending += quest.xp_reward
      }
    })
  }

  return {
    stats,
    isLoading,
    dailyReset: data?.daily_reset,
    weeklyReset: data?.weekly_reset,
    totalXpAvailable:
      stats.daily.xpPending + stats.weekly.xpPending + stats.achievements.xpPending,
    totalXpEarned:
      stats.daily.xpEarned + stats.weekly.xpEarned + stats.achievements.xpEarned,
  }
}

/**
 * Hook for claiming quest rewards with optimistic updates
 */
export function useClaimQuest() {
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuth()

  return useMutation({
    mutationFn: async (questId: string) => {
      if (!isAuthenticated) {
        throw new Error("Must be logged in to claim quests")
      }

      const response = await fetch("/api/quests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ questId, action: "claim" }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to claim quest")
      }

      return response.json()
    },
    // Optimistic update
    onMutate: async (questId) => {
      await queryClient.cancelQueries({ queryKey: ["quests"] })
      const previousQuests = queryClient.getQueryData<QuestsResponse>(["quests"])

      queryClient.setQueryData<QuestsResponse>(["quests"], (old) => {
        if (!old) return old
        return {
          ...old,
          quests: old.quests.map((q) =>
            q.id === questId ? { ...q, claimed: true } : q
          ),
        }
      })

      return { previousQuests }
    },
    onError: (_, __, context) => {
      if (context?.previousQuests) {
        queryClient.setQueryData(["quests"], context.previousQuests)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["quests"] })
      queryClient.invalidateQueries({ queryKey: ["user"] })
    },
  })
}

/**
 * Hook for checking and resetting quests
 */
export function useQuestReset() {
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuth()

  return useMutation({
    mutationFn: async () => {
      if (!isAuthenticated) {
        throw new Error("Must be logged in to reset quests")
      }

      const response = await fetch("/api/quests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "check_reset" }),
      })

      if (!response.ok) {
        throw new Error("Failed to check quest reset")
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quests"] })
    },
  })
}
