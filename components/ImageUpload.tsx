"use client"

import { useState, useRef, useCallback, memo } from "react"
import Image from "next/image"

interface ImageUploadProps {
  value?: string | null
  onChange: (url: string | null) => void
  bucket?: string
  folder?: string
  aspectRatio?: "square" | "cover" | "avatar"
  maxSizeMB?: number
  className?: string
  placeholder?: string
  disabled?: boolean
}

const ImageUpload = memo(function ImageUpload({
  value,
  onChange,
  bucket = "uploads",
  folder = "images",
  aspectRatio = "square",
  maxSizeMB = 5,
  className = "",
  placeholder = "Click or drag to upload",
  disabled = false,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const aspectClasses = {
    square: "aspect-square",
    cover: "aspect-video",
    avatar: "aspect-square rounded-full",
  }

  const validateFile = (file: File): string | null => {
    const maxSize = maxSizeMB * 1024 * 1024
    if (file.size > maxSize) {
      return `File size must be less than ${maxSizeMB}MB`
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return "Only JPEG, PNG, GIF, and WebP images are allowed"
    }

    return null
  }

  const uploadFile = useCallback(async (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setIsUploading(true)
    setProgress(0)

    try {
      // Create form data
      const formData = new FormData()
      formData.append("file", file)
      formData.append("bucket", bucket)
      formData.append("folder", folder)

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90))
      }, 100)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Upload failed")
      }

      const { url } = await response.json()
      setProgress(100)
      onChange(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
      onChange(null)
    } finally {
      setIsUploading(false)
      setTimeout(() => setProgress(0), 500)
    }
  }, [bucket, folder, maxSizeMB, onChange])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadFile(file)
    }
    // Reset input so same file can be selected again
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (disabled) return

    const file = e.dataTransfer.files[0]
    if (file) {
      uploadFile(file)
    }
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(null)
    setError(null)
  }

  return (
    <div className={className}>
      <div
        onClick={() => !disabled && !isUploading && inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative overflow-hidden border-2 border-dashed rounded-xl transition-all cursor-pointer
          ${aspectClasses[aspectRatio]}
          ${isDragging ? "border-primary bg-primary/10" : "border-white/20 hover:border-white/40"}
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          ${value ? "border-solid border-white/10" : ""}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || isUploading}
        />

        {value ? (
          <>
            <Image
              src={value}
              alt="Uploaded image"
              fill
              className={`object-cover ${aspectRatio === "avatar" ? "rounded-full" : ""}`}
            />
            {!disabled && (
              <button
                onClick={handleRemove}
                className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-red-500 rounded-full flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            {isUploading ? (
              <>
                <div className="w-12 h-12 mb-3">
                  <svg className="animate-spin text-primary" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
                <div className="w-full max-w-[120px] h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-text-muted mt-2">Uploading... {progress}%</p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 mb-3 text-text-muted">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm text-text-muted text-center">{placeholder}</p>
                <p className="text-xs text-text-muted/60 mt-1">Max {maxSizeMB}MB • JPEG, PNG, GIF, WebP</p>
              </>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 p-2 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-xs">{error}</p>
        </div>
      )}
    </div>
  )
})

export default ImageUpload
