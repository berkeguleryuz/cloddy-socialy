"use client"

import { useState, useRef, memo } from "react"
import Image from "next/image"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "./AuthContext"

interface CreatePostFormProps {
  onSuccess?: () => void
}

const CreatePostForm = memo(function CreatePostForm({ onSuccess }: CreatePostFormProps) {
  const { user, isDemo } = useAuth()
  const queryClient = useQueryClient()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [content, setContent] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)
  const [postType, setPostType] = useState<"text" | "image" | "video" | "poll">("text")
  const [visibility, setVisibility] = useState<"public" | "friends" | "private">("public")
  const [error, setError] = useState<string | null>(null)

  const createPostMutation = useMutation({
    mutationFn: async (data: { content: string; post_type: string; visibility: string }) => {
      if (isDemo) {
        // Simulate API call in demo mode
        await new Promise(resolve => setTimeout(resolve, 500))
        return { post: { id: `demo-${Date.now()}`, ...data } }
      }

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create post")
      }

      return response.json()
    },
    onSuccess: () => {
      setContent("")
      setIsExpanded(false)
      setError(null)
      queryClient.invalidateQueries({ queryKey: ["posts"] })
      onSuccess?.()
    },
    onError: (err: Error) => {
      setError(err.message)
    },
  })

  const handleSubmit = () => {
    if (!content.trim()) {
      setError("Please write something before posting")
      return
    }

    if (content.length > 5000) {
      setError("Post is too long (max 5000 characters)")
      return
    }

    setError(null)
    createPostMutation.mutate({
      content: content.trim(),
      post_type: postType,
      visibility,
    })
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 300)}px`
    }
  }

  return (
    <div className="widget-box p-4">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0">
          <Image
            src={user?.avatar && user.avatar.trim() !== "" ? user.avatar : "/images/avatars/avatar_01.png"}
            alt="Your avatar"
            fill
            className="object-cover"
          />
        </div>

        {/* Content area */}
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleTextareaChange}
            onFocus={() => setIsExpanded(true)}
            placeholder="What's on your mind?"
            className="w-full bg-transparent text-white placeholder-text-muted resize-none focus:outline-none text-base min-h-[44px]"
            rows={1}
          />

          {/* Error message */}
          {error && (
            <div className="mt-2 p-2 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Expanded options */}
          {isExpanded && (
            <div className="mt-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
              {/* Post type buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPostType("text")}
                  className={`p-2 rounded-lg transition-colors ${
                    postType === "text"
                      ? "bg-primary/20 text-primary"
                      : "bg-white/5 text-text-muted hover:text-white"
                  }`}
                  title="Text post"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                </button>
                <button
                  onClick={() => setPostType("image")}
                  className={`p-2 rounded-lg transition-colors ${
                    postType === "image"
                      ? "bg-secondary/20 text-secondary"
                      : "bg-white/5 text-text-muted hover:text-white"
                  }`}
                  title="Photo"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setPostType("video")}
                  className={`p-2 rounded-lg transition-colors ${
                    postType === "video"
                      ? "bg-accent-blue/20 text-accent-blue"
                      : "bg-white/5 text-text-muted hover:text-white"
                  }`}
                  title="Video"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setPostType("poll")}
                  className={`p-2 rounded-lg transition-colors ${
                    postType === "poll"
                      ? "bg-accent-orange/20 text-accent-orange"
                      : "bg-white/5 text-text-muted hover:text-white"
                  }`}
                  title="Poll"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </button>

                <div className="flex-1" />

                {/* Visibility selector */}
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as typeof visibility)}
                  className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="public">🌍 Public</option>
                  <option value="friends">👥 Friends</option>
                  <option value="private">🔒 Only me</option>
                </select>
              </div>

              {/* Character count & submit */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <span className={`text-xs ${content.length > 4500 ? "text-accent-orange" : "text-text-muted"}`}>
                  {content.length}/5000
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsExpanded(false)
                      setContent("")
                      setError(null)
                    }}
                    className="px-4 py-2 text-sm text-text-muted hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={createPostMutation.isPending || !content.trim()}
                    className="px-6 py-2 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {createPostMutation.isPending ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Posting...
                      </>
                    ) : (
                      "Post"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

export default CreatePostForm
