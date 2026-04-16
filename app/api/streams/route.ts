import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";

// GET - Fetch streams
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status") || "live";
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const supabase = await createClient() as any;
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    let query = supabase
      .from("streams")
      .select(`
        *,
        streamer:users!streams_user_id_fkey(
          id,
          display_name,
          avatar_url,
          level,
          is_verified
        )
      `)
      .order("viewer_count", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status === "live") {
      query = query.eq("is_live", true);
    }

    if (category && category !== "All") {
      query = query.eq("category", category);
    }

    const { data: streams, error } = await query;

    if (error) {
      console.error("Error fetching streams:", error);
      return NextResponse.json(
        { error: "Failed to fetch streams" },
        { status: 500 }
      );
    }

    // Get categories
    const { data: categories } = await supabase
      .from("streams")
      .select("category")
      .eq("is_live", true);

    const uniqueCategories = [
      "All",
      ...new Set(categories?.map((c: any) => c.category).filter(Boolean)),
    ];

    return NextResponse.json({
      streams: streams || [],
      categories: uniqueCategories,
      total: streams?.length || 0,
    });
  } catch (error) {
    console.error("Error in streams GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create or update stream
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, category, thumbnailUrl, streamKey } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient() as any;
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    // Check if user already has a stream
    const { data: existingStream } = await supabase
      .from("streams")
      .select("id")
      .eq("user_id", session.userId)
      .single();

    if (existingStream) {
      // Update existing stream
      const { data: stream, error } = await supabase
        .from("streams")
        .update({
          title,
          description,
          category,
          thumbnail_url: thumbnailUrl,
          stream_key: streamKey,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingStream.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating stream:", error);
        return NextResponse.json(
          { error: "Failed to update stream" },
          { status: 500 }
        );
      }

      return NextResponse.json({ stream });
    } else {
      // Create new stream
      const { data: stream, error } = await supabase
        .from("streams")
        .insert({
          user_id: session.userId,
          title,
          description,
          category,
          thumbnail_url: thumbnailUrl,
          stream_key: streamKey || crypto.randomUUID(),
          is_live: false,
          viewer_count: 0,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating stream:", error);
        return NextResponse.json(
          { error: "Failed to create stream" },
          { status: 500 }
        );
      }

      return NextResponse.json({ stream });
    }
  } catch (error) {
    console.error("Error in streams POST:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Go live / End stream
export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, streamId } = await request.json();

    if (!action || !streamId) {
      return NextResponse.json(
        { error: "Action and streamId are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient() as any;
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    // Verify ownership
    const { data: stream } = await supabase
      .from("streams")
      .select("user_id")
      .eq("id", streamId)
      .single();

    if (stream?.user_id !== session.userId) {
      return NextResponse.json(
        { error: "Not authorized to modify this stream" },
        { status: 403 }
      );
    }

    if (action === "go_live") {
      const { error } = await supabase
        .from("streams")
        .update({
          is_live: true,
          started_at: new Date().toISOString(),
          viewer_count: 0,
        })
        .eq("id", streamId);

      if (error) {
        return NextResponse.json(
          { error: "Failed to start stream" },
          { status: 500 }
        );
      }

      // Award XP for streaming
      await supabase.from("xp_transactions").insert({
        user_id: session.userId,
        amount: 25,
        reason: "Started streaming",
        source: "off_chain",
      });

      return NextResponse.json({ success: true, message: "Stream started" });
    } else if (action === "end_stream") {
      const { error } = await supabase
        .from("streams")
        .update({
          is_live: false,
          ended_at: new Date().toISOString(),
        })
        .eq("id", streamId);

      if (error) {
        return NextResponse.json(
          { error: "Failed to end stream" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, message: "Stream ended" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error in streams PATCH:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
