"use client";

import { useState, useMemo, memo } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "./AuthContext";
import { useData } from "./DataContext";

// Demo groups data
const demoGroupsData = {
  Newest: [
    { name: "Cosmo Fans", icon: "rocket", members: 324, color: "from-primary to-secondary" },
    { name: "Gaming Warriors", icon: "swords", members: 1250, color: "from-secondary to-accent-blue" },
    { name: "Art & Design", icon: "palette", members: 892, color: "from-accent-orange to-accent-yellow" },
    { name: "Music Lovers", icon: "music", members: 2104, color: "from-accent-blue to-primary" },
  ],
  Popular: [
    { name: "Streamers Hub", icon: "tv", members: 8542, color: "from-secondary to-accent-blue" },
    { name: "Gaming Warriors", icon: "swords", members: 1250, color: "from-primary to-secondary" },
    { name: "Photography Club", icon: "camera", members: 4321, color: "from-accent-yellow to-accent-orange" },
    { name: "Tech Enthusiasts", icon: "laptop", members: 3215, color: "from-accent-blue to-primary" },
  ],
  Active: [
    { name: "Daily Gamers", icon: "gamepad", members: 987, color: "from-secondary to-accent-blue" },
    { name: "Cosmo Fans", icon: "rocket", members: 324, color: "from-primary to-secondary" },
    { name: "Movie Buffs", icon: "film", members: 1654, color: "from-accent-orange to-secondary" },
    { name: "Fitness Team", icon: "dumbbell", members: 543, color: "from-accent-blue to-secondary" },
  ],
};

// Color palette for groups
const groupColors = [
  "from-primary to-secondary",
  "from-secondary to-accent-blue",
  "from-accent-orange to-accent-yellow",
  "from-accent-blue to-primary",
];

const GroupsWidget = memo(function GroupsWidget() {
  const [activeTab, setActiveTab] = useState<"Newest" | "Popular" | "Active">("Newest");
  const { isDemo, isAuthenticated } = useAuth();
  const { groups: groupsData } = useData();
  const tw = useTranslations("widgets");

  // Transform groups data or use demo data
  const groups = useMemo(() => {
    if (isDemo || !isAuthenticated || !groupsData.items || groupsData.items.length === 0) {
      return demoGroupsData;
    }

    // Transform real groups data
    const groupsList = groupsData.items.map((group: any, index: number) => ({
      name: group.name,
      icon: group.icon || "users",
      members: group.member_count || 0,
      color: groupColors[index % groupColors.length],
    }));

    return {
      Newest: groupsList.slice(0, 4),
      Popular: [...groupsList].sort((a, b) => b.members - a.members).slice(0, 4),
      Active: groupsList.slice(0, 4),
    };
  }, [isDemo, isAuthenticated, groupsData.items]);

  return (
    <div className="widget-box">
      <h3 className="text-xs font-black uppercase tracking-widest text-text-muted mb-4">
        {tw("groupsTitle")}
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

      {/* Groups List */}
      <div className="flex flex-col gap-3">
        {groups[activeTab].map((group, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-background/50 transition-colors cursor-pointer group"
          >
            <div
              className={`w-10 h-10 rounded-xl bg-linear-to-br ${group.color} flex items-center justify-center text-lg shrink-0`}
            >
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-white truncate group-hover:text-primary transition-colors">
                {group.name}
              </h4>
              <span className="text-[10px] text-text-muted">
                {group.members.toLocaleString()} members
              </span>
            </div>
            <button className="px-3 py-1.5 rounded-lg bg-background text-[10px] font-bold text-text-muted hover:bg-primary hover:text-white transition-all opacity-0 group-hover:opacity-100">
              Join
            </button>
          </div>
        ))}
      </div>
    </div>
  );
});

export default GroupsWidget;
