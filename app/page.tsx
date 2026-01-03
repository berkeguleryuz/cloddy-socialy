"use client";

import { useState } from "react";
import PostCard from "@/components/PostCard";
import HexagonAvatar from "@/components/HexagonAvatar";

const posts = [
  {
    id: 1,
    author: {
      name: "Neko Bebop",
      avatar: "/images/avatars/avatar_03.png",
      level: 16,
      time: "2 minutes ago",
    },
    content:
      "Hi everyone! Check out my latest video of the sandbox expansion for Cosmo Slime! G.I. is really excited, because my last video had almost 50,000 views.",
    video: true,
    likes: 15,
    comments: 4,
    shares: 2,
  },
];

export default function Home() {
  const [activeFilter, setActiveFilter] = useState("All Updates");
  const [activeTab, setActiveTab] = useState("Status");

  const filters = [
    "All Updates",
    "Mentions",
    "Friends",
    "Groups",
    "Blog Posts",
  ];

  const tabs = [
    { id: "Status", icon: "edit" },
    { id: "Blog Post", icon: "file" },
    { id: "Poll", icon: "poll" },
  ];

  return (
    <div className="flex flex-col gap-8 animate-in slide-in-from-bottom-4 duration-700">
      <div className="relative w-full h-[100px] rounded-xl overflow-hidden bg-linear-to-r from-[#615dfa] via-accent-blue to-[#21e19f]">
        <div className="absolute inset-0 opacity-30">
          <svg
            className="w-full h-full"
            viewBox="0 0 800 100"
            preserveAspectRatio="none"
          >
            <defs>
              <pattern
                id="waves"
                patternUnits="userSpaceOnUse"
                width="200"
                height="100"
              >
                <path
                  d="M0 50 Q50 0 100 50 T200 50"
                  fill="none"
                  stroke="white"
                  strokeWidth="0.5"
                  opacity="0.3"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#waves)" />
          </svg>
        </div>

        <div className="absolute inset-0 flex items-center pl-8">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
            <svg
              className="w-6 h-6 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"></path>
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-wide">
              Newsfeed
            </h1>
            <p className="text-white/80 text-xs font-medium">
              Check what your friends have been up to!
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-6">
        <div className="hidden lg:flex flex-col gap-6 order-1">
          <div className="widget-box text-center">
            <div className="relative w-28 h-28 mx-auto mb-4">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r="50"
                  fill="none"
                  stroke="var(--color-border)"
                  strokeWidth="6"
                />
                <circle
                  cx="56"
                  cy="56"
                  r="50"
                  fill="none"
                  stroke="url(#progressGradient)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${59 * 3.14} ${100 * 3.14}`}
                />
                <defs>
                  <linearGradient
                    id="progressGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#615dfa" />
                    <stop offset="100%" stopColor="#23d2e2" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-black text-white">59%</span>
              </div>
            </div>

            <h3 className="text-sm font-black text-white mb-1">
              Profile Completion
            </h3>
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-4">
              Marina Valentine
            </p>

            <p className="text-xs text-text-muted mb-6">
              Complete your profile by filling profile info, creating a group,
              and unlocking badges.
            </p>

            <div className="flex justify-center gap-8 mb-6">
              <div className="text-center">
                <p className="text-lg font-black text-white">11/30</p>
                <p className="text-[9px] font-bold uppercase text-text-muted tracking-wider">
                  Quests
                  <br />
                  Completed
                </p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-white">22/45</p>
                <p className="text-[9px] font-bold uppercase text-text-muted tracking-wider">
                  Badges
                  <br />
                  Unlocked
                </p>
              </div>
            </div>

            <div className="flex justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </div>
            </div>
          </div>

          <div className="widget-box">
            <h3 className="text-xs font-black uppercase tracking-widest text-text-muted mb-6">
              Featured Badges
            </h3>
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <div className="w-20 h-20 hexagon-mask bg-linear-to-br from-primary to-accent-blue flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 2L3 7v10l7 3 7-3V7l-7-5z" />
                  </svg>
                </div>
                <div className="absolute -top-1 -right-1 bg-surface border border-border rounded-full px-2 py-0.5 text-[9px] font-black text-primary">
                  +40 EXP
                </div>
              </div>
              <h4 className="text-sm font-black text-white mb-1">
                Universe Explorer
              </h4>
              <p className="text-[10px] text-text-muted text-center">
                Joined and interacted in 20 different groups
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 order-2">
          <div className="widget-box p-0 overflow-hidden">
            <div className="flex border-b border-border">
              {tabs.map((tab) => (
                <div
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-4 flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    activeTab === tab.id
                      ? "border-b-4 border-primary bg-background/20 text-white"
                      : "border-b-4 border-transparent text-text-muted hover:bg-background/10 hover:text-white"
                  }`}
                >
                  {tab.icon === "edit" && (
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
                    </svg>
                  )}
                  {tab.icon === "file" && (
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"></path>
                    </svg>
                  )}
                  {tab.icon === "poll" && (
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"></path>
                    </svg>
                  )}
                  <span className="text-[11px] font-black uppercase">
                    {tab.id}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-6 flex items-center gap-4">
              <HexagonAvatar
                src="/images/avatars/avatar_01.png"
                level={12}
                size="md"
              />
              <div className="flex-1 bg-background rounded-xl px-5 py-3 text-sm text-text-muted font-medium cursor-text border border-transparent hover:border-primary/50 transition-all">
                Hi Marina! Share your post here...
              </div>
              <div className="flex items-center gap-2">
                <button className="w-9 h-9 rounded-lg flex items-center justify-center text-text-muted hover:bg-primary/10 hover:text-primary transition-all">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    ></path>
                  </svg>
                </button>
                <button className="w-9 h-9 rounded-lg flex items-center justify-center text-text-muted hover:bg-secondary/10 hover:text-secondary transition-all">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-[11px] font-black uppercase tracking-wider overflow-x-auto no-scrollbar pb-1">
              {filters.map((filter) => (
                <div
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`${
                    activeFilter === filter
                      ? "text-white border-b-2 border-primary pb-1"
                      : "text-text-muted hover:text-white pb-1"
                  } cursor-pointer shrink-0 transition-all`}
                >
                  {filter}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} {...post} />
            ))}
          </div>
        </div>

        <div className="hidden lg:flex flex-col gap-6 order-3">
          <div
            className="rounded-xl p-5 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #23d2e2 0%, #14c0f0 100%)",
            }}
          >
            <div className="absolute top-0 right-0 w-full h-full opacity-40">
              <svg
                viewBox="0 0 200 80"
                className="w-full h-full"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 60 Q 30 30, 60 50 T 120 40 T 180 55 L 200 60 L 200 80 L 0 80 Z"
                  fill="rgba(255,255,255,0.15)"
                />
                <path
                  d="M0 65 Q 40 35, 80 55 T 160 45 L 200 65 L 200 80 L 0 80 Z"
                  fill="rgba(255,255,255,0.1)"
                />
                <circle cx="25" cy="55" r="3" fill="white" opacity="0.6" />
                <circle cx="60" cy="50" r="3" fill="white" opacity="0.6" />
                <circle cx="100" cy="45" r="3" fill="white" opacity="0.6" />
                <circle cx="140" cy="48" r="3" fill="white" opacity="0.6" />
                <circle cx="180" cy="52" r="3" fill="white" opacity="0.6" />
              </svg>
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-white/80">
                  Stats Box
                </h3>
                <div className="flex items-center gap-2">
                  <button className="text-white/60 hover:text-white">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  <button className="text-white/60 hover:text-white">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <p className="text-4xl font-black text-white">294</p>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded-full bg-[#2ecc71] flex items-center justify-center">
                    <svg
                      className="w-2.5 h-2.5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-[#2ecc71]">0.4%</span>
                </div>
              </div>
              <p className="text-sm font-bold text-white">Posts Created</p>
              <p className="text-[10px] text-white/60 mt-0.5">
                In the last month
              </p>
            </div>
          </div>

          <div className="widget-box">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-text-muted">
                Reactions Received
              </h3>
              <div className="flex items-center gap-2">
                <button className="text-text-muted hover:text-white">
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <button className="text-text-muted hover:text-white">
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col items-center gap-2">
                <img
                  src="/images/reactions/like.png"
                  alt="Like"
                  className="w-14 h-14 rounded-full"
                />
                <div className="text-center">
                  <p className="text-xl font-black text-white">12.642</p>
                  <p className="text-[9px] font-bold uppercase text-text-muted">
                    Likes
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <img
                  src="/images/reactions/love.png"
                  alt="Love"
                  className="w-14 h-14 rounded-full"
                />
                <div className="text-center">
                  <p className="text-xl font-black text-white">8.913</p>
                  <p className="text-[9px] font-bold uppercase text-text-muted">
                    Loves
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <img
                  src="/images/reactions/dislike.png"
                  alt="Dislike"
                  className="w-14 h-14 rounded-full"
                />
                <div className="text-center">
                  <p className="text-xl font-black text-white">945</p>
                  <p className="text-[9px] font-bold uppercase text-text-muted">
                    Dislikes
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <img
                  src="/images/reactions/happy.png"
                  alt="Happy"
                  className="w-14 h-14 rounded-full"
                />
                <div className="text-center">
                  <p className="text-xl font-black text-white">7.034</p>
                  <p className="text-[9px] font-bold uppercase text-text-muted">
                    Happy
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="widget-box">
            <h3 className="text-xs font-black uppercase tracking-widest text-text-muted mb-4">
              August 2019
            </h3>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px]">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="font-bold text-text-muted py-1">
                  {day}
                </div>
              ))}
              {[
                28, 29, 30, 31, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
                15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
                31,
              ].map((day, i) => (
                <div
                  key={i}
                  className={`py-1 rounded ${
                    i < 4
                      ? "text-text-muted/50"
                      : day === 12
                      ? "bg-primary text-white"
                      : "text-white hover:bg-background cursor-pointer"
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
