"use client"

import { useState, memo } from "react"
import Image from "next/image"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/components/AuthContext"

interface CreateGroupModalProps {
  isOpen: boolean
  onClose: () => void
}

const CATEGORIES = [
  "Gaming",
  "Streaming",
  "Cosplay",
  "Anime",
  "Art",
  "Technology",
  "Music",
  "Esports",
  "Photography",
  "General",
]

const CreateGroupModal = memo(function CreateGroupModal({ isOpen, onClose }: CreateGroupModalProps) {
  const { isDemo } = useAuth()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "General",
    isPrivate: false,
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const createGroupMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (isDemo) {
        await new Promise(resolve => setTimeout(resolve, 500))
        return { group: { id: `demo-group-${Date.now()}`, ...data } }
      }

      const response = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create group")
      }

      return response.json()
    },
    onSuccess: () => {
      setSuccess(true)
      queryClient.invalidateQueries({ queryKey: ["groups"] })
      setTimeout(() => {
        onClose()
        setSuccess(false)
        setFormData({ name: "", description: "", category: "General", isPrivate: false })
      }, 1500)
    },
    onError: (err: Error) => {
      setError(err.message)
    },
  })

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.name.trim()) {
      setError("Group name is required")
      return
    }

    if (formData.name.length < 3) {
      setError("Group name must be at least 3 characters")
      return
    }

    if (formData.description.length > 500) {
      setError("Description is too long (max 500 characters)")
      return
    }

    createGroupMutation.mutate(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="widget-box w-full max-w-lg animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-white">Create New Group</h2>
              <p className="text-text-muted text-sm mt-1">Start a community around your interests</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 text-text-muted hover:text-white hover:bg-white/20 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Group Created!</h3>
              <p className="text-text-muted text-sm">Your group is now live.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Group Name */}
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                  Group Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted focus:outline-none focus:border-primary transition-all"
                  placeholder="Enter group name..."
                  maxLength={100}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted focus:outline-none focus:border-primary transition-all resize-none"
                  placeholder="What's your group about?"
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-text-muted mt-1 text-right">{formData.description.length}/500</p>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary transition-all cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Privacy Toggle */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div>
                  <p className="text-white font-medium">Private Group</p>
                  <p className="text-text-muted text-sm">Only approved members can see content</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isPrivate: !formData.isPrivate })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    formData.isPrivate ? "bg-primary" : "bg-white/20"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      formData.isPrivate ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={createGroupMutation.isPending}
                  className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {createGroupMutation.isPending ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Creating...
                    </>
                  ) : (
                    "Create Group"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
})

export default CreateGroupModal
