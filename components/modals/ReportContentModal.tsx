"use client"

import { useState, memo } from "react"
import { useMutation } from "@tanstack/react-query"
import { useAuth } from "@/components/AuthContext"

interface ReportContentModalProps {
  isOpen: boolean
  onClose: () => void
  contentType: "post" | "comment" | "user" | "group" | "message"
  contentId: string
  contentPreview?: string
}

const REPORT_REASONS = [
  { value: "spam", label: "Spam", description: "Repetitive or promotional content" },
  { value: "harassment", label: "Harassment", description: "Bullying or targeting someone" },
  { value: "hate_speech", label: "Hate Speech", description: "Attacks based on identity" },
  { value: "violence", label: "Violence", description: "Violent or threatening content" },
  { value: "adult_content", label: "Adult Content", description: "Nudity or sexual content" },
  { value: "misinformation", label: "Misinformation", description: "False or misleading information" },
  { value: "impersonation", label: "Impersonation", description: "Pretending to be someone else" },
  { value: "scam", label: "Scam/Fraud", description: "Attempting to deceive or steal" },
  { value: "other", label: "Other", description: "Something else not listed" },
]

const ReportContentModal = memo(function ReportContentModal({
  isOpen,
  onClose,
  contentType,
  contentId,
  contentPreview,
}: ReportContentModalProps) {
  const { isDemo } = useAuth()
  const [selectedReason, setSelectedReason] = useState("")
  const [details, setDetails] = useState("")
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reportMutation = useMutation({
    mutationFn: async (data: { content_type: string; content_id: string; reason: string; details: string }) => {
      if (isDemo) {
        await new Promise(resolve => setTimeout(resolve, 500))
        return { success: true, reportId: `demo-report-${Date.now()}` }
      }

      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to submit report")
      }

      return response.json()
    },
    onSuccess: () => {
      setSuccess(true)
      setTimeout(() => {
        onClose()
        setSuccess(false)
        setSelectedReason("")
        setDetails("")
      }, 2000)
    },
    onError: (err: Error) => {
      setError(err.message)
    },
  })

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!selectedReason) {
      setError("Please select a reason for your report")
      return
    }

    reportMutation.mutate({
      content_type: contentType,
      content_id: contentId,
      reason: selectedReason,
      details: details.trim(),
    })
  }

  const contentTypeLabel = {
    post: "Post",
    comment: "Comment",
    user: "User",
    group: "Group",
    message: "Message",
  }[contentType]

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="widget-box w-full max-w-md animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-red/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-accent-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-black text-white">Report {contentTypeLabel}</h2>
                <p className="text-text-muted text-xs">Help us keep the community safe</p>
              </div>
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
              <h3 className="text-lg font-bold text-white mb-2">Report Submitted</h3>
              <p className="text-text-muted text-sm">Thank you for helping keep our community safe.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Content Preview */}
              {contentPreview && (
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-xs text-text-muted font-bold uppercase mb-1">Reported Content</p>
                  <p className="text-sm text-white line-clamp-2">{contentPreview}</p>
                </div>
              )}

              {/* Reason Selection */}
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
                  Why are you reporting this?
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {REPORT_REASONS.map((reason) => (
                    <label
                      key={reason.value}
                      className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                        selectedReason === reason.value
                          ? "bg-primary/20 border border-primary/50"
                          : "bg-white/5 border border-transparent hover:bg-white/10"
                      }`}
                    >
                      <input
                        type="radio"
                        name="reason"
                        value={reason.value}
                        checked={selectedReason === reason.value}
                        onChange={(e) => setSelectedReason(e.target.value)}
                        className="sr-only"
                      />
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                          selectedReason === reason.value
                            ? "border-primary bg-primary"
                            : "border-text-muted"
                        }`}
                      >
                        {selectedReason === reason.value && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{reason.label}</p>
                        <p className="text-xs text-text-muted">{reason.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Additional Details */}
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                  Additional Details (Optional)
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted focus:outline-none focus:border-primary transition-all resize-none"
                  placeholder="Provide more context if needed..."
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-text-muted mt-1 text-right">{details.length}/500</p>
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={reportMutation.isPending || !selectedReason}
                  className="w-full py-4 bg-accent-red text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {reportMutation.isPending ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    "Submit Report"
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

export default ReportContentModal
