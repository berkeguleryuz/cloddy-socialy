import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { createClient } from "@/lib/supabase/server"

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024

// Allowed MIME types
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const bucket = (formData.get("bucket") as string) || "uploads"
    const folder = (formData.get("folder") as string) || "images"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, GIF, and WebP images are allowed" },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ error: "Storage not configured" }, { status: 503 })
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop()
    const fileName = `${session.userId}/${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const { data, error } = await (supabase as any).storage
      .from(bucket)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      console.error("Upload error:", error)
      return NextResponse.json({ error: "Upload failed" }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = (supabase as any).storage
      .from(bucket)
      .getPublicUrl(data.path)

    return NextResponse.json({
      url: urlData.publicUrl,
      path: data.path,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}

// DELETE endpoint for removing files
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const path = searchParams.get("path")
    const bucket = searchParams.get("bucket") || "uploads"

    if (!path) {
      return NextResponse.json({ error: "No path provided" }, { status: 400 })
    }

    // Security: Only allow users to delete their own files
    if (!path.startsWith(session.userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ error: "Storage not configured" }, { status: 503 })
    }

    const { error } = await (supabase as any).storage
      .from(bucket)
      .remove([path])

    if (error) {
      console.error("Delete error:", error)
      return NextResponse.json({ error: "Delete failed" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  }
}
