import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/auth/session"

// Search types
type SearchType = "all" | "users" | "posts" | "groups" | "events"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")?.trim()
    const type = (searchParams.get("type") || "all") as SearchType
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50)
    const offset = parseInt(searchParams.get("offset") || "0")
    const fuzzy = searchParams.get("fuzzy") === "true"

    if (!query || query.length < 2) {
      return NextResponse.json({ error: "Search query too short" }, { status: 400 })
    }

    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    // Convert query to tsquery format for full-text search
    const tsQuery = query.split(/\s+/).filter(Boolean).join(" & ")
    const searchPattern = `%${query}%`

    const results: {
      users?: any[]
      posts?: any[]
      groups?: any[]
      events?: any[]
    } = {}

    // Search Users with full-text search + fuzzy fallback
    if (type === "all" || type === "users") {
      let users: any[] = []

      // Try full-text search first
      const { data: ftsUsers } = await (supabase as any)
        .from("users")
        .select("id, display_name, username, avatar_url, level, bio, is_online")
        .textSearch("search_vector", tsQuery, { type: "websearch", config: "english" })
        .is("deleted_at", null)
        .order("level", { ascending: false })
        .range(offset, offset + limit - 1)

      if (ftsUsers && ftsUsers.length > 0) {
        users = ftsUsers
      } else if (fuzzy) {
        // Fallback to trigram similarity for fuzzy matching
        const { data: fuzzyUsers } = await (supabase as any)
          .from("users")
          .select("id, display_name, username, avatar_url, level, bio, is_online")
          .or(`display_name.ilike.${searchPattern},username.ilike.${searchPattern}`)
          .is("deleted_at", null)
          .order("level", { ascending: false })
          .range(offset, offset + limit - 1)
        users = fuzzyUsers || []
      } else {
        // Standard ILIKE fallback
        const { data: iLikeUsers } = await (supabase as any)
          .from("users")
          .select("id, display_name, username, avatar_url, level, bio, is_online")
          .or(`display_name.ilike.${searchPattern},username.ilike.${searchPattern},bio.ilike.${searchPattern}`)
          .is("deleted_at", null)
          .order("level", { ascending: false })
          .range(offset, offset + limit - 1)
        users = iLikeUsers || []
      }

      results.users = users?.map((user: any) => ({
        id: user.id,
        type: "user",
        name: user.display_name || user.username,
        avatar: user.avatar_url,
        level: user.level,
        description: user.bio,
        isOnline: user.is_online,
      })) || []
    }

    // Search Posts with full-text search
    if (type === "all" || type === "posts") {
      let posts: any[] = []

      const { data: ftsPosts } = await (supabase as any)
        .from("posts")
        .select(`
          id,
          content,
          created_at,
          likes_count,
          comments_count,
          author:users!posts_author_id_fkey(id, display_name, avatar_url)
        `)
        .textSearch("search_vector", tsQuery, { type: "websearch", config: "english" })
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1)

      if (ftsPosts && ftsPosts.length > 0) {
        posts = ftsPosts
      } else {
        // Fallback to ILIKE
        const { data: iLikePosts } = await (supabase as any)
          .from("posts")
          .select(`
            id,
            content,
            created_at,
            likes_count,
            comments_count,
            author:users!posts_author_id_fkey(id, display_name, avatar_url)
          `)
          .ilike("content", searchPattern)
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1)
        posts = iLikePosts || []
      }

      results.posts = posts?.map((post: any) => ({
        id: post.id,
        type: "post",
        name: post.content.substring(0, 100) + (post.content.length > 100 ? "..." : ""),
        avatar: post.author?.avatar_url,
        authorName: post.author?.display_name,
        authorId: post.author?.id,
        createdAt: post.created_at,
        likesCount: post.likes_count,
        commentsCount: post.comments_count,
      })) || []
    }

    // Search Groups with full-text search
    if (type === "all" || type === "groups") {
      let groups: any[] = []

      const { data: ftsGroups } = await (supabase as any)
        .from("groups")
        .select("id, name, description, avatar_url, cover_url, is_private, members_count, category")
        .textSearch("search_vector", tsQuery, { type: "websearch", config: "english" })
        .is("deleted_at", null)
        .order("members_count", { ascending: false })
        .range(offset, offset + limit - 1)

      if (ftsGroups && ftsGroups.length > 0) {
        groups = ftsGroups
      } else {
        const { data: iLikeGroups } = await (supabase as any)
          .from("groups")
          .select("id, name, description, avatar_url, cover_url, is_private, members_count, category")
          .or(`name.ilike.${searchPattern},description.ilike.${searchPattern}`)
          .is("deleted_at", null)
          .order("members_count", { ascending: false })
          .range(offset, offset + limit - 1)
        groups = iLikeGroups || []
      }

      results.groups = groups?.map((group: any) => ({
        id: group.id,
        type: "group",
        name: group.name,
        avatar: group.avatar_url,
        cover: group.cover_url,
        description: group.description,
        isPrivate: group.is_private,
        membersCount: group.members_count,
        category: group.category,
      })) || []
    }

    // Search Events with full-text search
    if (type === "all" || type === "events") {
      let events: any[] = []

      const { data: ftsEvents } = await (supabase as any)
        .from("events")
        .select("id, title, description, image_url, start_date, end_date, location, is_online, participants_count, category")
        .textSearch("search_vector", tsQuery, { type: "websearch", config: "english" })
        .is("deleted_at", null)
        .gte("start_date", new Date().toISOString())
        .order("start_date", { ascending: true })
        .range(offset, offset + limit - 1)

      if (ftsEvents && ftsEvents.length > 0) {
        events = ftsEvents
      } else {
        const { data: iLikeEvents } = await (supabase as any)
          .from("events")
          .select("id, title, description, image_url, start_date, end_date, location, is_online, participants_count, category")
          .or(`title.ilike.${searchPattern},description.ilike.${searchPattern},location.ilike.${searchPattern}`)
          .is("deleted_at", null)
          .gte("start_date", new Date().toISOString())
          .order("start_date", { ascending: true })
          .range(offset, offset + limit - 1)
        events = iLikeEvents || []
      }

      results.events = events?.map((event: any) => ({
        id: event.id,
        type: "event",
        name: event.title,
        avatar: event.image_url,
        description: event.description,
        startDate: event.start_date,
        endDate: event.end_date,
        location: event.location,
        isOnline: event.is_online,
        participantsCount: event.participants_count,
        category: event.category,
      })) || []
    }

    // Calculate total count for pagination
    const totalCount = (results.users?.length || 0) +
                       (results.posts?.length || 0) +
                       (results.groups?.length || 0) +
                       (results.events?.length || 0)

    return NextResponse.json({
      query,
      type,
      results,
      totalCount,
      hasMore: totalCount === limit,
      searchMethod: "full-text", // Indicate search method used
    })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}
