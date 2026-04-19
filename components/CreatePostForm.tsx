"use client";

import { memo, useCallback, useRef, useState } from "react";
import Image from "next/image";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useAuth } from "./AuthContext";
import { Button } from "./ui/Button";
import { cn } from "@/lib/utils";

interface CreatePostFormProps {
  onSuccess?: () => void;
}

const MAX_CONTENT_LENGTH = 5000;
const WARN_THRESHOLD = 4500;

type PostType = "text" | "image" | "video" | "poll";
type Visibility = "public" | "friends" | "private";

const CreatePostForm = memo(function CreatePostForm({
  onSuccess,
}: CreatePostFormProps) {
  const t = useTranslations("createPost");
  const tc = useTranslations("common");
  const { user, isDemo, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [content, setContent] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [postType, setPostType] = useState<PostType>("text");
  const [visibility, setVisibility] = useState<Visibility>("public");

  const createPost = useMutation({
    mutationFn: async (data: {
      content: string;
      post_type: PostType;
      visibility: Visibility;
    }) => {
      if (isDemo) {
        await new Promise((resolve) => setTimeout(resolve, 400));
        return { post: { id: `demo-${Date.now()}`, ...data } };
      }

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || t("errorGeneric"));
      }

      return response.json();
    },
    onSuccess: () => {
      setContent("");
      setIsExpanded(false);
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success(t("success"));
      onSuccess?.();
    },
    onError: (err: Error) => {
      toast.error(err.message || tc("error"));
    },
  });

  const handleSubmit = useCallback(() => {
    const trimmed = content.trim();
    if (!trimmed) {
      toast.info(t("emptyWarning"));
      return;
    }
    if (trimmed.length > MAX_CONTENT_LENGTH) {
      toast.error(t("tooLong", { max: MAX_CONTENT_LENGTH }));
      return;
    }
    if (!isAuthenticated && !isDemo) {
      toast.info(t("signInPrompt"));
      return;
    }
    createPost.mutate({
      content: trimmed,
      post_type: postType,
      visibility,
    });
  }, [content, createPost, isAuthenticated, isDemo, postType, t, visibility]);

  const handleCancel = useCallback(() => {
    setIsExpanded(false);
    setContent("");
  }, []);

  const handleTextareaChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setContent(event.target.value);
      const el = textareaRef.current;
      if (el) {
        el.style.height = "auto";
        el.style.height = `${Math.min(el.scrollHeight, 300)}px`;
      }
    },
    []
  );

  const postTypes: {
    id: PostType;
    label: string;
    activeClass: string;
    path: string;
  }[] = [
    {
      id: "text",
      label: t("typeText"),
      activeClass: "bg-primary/20 text-primary",
      path: "M4 6h16M4 12h16M4 18h7",
    },
    {
      id: "image",
      label: t("typeImage"),
      activeClass: "bg-secondary/20 text-secondary",
      path: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
    },
    {
      id: "video",
      label: t("typeVideo"),
      activeClass: "bg-accent-blue/20 text-accent-blue",
      path: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z",
    },
    {
      id: "poll",
      label: t("typePoll"),
      activeClass: "bg-accent-orange/20 text-accent-orange",
      path: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    },
  ];

  return (
    <div className="widget-box p-4">
      <div className="flex gap-3">
        <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0">
          <Image
            src={
              user?.avatar && user.avatar.trim() !== ""
                ? user.avatar
                : "/images/avatars/avatar_01.png"
            }
            alt="Your avatar"
            fill
            className="object-cover"
            unoptimized={user?.avatar?.includes("dicebear")}
          />
        </div>

        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleTextareaChange}
            onFocus={() => setIsExpanded(true)}
            placeholder={t("placeholder")}
            aria-label={t("placeholder")}
            maxLength={MAX_CONTENT_LENGTH + 500}
            className="w-full bg-transparent text-white placeholder-text-muted resize-none focus:outline-none text-base min-h-[44px]"
            rows={1}
          />

          {isExpanded && (
            <div className="mt-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-2 flex-wrap">
                {postTypes.map((pt) => (
                  <button
                    key={pt.id}
                    type="button"
                    onClick={() => setPostType(pt.id)}
                    aria-pressed={postType === pt.id}
                    aria-label={pt.label}
                    title={pt.label}
                    className={cn(
                      "p-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      postType === pt.id
                        ? pt.activeClass
                        : "bg-white/5 text-text-muted hover:text-white"
                    )}
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
                        strokeWidth={2}
                        d={pt.path}
                      />
                    </svg>
                  </button>
                ))}

                <div className="flex-1" />

                <label className="sr-only" htmlFor="post-visibility">
                  {t("visibilityLabel")}
                </label>
                <select
                  id="post-visibility"
                  value={visibility}
                  onChange={(e) =>
                    setVisibility(e.target.value as Visibility)
                  }
                  className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="public">🌍 {t("visibilityPublic")}</option>
                  <option value="friends">👥 {t("visibilityFriends")}</option>
                  <option value="private">🔒 {t("visibilityPrivate")}</option>
                </select>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <span
                  className={cn(
                    "text-xs tabular-nums",
                    content.length > WARN_THRESHOLD
                      ? "text-accent-orange"
                      : "text-text-muted"
                  )}
                >
                  {content.length}/{MAX_CONTENT_LENGTH}
                </span>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={handleCancel}>
                    {tc("cancel")}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSubmit}
                    loading={createPost.isPending}
                    disabled={!content.trim()}
                  >
                    {t("submit")}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default CreatePostForm;
