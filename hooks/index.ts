// Re-export all hooks

// User hooks
export { useUser, useCurrentUser } from "./useUser"
export { useUserSearch, useUserProfile } from "./useUserSearch"

// Posts hooks
export { usePosts, usePost } from "./usePosts"

// Post interactions hooks
export {
  usePostLikes,
  useLikePost,
  useUnlikePost,
  usePostComments,
  useCreateComment,
  useDeleteComment,
} from "./usePostInteractions"

// Friends hooks
export { useFriends } from "./useFriends"

// Groups hooks
export {
  useGroups,
  useGroup,
  useCreateGroup,
  useJoinGroup,
  useLeaveGroup,
} from "./useGroups"

// Events hooks
export {
  useEvents,
  useEvent,
  useCreateEvent,
  useRespondToEvent,
  useCancelEventResponse,
} from "./useEvents"

// Notifications hooks
export { useNotifications } from "./useNotifications"

// Messages hooks
export {
  useConversations,
  useMessages,
  useSendMessage,
  useChat,
} from "./useMessages"

// Streams hooks
export {
  useStreams,
  useCreateStream,
  useGoLive,
  useEndStream,
  useMyStream,
} from "./useStreams"

// Realtime hooks
export {
  useRealtimeSubscription,
  useMultipleRealtimeSubscriptions,
  usePresence,
  useRealtimeNotifications,
  useRealtimeFriendActivity,
} from "./useRealtime"

// Badges and XP hooks
export { useBadges, useUserBadges, useXP } from "./useBadges"

// XP Sync hooks
export {
  useXPSync,
  useAddXP,
  useXPProgress,
  calculateLevelFromXP,
  xpForLevel,
  XP_REWARDS,
} from "./useXPSync"
export type { XPAction } from "./useXPSync"

// Quests hooks
export {
  useQuests,
  useDailyQuests,
  useWeeklyQuests,
  useAchievements,
  useQuestStats,
  useClaimQuest,
  useQuestReset,
} from "./useQuests"

// Toast hooks
export {
  useToast,
  toast,
  showApiError,
  showApiSuccess,
} from "./useToast"

// Search hooks
export { useSearch } from "./useSearch"
export type { SearchResult, SearchType } from "./useSearch"

// Profile completion hooks
export { useProfileCompletion } from "./useProfileCompletion"

// Contract hooks (Web3)
export {
  // Token
  useTokenBalance,
  useStakedBalance,
  usePendingRewards,
  useTotalStaked,
  // Profile
  useHasProfile,
  useProfileTokenId,
  useProfile,
  useCreateProfile,
  // Badges
  useHasBadge,
  useUserBadges as useUserBadgesOnChain,
  useBadgeInfo,
  useBadgeHolderCount,
  useMintBadge,
  // Reputation/XP
  useXP as useOnChainXP,
  useLevel,
  useUserRank,
  useXPForNextLevel,
  useLeaderboard,
  // Staking
  useStake,
  useUnstake,
  useClaimRewards,
  useStakeInfo,
  useStakingTimestamp,
  // Marketplace
  useListing,
  useNextListingId,
  usePlatformFee,
  useListERC721,
  useListERC1155,
  useBuyWithETH,
  useBuyWithToken,
  useCancelListing,
  // Token Gate
  useCheckGateAccess,
  useGate,
  useGateRequirements,
  useGateRequirement,
  // Equippable
  useEquippedAccessories,
  useAccessoryInfo,
  useAccessoryType,
  useMintAccessory,
  useEquipAccessory,
  useUnequipAccessory,
  // Contract addresses
  CONTRACT_ADDRESSES,
} from "./useContracts"
