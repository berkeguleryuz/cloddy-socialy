"use client";

import { useState } from "react";
import HexagonAvatar from "./HexagonAvatar";

const membersData = {
  Newest: [
    {
      name: "Nick Grissom",
      avatar: "/images/avatars/avatar_02.png",
      level: 16,
    },
    { name: "Neko Bebop", avatar: "/images/avatars/avatar_03.png", level: 12 },
    { name: "Matt Parker", avatar: "/images/avatars/avatar_04.png", level: 8 },
    {
      name: "Sandra Strange",
      avatar: "/images/avatars/avatar_05.png",
      level: 27,
    },
    { name: "James Walker", avatar: "/images/avatars/avatar_06.png", level: 5 },
  ],
  Popular: [
    {
      name: "Marina Valentine",
      avatar: "/images/avatars/avatar_01.png",
      level: 24,
    },
    {
      name: "Sandra Strange",
      avatar: "/images/avatars/avatar_05.png",
      level: 27,
    },
    {
      name: "Nick Grissom",
      avatar: "/images/avatars/avatar_02.png",
      level: 16,
    },
    { name: "Destroy Dex", avatar: "/images/avatars/avatar_07.png", level: 32 },
    {
      name: "Sarah Diamond",
      avatar: "/images/avatars/avatar_08.png",
      level: 19,
    },
  ],
  Active: [
    { name: "Destroy Dex", avatar: "/images/avatars/avatar_07.png", level: 32 },
    {
      name: "Marina Valentine",
      avatar: "/images/avatars/avatar_01.png",
      level: 24,
    },
    { name: "Neko Bebop", avatar: "/images/avatars/avatar_03.png", level: 12 },
    { name: "Matt Parker", avatar: "/images/avatars/avatar_04.png", level: 8 },
    {
      name: "Nick Grissom",
      avatar: "/images/avatars/avatar_02.png",
      level: 16,
    },
  ],
};

export default function MembersWidget() {
  const [activeTab, setActiveTab] = useState<"Newest" | "Popular" | "Active">(
    "Newest"
  );

  return (
    <div className="widget-box">
      <h3 className="text-xs font-black uppercase tracking-widest text-text-muted mb-4">
        Members
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

      {/* Members List */}
      <div className="flex flex-col gap-3">
        {membersData[activeTab].map((member, index) => (
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
                Lvl {member.level}
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
        ))}
      </div>
    </div>
  );
}
