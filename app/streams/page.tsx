"use client";

import { useState } from "react";
import StreamCard from "@/components/StreamCard";

const streams = [
  {
    id: 1,
    title: "🔴 Playing Valorant Ranked - Road to Immortal!",
    streamer: {
      name: "Marina Valentine",
      avatar: "/images/avatars/avatar_01.png",
      level: 24,
    },
    thumbnail: "/images/covers/cover_01.png",
    viewers: 1247,
    isLive: true,
    platform: "twitch" as const,
    category: "Valorant",
  },
  {
    id: 2,
    title: "Chill Music & Chat - Late Night Vibes 🌙",
    streamer: {
      name: "Nick Grissom",
      avatar: "/images/avatars/avatar_02.png",
      level: 16,
    },
    thumbnail: "/images/covers/cover_02.png",
    viewers: 892,
    isLive: true,
    platform: "youtube" as const,
    category: "Just Chatting",
  },
  {
    id: 3,
    title: "First Playthrough - Elden Ring DLC!",
    streamer: {
      name: "Neko Bebop",
      avatar: "/images/avatars/avatar_03.png",
      level: 12,
    },
    thumbnail: "/images/covers/cover_03.png",
    viewers: 2341,
    isLive: true,
    platform: "twitch" as const,
    category: "Elden Ring",
  },
  {
    id: 4,
    title: "Pro Tips & Tricks - League of Legends Coaching",
    streamer: {
      name: "Sarah Diamond",
      avatar: "/images/avatars/avatar_05.png",
      level: 26,
    },
    thumbnail: "/images/covers/cover_05.png",
    viewers: 567,
    isLive: true,
    platform: "twitch" as const,
    category: "League of Legends",
  },
  {
    id: 5,
    title: "Weekly Podcast - Gaming Industry News",
    streamer: {
      name: "Tim Rogers",
      avatar: "/images/avatars/avatar_04.png",
      level: 7,
    },
    thumbnail: "/images/covers/cover_04.png",
    isLive: false,
    platform: "youtube" as const,
    category: "Podcast",
    duration: "1:24:35",
  },
  {
    id: 6,
    title: "Minecraft Survival - Building a Castle",
    streamer: {
      name: "Bearded Wonder",
      avatar: "/images/avatars/avatar_06.png",
      level: 6,
    },
    thumbnail: "/images/covers/cover_06.png",
    isLive: false,
    platform: "facebook" as const,
    category: "Minecraft",
    duration: "2:45:12",
  },
  {
    id: 7,
    title: "Art Stream - Digital Painting Session",
    streamer: {
      name: "Sandra Strange",
      avatar: "/images/avatars/avatar_07.png",
      level: 27,
    },
    thumbnail: "/images/covers/cover_29.png",
    isLive: false,
    platform: "twitch" as const,
    category: "Art",
    duration: "3:12:08",
  },
  {
    id: 8,
    title: "Speed Run Challenge - Mario 64 Any%",
    streamer: {
      name: "Destroy Dex",
      avatar: "/images/avatars/avatar_09.png",
      level: 13,
    },
    thumbnail: "/images/covers/cover_28.png",
    isLive: false,
    platform: "youtube" as const,
    category: "Speedrun",
    duration: "0:52:44",
  },
];

const filterTabs = [
  { id: "all", label: "All Streams" },
  { id: "live", label: "Live Now" },
  { id: "past", label: "Past Streams" },
];

const platforms = ["All Platforms", "Twitch", "YouTube", "Facebook"];

export default function StreamsPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedPlatform, setSelectedPlatform] = useState("All Platforms");

  const liveCount = streams.filter((s) => s.isLive).length;
  const totalViewers = streams
    .filter((s) => s.isLive)
    .reduce((sum, s) => sum + (s.viewers || 0), 0);

  const filteredStreams = streams.filter((stream) => {
    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "live" && stream.isLive) ||
      (activeFilter === "past" && !stream.isLive);

    const matchesPlatform =
      selectedPlatform === "All Platforms" ||
      stream.platform.toLowerCase() === selectedPlatform.toLowerCase();

    return matchesFilter && matchesPlatform;
  });

  return (
    <div className="flex flex-col gap-8 animate-in slide-in-from-bottom-4 duration-700">
      <div className="widget-box p-8 bg-linear-to-r from-[#9146FF]/10 via-transparent to-[#FF0000]/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-primary/5 to-secondary/5 opacity-5" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-wider mb-2">
              Streams
            </h1>
            <p className="text-sm text-text-muted font-medium">
              Watch live streams from our community members!
            </p>
          </div>

          <div className="flex gap-6">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent-red rounded-full animate-pulse" />
                <span className="text-2xl font-black text-accent-red">
                  {liveCount}
                </span>
              </div>
              <span className="text-[10px] text-text-muted font-bold uppercase">
                Live Now
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-primary">
                {totalViewers.toLocaleString()}
              </span>
              <span className="text-[10px] text-text-muted font-bold uppercase">
                Viewers
              </span>
            </div>
          </div>
        </div>
      </div>

      {liveCount > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-accent-red rounded-full animate-pulse" />
            <h2 className="text-lg font-black uppercase">Live Now</h2>
            <span className="text-xs text-text-muted font-bold">
              ({liveCount} streams)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {streams
              .filter((s) => s.isLive)
              .map((stream) => (
                <StreamCard key={stream.id} {...stream} />
              ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="widget-box p-0! overflow-hidden">
          <div className="p-6 pb-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-black uppercase">Browse Streams</h2>
              <p className="text-xs text-text-muted font-medium">
                {filteredStreams.length} streams found
              </p>
            </div>

            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="px-4 py-2.5 bg-background rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
            >
              {platforms.map((platform) => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ))}
            </select>
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
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#9146FF] rounded-t-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredStreams.map((stream) => (
            <StreamCard key={stream.id} {...stream} />
          ))}
        </div>
      </div>

      <div className="widget-box p-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-linear-to-r from-[#9146FF]/10 to-[#FF0000]/10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#9146FF]/20 rounded-xl flex items-center justify-center">
            <svg
              className="w-7 h-7 text-[#9146FF]"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold">Start Your Own Stream</h3>
            <p className="text-sm text-text-muted">
              Connect your streaming account and go live!
            </p>
          </div>
        </div>
        <button className="px-6 py-3 bg-[#9146FF] text-white text-sm font-bold rounded-xl shadow-lg shadow-[#9146FF]/30 hover:scale-105 transition-all">
          Connect Account
        </button>
      </div>
    </div>
  );
}
