"use client"

import { Component, ReactNode } from "react"

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo })

    // Log to console in development
    console.error("ErrorBoundary caught an error:", error, errorInfo)

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)

    // Log to external service (Sentry, etc.) if configured
    if (typeof window !== "undefined" && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        extra: { componentStack: errorInfo.componentStack },
      })
    }

    // Also try to log to our API for server-side logging
    this.logErrorToServer(error, errorInfo)
  }

  private async logErrorToServer(error: Error, errorInfo: React.ErrorInfo) {
    try {
      await fetch("/api/logs/error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          url: typeof window !== "undefined" ? window.location.href : "",
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
          timestamp: new Date().toISOString(),
        }),
      })
    } catch {
      // Silently fail if logging fails
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="widget-box max-w-md w-full p-8 text-center">
            {/* Error Icon */}
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent-red/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-accent-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            {/* Error Message */}
            <h2 className="text-xl font-black text-white mb-2">Something went wrong</h2>
            <p className="text-text-muted mb-6">
              We encountered an unexpected error. Our team has been notified.
            </p>

            {/* Error Details (only in development) */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="mb-6 p-4 bg-background rounded-xl text-left overflow-auto max-h-40">
                <p className="text-accent-red text-sm font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/80 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

// Hook for functional components
import { useState, useCallback } from "react"

export function useErrorHandler() {
  const [error, setError] = useState<Error | null>(null)

  const handleError = useCallback((error: Error) => {
    setError(error)
    console.error("Error caught by useErrorHandler:", error)

    // Log to server
    fetch("/api/logs/error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        url: typeof window !== "undefined" ? window.location.href : "",
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {})
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return { error, handleError, clearError }
}
