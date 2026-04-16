import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/auth/session"

// Report reasons
const VALID_REASONS = [
  'spam',
  'harassment',
  'hate_speech',
  'violence',
  'adult_content',
  'misinformation',
  'impersonation',
  'scam',
  'other',
]

// POST - Create a content report
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { content_type, content_id, reason, details } = body

    // Validate content type
    if (!['post', 'comment', 'user', 'group', 'message'].includes(content_type)) {
      return NextResponse.json(
        { error: "Invalid content type" },
        { status: 400 }
      )
    }

    // Validate reason
    if (!reason || !VALID_REASONS.includes(reason)) {
      return NextResponse.json(
        { error: "Invalid report reason", validReasons: VALID_REASONS },
        { status: 400 }
      )
    }

    if (!content_id) {
      return NextResponse.json(
        { error: "Content ID is required" },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    // Check if user already reported this content
    const { data: existingReport } = await (supabase as any)
      .from('content_reports')
      .select('id')
      .eq('reporter_id', session.userId)
      .eq('content_type', content_type)
      .eq('content_id', content_id)
      .single()

    if (existingReport) {
      return NextResponse.json(
        { error: "You have already reported this content" },
        { status: 409 }
      )
    }

    // Create report
    const { data: report, error } = await (supabase as any)
      .from('content_reports')
      .insert({
        reporter_id: session.userId,
        content_type,
        content_id,
        reason,
        details: details?.substring(0, 1000) || null, // Limit details length
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating report:", error)
      return NextResponse.json(
        { error: "Failed to submit report" },
        { status: 500 }
      )
    }

    // If this content has received multiple reports, auto-flag it
    const { count } = await (supabase as any)
      .from('content_reports')
      .select('id', { count: 'exact', head: true })
      .eq('content_type', content_type)
      .eq('content_id', content_id)
      .eq('status', 'pending')

    // Auto-flag if 3+ reports
    if (count >= 3) {
      if (content_type === 'post') {
        (supabase as any)
          .from('posts')
          .update({ is_flagged: true })
          .eq('id', content_id)
          .then(() => {})
          .catch(console.error)
      } else if (content_type === 'comment') {
        (supabase as any)
          .from('comments')
          .update({ is_flagged: true })
          .eq('id', content_id)
          .then(() => {})
          .catch(console.error)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Thank you for your report. Our team will review it shortly.",
      reportId: report.id,
    })
  } catch (error) {
    console.error("Error in reports POST:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET - Get user's own reports
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50)
    const offset = parseInt(searchParams.get("offset") || "0")

    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const { data: reports, error, count } = await (supabase as any)
      .from('content_reports')
      .select('*', { count: 'exact' })
      .eq('reporter_id', session.userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error("Error fetching reports:", error)
      return NextResponse.json(
        { error: "Failed to fetch reports" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      reports,
      total: count || 0,
    })
  } catch (error) {
    console.error("Error in reports GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
