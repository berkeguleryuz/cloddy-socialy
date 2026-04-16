import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthContext";

interface Streamer {
  id: string;
  display_name: string;
  avatar_url: string;
  level: number;
  is_verified?: boolean;
}

interface Stream {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  thumbnail_url: string;
  stream_key?: string;
  is_live: boolean;
  viewer_count: number;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  streamer?: Streamer;
}

interface StreamsResponse {
  streams: Stream[];
  categories: string[];
  total: number;
}

interface StreamResponse {
  stream: Stream;
}

// Fetch all streams
export function useStreams(options?: { category?: string; status?: string }) {
  const { category, status = "live" } = options || {};

  return useQuery<StreamsResponse>({
    queryKey: ["streams", category, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      if (status) params.set("status", status);

      const response = await fetch(`/api/streams?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch streams");
      }
      return response.json();
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
}

// Create or update stream settings
export function useCreateStream() {
  const queryClient = useQueryClient();

  return useMutation<
    StreamResponse,
    Error,
    {
      title: string;
      description?: string;
      category?: string;
      thumbnailUrl?: string;
    }
  >({
    mutationFn: async (data) => {
      const response = await fetch("/api/streams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create stream");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["streams"] });
      queryClient.invalidateQueries({ queryKey: ["myStream"] });
    },
  });
}

// Go live
export function useGoLive() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: async (streamId) => {
      const response = await fetch("/api/streams", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "go_live", streamId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to go live");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["streams"] });
      queryClient.invalidateQueries({ queryKey: ["myStream"] });
    },
  });
}

// End stream
export function useEndStream() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: async (streamId) => {
      const response = await fetch("/api/streams", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "end_stream", streamId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to end stream");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["streams"] });
      queryClient.invalidateQueries({ queryKey: ["myStream"] });
    },
  });
}

// Get user's own stream
export function useMyStream() {
  const { isAuthenticated, isDemo } = useAuth();

  return useQuery<Stream | null>({
    queryKey: ["myStream"],
    queryFn: async () => {
      const response = await fetch("/api/streams/my", {
        credentials: "include",
      });
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error("Failed to fetch stream");
      }
      const data = await response.json();
      return data.stream;
    },
    enabled: isAuthenticated && !isDemo,
  });
}

export default useStreams;
