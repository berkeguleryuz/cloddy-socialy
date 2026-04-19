"use client";

import { memo, useCallback } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { usePostLikes, useLikePost, useUnlikePost } from "@/hooks/usePostInteractions";
import { useAuth } from "@/components/AuthContext";
import { cn } from "@/lib/utils";

interface PostActionsProps {
  postId: string;
  initialLikes: number;
  initialComments: number;
  initialShares: number;
  onCommentClick?: () => void;
  className?: string;
}

const PostActions = memo(function PostActions({
  postId,
  initialLikes,
  initialComments,
  initialShares,
  onCommentClick,
  className,
}: PostActionsProps) {
  const tc = useTranslations("common");
  const { isAuthenticated } = useAuth();

  const likesQuery = usePostLikes(postId);
  const likePost = useLikePost();
  const unlikePost = useUnlikePost();

  const likesCount = likesQuery.data?.count ?? initialLikes;
  const isLiked = likesQuery.data?.liked_by_user ?? false;
  const mutating = likePost.isPending || unlikePost.isPending;

  const handleLike = useCallback(() => {
    if (!isAuthenticated) {
      toast.info("Sign in to like posts");
      return;
    }
    if (mutating) return;
    if (isLiked) {
      unlikePost.mutate(postId, {
        onError: (err) => toast.error((err as Error).message),
      });
    } else {
      likePost.mutate(postId, {
        onError: (err) => toast.error((err as Error).message),
      });
    }
  }, [isAuthenticated, isLiked, mutating, likePost, unlikePost, postId]);

  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/post/${postId}`;
    try {
      if (navigator.share) {
        await navigator.share({ url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success(tc("copied"));
      }
    } catch (err) {
      if ((err as { name?: string })?.name !== "AbortError") {
        toast.error(tc("error"));
      }
    }
  }, [postId, tc]);

  return (
    <div
      className={cn(
        "flex items-center justify-between pt-4 border-t border-border",
        className
      )}
    >
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={handleLike}
          disabled={mutating}
          aria-pressed={isLiked}
          aria-label="Like"
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            isLiked
              ? "bg-secondary text-white"
              : "bg-background text-text-muted hover:bg-secondary hover:text-white",
            mutating && "opacity-60 cursor-not-allowed"
          )}
        >
          <svg
            className={cn("w-5 h-5 transition-transform", isLiked && "scale-110")}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onCommentClick}
          aria-label="Comment"
          className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-text-muted hover:bg-primary hover:text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>
        <button
          type="button"
          onClick={handleShare}
          aria-label="Share"
          className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-text-muted hover:bg-accent-blue hover:text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
        </button>
      </div>
      <div className="flex items-center gap-4 text-xs text-text-muted">
        <Counter
          value={likesCount}
          icon={
            <svg className="w-4 h-4 text-secondary" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
            </svg>
          }
        />
        <Counter
          value={initialComments}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          }
        />
        <Counter
          value={initialShares}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
          }
        />
      </div>
    </div>
  );
});

function Counter({ value, icon }: { value: number; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5">
      {icon}
      <span className="font-bold tabular-nums">{value}</span>
    </div>
  );
}

export default PostActions;
