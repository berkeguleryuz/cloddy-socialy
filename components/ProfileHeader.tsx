"use client";

import HexagonAvatar from "@/components/HexagonAvatar";

interface ProfileHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
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

export default function ProfileHeader({
  activeTab,
  onTabChange,
}: ProfileHeaderProps) {
  return (
    <div className="widget-box overflow-hidden mb-8">
      <div className="h-72 relative overflow-hidden">
        <img
          src="/images/covers/cover_01.png"
          alt="Cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-surface via-surface/50 to-transparent"></div>
      </div>

      <div className="px-6 md:px-12 pb-8 flex flex-col lg:flex-row items-center lg:items-end gap-4 lg:gap-8 -mt-24 relative z-10">
        <div className="hidden lg:flex items-center gap-6 pb-4 order-1">
          <div className="flex flex-col items-center">
            <span className="text-xl font-black">930</span>
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest">
              Posts
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl font-black">82</span>
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest">
              Friends
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl font-black">5.7K</span>
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest">
              Visits
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center order-2 lg:order-2 flex-1">
          <div className="relative">
            <HexagonAvatar
              src="/images/avatars/avatar_01.png"
              level={24}
              size="xl"
            />
            <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-secondary border-2 border-surface"></div>
          </div>
          <h1 className="text-2xl font-black uppercase mt-4">
            Marina Valentine
          </h1>
          <p className="text-sm text-primary font-bold hover:text-secondary cursor-pointer transition-colors">
            www.gamehuntress.com
          </p>
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
            <button className="px-6 py-2 bg-linear-to-r from-primary to-primary/80 text-white text-xs font-black rounded-lg shadow-lg shadow-primary/30 uppercase hover:opacity-90 transition-all">
              Add Friend +
            </button>
            <button className="px-6 py-2 bg-linear-to-r from-secondary to-secondary/80 text-white text-xs font-black rounded-lg shadow-lg shadow-secondary/30 uppercase hover:opacity-90 transition-all">
              Send Message
            </button>
          </div>
        </div>
      </div>

      <div className="lg:hidden flex justify-center gap-8 px-6 pb-4">
        <div className="flex flex-col items-center">
          <span className="text-lg font-black">930</span>
          <span className="text-[10px] text-text-muted font-bold uppercase">
            Posts
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-lg font-black">82</span>
          <span className="text-[10px] text-text-muted font-bold uppercase">
            Friends
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-lg font-black">5.7K</span>
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
}
