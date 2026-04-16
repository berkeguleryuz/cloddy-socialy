"use client";

import { useState, useMemo } from "react";
import HexagonAvatar from "@/components/HexagonAvatar";
import { useAuth } from "@/components/AuthContext";
import { useAccount } from "wagmi";
import { useLeaderboard, useUserRank, useXP } from "@/hooks/useContracts";

// Demo leaderboard data - used as fallback
const demoLeaderboard = [
  {
    rank: 1,
    user: {
      id: "1",
      name: "Destroy Dex",
      avatar: "/images/avatars/avatar_09.png",
      level: 32,
      address: "0x1234...5678",
    },
    xp: 125800,
    badges: 45,
    posts: 2340,
    change: "up" as const,
  },
  {
    rank: 2,
    user: {
      id: "2",
      name: "Gaming Pro",
      avatar: "/images/avatars/avatar_01.png",
      level: 24,
      address: "0x2345...6789",
    },
    xp: 98500,
    badges: 38,
    posts: 1890,
    change: "same" as const,
  },
  {
    rank: 3,
    user: {
      id: "3",
      name: "Crypto Queen",
      avatar: "/images/avatars/avatar_05.png",
      level: 27,
      address: "0x3456...7890",
    },
    xp: 87200,
    badges: 32,
    posts: 1650,
    change: "up" as const,
  },
  {
    rank: 4,
    user: {
      id: "4",
      name: "Nick Grissom",
      avatar: "/images/avatars/avatar_02.png",
      level: 16,
      address: "0x4567...8901",
    },
    xp: 65400,
    badges: 28,
    posts: 1230,
    change: "down" as const,
  },
  {
    rank: 5,
    user: {
      id: "5",
      name: "Neko Bebop",
      avatar: "/images/avatars/avatar_03.png",
      level: 12,
      address: "0x5678...9012",
    },
    xp: 52100,
    badges: 22,
    posts: 980,
    change: "up" as const,
  },
];

const timeFilters = [
  { id: "all", label: "All Time" },
  { id: "month", label: "This Month" },
  { id: "week", label: "This Week" },
  { id: "today", label: "Today" },
];

const categoryFilters = [
  { id: "xp", label: "XP" },
  { id: "badges", label: "Badges" },
  { id: "posts", label: "Posts" },
];

// Helper to calculate level from XP (100 * level^2)
function calculateLevel(xp: number): number {
  if (xp === 0) return 1;
  let level = 1;
  while (100 * (level + 1) * (level + 1) <= xp && level < 100) {
    level++;
  }
  return level;
}

