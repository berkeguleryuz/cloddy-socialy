"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/components/AuthContext"
import { createClient } from "@/lib/supabase/client"

// Demo posts data
const demoPosts = [
  {
    id: "1",
    author_id: "demo-user",
    post_type: "text",
    content:
      "Just finished my new gaming setup! The RGB lighting is absolutely insane. Can't wait to stream tonight and show it off to everyone!",
    visibility: "public",
    likes_count: 87,
    comments_count: 23,
    shares_count: 5,
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    author: {
      id: "demo-user",
      display_name: "Marina Valentine",
      avatar_url: "/images/avatars/avatar_01.png",
      level: 24,
    },
  },
  {
    id: "2",
    author_id: "demo-user-2",
    post_type: "video",
    content:
      "Check out my latest video of the sandbox expansion for Cosmo Slime! Don't forget to like and subscribe!",
    visibility: "public",
    likes_count: 342,
    comments_count: 89,
    shares_count: 24,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    author: {
      id: "demo-user-2",
      display_name: "Neko Bebop",
      avatar_url: "/images/avatars/avatar_03.png",
      level: 16,
    },
  },
  {
    id: "3",
    author_id: "demo-user-3",
    post_type: "poll",
    content: "Which game should I stream this weekend?",
    visibility: "public",
    likes_count: 45,
    comments_count: 32,
    shares_count: 8,
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    author: {
      id: "demo-user-3",
      display_name: "Sarah Diamond",
      avatar_url: "/images/avatars/avatar_08.png",
      level: 19,
    },
  },
]

interface CreatePostInput {
  content: string
  postType?: string
  visibility?: string
  media?: { type: string; url: string }[]
}

export function usePosts() {
  const { isDemo, isAuthenticated, user } = useAuth()
  const supabase = createClient()
  const queryClient = useQueryClient()

  // Fetch posts - query runs for both authenticated and unauthenticated
  const {
    data: posts,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["posts", isAuthenticated],
    queryFn: async () => {
      // Only show demo posts for unauthenticated users
      if (!isAuthenticated) {
        return demoPosts
      }

      // For authenticated users, fetch real data from database
      const { data, error } = await (supabase as any)
        .from("posts")
        .select(
          `
          *,
          author:users(id, display_name, avatar_url, level)
        `
        )
        .order("created_at", { ascending: false })
        .limit(20)

      if (error) throw error
      return data || []
    },
  })

  // Create post
  const createPost = useMutation({
    mutationFn: async (input: CreatePostInput) => {
      if (!isAuthenticated || !user) {
        throw new Error("Must be logged in to create posts")
      }

      const { data, error } = await (supabase as any)
        .from("posts")
        .insert({
          author_id: user.id,
          content: input.content,
          post_type: input.postType || "text",
          visibility: input.visibility || "public",
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] })
    },
  })

  // Like post with optimistic update
  const likePost = useMutation({
    mutationFn: async (postId: string) => {
      if (!isAuthenticated || !user) {
        throw new Error("Must be logged in to like posts")
      }

      const { data, error } = await (supabase as any)
        .from("likes")
        .insert({
          user_id: user.id,
          likeable_type: "post",
          likeable_id: postId,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] })
      const previousPosts = queryClient.getQueryData(["posts"])

      queryClient.setQueryData(["posts"], (old: typeof demoPosts | undefined) => {
        if (!old) return old
        return old.map((post) =>
          post.id === postId
            ? { ...post, likes_count: post.likes_count + 1 }
            : post
        )
      })

      return { previousPosts }
    },
    onError: (_, __, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts"], context.previousPosts)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] })
    },
  })

  // Unlike post with optimistic update
  const unlikePost = useMutation({
    mutationFn: async (postId: string) => {
      if (!isAuthenticated || !user) {
        throw new Error("Must be logged in to unlike posts")
      }

      const { error } = await (supabase as any)
        .from("likes")
        .delete()
        .eq("user_id", user.id)
        .eq("likeable_type", "post")
        .eq("likeable_id", postId)

      if (error) throw error
    },
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] })
      const previousPosts = queryClient.getQueryData(["posts"])

      queryClient.setQueryData(["posts"], (old: typeof demoPosts | undefined) => {
        if (!old) return old
        return old.map((post) =>
          post.id === postId
            ? { ...post, likes_count: Math.max(0, post.likes_count - 1) }
            : post
        )
      })

      return { previousPosts }
    },
    onError: (_, __, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts"], context.previousPosts)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] })
    },
  })

  // Delete post
  const deletePost = useMutation({
    mutationFn: async (postId: string) => {
      if (!isAuthenticated) {
        throw new Error("Must be logged in to delete posts")
      }

      const { error } = await (supabase as any)
        .from("posts")
        .delete()
        .eq("id", postId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] })
    },
  })

  return {
    posts,
    isLoading,
    error,
    refetch,
    createPost: createPost.mutate,
    isCreating: createPost.isPending,
    likePost: likePost.mutate,
    unlikePost: unlikePost.mutate,
    deletePost: deletePost.mutate,
  }
}

export function usePost(postId: string) {
  const { isAuthenticated } = useAuth()
  const supabase = createClient()

  const { data: post, isLoading, error } = useQuery({
    queryKey: ["post", postId],
    queryFn: async () => {
      // For unauthenticated users, return demo post
      if (!isAuthenticated) {
        return demoPosts.find((p) => p.id === postId) || null
      }

      const { data, error } = await (supabase as any)
        .from("posts")
        .select(
          `
          *,
          author:users(id, display_name, avatar_url, level),
          media:post_media(*),
          poll_options(*)
        `
        )
        .eq("id", postId)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!postId,
  })

  return { post, isLoading, error }
}
