import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthContext";

interface XPData {
  onChain: {
    xp: number;
    level: number;
    progressPercent: number;
    rank: number;
  } | null;
  database: {
    xp: number;
    level: number;
  };
  synced: boolean;
  message?: string;
}

interface AddXPResult {
  success: boolean;
  xpEarned: number;
  totalXP: number;
  level: number;
  leveledUp: boolean;
}

// XP action types
export type XPAction =
  | "post_created"
  | "like_received"
  | "comment_received"
  | "friend_added"
  | "badge_earned"
  | "event_organized"
  | "profile_updated"
  | "first_login";

// XP amounts for reference
export const XP_REWARDS: Record<XPAction, number> = {
  post_created: 10,
  like_received: 2,
  comment_received: 5,
  friend_added: 15,
  badge_earned: 50,
  event_organized: 50,
  profile_updated: 5,
  first_login: 100,
};

/**
 * Hook to sync and fetch XP data
 */
export function useXPSync() {
  const { isAuthenticated } = useAuth();

  return useQuery<XPData>({
    queryKey: ["xp-sync"],
    queryFn: async () => {
      const response = await fetch("/api/xp/sync");
      if (!response.ok) {
        throw new Error("Failed to sync XP");
      }
      return response.json();
    },
    enabled: isAuthenticated,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
}

/**
 * Hook to add XP for an action
 */
export function useAddXP() {
  const queryClient = useQueryClient();

  return useMutation<AddXPResult, Error, { action: XPAction; reason?: string }>({
    mutationFn: async ({ action, reason }) => {
      const response = await fetch("/api/xp/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          amount: XP_REWARDS[action],
          reason,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add XP");
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate XP queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["xp-sync"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });

      // Trigger level up celebration if user leveled up
      if (data.leveledUp) {
        window.dispatchEvent(
          new CustomEvent("level-up", { detail: { newLevel: data.level } })
        );
      }
    },
  });
}

/**
 * Hook to get XP progress percentage to next level
 * Formula: XP for level L = 100 * L^2
 */
export function useXPProgress() {
  const { data } = useXPSync();

  if (!data) {
    return { progress: 0, currentXP: 0, nextLevelXP: 100, totalXP: 0, level: 1, rank: 0 };
  }

  const xp = data.onChain?.xp ?? data.database.xp;
  // Use on-chain level or database level (both use same formula now)
  // Note: contract returns 0 for 0 XP, but we display as level 1 for UX
  const rawLevel = data.onChain?.level ?? data.database.level;
  const level = rawLevel === 0 ? 1 : rawLevel;

  const currentLevelXP = xpForLevel(level);
  const nextLevelXP = xpForLevel(level + 1);
  const xpInCurrentLevel = xp - currentLevelXP;
  const xpNeededForNextLevel = nextLevelXP - currentLevelXP;

  const progress = xpNeededForNextLevel > 0
    ? Math.min(100, Math.round((xpInCurrentLevel / xpNeededForNextLevel) * 100))
    : 100;

  return {
    progress,
    currentXP: xpInCurrentLevel,
    nextLevelXP: xpNeededForNextLevel,
    totalXP: xp,
    level,
    rank: data.onChain?.rank ?? 0,
  };
}

/**
 * Calculate level from XP
 */
export function calculateLevelFromXP(xp: number): number {
  if (xp === 0) return 1;
  let level = 1;
  while (100 * level * level <= xp && level < 100) {
    level++;
  }
  return level;
}

/**
 * Calculate XP needed for a specific level
 */
export function xpForLevel(level: number): number {
  return 100 * level * level;
}
