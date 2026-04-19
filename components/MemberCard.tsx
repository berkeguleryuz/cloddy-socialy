"use client";

import { memo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import HexagonAvatar from "./HexagonAvatar";
import { useFriends } from "@/hooks/useFriends";
import { useAuth } from "./AuthContext";

interface MemberCardProps {
  id?: string | number;
  name: string;
  avatar: string;
  cover: string;
  level: number;
  stats: {
    posts: string;
    friends: string;
    visits: string;
  };
  tagline?: string;
  bio?: string;
  badges?: number;
}

const MemberCard = memo(function MemberCard({
  id,
  name,
  avatar,
  cover,
  level,
  stats,
  tagline = "www.vikinger.com",
  bio = "Hello! I'm a passionate gamer who loves streaming and connecting with my community. Come check out my profile!",
  badges = 9,
}: MemberCardProps) {
  const t = useTranslations("members");
  const tc = useTranslations("common");
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { sendFriendRequest, isSendingRequest } = useFriends();

  const handleSendMessage = useCallback(() => {
    if (!isAuthenticated) {
      toast.info(t("signInToAdd"));
      return;
    }
    if (!id) return;
    router.push(`/messages?to=${encodeURIComponent(String(id))}`);
  }, [id, isAuthenticated, router, t]);

  const handleAddFriend = useCallback(() => {
    if (!isAuthenticated) {
      toast.info(t("signInToAdd"));
      return;
    }
    if (!id) return;
    sendFriendRequest(String(id), {
      onSuccess: () => toast.success(t("requestSent")),
      onError: (error) => toast.error(error instanceof Error ? error.message : tc("error")),
    } as Parameters<typeof sendFriendRequest>[1]);
  }, [id, isAuthenticated, sendFriendRequest, t, tc]);

  return (
    <div className="widget-box overflow-hidden group transition-all duration-300 hover:translate-y-[-2px]">
      <div className="h-20 overflow-hidden relative">
        <Image
          src={cover}
          alt="Cover"
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700"
          sizes="(max-width: 768px) 100vw, 400px"
        />
        <div className="absolute inset-0 bg-linear-to-t from-surface to-transparent" />
      </div>

      <div className="px-6 pb-6 -mt-6 flex gap-6">
        <div className="shrink-0 flex flex-col items-center">
          <div className="relative">
            <HexagonAvatar src={avatar} level={level} size="lg" />
            {badges > 0 ? (
              <Link
                href="/profile"
                className="absolute -right-1 -bottom-1 bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md hover:bg-secondary transition-colors"
              >
                +{badges}
              </Link>
            ) : null}
          </div>
        </div>

        <div className="flex-1 pt-6 flex flex-col min-w-0">
          <Link href={id ? `/members/${id}` : "/profile"}>
            <h3 className="text-sm font-bold hover:text-primary cursor-pointer transition-colors truncate">
              {name}
            </h3>
          </Link>
          <p className="text-[10px] text-text-muted font-bold mb-3 truncate">
            {tagline}
          </p>

          <div className="flex gap-6 mb-3">
            <div className="flex flex-col">
              <span className="text-xs font-black">{stats.posts}</span>
              <span className="text-[9px] text-text-muted font-bold uppercase">
                {t("statPosts")}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black">{stats.friends}</span>
              <span className="text-[9px] text-text-muted font-bold uppercase">
                {t("statFriends")}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black">{stats.visits}</span>
              <span className="text-[9px] text-text-muted font-bold uppercase">
                {t("statVisits")}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-text-muted font-medium leading-relaxed line-clamp-2 mb-4">
            {bio}
          </p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleAddFriend}
              disabled={isSendingRequest || !id}
              className="flex-1 py-2.5 bg-primary text-white text-[10px] font-bold rounded-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-wide disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {t("addFriend")}
            </button>
            <button
              type="button"
              onClick={handleSendMessage}
              disabled={!id}
              className="flex-1 py-2.5 bg-surface border border-border text-white text-[10px] font-bold rounded-lg hover:bg-background transition-all uppercase tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
            >
              {t("sendMessage")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default MemberCard;
