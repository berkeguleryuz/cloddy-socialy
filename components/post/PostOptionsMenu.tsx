"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useAuth } from "@/components/AuthContext";
import { usePosts } from "@/hooks/usePosts";
import { cn } from "@/lib/utils";

interface PostOptionsMenuProps {
  postId: string;
  authorId?: string;
  onReport?: () => void;
}

const PostOptionsMenu = memo(function PostOptionsMenu({
  postId,
  authorId,
  onReport,
}: PostOptionsMenuProps) {
  const t = useTranslations("postOptions");
  const tc = useTranslations("common");
  const { user, isAuthenticated } = useAuth();
  const { deletePost } = usePosts();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const canDelete = isAuthenticated && authorId && user?.id === authorId;

  const copyLink = useCallback(async () => {
    const url = `${window.location.origin}/post/${postId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success(tc("copied"));
    } catch {
      toast.error(tc("error"));
    }
    setOpen(false);
  }, [postId, tc]);

  const handleDelete = useCallback(() => {
    if (!canDelete) return;
    if (!confirm(t("confirmDelete"))) {
      setOpen(false);
      return;
    }
    deletePost(postId);
    toast.success(t("deleted"));
    setOpen(false);
  }, [canDelete, deletePost, postId, t]);

  const handleReport = useCallback(() => {
    setOpen(false);
    onReport?.();
  }, [onReport]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Post options"
        className="w-8 h-8 rounded-lg text-text-muted hover:bg-background hover:text-white transition-colors flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1 min-w-[180px] rounded-xl bg-surface border border-border shadow-widget overflow-hidden z-30 animate-in fade-in zoom-in-95 duration-100"
        >
          <MenuItem onClick={copyLink}>{t("copyLink")}</MenuItem>
          {canDelete && (
            <MenuItem onClick={handleDelete} destructive>
              {t("delete")}
            </MenuItem>
          )}
          {!canDelete && (
            <MenuItem onClick={handleReport}>{t("report")}</MenuItem>
          )}
        </div>
      )}
    </div>
  );
});

function MenuItem({
  onClick,
  children,
  destructive,
}: {
  onClick: () => void;
  children: React.ReactNode;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        "w-full px-4 py-2.5 text-sm text-left transition-colors",
        destructive
          ? "text-accent-orange hover:bg-accent-orange/10"
          : "text-text-main hover:bg-background"
      )}
    >
      {children}
    </button>
  );
}

export default PostOptionsMenu;
