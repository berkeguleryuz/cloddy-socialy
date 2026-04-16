import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { createClient } from "@/lib/supabase/server"

interface ErrorLog {
  message: string
  stack?: string
  componentStack?: string
  url?: string
  userAgent?: string
  timestamp?: string
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    const body = (await request.json()) as ErrorLog

    // Log to console for development
    console.error("[Client Error]", {
      userId: session?.userId,
      message: body.message,
      url: body.url,
      timestamp: body.timestamp,
    })

    // Try to log to database
    const supabase = await createClient()
    if (supabase) {
      await (supabase as any)
        .from("error_logs")
        .insert({
          user_id: session?.userId || null,
          message: body.message?.substring(0, 1000), // Limit message length
          stack: body.stack?.substring(0, 5000),
          component_stack: body.componentStack?.substring(0, 5000),
          url: body.url?.substring(0, 500),
          user_agent: body.userAgent?.substring(0, 500),
          metadata: {
            timestamp: body.timestamp,
            environment: process.env.NODE_ENV,
          },
        })
        .then(() => {})
        .catch(console.error)
    }

    // If Sentry DSN is configured, forward the error
    if (process.env.SENTRY_DSN) {
      // Sentry server-side logging would go here
      // This is a simplified version - in production you'd use @sentry/nextjs
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error logging error:", error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
