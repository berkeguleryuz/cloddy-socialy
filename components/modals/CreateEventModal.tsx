"use client"

import { useState, memo } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/components/AuthContext"

interface CreateEventModalProps {
  isOpen: boolean
  onClose: () => void
}

const CreateEventModal = memo(function CreateEventModal({ isOpen, onClose }: CreateEventModalProps) {
  const { isDemo } = useAuth()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    location: "",
    isOnline: true,
    maxParticipants: "",
    category: "Gaming",
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const createEventMutation = useMutation({
    mutationFn: async (data: any) => {
      if (isDemo) {
        await new Promise(resolve => setTimeout(resolve, 500))
        return { event: { id: `demo-event-${Date.now()}`, ...data } }
      }

      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create event")
      }

      return response.json()
    },
    onSuccess: () => {
      setSuccess(true)
      queryClient.invalidateQueries({ queryKey: ["events"] })
      setTimeout(() => {
        onClose()
        setSuccess(false)
        setFormData({
          title: "",
          description: "",
          startDate: "",
          startTime: "",
          endDate: "",
          endTime: "",
          location: "",
          isOnline: true,
          maxParticipants: "",
          category: "Gaming",
        })
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

    if (!formData.title.trim()) {
      setError("Event title is required")
      return
    }

    if (!formData.startDate || !formData.startTime) {
      setError("Start date and time are required")
      return
    }

    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`)
    if (startDateTime <= new Date()) {
      setError("Event must be in the future")
      return
    }

    let endDateTime = null
    if (formData.endDate && formData.endTime) {
      endDateTime = new Date(`${formData.endDate}T${formData.endTime}`)
      if (endDateTime <= startDateTime) {
        setError("End time must be after start time")
        return
      }
    }

    createEventMutation.mutate({
      title: formData.title.trim(),
      description: formData.description.trim(),
      start_date: startDateTime.toISOString(),
      end_date: endDateTime?.toISOString() || null,
      location: formData.isOnline ? "Online" : formData.location.trim(),
      is_online: formData.isOnline,
      max_participants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
      category: formData.category,
    })
  }

  // Get today's date for min date
  const today = new Date().toISOString().split("T")[0]

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="widget-box w-full max-w-lg my-8 animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-white">Create New Event</h2>
              <p className="text-text-muted text-sm mt-1">Organize and share your upcoming events</p>
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
              <h3 className="text-lg font-bold text-white mb-2">Event Created!</h3>
              <p className="text-text-muted text-sm">Your event is now published.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Event Title */}
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted focus:outline-none focus:border-primary transition-all"
                  placeholder="What's the event called?"
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
                  placeholder="Tell people about your event..."
                  rows={3}
                  maxLength={1000}
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    min={today}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    min={formData.startDate || today}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Online Toggle */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div>
                  <p className="text-white font-medium">Online Event</p>
                  <p className="text-text-muted text-sm">This event takes place online</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isOnline: !formData.isOnline })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    formData.isOnline ? "bg-primary" : "bg-white/20"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      formData.isOnline ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Location (if not online) */}
              {!formData.isOnline && (
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted focus:outline-none focus:border-primary transition-all"
                    placeholder="Where is the event?"
                  />
                </div>
              )}

              {/* Max Participants */}
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                  Max Participants (optional)
                </label>
                <input
                  type="number"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted focus:outline-none focus:border-primary transition-all"
                  placeholder="Leave empty for unlimited"
                  min="1"
                  max="10000"
                />
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={createEventMutation.isPending}
                  className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {createEventMutation.isPending ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Creating...
                    </>
                  ) : (
                    "Create Event"
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

export default CreateEventModal
