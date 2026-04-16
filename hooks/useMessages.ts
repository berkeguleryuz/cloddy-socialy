import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthContext";

interface User {
  id: string;
  display_name: string;
  avatar_url: string;
  level: number;
  is_online?: boolean;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  read: boolean;
  read_at: string | null;
  created_at: string;
  sender?: User;
}

interface Conversation {
  id: string;
  user: User;
  lastMessage: string;
  lastMessageTime: string;
  unread: boolean;
  updatedAt: string;
}

interface ConversationsResponse {
  conversations: Conversation[];
}

interface MessagesResponse {
  messages: Message[];
}

interface SendMessageResponse {
  message: Message;
  conversationId: string;
}

// Fetch all conversations
export function useConversations() {
  const { isAuthenticated, isDemo } = useAuth();

  return useQuery<ConversationsResponse>({
    queryKey: ["conversations"],
    queryFn: async () => {
      const response = await fetch("/api/messages", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch conversations");
      }
      return response.json();
    },
    enabled: isAuthenticated && !isDemo,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
}

// Fetch messages for a specific conversation
export function useMessages(conversationId: string | null) {
  const { isAuthenticated, isDemo } = useAuth();

  return useQuery<MessagesResponse>({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      if (!conversationId) throw new Error("No conversation ID");

      const response = await fetch(
        `/api/messages?conversationId=${conversationId}`,
        {
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }
      return response.json();
    },
    enabled: isAuthenticated && !isDemo && !!conversationId,
    staleTime: 10000, // 10 seconds
    refetchInterval: 15000, // Refetch every 15 seconds for real-time feel
  });
}

// Send a new message
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation<
    SendMessageResponse,
    Error,
    { recipientId?: string; conversationId?: string; content: string }
  >({
    mutationFn: async ({ recipientId, conversationId, content }) => {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ recipientId, conversationId, content }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send message");
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate and refetch conversations
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      // Invalidate messages for this conversation
      queryClient.invalidateQueries({
        queryKey: ["messages", data.conversationId],
      });
    },
  });
}

// Combined hook for chat functionality
export function useChat(conversationId: string | null) {
  const conversations = useConversations();
  const messages = useMessages(conversationId);
  const sendMessage = useSendMessage();

  return {
    conversations: conversations.data?.conversations || [],
    messages: messages.data?.messages || [],
    isLoadingConversations: conversations.isLoading,
    isLoadingMessages: messages.isLoading,
    sendMessage: sendMessage.mutate,
    isSending: sendMessage.isPending,
    error: conversations.error || messages.error || sendMessage.error,
  };
}

export default useChat;
