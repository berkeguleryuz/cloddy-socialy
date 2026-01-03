"use client";

import { useState } from "react";
import ProfileHeader from "@/components/ProfileHeader";
import PostCard from "@/components/PostCard";
import HexagonAvatar from "@/components/HexagonAvatar";

const userPosts = [
  {
    id: 1,
    author: {
      name: "Marina Valentine",
      avatar: "/images/avatars/avatar_01.png",
      level: 24,
      time: "2 hours ago",
    },
    content:
      "Just finished an amazing gaming session! Who else is playing the new update? 🎮",
    image: "/images/covers/cover_01.png",
    likes: 287,
    comments: 42,
    shares: 15,
  },
  {
    id: 2,
    author: {
      name: "Marina Valentine",
      avatar: "/images/avatars/avatar_01.png",
      level: 24,
      time: "Yesterday",
    },
    content:
      "New artwork coming soon! Here's a little preview of what I've been working on. 🎨",
    image: "/images/covers/cover_04.png",
    likes: 523,
    comments: 89,
    shares: 34,
  },
];

const friends = [
  {
    name: "Nick Grissom",
    avatar: "/images/avatars/avatar_02.png",
    level: 18,
  },
  {
    name: "Sarah Diamond",
    avatar: "/images/avatars/avatar_03.png",
    level: 31,
  },
  {
    name: "James Thunder",
    avatar: "/images/avatars/avatar_04.png",
    level: 15,
  },
  {
    name: "Olivia Chen",
    avatar: "/images/avatars/avatar_05.png",
    level: 27,
  },
  {
    name: "Alex Storm",
    avatar: "/images/avatars/avatar_06.png",
    level: 22,
  },
  {
    name: "Luna Grey",
    avatar: "/images/avatars/avatar_07.png",
    level: 19,
  },
];

const groups = [
  {
    name: "Cosplayers of the World",
    members: 5632,
    image: "/images/covers/cover_01.png",
  },
  {
    name: "Pro Gaming League",
    members: 12500,
    image: "/images/covers/cover_02.png",
  },
  {
    name: "Digital Artists Hub",
    members: 8240,
    image: "/images/covers/cover_03.png",
  },
];

const photos = [
  "/images/covers/cover_01.png",
  "/images/covers/cover_02.png",
  "/images/covers/cover_03.png",
  "/images/covers/cover_04.png",
  "/images/covers/cover_05.png",
  "/images/covers/cover_06.png",
];

const badges = [
  { name: "Forum Master", icon: "🏆", color: "#ffd700", earned: true },
  { name: "Streamer Elite", icon: "📺", color: "#9146ff", earned: true },
  { name: "Social Butterfly", icon: "🦋", color: "#ec4899", earned: true },
  { name: "Quest Champion", icon: "⚔️", color: "#ef4444", earned: true },
  { name: "Content Creator", icon: "🎨", color: "#06b6d4", earned: true },
  { name: "Community Leader", icon: "👑", color: "#f59e0b", earned: true },
  { name: "Night Owl", icon: "🦉", color: "#8b5cf6", earned: false },
  { name: "Pioneer", icon: "🚀", color: "#22c55e", earned: false },
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("About");

  const renderTabContent = () => {
    switch (activeTab) {
      case "About":
        return <AboutTab />;
      case "Timeline":
        return <TimelineTab />;
      case "Friends":
        return <FriendsTab />;
      case "Groups":
        return <GroupsTab />;
      case "Photos":
        return <PhotosTab />;
      case "Videos":
        return <VideosTab />;
      case "Badges":
        return <BadgesTab />;
      case "Stream":
        return <StreamTab />;
      case "Blog":
        return <BlogTab />;
      default:
        return <AboutTab />;
    }
  };

  return (
    <div className="flex flex-col animate-in fade-in duration-700">
      <ProfileHeader activeTab={activeTab} onTabChange={setActiveTab} />
      {renderTabContent()}
    </div>
  );
}

function AboutTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="flex flex-col gap-6">
        <div className="widget-box p-6">
          <h3 className="text-sm font-black mb-4 uppercase">About Me</h3>
          <p className="text-xs leading-relaxed text-text-muted font-medium mb-6">
            Hi! I&apos;m Marina Valentine, a digital illustrator and graphic
            designer living in London. I love coffee, gaming and sushi!
            Currently working as a freelance artist and streaming my creative
            process on Twitch.
          </p>
          <div className="flex flex-col gap-4">
            <InfoRow
              icon="🏠"
              label="City"
              value="London, United Kingdom"
              color="primary"
            />
            <InfoRow
              icon="📅"
              label="Birthday"
              value="August 24th, 1996"
              color="secondary"
            />
            <InfoRow
              icon="💼"
              label="Occupation"
              value="Graphic Designer"
              color="accent-blue"
            />
            <InfoRow
              icon="📧"
              label="Email"
              value="marina@gamehuntress.com"
              color="accent-orange"
            />
          </div>
        </div>

        <div className="widget-box p-6">
          <h3 className="text-sm font-black mb-4 uppercase">Personal Info</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] text-text-muted font-bold uppercase">
                Status
              </span>
              <span className="text-xs font-bold">Single</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-text-muted font-bold uppercase">
                Joined
              </span>
              <span className="text-xs font-bold">March 2019</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-text-muted font-bold uppercase">
                Country
              </span>
              <span className="text-xs font-bold">United Kingdom</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-text-muted font-bold uppercase">
                Age
              </span>
              <span className="text-xs font-bold">28</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="widget-box p-6">
          <h3 className="text-sm font-black mb-4 uppercase">Interests</h3>
          <div className="space-y-4">
            <InterestRow
              label="TV Shows"
              value="Breaking Bad, Game of Thrones, Stranger Things"
            />
            <InterestRow label="Music" value="Pop, Electronic, K-Pop" />
            <InterestRow
              label="Movies"
              value="Inception, Interstellar, The Matrix"
            />
            <InterestRow
              label="Books"
              value="Harry Potter, The Witcher, Lord of the Rings"
            />
            <InterestRow
              label="Games"
              value="League of Legends, Valorant, Genshin Impact"
            />
          </div>
        </div>

        <div className="widget-box p-6">
          <h3 className="text-sm font-black mb-4 uppercase">
            Jobs & Education
          </h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-lg">
                🎨
              </div>
              <div>
                <h4 className="text-xs font-bold">
                  Freelance Graphic Designer
                </h4>
                <p className="text-[10px] text-text-muted">
                  Self-Employed • 2019 - Present
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center text-lg">
                🎓
              </div>
              <div>
                <h4 className="text-xs font-bold">University of Arts London</h4>
                <p className="text-[10px] text-text-muted">
                  BA Graphic Design • 2014 - 2018
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="widget-box p-6">
          <h3 className="text-sm font-black mb-4 uppercase">
            Profile Completion
          </h3>
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-24 h-24">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#2f3749"
                  strokeWidth="6"
                  fill="none"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="url(#gradient)"
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray="251.2"
                  strokeDashoffset="100"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient
                    id="gradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#7750f8" />
                    <stop offset="100%" stopColor="#40d04f" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-black">59%</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-text-muted font-bold">
                Quests Completed
              </span>
              <span className="font-bold">11/30</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-muted font-bold">Badges Unlocked</span>
              <span className="font-bold">22/46</span>
            </div>
          </div>
        </div>

        <div className="widget-box p-6">
          <h3 className="text-sm font-black mb-4 uppercase">
            Featured Friends
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {friends.slice(0, 6).map((friend) => (
              <div
                key={friend.name}
                className="flex flex-col items-center gap-2"
              >
                <HexagonAvatar
                  src={friend.avatar}
                  size="md"
                  level={friend.level}
                />
                <span className="text-[10px] font-bold text-center truncate w-full">
                  {friend.name.split(" ")[0]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="flex flex-col gap-6">
        <div className="widget-box p-6">
          <h3 className="text-sm font-black mb-4 uppercase">About Me</h3>
          <p className="text-xs leading-relaxed text-text-muted font-medium">
            Hi! I&apos;m Marina Valentine, a digital illustrator and graphic
            designer.
          </p>
        </div>
        <div className="widget-box p-6">
          <h3 className="text-sm font-black mb-4 uppercase">Featured Badges</h3>
          <div className="grid grid-cols-4 gap-2">
            {badges.slice(0, 4).map((badge) => (
              <div
                key={badge.name}
                className="flex items-center justify-center text-2xl"
              >
                {badge.icon}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="widget-box p-6 flex items-center gap-4">
          <HexagonAvatar
            src="/images/avatars/avatar_01.png"
            level={24}
            size="md"
          />
          <div className="flex-1 bg-background rounded-xl px-6 py-3 text-sm text-text-muted font-medium cursor-pointer hover:bg-surface transition-colors">
            What&apos;s on your mind, Marina?
          </div>
        </div>

        {userPosts.map((post) => (
          <PostCard key={post.id} {...post} />
        ))}
      </div>
    </div>
  );
}

function FriendsTab() {
  return (
    <div className="widget-box p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-black uppercase">Friends (82)</h3>
        <input
          type="text"
          placeholder="Search friends..."
          className="bg-background border border-border rounded-lg px-4 py-2 text-xs font-medium outline-none focus:border-primary"
        />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[...friends, ...friends].map((friend, i) => (
          <div
            key={`${friend.name}-${i}`}
            className="flex flex-col items-center gap-3 p-4 bg-background rounded-xl hover:bg-surface transition-colors cursor-pointer"
          >
            <HexagonAvatar
              src={friend.avatar}
              size="lg"
              level={friend.level}
            />
            <span className="text-xs font-bold text-center">{friend.name}</span>
            <button className="w-full py-1.5 text-[10px] font-bold uppercase bg-primary/20 text-primary rounded-lg hover:bg-primary hover:text-white transition-colors">
              Profile
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function GroupsTab() {
  return (
    <div className="widget-box p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-black uppercase">Groups (3)</h3>
        <button className="px-4 py-2 bg-linear-to-r from-primary to-secondary text-white text-xs font-black rounded-lg uppercase">
          + Create Group
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((group) => (
          <div
            key={group.name}
            className="bg-background rounded-xl overflow-hidden hover:scale-[1.02] transition-transform cursor-pointer"
          >
            <div className="h-24 relative">
              <img
                src={group.image}
                alt={group.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-[#161b28] to-transparent"></div>
            </div>
            <div className="p-4 -mt-4 relative z-10">
              <h4 className="text-sm font-bold mb-1">{group.name}</h4>
              <p className="text-[10px] text-text-muted font-bold">
                {group.members.toLocaleString()} Members
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PhotosTab() {
  return (
    <div className="widget-box p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-black uppercase">Photos (48)</h3>
        <button className="px-4 py-2 bg-linear-to-r from-primary to-secondary text-white text-xs font-black rounded-lg uppercase">
          + Upload Photo
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {[...photos, ...photos].map((photo, i) => (
          <div
            key={i}
            className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform"
          >
            <img
              src={photo}
              alt={`Photo ${i + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function VideosTab() {
  return (
    <div className="widget-box p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-black uppercase">Videos (12)</h3>
        <button className="px-4 py-2 bg-linear-to-r from-primary to-secondary text-white text-xs font-black rounded-lg uppercase">
          + Upload Video
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {photos.slice(0, 6).map((photo, i) => (
          <div
            key={i}
            className="aspect-video rounded-xl overflow-hidden relative cursor-pointer group hover:scale-[1.02] transition-transform"
          >
            <img
              src={photo}
              alt={`Video ${i + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/60 transition-colors">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <svg
                  className="w-6 h-6 text-white ml-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BadgesTab() {
  return (
    <div className="widget-box p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-black uppercase">Badges (22/46)</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {badges.map((badge) => (
          <div
            key={badge.name}
            className={`flex flex-col items-center gap-3 p-4 rounded-xl transition-all ${
              badge.earned ? "bg-background" : "bg-background/50 opacity-50"
            }`}
          >
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl"
              style={{ backgroundColor: `${badge.color}20` }}
            >
              {badge.icon}
            </div>
            <span className="text-xs font-bold text-center">{badge.name}</span>
            {badge.earned ? (
              <span className="text-[10px] font-bold text-secondary uppercase">
                Unlocked
              </span>
            ) : (
              <span className="text-[10px] font-bold text-text-muted uppercase">
                Locked
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StreamTab() {
  return (
    <div className="widget-box p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-black uppercase">Stream</h3>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
          <span className="text-xs font-bold text-red-500 uppercase">
            Live Now
          </span>
        </div>
      </div>
      <div className="aspect-video bg-background rounded-xl overflow-hidden relative mb-4">
        <img
          src="/images/covers/cover_01.png"
          alt="Stream Preview"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <button className="w-16 h-16 rounded-full bg-primary flex items-center justify-center hover:scale-110 transition-transform">
            <svg
              className="w-8 h-8 text-white ml-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold">
            Playing Valorant - Road to Immortal!
          </h4>
          <p className="text-xs text-text-muted">1,234 viewers</p>
        </div>
        <button className="px-4 py-2 bg-[#9146ff] text-white text-xs font-black rounded-lg uppercase">
          Watch on Twitch
        </button>
      </div>
    </div>
  );
}

function BlogTab() {
  return (
    <div className="widget-box p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-black uppercase">Blog Posts (8)</h3>
        <button className="px-4 py-2 bg-linear-to-r from-primary to-secondary text-white text-xs font-black rounded-lg uppercase">
          + Write Post
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-background rounded-xl overflow-hidden hover:scale-[1.02] transition-transform cursor-pointer"
          >
            <div className="h-32 relative">
              <img
                src={photos[i - 1]}
                alt={`Blog ${i}`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <span className="text-[10px] font-bold text-primary uppercase">
                Gaming
              </span>
              <h4 className="text-sm font-bold mt-1 mb-2">
                Top 10 Tips for Climbing in Ranked
              </h4>
              <p className="text-xs text-text-muted line-clamp-2">
                Learn the secrets to improving your gameplay and reaching higher
                ranks...
              </p>
              <div className="flex items-center gap-4 mt-3 text-[10px] font-bold text-text-muted">
                <span>Dec 28, 2025</span>
                <span>•</span>
                <span>5 min read</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className={`text-${color} text-lg`}>{icon}</div>
      <div className="flex flex-col">
        <span className="text-[10px] text-text-muted font-bold uppercase">
          {label}
        </span>
        <span className="text-xs font-bold">{value}</span>
      </div>
    </div>
  );
}

function InterestRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] text-text-muted font-bold uppercase">
        {label}
      </span>
      <span className="text-xs font-bold">{value}</span>
    </div>
  );
}
