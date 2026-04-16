import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { requestId } = await request.json();
    if (!requestId) {
      return NextResponse.json(
        { error: "Request ID is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    // Get the friend request to verify ownership
    const { data: friendRequest, error: fetchError } = await (supabase as any)
      .from("friendships")
      .select("*")
      .eq("id", requestId)
      .eq("addressee_id", session.userId)
      .eq("status", "pending")
      .single();

    if (fetchError || !friendRequest) {
      return NextResponse.json(
        { error: "Friend request not found" },
        { status: 404 }
      );
    }

    // Delete the friend request (or update status to declined)
    const { error: deleteError } = await (supabase as any)
      .from("friendships")
      .delete()
      .eq("id", requestId);

    if (deleteError) {
      console.error("Error declining friend request:", deleteError);
      return NextResponse.json(
        { error: "Failed to decline friend request" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Friend request declined",
    });
  } catch (error) {
    console.error("Error in decline friend request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
