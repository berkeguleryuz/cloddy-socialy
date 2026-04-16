"use client"

import { createContext, useContext, useMemo, useCallback, ReactNode } from "react"
import { useAuth } from "./AuthContext"
import { usePosts } from "@/hooks/usePosts"
import { useFriends } from "@/hooks/useFriends"
import { useNotifications } from "@/hooks/useNotifications"
import { useGroups } from "@/hooks/useGroups"
import { useEvents } from "@/hooks/useEvents"
import { useBadges, useXP } from "@/hooks/useBadges"
import { demoPosts, emptyPosts } from "@/constants/demoData"

interface DataContextType {
  // Legacy demo posts
  posts: typeof demoPosts | typeof emptyPosts
  isDemo: boolean

  // New API-backed data
  feed: {
    posts: any[]
    isLoading: boolean
    error: Error | null
    refetch: () => void
    createPost: (input: any) => void
    isCreating: boolean
  }
  social: {
    friends: any[]
    friendRequests: any[]
    isLoading: boolean
    sendFriendRequest: (toUserId: string) => void
    acceptFriendRequest: (friendshipId: string) => void
    declineFriendRequest: (friendshipId: string) => void
    removeFriend: (friendshipId: string) => void
  }
  notifications: {
    items: any[]
    unreadCount: number
    isLoading: boolean
    markAsRead: (notificationId: string) => void
    markAllAsRead: () => void
  }
  groups: {
    items: any[]
    isLoading: boolean
  }
  events: {
    items: any[]
    isLoading: boolean
  }
  gamification: {
    badges: any[]
    userBadges: any[]
    isLoading: boolean
    xp: {
      currentXP: number
      currentLevel: number
      progressPercent: number
      xpForNextLevel: number
    }
  }
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const { isDemo, isAuthenticated } = useAuth()

  // Use hooks - all fetching happens in parallel via React Query
  const postsData = usePosts()
  const friendsData = useFriends()
  const notificationsData = useNotifications()
  const groupsData = useGroups()
  const eventsData = useEvents({ upcoming: true })
  const badgesData = useBadges()
  const xpData = useXP()

  // Legacy posts
  const posts = isDemo ? demoPosts : emptyPosts

  // Extract primitive values for stable dependencies
  const postsArray = postsData.posts
  const postsLoading = postsData.isLoading
  const postsError = postsData.error
  const postsCreating = postsData.isCreating

  const friendsArray = friendsData.friends
  const friendRequestsArray = friendsData.friendRequests
  const friendsLoading = friendsData.isLoading

  const notificationsArray = notificationsData.notifications
  const unreadCount = notificationsData.unreadCount
  const notificationsLoading = notificationsData.isLoading

  const groupsArray = groupsData.data?.groups
  const groupsLoading = groupsData.isLoading

  const eventsArray = eventsData.data?.events
  const eventsLoading = eventsData.isLoading

  const badgesArray = badgesData.data?.badges
  const userBadgesArray = badgesData.data?.user_badges
  const badgesLoading = badgesData.isLoading

  const currentXP = xpData.currentXP
  const currentLevel = xpData.currentLevel
  const progressPercent = xpData.progressPercent
  const xpForNextLevel = xpData.xpForNextLevel

  // Memoize callback functions to prevent re-renders
  const refetch = useCallback(() => postsData.refetch(), [postsData.refetch])
  const createPost = useCallback((input: any) => postsData.createPost(input), [postsData.createPost])

  const sendFriendRequest = useCallback((id: string) => friendsData.sendFriendRequest(id), [friendsData.sendFriendRequest])
  const acceptFriendRequest = useCallback((id: string) => friendsData.acceptFriendRequest(id), [friendsData.acceptFriendRequest])
  const declineFriendRequest = useCallback((id: string) => friendsData.declineFriendRequest(id), [friendsData.declineFriendRequest])
  const removeFriend = useCallback((id: string) => friendsData.removeFriend(id), [friendsData.removeFriend])

  const markAsRead = useCallback((id: string) => notificationsData.markAsRead(id), [notificationsData.markAsRead])
  const markAllAsRead = useCallback(() => notificationsData.markAllAsRead(), [notificationsData.markAllAsRead])

  const value = useMemo(
    () => ({
      posts,
      isDemo,

      // Feed
      feed: {
        posts: postsArray || [],
        isLoading: postsLoading,
        error: postsError,
        refetch,
        createPost,
        isCreating: postsCreating,
      },

      // Social
      social: {
        friends: friendsArray || [],
        friendRequests: friendRequestsArray || [],
        isLoading: friendsLoading,
        sendFriendRequest,
        acceptFriendRequest,
        declineFriendRequest,
        removeFriend,
      },

      // Notifications
      notifications: {
        items: notificationsArray || [],
        unreadCount,
        isLoading: notificationsLoading,
        markAsRead,
        markAllAsRead,
      },

      // Groups
      groups: {
        items: groupsArray || [],
        isLoading: groupsLoading,
      },

      // Events
      events: {
        items: eventsArray || [],
        isLoading: eventsLoading,
      },

      // Gamification
      gamification: {
        badges: badgesArray || [],
        userBadges: userBadgesArray || [],
        isLoading: badgesLoading,
        xp: {
          currentXP,
          currentLevel,
          progressPercent,
          xpForNextLevel,
        },
      },
    }),
    [
      posts,
      isDemo,
      // Feed primitives
      postsArray,
      postsLoading,
      postsError,
      refetch,
      createPost,
      postsCreating,
      // Social primitives
      friendsArray,
      friendRequestsArray,
      friendsLoading,
      sendFriendRequest,
      acceptFriendRequest,
      declineFriendRequest,
      removeFriend,
      // Notifications primitives
      notificationsArray,
      unreadCount,
      notificationsLoading,
      markAsRead,
      markAllAsRead,
      // Groups primitives
      groupsArray,
      groupsLoading,
      // Events primitives
      eventsArray,
      eventsLoading,
      // Gamification primitives
      badgesArray,
      userBadgesArray,
      badgesLoading,
      currentXP,
      currentLevel,
      progressPercent,
      xpForNextLevel,
    ]
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}

// Export demo data for direct usage in page.tsx when needed
export { demoPosts, emptyPosts }
