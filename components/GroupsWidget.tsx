"use client";

import { useState } from "react";

const groupsData = {
  Newest: [
    {
      name: "Cosmo Fans",
      icon: "🚀",
      members: 324,
      color: "from-primary to-secondary",
    },
    {
      name: "Gaming Warriors",
      icon: "⚔️",
      members: 1250,
      color: "from-secondary to-accent-blue",
    },
    {
      name: "Art & Design",
      icon: "🎨",
      members: 892,
      color: "from-accent-orange to-accent-yellow",
    },
    {
      name: "Music Lovers",
      icon: "🎵",
      members: 2104,
      color: "from-accent-blue to-primary",
    },
  ],
  Popular: [
    {
      name: "Streamers Hub",
      icon: "📺",
      members: 8542,
      color: "from-secondary to-accent-blue",
    },
    {
      name: "Gaming Warriors",
      icon: "⚔️",
      members: 1250,
      color: "from-primary to-secondary",
    },
    {
      name: "Photography Club",
      icon: "📷",
      members: 4321,
      color: "from-accent-yellow to-accent-orange",
    },
    {
      name: "Tech Enthusiasts",
      icon: "💻",
      members: 3215,
      color: "from-accent-blue to-primary",
    },
  ],
  Active: [
    {
      name: "Daily Gamers",
      icon: "🎮",
      members: 987,
      color: "from-secondary to-accent-blue",
    },
    {
      name: "Cosmo Fans",
      icon: "🚀",
      members: 324,
      color: "from-primary to-secondary",
    },
    {
      name: "Movie Buffs",
      icon: "🎬",
      members: 1654,
      color: "from-accent-orange to-secondary",
    },
    {
      name: "Fitness Team",
      icon: "💪",
      members: 543,
      color: "from-accent-blue to-secondary",
    },
  ],
};

export default function GroupsWidget() {
  const [activeTab, setActiveTab] = useState<"Newest" | "Popular" | "Active">(
    "Newest"
  );

  return (
    <div className="widget-box">
      <h3 className="text-xs font-black uppercase tracking-widest text-text-muted mb-4">
        Groups
      </h3>

      {/* Tabs */}
      <div className="flex gap-1 mb-4">
        {(["Newest", "Popular", "Active"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-lg transition-all ${
              activeTab === tab
                ? "bg-primary text-white"
                : "bg-background text-text-muted hover:bg-background/80"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Groups List */}
      <div className="flex flex-col gap-3">
        {groupsData[activeTab].map((group, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-background/50 transition-colors cursor-pointer group"
          >
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${group.color} flex items-center justify-center text-lg shrink-0`}
            >
              {group.icon}
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
}
