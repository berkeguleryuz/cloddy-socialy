import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { notificationId, all } = body;

    const supabase = await createClient() as any;
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    if (all) {
      // Mark all notifications as read
      const { error } = await supabase
        .from("notifications")
        .update({
          read: true,
          read_at: new Date().toISOString(),
        })
        .eq("user_id", session.userId)
        .eq("read", false);

      if (error) {
        console.error("Error marking all notifications as read:", error);
        return NextResponse.json(
          { error: "Failed to mark notifications as read" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "All notifications marked as read",
      });
    } else if (notificationId) {
      // Mark single notification as read
      const { error } = await supabase
        .from("notifications")
        .update({
          read: true,
          read_at: new Date().toISOString(),
        })
        .eq("id", notificationId)
        .eq("user_id", session.userId);

      if (error) {
        console.error("Error marking notification as read:", error);
        return NextResponse.json(
          { error: "Failed to mark notification as read" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Notification marked as read",
      });
    } else {
      return NextResponse.json(
        { error: "Either notificationId or all=true is required" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error in mark notifications read:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
