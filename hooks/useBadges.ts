"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/components/AuthContext"

interface Badge {
  id: string
  name: string
  description: string
  icon_url: string
  xp_reward: number
  earned?: boolean
}

interface UserBadge {
  id: string
  earned_at: string
  badge: Badge
}

interface BadgesResponse {
  badges: Badge[]
  user_badges: UserBadge[]
}

// Demo badges
const demoBadges: Badge[] = [
  {
    id: "1",
    name: "Welcome",
    description: "Joined the community",
    icon_url: "/images/badges/badge_welcome.png",
    xp_reward: 50,
    earned: true,
  },
  {
    id: "2",
    name: "First Post",
    description: "Created your first post",
    icon_url: "/images/badges/badge_first_post.png",
    xp_reward: 100,
    earned: true,
  },
  {
    id: "3",
    name: "Social Butterfly",
    description: "Made 10 friends",
    icon_url: "/images/badges/badge_social.png",
    xp_reward: 250,
    earned: false,
  },
  {
    id: "4",
    name: "Popular",
    description: "Received 100 likes on posts",
    icon_url: "/images/badges/badge_popular.png",
    xp_reward: 500,
    earned: false,
  },
  {
    id: "5",
    name: "Verified",
    description: "Verified your wallet",
    icon_url: "/images/badges/badge_verified.png",
    xp_reward: 150,
    earned: true,
  },
]

const demoUserBadges: UserBadge[] = demoBadges
  .filter((b) => b.earned)
  .map((b) => ({
    id: `ub-${b.id}`,
    earned_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    badge: b,
  }))

export function useBadges(options?: { earned?: boolean }) {
  const { isAuthenticated } = useAuth()

  return useQuery({
    queryKey: ["badges", options, isAuthenticated],
    queryFn: async (): Promise<BadgesResponse> => {
      // Show demo badges for unauthenticated users
      if (!isAuthenticated) {
        if (options?.earned) {
          return {
            badges: demoBadges.filter((b) => b.earned),
            user_badges: demoUserBadges,
          }
        }
        return {
          badges: demoBadges,
          user_badges: demoUserBadges,
        }
      }

      // For authenticated users, fetch real data
      const params = new URLSearchParams()
      if (options?.earned) params.set("earned", "true")

      const response = await fetch(`/api/badges?${params}`, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch badges")
      }

      return response.json()
    },
    staleTime: 60000, // Cache for 1 minute
  })
}

export function useUserBadges(userId?: string) {
  const { isAuthenticated, user } = useAuth()

  return useQuery({
    queryKey: ["user-badges", userId || user?.id, isAuthenticated],
    queryFn: async (): Promise<UserBadge[]> => {
      // Show demo badges for unauthenticated users
      if (!isAuthenticated) {
        return demoUserBadges
      }

      // If fetching current user's badges
      if (!userId || userId === user?.id) {
        const response = await fetch("/api/badges?earned=true", {
          credentials: "include",
        })

        if (!response.ok) {
          throw new Error("Failed to fetch user badges")
        }

        const data = await response.json()
        return data.user_badges
      }

      // For other users, we need a different endpoint
      // For now, return empty array
      return []
    },
    staleTime: 60000,
  })
}

/**
 * Hook for XP and level calculations
 * Formula matches CloddyReputation.sol: XP for level L = 100 * L^2
 * Level starts at 1 for UX (contract starts at 0)
 */
export function useXP() {
  const { user, isAuthenticated } = useAuth()

  // XP required to reach a specific level (100 * level^2)
  // Matches CloddyReputation.sol formula
  const getXPForLevel = (level: number): number => {
    if (level <= 1) return 0
    return 100 * level * level
  }

  // Get total XP required to reach a specific level
  // This is cumulative XP needed
  const getTotalXPForLevel = (level: number): number => {
    return getXPForLevel(level)
  }

  // Calculate current level from XP
  // Binary search approach matching contract
  const getLevelFromXP = (xp: number): number => {
    if (xp === 0) return 1 // UX: Start at level 1 (contract uses 0)

    let level = 1
    while (100 * (level + 1) * (level + 1) <= xp && level < 100) {
      level++
    }
    return level
  }

  // Get progress to next level (0-100%)
  const getProgressToNextLevel = (xp: number): number => {
    const level = getLevelFromXP(xp)
    const currentLevelXP = getXPForLevel(level)
    const nextLevelXP = getXPForLevel(level + 1)
    const levelRange = nextLevelXP - currentLevelXP

    if (levelRange <= 0) return 100

    const progressXP = xp - currentLevelXP
    return Math.min(100, Math.floor((progressXP / levelRange) * 100))
  }

  // Demo XP value for unauthenticated users
  const currentXP = !isAuthenticated ? 1250 : (user?.experiencePoints || 0)
  const currentLevel = user?.level || getLevelFromXP(currentXP)

  return {
    currentXP,
    currentLevel,
    xpForNextLevel: getXPForLevel(currentLevel + 1) - getXPForLevel(currentLevel),
    totalXPForNextLevel: getXPForLevel(currentLevel + 1),
    progressPercent: getProgressToNextLevel(currentXP),
    getXPForLevel,
    getTotalXPForLevel,
    getLevelFromXP,
    getProgressToNextLevel,
  }
}
