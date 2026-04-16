"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/components/AuthContext"

interface User {
  id: string
  display_name: string
  avatar_url: string
  level: number
}

interface Like {
  id: string
  created_at: string
  user: User
}

interface Comment {
  id: string
  content: string
  created_at: string
  user: User
}

interface LikesResponse {
  likes: Like[]
  count: number
  liked_by_user: boolean
}

interface CommentsResponse {
  comments: Comment[]
  total: number
  page: number
  limit: number
}

// Demo data
const demoLikes: Like[] = [
  {
    id: "1",
    created_at: new Date().toISOString(),
    user: {
      id: "demo-1",
      display_name: "CryptoFan",
      avatar_url: "/images/avatars/avatar_02.png",
      level: 23,
    },
  },
  {
    id: "2",
    created_at: new Date().toISOString(),
    user: {
      id: "demo-2",
      display_name: "Web3Builder",
      avatar_url: "/images/avatars/avatar_03.png",
      level: 45,
    },
  },
]

const demoComments: Comment[] = [
  {
    id: "1",
    content: "This is amazing!",
    created_at: new Date().toISOString(),
    user: {
      id: "demo-1",
      display_name: "CryptoFan",
      avatar_url: "/images/avatars/avatar_02.png",
      level: 23,
    },
  },
]

export function usePostLikes(postId: string) {
  const { isAuthenticated } = useAuth()

  return useQuery({
    queryKey: ["post-likes", postId, isAuthenticated],
    queryFn: async (): Promise<LikesResponse> => {
      // Show demo likes for unauthenticated users
      if (!isAuthenticated) {
        return {
          likes: demoLikes,
          count: demoLikes.length,
          liked_by_user: true,
        }
      }

      const response = await fetch(`/api/posts/${postId}/likes`, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch likes")
      }

      return response.json()
    },
    enabled: !!postId,
  })
}

export function useLikePost() {
  const queryClient = useQueryClient()
  const { isAuthenticated, user } = useAuth()

  return useMutation({
    mutationFn: async (postId: string) => {
      if (!isAuthenticated) {
        throw new Error("Must be logged in to like posts")
      }

      const response = await fetch(`/api/posts/${postId}/likes`, {
        method: "POST",
        credentials: "include",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to like post")
      }

      return response.json()
    },
    // Optimistic update
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ["post-likes", postId] })
      const previousLikes = queryClient.getQueryData<LikesResponse>(["post-likes", postId])

      queryClient.setQueryData<LikesResponse>(["post-likes", postId], (old) => {
        if (!old) return old
        return {
          ...old,
          count: old.count + 1,
          liked_by_user: true,
          likes: [
            {
              id: `temp-${Date.now()}`,
              created_at: new Date().toISOString(),
              user: {
                id: user?.id || "",
                display_name: user?.name || "",
                avatar_url: user?.avatar || "/images/avatars/avatar_01.png",
                level: user?.level || 1,
              },
            },
            ...old.likes,
          ],
        }
      })

      return { previousLikes }
    },
    onError: (_, postId, context) => {
      if (context?.previousLikes) {
        queryClient.setQueryData(["post-likes", postId], context.previousLikes)
      }
    },
    onSettled: (_, __, postId) => {
      queryClient.invalidateQueries({ queryKey: ["post-likes", postId] })
      queryClient.invalidateQueries({ queryKey: ["posts"] })
      queryClient.invalidateQueries({ queryKey: ["post", postId] })
    },
  })
}

