"use client";

import { useState, useMemo } from "react";
import MemberCard from "@/components/MemberCard";
import { useAuth } from "@/components/AuthContext";
import { useData } from "@/components/DataContext";

// Demo members - shown when not authenticated
const demoMembers = [
  {
    id: 1,
    name: "Neko Bebop",
    avatar: "/images/avatars/avatar_03.png",
    cover: "/images/covers/cover_03.png",
    level: 12,
    stats: { posts: "874", friends: "60", visits: "3.9k" },
    tagline: "www.store.com/nekoprints",
    bio: "Hello! I'm James Hart, but I go by the name of Destroy Dex on my stream channel. Come to check out the latest gaming news!",
    badges: 29,
  },
  {
    id: 2,
    name: "Destroy Dex",
    avatar: "/images/avatars/avatar_09.png",
    cover: "/images/covers/cover_04.png",
    level: 13,
    stats: { posts: "890", friends: "79", visits: "4.6k" },
    tagline: "www.twitch.tv/d-destroyer",
    bio: "Hello! I'm James Hart, but I go by the name of Destroy Dex on my stream channel. Come to check out the latest gaming news!",
    badges: 12,
  },
  {
    id: 3,
    name: "Nick Grissom",
    avatar: "/images/avatars/avatar_02.png",
    cover: "/images/covers/cover_02.png",
    level: 16,
    stats: { posts: "562", friends: "77", visits: "2.3k" },
    tagline: "aka Phantom Streamer",
    bio: "Hello! I'm James Hart, but I go by the name of Destroy Dex on my stream channel. Come to check out the latest gaming news!",
    badges: 9,
  },
  {
    id: 4,
    name: "Sarah Diamond",
    avatar: "/images/avatars/avatar_05.png",
    cover: "/images/covers/cover_05.png",
    level: 26,
    stats: { posts: "1046", friends: "107", visits: "12.1k" },
    tagline: "www.diamondart.com",
    bio: "Hello! I'm James Hart, but I go by the name of Destroy Dex on my stream channel. Come to check out the latest gaming news!",
    badges: 32,
  },
  {
    id: 5,
    name: "Bearded Wonder",
    avatar: "/images/avatars/avatar_06.png",
    cover: "/images/covers/cover_06.png",
    level: 6,
    stats: { posts: "97", friends: "44", visits: "608" },
    tagline: "aka Jack Parker",
    bio: "Hello! I'm James Hart, but I go by the name of Destroy Dex on my stream channel. Come to check out the latest gaming news!",
    badges: 22,
  },
  {
    id: 6,
    name: "The Green Goo",
    avatar: "/images/avatars/avatar_10.png",
    cover: "/images/covers/cover_29.png",
    level: 5,
    stats: { posts: "28", friends: "53", visits: "901" },
    tagline: "www.ggprints.com",
    bio: "Hello! I'm James Hart, but I go by the name of Destroy Dex on my stream channel. Come to check out the latest gaming news!",
    badges: 7,
  },
  {
    id: 7,
    name: "Damian Greyson",
    avatar: "/images/avatars/avatar_04.png",
    cover: "/images/covers/cover_28.png",
    level: 4,
    stats: { posts: "29", friends: "17", visits: "218" },
    tagline: "aka Samurai Stream",
    bio: "Hello! I'm James Hart, but I go by the name of Destroy Dex on my stream channel. Come to check out the latest gaming news!",
    badges: 2,
  },
  {
    id: 8,
    name: "Rosie Sakura",
    avatar: "/images/avatars/avatar_07.png",
    cover: "/images/covers/cover_30.png",
    level: 19,
    stats: { posts: "1260", friends: "114", visits: "1.1k" },
    tagline: "www.rosiesk.com",
    bio: "Hello! I'm James Hart, but I go by the name of Destroy Dex on my stream channel. Come to check out the latest gaming news!",
    badges: 18,
  },
  {
    id: 9,
    name: "Sarah Rodgers",
    avatar: "/images/avatars/avatar_08.png",
    cover: "/images/covers/cover_01.png",
    level: 5,
    stats: { posts: "204", friends: "35", visits: "2.3k" },
    tagline: "aka Raven999",
    bio: "Hello! I'm James Hart, but I go by the name of Destroy Dex on my stream channel. Come to check out the latest gaming news!",
    badges: 6,
  },
];

const filterTabs = [
  { id: "active", label: "Recently Active" },
  { id: "newest", label: "Newest Friends" },
  { id: "alphabetical", label: "Alphabetical" },
];

export default function MembersPage() {
  const [activeFilter, setActiveFilter] = useState("active");
  const [currentPage, setCurrentPage] = useState(1);
  const membersPerPage = 9;

  const { isDemo, isAuthenticated } = useAuth();
  const { social } = useData();

  // Transform members data or use demo data
  const { members, totalMembers } = useMemo(() => {
    if (isDemo || !isAuthenticated || !social.friends || social.friends.length === 0) {
      return { members: demoMembers, totalMembers: 256 };
    }

    // Transform real friends data to member format
    const membersList = social.friends.map((friend: any, index: number) => ({
      id: friend.id || index,
      name: friend.user?.display_name || "User",
      avatar: friend.user?.avatar_url || `/images/avatars/avatar_0${(index % 8) + 1}.png`,
      cover: friend.user?.cover_url || `/images/covers/cover_0${(index % 6) + 1}.png`,
      level: friend.user?.level || 1,
      stats: {
        posts: friend.user?.posts_count?.toString() || "0",
        friends: friend.user?.friends_count?.toString() || "0",
        visits: friend.user?.profile_views?.toString() || "0",
      },
      tagline: friend.user?.tagline || "",
      bio: friend.user?.bio || "",
      badges: friend.user?.badges_count || 0,
    }));

    return { members: membersList, totalMembers: membersList.length };
  }, [isDemo, isAuthenticated, social.friends]);

  return (
    <div className="flex flex-col gap-8 animate-in slide-in-from-bottom-4 duration-700">
      <div className="widget-box p-0! overflow-hidden">
        <div className="p-6 pb-0 flex flex-col gap-1">
          <h1 className="text-lg font-black uppercase">
            Members ({totalMembers})
          </h1>
          <p className="text-xs text-text-muted font-medium">
            Browse all the members of the community!
          </p>
        </div>

        <div className="flex border-b border-border mt-4">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`relative px-6 py-4 text-xs font-bold uppercase transition-colors ${
                activeFilter === tab.id
                  ? "text-white"
                  : "text-text-muted hover:text-white"
              }`}
            >
              {tab.label}
              {activeFilter === tab.id ? (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
              ) : null}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {members.map((member) => (
          <MemberCard key={member.id} {...member} />
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-text-muted font-bold">
          Showing {membersPerPage} out of {totalMembers} members
        </p>

        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5, 6].map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                currentPage === page
                  ? "bg-primary text-white shadow-lg shadow-primary/30"
                  : "bg-surface text-text-muted hover:text-white hover:bg-background"
              }`}
            >
              {page.toString().padStart(2, "0")}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
