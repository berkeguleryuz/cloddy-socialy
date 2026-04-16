"use client";

import { memo } from "react";
import HexagonAvatar from "@/components/HexagonAvatar";

export interface ProfileUser {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  level: number;
  tagline?: string | null;
  wallet_address?: string;
  ens_name?: string | null;
  stats?: {
    posts: number;
    friends: number;
    visits: number;
  };
}

// Demo user data - shown when not authenticated or no user prop
const demoUser: ProfileUser = {
  id: "demo-user",
  display_name: "Marina Valentine",
  avatar_url: "/images/avatars/avatar_01.png",
  cover_url: "/images/covers/cover_01.png",
  level: 24,
  tagline: "www.gamehuntress.com",
  wallet_address: undefined,
  ens_name: undefined,
  stats: {
    posts: 930,
    friends: 82,
    visits: 5700,
  },
};

interface ProfileHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  user?: ProfileUser | null;
  isOwnProfile?: boolean;
  isDemo?: boolean;
}

const tabs = [
  "About",
  "Timeline",
  "Friends",
  "Groups",
  "Photos",
  "Videos",
  "Badges",
  "Stream",
  "Blog",
];

const socialLinks = [
  { icon: "facebook", color: "#3b5998" },
  { icon: "twitter", color: "#1da1f2" },
  { icon: "instagram", color: "#e1306c" },
  { icon: "twitch", color: "#9146ff" },
  { icon: "youtube", color: "#ff0000" },
  { icon: "discord", color: "#7289da" },
];

const ProfileHeader = memo(function ProfileHeader({
  activeTab,
  onTabChange,
  user,
  isOwnProfile = false,
  isDemo = false,
}: ProfileHeaderProps) {
  // Use provided user or fall back to demo data
  const displayUser = user || demoUser;
  const stats = displayUser.stats ?? demoUser.stats ?? { posts: 0, friends: 0, visits: 0 };

  // Format large numbers (e.g., 5700 -> "5.7K")
  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    }
    return num.toString();
  };

  return (
    <div className="widget-box overflow-hidden mb-8">
      <div className="h-72 relative overflow-hidden">
        <img
          src={displayUser.cover_url || "/images/covers/cover_01.png"}
          alt="Cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-surface via-surface/50 to-transparent"></div>
      </div>

      <div className="px-6 md:px-12 pb-8 flex flex-col lg:flex-row items-center lg:items-end gap-4 lg:gap-8 -mt-24 relative z-10">
        <div className="hidden lg:flex items-center gap-6 pb-4 order-1">
          <div className="flex flex-col items-center">
            <span className="text-xl font-black">{formatNumber(stats.posts)}</span>
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest">
              Posts
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl font-black">{formatNumber(stats.friends)}</span>
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest">
              Friends
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl font-black">{formatNumber(stats.visits)}</span>
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest">
              Visits
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center order-2 lg:order-2 flex-1">
          <div className="relative">
            <HexagonAvatar
              src={displayUser.avatar_url || "/images/avatars/avatar_01.png"}
              level={displayUser.level}
              size="xl"
            />
            <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-secondary border-2 border-surface"></div>
          </div>
          <h1 className="text-2xl font-black uppercase mt-4">
            {displayUser.display_name || "Anonymous User"}
          </h1>
          {displayUser.tagline && (
            <p className="text-sm text-primary font-bold hover:text-secondary cursor-pointer transition-colors">
              {displayUser.tagline}
            </p>
          )}
          {displayUser.wallet_address && !displayUser.tagline && (
            <p className="text-sm text-primary font-bold font-mono">
              {displayUser.ens_name || `${displayUser.wallet_address.slice(0, 6)}...${displayUser.wallet_address.slice(-4)}`}
            </p>
          )}
        </div>

        <div className="flex flex-col items-center lg:items-end gap-4 pb-4 order-3">
          <div className="flex items-center gap-2">
            {socialLinks.map((social) => (
              <button
                key={social.icon}
                className="w-8 h-8 rounded-lg bg-surface-light hover:opacity-80 transition-opacity flex items-center justify-center"
                style={{
                  backgroundColor: `${social.color}20`,
                  color: social.color,
                }}
              >
                <span className="text-xs font-bold uppercase">
                  {social.icon[0]}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {isOwnProfile || isDemo ? (
              <button className="px-6 py-2 bg-linear-to-r from-primary to-primary/80 text-white text-xs font-black rounded-lg shadow-lg shadow-primary/30 uppercase hover:opacity-90 transition-all">
                Edit Profile
              </button>
            ) : (
              <>
                <button className="px-6 py-2 bg-linear-to-r from-primary to-primary/80 text-white text-xs font-black rounded-lg shadow-lg shadow-primary/30 uppercase hover:opacity-90 transition-all">
                  Add Friend +
                </button>
                <button className="px-6 py-2 bg-linear-to-r from-secondary to-secondary/80 text-white text-xs font-black rounded-lg shadow-lg shadow-secondary/30 uppercase hover:opacity-90 transition-all">
                  Send Message
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="lg:hidden flex justify-center gap-8 px-6 pb-4">
        <div className="flex flex-col items-center">
          <span className="text-lg font-black">{formatNumber(stats.posts)}</span>
          <span className="text-[10px] text-text-muted font-bold uppercase">
            Posts
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-lg font-black">{formatNumber(stats.friends)}</span>
          <span className="text-[10px] text-text-muted font-bold uppercase">
            Friends
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-lg font-black">{formatNumber(stats.visits)}</span>
          <span className="text-[10px] text-text-muted font-bold uppercase">
            Visits
          </span>
        </div>
      </div>

      <div className="bg-[#1a1f2e] border-t border-border px-6 md:px-12 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-6 md:gap-10 py-5 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`text-xs font-bold uppercase tracking-widest transition-all relative py-1 ${
                activeTab === tab
                  ? "text-white"
                  : "text-text-muted hover:text-white"
              }`}
            >
              {tab}
              {activeTab === tab ? (
                <div className="absolute -bottom-5 left-0 right-0 h-0.5 bg-linear-to-r from-primary to-secondary"></div>
              ) : null}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

export default ProfileHeader;