export function useUnlikePost() {
  const queryClient = useQueryClient()
  const { isAuthenticated, user } = useAuth()

  return useMutation({
    mutationFn: async (postId: string) => {
      if (!isAuthenticated) {
        throw new Error("Must be logged in to unlike posts")
      }

      const response = await fetch(`/api/posts/${postId}/likes`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to unlike post")
      }

      return response.json()
    },
    // Optimistic update
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ["post-likes", postId] })
      const previousLikes = queryClient.getQueryData<LikesResponse>(["post-likes", postId])

      queryClient.setQueryData<LikesResponse>(["post-likes", postId], (old) => {
        if (!old) return old
        return {
          ...old,
          count: Math.max(0, old.count - 1),
          liked_by_user: false,
          likes: old.likes.filter((like) => like.user.id !== user?.id),
        }
      })

      return { previousLikes }
    },
    onError: (_, postId, context) => {
      if (context?.previousLikes) {
        queryClient.setQueryData(["post-likes", postId], context.previousLikes)
      }
    },
    onSettled: (_, __, postId) => {
      queryClient.invalidateQueries({ queryKey: ["post-likes", postId] })
      queryClient.invalidateQueries({ queryKey: ["posts"] })
      queryClient.invalidateQueries({ queryKey: ["post", postId] })
    },
  })
}

export function usePostComments(postId: string, options?: { page?: number; limit?: number }) {
  const { isAuthenticated } = useAuth()

  return useQuery({
    queryKey: ["post-comments", postId, options, isAuthenticated],
    queryFn: async (): Promise<CommentsResponse> => {
      // Show demo comments for unauthenticated users
      if (!isAuthenticated) {
        return {
          comments: demoComments,
          total: demoComments.length,
          page: options?.page || 1,
          limit: options?.limit || 20,
        }
      }

      const params = new URLSearchParams()
      if (options?.page) params.set("page", String(options.page))
      if (options?.limit) params.set("limit", String(options.limit))

      const response = await fetch(`/api/posts/${postId}/comments?${params}`, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch comments")
      }

      return response.json()
    },
    enabled: !!postId,
  })
}

export function useCreateComment() {
  const queryClient = useQueryClient()
  const { isAuthenticated, user } = useAuth()

  return useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      if (!isAuthenticated) {
        throw new Error("Must be logged in to create comments")
      }

      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create comment")
      }

      return response.json()
    },
    // Optimistic update
    onMutate: async ({ postId, content }) => {
      await queryClient.cancelQueries({ queryKey: ["post-comments", postId] })
      const previousComments = queryClient.getQueryData<CommentsResponse>(["post-comments", postId])

      const optimisticComment: Comment = {
        id: `temp-${Date.now()}`,
        content,
        created_at: new Date().toISOString(),
        user: {
          id: user?.id || "",
          display_name: user?.name || "",
          avatar_url: user?.avatar || "/images/avatars/avatar_01.png",
          level: user?.level || 1,
        },
      }

      queryClient.setQueryData<CommentsResponse>(["post-comments", postId], (old) => {
        if (!old) return old
        return {
          ...old,
          total: old.total + 1,
          comments: [...old.comments, optimisticComment],
        }
      })

      return { previousComments }
    },
    onError: (_, { postId }, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(["post-comments", postId], context.previousComments)
      }
    },
    onSettled: (_, __, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ["post-comments", postId] })
      queryClient.invalidateQueries({ queryKey: ["posts"] })
      queryClient.invalidateQueries({ queryKey: ["post", postId] })
    },
  })
}

export function useDeleteComment() {
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuth()

  return useMutation({
    mutationFn: async ({ postId, commentId }: { postId: string; commentId: string }) => {
      if (!isAuthenticated) {
        throw new Error("Must be logged in to delete comments")
      }

      const response = await fetch(`/api/posts/${postId}/comments?commentId=${commentId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete comment")
      }

      return response.json()
    },
    // Optimistic update
    onMutate: async ({ postId, commentId }) => {
      await queryClient.cancelQueries({ queryKey: ["post-comments", postId] })
      const previousComments = queryClient.getQueryData<CommentsResponse>(["post-comments", postId])

      queryClient.setQueryData<CommentsResponse>(["post-comments", postId], (old) => {
        if (!old) return old
        return {
          ...old,
          total: Math.max(0, old.total - 1),
          comments: old.comments.filter((c) => c.id !== commentId),
        }
      })

      return { previousComments }
    },
    onError: (_, { postId }, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(["post-comments", postId], context.previousComments)
      }
    },
    onSettled: (_, __, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ["post-comments", postId] })
      queryClient.invalidateQueries({ queryKey: ["posts"] })
      queryClient.invalidateQueries({ queryKey: ["post", postId] })
    },
  })
}
