"use client";

import { memo, useCallback, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useAuth } from "@/components/AuthContext";
import {
  usePostComments,
  useCreateComment,
  useDeleteComment,
} from "@/hooks/usePostInteractions";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

interface PostCommentsProps {
  postId: string;
}

const MAX_LENGTH = 500;

const PostComments = memo(function PostComments({ postId }: PostCommentsProps) {
  const tc = useTranslations("common");
  const { isAuthenticated, user } = useAuth();
  const [draft, setDraft] = useState("");

  const commentsQuery = usePostComments(postId, { limit: 50 });
  const createComment = useCreateComment();
  const deleteComment = useDeleteComment();

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const content = draft.trim();
      if (!content) return;
      if (!isAuthenticated) {
        toast.info("Sign in to comment");
        return;
      }
      createComment.mutate(
        { postId, content },
        {
          onSuccess: () => setDraft(""),
          onError: (err) => toast.error((err as Error).message),
        }
      );
    },
    [createComment, draft, isAuthenticated, postId]
  );

  const comments = commentsQuery.data?.comments ?? [];

  return (
    <div className="flex flex-col gap-4 pt-4 mt-2 border-t border-border">
      {commentsQuery.isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-5/6" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-text-muted">No comments yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {comments.map((comment) => (
            <li
              key={comment.id}
              className="flex items-start gap-3 bg-background rounded-xl p-3"
            >
              <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 bg-surface">
                <Image
                  src={comment.user.avatar_url || "/images/avatars/avatar_01.png"}
                  alt={comment.user.display_name}
                  fill
                  className="object-cover"
                  sizes="32px"
                  unoptimized={comment.user.avatar_url?.includes("dicebear")}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-bold text-text-main">
                    {comment.user.display_name}
                  </span>
                  <span className="text-[10px] text-text-muted">
                    {new Date(comment.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-text-main break-words">
                  {comment.content}
                </p>
              </div>
              {isAuthenticated && comment.user.id === user?.id && (
                <button
                  type="button"
                  onClick={() => {
                    if (!confirm("Delete this comment?")) return;
                    deleteComment.mutate(
                      { postId, commentId: comment.id },
                      { onError: (err) => toast.error((err as Error).message) }
                    );
                  }}
                  className="text-text-muted hover:text-accent-orange text-xs font-bold"
                >
                  {tc("delete")}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="flex items-start gap-2">
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value.slice(0, MAX_LENGTH))}
          placeholder={
            isAuthenticated ? "Write a comment..." : "Sign in to comment"
          }
          disabled={!isAuthenticated || createComment.isPending}
          rows={1}
          className="flex-1 rounded-xl bg-background border border-border px-4 py-2.5 text-sm text-text-main placeholder:text-text-muted/60 focus:border-primary focus:outline-none resize-none disabled:opacity-50"
        />
        <Button
          type="submit"
          size="sm"
          loading={createComment.isPending}
          disabled={!draft.trim() || !isAuthenticated}
        >
          {tc("submit")}
        </Button>
      </form>
    </div>
  );
});

export default PostComments;
