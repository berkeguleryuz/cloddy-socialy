import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";

// GET - Fetch conversations or messages
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const supabase = await createClient() as any;
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    if (conversationId) {
      // Fetch messages for a specific conversation
      const { data: messages, error } = await supabase
        .from("messages")
        .select(`
          *,
          sender:users!messages_sender_id_fkey(id, display_name, avatar_url, level)
        `)
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error("Error fetching messages:", error);
        return NextResponse.json(
          { error: "Failed to fetch messages" },
          { status: 500 }
        );
      }

      // Mark messages as read (fire-and-forget - non-blocking)
      supabase
        .from("messages")
        .update({ read: true, read_at: new Date().toISOString() })
        .eq("conversation_id", conversationId)
        .eq("recipient_id", session.userId)
        .eq("read", false)
        .then(() => {})
        .catch(console.error);

      return NextResponse.json({ messages });
    } else {
      // Fetch all conversations for the user
      const { data: conversations, error } = await supabase
        .from("conversations")
        .select(`
          *,
          participant1:users!conversations_participant1_id_fkey(id, display_name, avatar_url, level, is_online),
          participant2:users!conversations_participant2_id_fkey(id, display_name, avatar_url, level, is_online),
          last_message:messages(id, content, created_at, sender_id, read)
        `)
        .or(`participant1_id.eq.${session.userId},participant2_id.eq.${session.userId}`)
        .order("updated_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error("Error fetching conversations:", error);
        return NextResponse.json(
          { error: "Failed to fetch conversations" },
          { status: 500 }
        );
      }

      // Transform conversations to include the other participant
      const transformedConversations = conversations?.map((conv: any) => {
        const otherParticipant =
          conv.participant1_id === session.userId
            ? conv.participant2
            : conv.participant1;

        return {
          id: conv.id,
          user: otherParticipant,
          lastMessage: conv.last_message?.[0]?.content || "",
          lastMessageTime: conv.last_message?.[0]?.created_at,
          unread: conv.last_message?.[0]?.sender_id !== session.userId && !conv.last_message?.[0]?.read,
          updatedAt: conv.updated_at,
        };
      });

      return NextResponse.json({ conversations: transformedConversations });
    }
  } catch (error) {
    console.error("Error in messages GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Send a new message
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { recipientId, content, conversationId } = await request.json();

    if (!content || (!recipientId && !conversationId)) {
      return NextResponse.json(
        { error: "Content and either recipientId or conversationId are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient() as any;
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }
    let convId = conversationId;

    // If no conversationId, find or create conversation
    if (!convId && recipientId) {
      // Check if conversation exists
      const { data: existingConv } = await supabase
        .from("conversations")
        .select("id")
        .or(
          `and(participant1_id.eq.${session.userId},participant2_id.eq.${recipientId}),and(participant1_id.eq.${recipientId},participant2_id.eq.${session.userId})`
        )
        .single();

      if (existingConv) {
        convId = existingConv.id;
      } else {
        // Create new conversation
        const { data: newConv, error: convError } = await supabase
          .from("conversations")
          .insert({
            participant1_id: session.userId,
            participant2_id: recipientId,
          })
          .select("id")
          .single();

        if (convError) {
          console.error("Error creating conversation:", convError);
          return NextResponse.json(
            { error: "Failed to create conversation" },
            { status: 500 }
          );
        }
        convId = newConv.id;
      }
    }

    // Get recipient ID from conversation if needed
    let actualRecipientId = recipientId;
    if (!actualRecipientId) {
      const { data: conv } = await supabase
        .from("conversations")
        .select("participant1_id, participant2_id")
        .eq("id", convId)
        .single();

      actualRecipientId =
        conv?.participant1_id === session.userId
          ? conv?.participant2_id
          : conv?.participant1_id;
    }

    // Insert the message
    const { data: message, error: msgError } = await supabase
      .from("messages")
      .insert({
        conversation_id: convId,
        sender_id: session.userId,
        recipient_id: actualRecipientId,
        content,
      })
      .select(`
        *,
        sender:users!messages_sender_id_fkey(id, display_name, avatar_url, level)
      `)
      .single();

    if (msgError) {
      console.error("Error sending message:", msgError);
      return NextResponse.json(
        { error: "Failed to send message" },
        { status: 500 }
      );
    }

    // Update conversation and create notification (fire-and-forget - non-blocking)
    // These operations are independent and don't need to block the response
    Promise.all([
      supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", convId),
      supabase.from("notifications").insert({
        user_id: actualRecipientId,
        type: "message",
        title: "New Message",
        message: `You have a new message`,
        data: {
          from_user_id: session.userId,
          conversation_id: convId,
        },
      }),
    ]).catch(console.error);

    return NextResponse.json({ message, conversationId: convId });
  } catch (error) {
    console.error("Error in messages POST:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
