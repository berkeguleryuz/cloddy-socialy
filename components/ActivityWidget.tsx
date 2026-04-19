"use client";

import { ReactNode, useMemo, memo } from "react";
import { useTranslations } from "next-intl";
import HexagonAvatar from "./HexagonAvatar";
import { useAuth } from "./AuthContext";
import { useData } from "./DataContext";
import { demoActivities } from "@/constants/demoData";

// Helper to format time
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
}

// Map notification type to icon
function getActivityIcon(type: string): string {
  const iconMapping: Record<string, string> = {
    like: "heart",
    comment: "comment",
    friend_request: "group",
    badge_earned: "badge",
    share: "share",
  };
  return iconMapping[type] || "heart";
}

const iconMap: Record<string, ReactNode> = {
  heart: (
    <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center">
      <svg
        className="w-2.5 h-2.5 text-white"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  ),
  comment: (
    <div className="w-5 h-5 rounded-full bg-accent-blue flex items-center justify-center">
      <svg
        className="w-2.5 h-2.5 text-white"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  ),
  group: (
    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
      <svg
        className="w-2.5 h-2.5 text-white"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
      </svg>
    </div>
  ),
  badge: (
    <div className="w-5 h-5 rounded-full bg-accent-yellow flex items-center justify-center">
      <svg
        className="w-2.5 h-2.5 text-background"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    </div>
  ),
  share: (
    <div className="w-5 h-5 rounded-full bg-accent-orange flex items-center justify-center">
      <svg
        className="w-2.5 h-2.5 text-white"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
      </svg>
    </div>
  ),
};

const ActivityWidget = memo(function ActivityWidget() {
  const tw = useTranslations("widgets");
  const { isDemo, isAuthenticated } = useAuth();
  const { notifications } = useData();

  // Transform notifications to activity format or use demo data
  const activities = useMemo(() => {
    if (isDemo || !isAuthenticated || !notifications.items || notifications.items.length === 0) {
      return demoActivities;
    }

    // Transform real notifications to activity format
    return notifications.items.slice(0, 5).map((notif: any, index: number) => ({
      id: notif.id || index,
      user: {
        name: notif.data?.from_user?.display_name || "Someone",
        avatar: notif.data?.from_user?.avatar_url || `/images/avatars/avatar_0${(index % 8) + 1}.png`,
      },
      action: notif.message?.split(" ")[0]?.toLowerCase() || "interacted with",
      target: notif.title || "your content",
      time: formatTimeAgo(notif.created_at),
      icon: getActivityIcon(notif.type),
    }));
  }, [isDemo, isAuthenticated, notifications.items]);

  return (
    <div className="widget-box">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-text-muted">
          {tw("activityTitle")}
        </h3>
        <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
      </div>

      <div className="flex flex-col gap-3">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 pb-3 border-b border-border/50 last:border-0 last:pb-0"
          >
            <div className="relative shrink-0">
              <HexagonAvatar src={activity.user.avatar} size="sm" />
              <div className="absolute -bottom-0.5 -right-0.5">
                {iconMap[activity.icon]}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs leading-relaxed">
                <span className="font-bold text-white hover:text-primary cursor-pointer transition-colors">
                  {activity.user.name}
                </span>{" "}
                <span className="text-text-muted">{activity.action}</span>{" "}
                <span className="font-medium text-white">
                  {activity.target}
                </span>
              </p>
              <span className="text-[10px] text-text-muted">
                {activity.time}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

export default ActivityWidget;
