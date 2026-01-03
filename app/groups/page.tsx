"use client";

import { useState } from "react";
import GroupCard from "@/components/GroupCard";

const groups = [
  {
    id: 1,
    name: "Cosplayers of the World",
    avatar: "/images/avatars/avatar_01.png",
    cover: "/images/covers/cover_01.png",
    members: "139",
    posts: "450",
    category: "Cosplay",
    memberAvatars: [
      "/images/avatars/avatar_02.png",
      "/images/avatars/avatar_03.png",
      "/images/avatars/avatar_04.png",
      "/images/avatars/avatar_05.png",
      "/images/avatars/avatar_06.png",
    ],
    lastActivity: "2 hours ago",
  },
  {
    id: 2,
    name: "Streamers Republic",
    avatar: "/images/avatars/avatar_02.png",
    cover: "/images/covers/cover_02.png",
    members: "850",
    posts: "1.2k",
    isPrivate: true,
    category: "Streaming",
    memberAvatars: [
      "/images/avatars/avatar_01.png",
      "/images/avatars/avatar_03.png",
      "/images/avatars/avatar_07.png",
    ],
    lastActivity: "30 mins ago",
  },
  {
    id: 3,
    name: "Gaming Legends",
    avatar: "/images/avatars/avatar_03.png",
    cover: "/images/covers/cover_03.png",
    members: "5.4k",
    posts: "12k",
    category: "Gaming",
    memberAvatars: [
      "/images/avatars/avatar_01.png",
      "/images/avatars/avatar_02.png",
      "/images/avatars/avatar_04.png",
      "/images/avatars/avatar_08.png",
      "/images/avatars/avatar_09.png",
      "/images/avatars/avatar_10.png",
    ],
    lastActivity: "15 mins ago",
  },
  {
    id: 4,
    name: "Anime Lovers United",
    avatar: "/images/avatars/avatar_04.png",
    cover: "/images/covers/cover_04.png",
    members: "2.1k",
    posts: "8.5k",
    category: "Anime",
    memberAvatars: [
      "/images/avatars/avatar_05.png",
      "/images/avatars/avatar_06.png",
      "/images/avatars/avatar_07.png",
      "/images/avatars/avatar_08.png",
    ],
    lastActivity: "1 hour ago",
  },
  {
    id: 5,
    name: "Digital Artists Hub",
    avatar: "/images/avatars/avatar_05.png",
    cover: "/images/covers/cover_05.png",
    members: "1.8k",
    posts: "4.2k",
    isPrivate: true,
    category: "Art",
    memberAvatars: [
      "/images/avatars/avatar_01.png",
      "/images/avatars/avatar_09.png",
      "/images/avatars/avatar_10.png",
    ],
    lastActivity: "3 hours ago",
  },
  {
    id: 6,
    name: "Tech Enthusiasts",
    avatar: "/images/avatars/avatar_06.png",
    cover: "/images/covers/cover_06.png",
    members: "3.2k",
    posts: "6.8k",
    category: "Technology",
    memberAvatars: [
      "/images/avatars/avatar_02.png",
      "/images/avatars/avatar_03.png",
      "https:///images/avatars/avatar_11.png",
      "https:///images/avatars/avatar_12.png",
    ],
    lastActivity: "45 mins ago",
  },
  {
    id: 7,
    name: "Music Producers Network",
    avatar: "/images/avatars/avatar_07.png",
    cover: "/images/covers/cover_29.png",
    members: "920",
    posts: "2.3k",
    category: "Music",
    memberAvatars: [
      "/images/avatars/avatar_01.png",
      "/images/avatars/avatar_04.png",
      "/images/avatars/avatar_05.png",
    ],
    lastActivity: "5 hours ago",
  },
  {
    id: 8,
    name: "Esports Champions League",
    avatar: "/images/avatars/avatar_08.png",
    cover: "/images/covers/cover_28.png",
    members: "4.7k",
    posts: "15k",
    isPrivate: true,
    category: "Esports",
    memberAvatars: [
      "/images/avatars/avatar_02.png",
      "/images/avatars/avatar_06.png",
      "/images/avatars/avatar_07.png",
      "/images/avatars/avatar_09.png",
      "/images/avatars/avatar_10.png",
    ],
    lastActivity: "20 mins ago",
  },
  {
    id: 9,
    name: "Photography Masters",
    avatar: "/images/avatars/avatar_09.png",
    cover: "/images/covers/cover_30.png",
    members: "1.5k",
    posts: "3.8k",
    category: "Photography",
    memberAvatars: [
      "/images/avatars/avatar_01.png",
      "/images/avatars/avatar_03.png",
      "/images/avatars/avatar_05.png",
    ],
    lastActivity: "4 hours ago",
  },
];

const filterTabs = [
  { id: "newest", label: "Newest Groups" },
  { id: "active", label: "Most Active" },
  { id: "popular", label: "Most Popular" },
  { id: "alphabetical", label: "Alphabetical" },
];

const categories = [
  "All",
  "Gaming",
  "Streaming",
  "Cosplay",
  "Anime",
  "Art",
  "Technology",
  "Music",
  "Esports",
];

export default function GroupsPage() {
  const [activeFilter, setActiveFilter] = useState("newest");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const publicCount = groups.filter((g) => !g.isPrivate).length;
  const privateCount = groups.filter((g) => g.isPrivate).length;

  const filteredGroups = groups.filter((group) => {
    const matchesSearch = group.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || group.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col gap-8 animate-in slide-in-from-bottom-4 duration-700">
      <div className="widget-box p-8 bg-linear-to-r from-secondary/10 via-transparent to-primary/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-primary/5 to-secondary/5 opacity-5" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-wider mb-2">
              Groups
            </h1>
            <p className="text-sm text-text-muted font-medium">
              Find the perfect community for your interests!
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex gap-6">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-black text-accent-green">
                  {publicCount}
                </span>
                <span className="text-[10px] text-text-muted font-bold uppercase">
                  Public
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-black text-accent-red">
                  {privateCount}
                </span>
                <span className="text-[10px] text-text-muted font-bold uppercase">
                  Private
                </span>
              </div>
            </div>
            <button className="px-6 py-3 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/30 hover:scale-105 transition-all">
              + Create Group
            </button>
          </div>
        </div>
      </div>

      <div className="widget-box p-0! overflow-hidden">
        <div className="p-6 pb-0 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-black uppercase">Browse Groups</h2>
            <p className="text-xs text-text-muted font-medium">
              {filteredGroups.length} groups found
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2.5 bg-background rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <div className="relative flex-1 lg:w-64">
              <input
                type="text"
                placeholder="Search groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 pl-10 bg-background rounded-xl text-sm text-white placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex border-b border-border mt-4 overflow-x-auto">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`relative px-6 py-4 text-xs font-bold uppercase transition-colors whitespace-nowrap ${
                activeFilter === tab.id
                  ? "text-white"
                  : "text-text-muted hover:text-white"
              }`}
            >
              {tab.label}
              {activeFilter === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.map((group) => (
          <GroupCard key={group.id} {...group} />
        ))}
      </div>

      <div className="flex justify-center">
        <button className="px-8 py-3 bg-surface hover:bg-secondary text-white text-sm font-bold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-secondary/20">
          Load More Groups
        </button>
      </div>
    </div>
  );
}
