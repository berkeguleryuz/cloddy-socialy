"use client";

import { useState, useMemo, memo } from "react";
import { useTranslations } from "next-intl";
import HexagonAvatar from "./HexagonAvatar";
import { useAuth } from "./AuthContext";
import { useData } from "./DataContext";
import { demoMembersData } from "@/constants/demoData";

const MembersWidget = memo(function MembersWidget() {
  const [activeTab, setActiveTab] = useState<"Newest" | "Popular" | "Active">(
    "Newest"
  );

  const { isDemo, isAuthenticated } = useAuth();
  const { social } = useData();
  const tw = useTranslations("widgets");

  // Transform friends data to member format or use demo data
  const { membersData, showEmpty } = useMemo(() => {
    // Only show demo data for demo mode or unauthenticated users
    if (isDemo || !isAuthenticated) {
      return { membersData: demoMembersData, showEmpty: false };
    }

    // For authenticated users, show real data or empty state
    if (!social.friends || social.friends.length === 0) {
      return {
        membersData: { Newest: [], Popular: [], Active: [] },
        showEmpty: true
      };
    }

    // Transform real friends data
    const friendsList = social.friends.map((f: any) => ({
      name: f.user?.display_name || "User",
      avatar: f.user?.avatar_url || "/images/avatars/avatar_01.png",
      level: f.user?.level || 1,
    }));

    // For authenticated users, use friends for all tabs (with slight variations)
    return {
      membersData: {
        Newest: friendsList.slice(0, 5),
        Popular: [...friendsList].sort((a, b) => b.level - a.level).slice(0, 5),
        Active: [...friendsList].slice(0, 5),
      },
      showEmpty: false,
    };
  }, [isDemo, isAuthenticated, social.friends]);

  return (
    <div className="widget-box">
      <h3 className="text-xs font-black uppercase tracking-widest text-text-muted mb-4">
        {tw("membersTitle")}
      </h3>

      {/* Tabs */}
      <div className="flex gap-1 mb-4">
        {(["Newest", "Popular", "Active"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              activeTab === tab
                ? "bg-primary text-white"
                : "bg-background text-text-muted hover:bg-background/80"
            }`}
          >
            {tw(`tab${tab}` as const)}
          </button>
        ))}
      </div>

      {/* Members List */}
      <div className="flex flex-col gap-3">
        {showEmpty ? (
          <div className="p-4 text-center">
            <p className="text-xs text-text-muted">{tw("emptyTitle")}</p>
            <p className="text-[10px] text-text-muted mt-1">{tw("emptyHint")}</p>
          </div>
        ) : (
          membersData[activeTab].map((member, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-background/50 transition-colors cursor-pointer group"
            >
              <HexagonAvatar src={member.avatar} level={member.level} size="sm" />
              <div className="flex-1">
                <h4 className="text-xs font-bold text-white group-hover:text-primary transition-colors">
                  {member.name}
                </h4>
                <span className="text-[10px] text-text-muted">
                  {tw("level", { level: member.level })}
                </span>
              </div>
              <button className="w-7 h-7 rounded-lg bg-background flex items-center justify-center text-text-muted hover:bg-primary hover:text-white transition-all opacity-0 group-hover:opacity-100">
                <svg
                  className="w-3.5 h-3.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
});

export default MembersWidget;
