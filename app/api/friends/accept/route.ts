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

    // Get the friend request
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

    // Update the friend request status to accepted
    const { error: updateError } = await (supabase as any)
      .from("friendships")
      .update({
        status: "accepted",
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    if (updateError) {
      console.error("Error accepting friend request:", updateError);
      return NextResponse.json(
        { error: "Failed to accept friend request" },
        { status: 500 }
      );
    }

    // Create a notification for the sender
    await (supabase as any).from("notifications").insert({
      user_id: friendRequest.requester_id,
      type: "friend_accepted",
      title: "Friend Request Accepted",
      message: "Your friend request has been accepted!",
      data: {
        from_user_id: session.userId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Friend request accepted",
    });
  } catch (error) {
    console.error("Error in accept friend request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
