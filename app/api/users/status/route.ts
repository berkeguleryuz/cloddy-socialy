import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

// POST - Update user online status (supports sendBeacon)
export async function POST(request: NextRequest) {
  try {
    // Parse body - might be text from sendBeacon
    let body
    const contentType = request.headers.get("content-type")

    if (contentType?.includes("text/plain")) {
      const text = await request.text()
      body = JSON.parse(text)
    } else {
      body = await request.json()
    }

    const { user_id, is_online } = body

    if (!user_id) {
      return NextResponse.json({ error: "user_id required" }, { status: 400 })
    }

    const supabase = await createAdminClient()
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    await (supabase as any)
      .from("users")
      .update({
        is_online: is_online ?? false,
        last_seen_at: new Date().toISOString(),
      })
      .eq("id", user_id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating status:", error)
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 })
  }
}