// Helper to shorten address
function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function LeaderboardPage() {
  const [timeFilter, setTimeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("xp");

  const { isDemo, user } = useAuth();
  const { address } = useAccount();

  // Fetch on-chain leaderboard (top 20)
  const { data: onChainLeaderboard, isLoading: leaderboardLoading } = useLeaderboard(20);

  // Fetch user's rank
  const { data: userRank } = useUserRank(address);

  // Fetch user's XP
  const xpData = useXP(address);

  // Transform on-chain data to display format
  const leaderboardData = useMemo(() => {
    // If we have on-chain data, use it
    if (onChainLeaderboard && !isDemo) {
      const [users, xps] = onChainLeaderboard as [string[], bigint[]];

      if (users && users.length > 0) {
        return users.map((userAddress, index) => {
          const xp = Number(xps[index] || BigInt(0));
          return {
            rank: index + 1,
            user: {
              id: userAddress,
              name: shortenAddress(userAddress),
              avatar: `/images/avatars/avatar_0${(index % 10) + 1}.png`,
              level: calculateLevel(xp),
              address: userAddress,
            },
            xp,
            badges: 0, // Would need separate contract call
            posts: 0, // Off-chain data
            change: "same" as const,
          };
        });
      }
    }

    // Fallback to demo data
    return demoLeaderboard;
  }, [onChainLeaderboard, isDemo]);

  // Sort leaderboard based on category
  const sortedLeaderboard = useMemo(() => {
    return [...leaderboardData].sort((a, b) => {
      switch (categoryFilter) {
        case "badges":
          return b.badges - a.badges;
        case "posts":
          return b.posts - a.posts;
        default:
          return b.xp - a.xp;
      }
    });
  }, [leaderboardData, categoryFilter]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/30">
            <span className="text-lg">👑</span>
          </div>
        );
      case 2:
        return (
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-300 to-gray-400 flex items-center justify-center shadow-lg shadow-gray-400/30">
            <span className="text-lg">🥈</span>
          </div>
        );
      case 3:
        return (
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-600/30">
            <span className="text-lg">🥉</span>
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center">
            <span className="text-sm font-bold text-text-muted">{rank}</span>
          </div>
        );
    }
  };

  const getChangeIcon = (change: string) => {
    switch (change) {
      case "up":
        return (
          <svg className="w-4 h-4 text-secondary" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        );
      case "down":
        return (
          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-text-muted" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  // User's position data
  const myRank = userRank ? Number(userRank) : 0;
  const myXP = xpData.totalXP || 0;

  return (
    <div className="flex flex-col gap-8 animate-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-primary via-secondary to-accent-blue p-8">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-4 right-8 w-24 h-24 border-4 border-white/30 rounded-full" />
          <div className="absolute bottom-4 right-32 w-16 h-16 border-4 border-white/20 rounded-full" />
          <div className="absolute top-8 left-32 w-12 h-12 border-4 border-white/10 rounded-full" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black uppercase tracking-tight text-white mb-2">
            Leaderboard
          </h1>
          <p className="text-sm text-white/80 font-medium">
            {isDemo
              ? "Demo data - Connect wallet to see on-chain rankings"
              : "Top community members ranked by on-chain XP"}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="widget-box p-0 overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-6 pb-0 gap-4">
          <div className="flex gap-2 flex-wrap">
            {categoryFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setCategoryFilter(filter.id)}
                className={`px-4 py-2 text-xs font-bold uppercase rounded-lg transition-all ${
                  categoryFilter === filter.id
                    ? "bg-primary text-white"
                    : "bg-background text-text-muted hover:text-white"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2 flex-wrap">
            {timeFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setTimeFilter(filter.id)}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all ${
                  timeFilter === filter.id
                    ? "bg-secondary/20 text-secondary"
                    : "text-text-muted hover:text-white"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-border text-[10px] font-bold uppercase text-text-muted mt-4">
          <div className="col-span-1">Rank</div>
          <div className="col-span-5">User</div>
          <div className="col-span-2 text-center">XP</div>
          <div className="col-span-2 text-center">Level</div>
          <div className="col-span-1 text-center">Badges</div>
          <div className="col-span-1 text-center">Trend</div>
        </div>

        {/* Loading State */}
        {leaderboardLoading && !isDemo && (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-text-muted">Loading on-chain leaderboard...</p>
          </div>
        )}

        {/* Leaderboard List */}
        {(!leaderboardLoading || isDemo) && (
          <div className="divide-y divide-border/50">
            {sortedLeaderboard.map((entry, index) => (
              <div
                key={entry.user.id}
                className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-background/30 transition-colors cursor-pointer ${
                  index < 3 ? "bg-gradient-to-r from-primary/5 to-transparent" : ""
                } ${entry.user.address === address ? "ring-2 ring-primary/50" : ""}`}
              >
                {/* Rank */}
                <div className="col-span-1">{getRankIcon(index + 1)}</div>

                {/* User */}
                <div className="col-span-5 flex items-center gap-3">
                  <HexagonAvatar
                    src={entry.user.avatar}
                    level={entry.user.level}
                    size="md"
                  />
                  <div>
                    <h4 className="font-bold text-white flex items-center gap-2">
                      {entry.user.name}
                      {entry.user.address === address && (
                        <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded">YOU</span>
                      )}
                    </h4>
                    <span className="text-xs text-text-muted">
                      Level {entry.user.level}
                    </span>
                  </div>
                </div>

                {/* XP */}
                <div className="col-span-2 text-center">
                  <span
                    className={`font-bold ${
                      categoryFilter === "xp" ? "text-primary" : "text-white"
                    }`}
                  >
                    {formatNumber(entry.xp)}
                  </span>
                </div>

                {/* Level */}
                <div className="col-span-2 text-center">
                  <span className="font-bold text-white">
                    {entry.user.level}
                  </span>
                </div>

                {/* Badges */}
                <div className="col-span-1 text-center">
                  <span
                    className={`font-bold ${
                      categoryFilter === "badges" ? "text-primary" : "text-white"
                    }`}
                  >
                    {entry.badges}
                  </span>
                </div>

                {/* Trend */}
                <div className="col-span-1 flex justify-center">
                  {getChangeIcon(entry.change)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Your Position */}
      {address && !isDemo && (
        <div className="widget-box p-6 bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-lg font-bold text-primary">
                  {myRank > 0 ? `#${myRank}` : "-"}
                </span>
              </div>
              <div>
                <h3 className="font-bold">Your Position</h3>
                <p className="text-sm text-text-muted">
                  {myRank > 0
                    ? "Keep earning XP to climb the ranks!"
                    : "Earn XP to appear on the leaderboard"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-primary">{formatNumber(myXP)}</span>
              <span className="text-sm text-text-muted ml-2">XP</span>
            </div>
          </div>
        </div>
      )}

      {/* Demo Mode Notice */}
      {isDemo && (
        <div className="widget-box p-4 border border-yellow-500/20 bg-yellow-500/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <span className="text-lg">⚠️</span>
            </div>
            <div>
              <h4 className="font-bold text-yellow-500">Demo Mode</h4>
              <p className="text-sm text-text-muted">
                Connect your wallet to see the real on-chain leaderboard powered by CloddyReputation contract.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
