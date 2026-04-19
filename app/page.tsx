"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import PostCard from "@/components/PostCard";
import VideoPost from "@/components/VideoPost";
import PollPost from "@/components/PollPost";
import GalleryPost from "@/components/GalleryPost";
import MembersWidget from "@/components/MembersWidget";
import QuestsWidget from "@/components/QuestsWidget";
import PromoWidget from "@/components/PromoWidget";
import EventsWidget from "@/components/EventsWidget";
import ActivityWidget from "@/components/ActivityWidget";
import GroupsWidget from "@/components/GroupsWidget";
import CreatePostForm from "@/components/CreatePostForm";
import { useAuth } from "@/components/AuthContext";
import { useData } from "@/components/DataContext";
import { useQuestStats } from "@/hooks/useQuests";

// Demo data - shown when not authenticated
const demoTextPosts = [
  {
    id: "demo-text-1",
    author: {
      name: "Marina Valentine",
      avatar: "/images/avatars/avatar_01.png",
      level: 24,
      time: "15 minutes ago",
    },
    content:
      "Just finished my new gaming setup! 🎮 The RGB lighting is absolutely insane. Can't wait to stream tonight and show it off to everyone!",
    image: "/images/posts/gaming_setup.jpg",
    likes: 87,
    comments: 23,
    shares: 5,
  },
];

const demoVideoPost = {
  id: "demo-video-1",
  author: {
    name: "Neko Bebop",
    avatar: "/images/avatars/avatar_03.png",
    level: 16,
    time: "2 hours ago",
  },
  content:
    "Check out my latest video of the sandbox expansion for Cosmo Slime! G.I. is really excited, because my last video had almost 50,000 views. Don't forget to like and subscribe! 🚀",
  videoThumbnail: "/images/posts/video_thumbnail.jpg",
  videoTitle: "Cosmo Slime - Sandbox Expansion Full Gameplay",
  videoDuration: "12:45",
  videoViews: "48.2K",
  likes: 342,
  comments: 89,
  shares: 24,
};

const demoPollPost = {
  id: "demo-poll-1",
  author: {
    name: "Sarah Diamond",
    avatar: "/images/avatars/avatar_08.png",
    level: 19,
    time: "4 hours ago",
  },
  question: "Which game should I stream this weekend?",
  options: [
    { id: 1, text: "Elden Ring - New DLC", votes: 156 },
    { id: 2, text: "Cyberpunk 2077 - Phantom Liberty", votes: 98 },
    { id: 3, text: "Baldur's Gate 3", votes: 234 },
    { id: 4, text: "Starfield", votes: 67 },
  ],
  totalVotes: 555,
  likes: 45,
  comments: 32,
  shares: 8,
};

const demoGalleryPost = {
  id: "demo-gallery-1",
  author: {
    name: "Destroy Dex",
    avatar: "/images/avatars/avatar_07.png",
    level: 32,
    time: "6 hours ago",
  },
  content:
    "Screenshots from today's epic gaming session! We finally beat the raid boss after 47 attempts 🎉",
  images: [
    "/images/posts/gallery_1.jpg",
    "/images/posts/gallery_2.jpg",
    "/images/posts/gallery_3.jpg",
    "/images/posts/gallery_4.jpg",
    "/images/posts/gallery_5.jpg",
    "/images/posts/gallery_6.jpg",
  ],
  likes: 156,
  comments: 41,
  shares: 12,
};

// Demo user profile stats
const demoProfileStats = {
  name: "Marina Valentine",
  profileCompletion: 59,
  questsCompleted: "11/30",
  badgesUnlocked: "22/45",
  postsCreated: 294,
};

// Helper function to format time
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
}

export default function Home() {
  const t = useTranslations("newsfeed");
  const [activeFilter, setActiveFilter] = useState("all");

  // Get auth and data context
  const { user: authUser, isDemo, isAuthenticated } = useAuth();
  const { feed, gamification, posts: demoPosts } = useData();
  const questStats = useQuestStats();

  // Determine which posts to show - demo for unauthenticated, real for authenticated
  const { textPosts, videoPost, pollPost, galleryPost, profileStats, showEmptyFeed } = useMemo(() => {
    if (isDemo || !isAuthenticated) {
      // Show demo data for demo mode or unauthenticated users
      return {
        textPosts: demoTextPosts,
        videoPost: demoVideoPost,
        pollPost: demoPollPost,
        galleryPost: demoGalleryPost,
        profileStats: demoProfileStats,
        showEmptyFeed: false,
      };
    }

    // For authenticated users, transform API posts to match component props
    const apiPosts = feed.posts || [];
    const transformedTextPosts = apiPosts
      .filter((p: any) => p.post_type === 'text' || !p.post_type)
      .map((post: any) => ({
        id: post.id,
        author: {
          name: post.author?.display_name || authUser?.name || "User",
          avatar: post.author?.avatar_url || "/images/avatars/avatar_01.png",
          level: post.author?.level || 1,
          time: formatTimeAgo(post.created_at),
        },
        content: post.content,
        image: post.media?.[0]?.url,
        likes: post.likes_count || 0,
        comments: post.comments_count || 0,
        shares: post.shares_count || 0,
      }));

    // Check for special post types
    const videoPosts = apiPosts.filter((p: any) => p.post_type === 'video');
    const pollPosts = apiPosts.filter((p: any) => p.post_type === 'poll');
    const galleryPosts = apiPosts.filter((p: any) => p.post_type === 'gallery');

    // For authenticated users, show real data or null (not demo)
    return {
      textPosts: transformedTextPosts,
      videoPost: videoPosts.length > 0 ? {
        id: videoPosts[0].id,
        author: {
          name: videoPosts[0].author?.display_name || "User",
          avatar: videoPosts[0].author?.avatar_url || "/images/avatars/avatar_03.png",
          level: videoPosts[0].author?.level || 1,
          time: formatTimeAgo(videoPosts[0].created_at),
        },
        content: videoPosts[0].content,
        videoThumbnail: videoPosts[0].media?.[0]?.thumbnail_url || "/images/posts/video_thumbnail.jpg",
        videoTitle: videoPosts[0].media?.[0]?.title || "Video",
        videoDuration: videoPosts[0].media?.[0]?.duration || "0:00",
        videoViews: "0",
        likes: videoPosts[0].likes_count || 0,
        comments: videoPosts[0].comments_count || 0,
        shares: videoPosts[0].shares_count || 0,
      } : null,
      pollPost: pollPosts.length > 0 ? {
        id: pollPosts[0].id,
        author: {
          name: pollPosts[0].author?.display_name || "User",
          avatar: pollPosts[0].author?.avatar_url || "/images/avatars/avatar_08.png",
          level: pollPosts[0].author?.level || 1,
          time: formatTimeAgo(pollPosts[0].created_at),
        },
        question: pollPosts[0].content,
        options: pollPosts[0].poll_options || [],
        totalVotes: pollPosts[0].poll_options?.reduce((sum: number, opt: any) => sum + (opt.votes || 0), 0) || 0,
        likes: pollPosts[0].likes_count || 0,
        comments: pollPosts[0].comments_count || 0,
        shares: pollPosts[0].shares_count || 0,
      } : null,
      galleryPost: galleryPosts.length > 0 ? {
        id: galleryPosts[0].id,
        author: {
          name: galleryPosts[0].author?.display_name || "User",
          avatar: galleryPosts[0].author?.avatar_url || "/images/avatars/avatar_07.png",
          level: galleryPosts[0].author?.level || 1,
          time: formatTimeAgo(galleryPosts[0].created_at),
        },
        content: galleryPosts[0].content,
        images: galleryPosts[0].media?.map((m: any) => m.url) || [],
        likes: galleryPosts[0].likes_count || 0,
        comments: galleryPosts[0].comments_count || 0,
        shares: galleryPosts[0].shares_count || 0,
      } : null,
      profileStats: {
        name: authUser?.name || "User",
        profileCompletion: gamification.xp?.progressPercent || 0,
        questsCompleted: `${questStats.stats.daily.completed + questStats.stats.weekly.completed + questStats.stats.achievements.completed}/${questStats.stats.daily.total + questStats.stats.weekly.total + questStats.stats.achievements.total}`,
        badgesUnlocked: `${gamification.userBadges.length}/${gamification.badges.length || 0}`,
        postsCreated: feed.posts?.length || 0,
      },
      showEmptyFeed: apiPosts.length === 0,
    };
  }, [isDemo, isAuthenticated, feed.posts, authUser, gamification, demoPosts]);

  const filters = [
    { id: "all", label: t("filters.all") },
    { id: "mentions", label: t("filters.mentions") },
    { id: "friends", label: t("filters.friends") },
    { id: "groups", label: t("filters.groups") },
    { id: "blog", label: t("filters.blog") },
  ];


  return (
    <div className="flex flex-col gap-8 animate-in slide-in-from-bottom-4 duration-700">
      {/* Header Banner */}
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
              {t("title")}
            </h1>
            <p className="text-white/80 text-xs font-medium">{t("subtitle")}</p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-6">
        {/* Left Sidebar */}
        <div className="hidden lg:flex flex-col gap-6 order-1">
          {/* Profile Completion */}
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
                  strokeDasharray={`${profileStats.profileCompletion * 3.14} ${100 * 3.14}`}
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
                <span className="text-2xl font-black text-white">{profileStats.profileCompletion}%</span>
              </div>
            </div>

            <h3 className="text-sm font-black text-white mb-1">
              Profile Completion
            </h3>
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-4">
              {profileStats.name}
            </p>

            <p className="text-xs text-text-muted mb-6">
              Complete your profile by filling profile info, creating a group,
              and unlocking badges.
            </p>

            <div className="flex justify-center gap-8 mb-6">
              <div className="text-center">
                <p className="text-lg font-black text-white">{profileStats.questsCompleted}</p>
                <p className="text-[9px] font-bold uppercase text-text-muted tracking-wider">
                  Quests
                  <br />
                  Completed
                </p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-white">{profileStats.badgesUnlocked}</p>
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

          <MembersWidget />
          <QuestsWidget />
          <PromoWidget />
        </div>

        {/* Main Content */}
        <div className="flex flex-col gap-6 order-2">
          {/* Post Creation Box */}
          {isAuthenticated && <CreatePostForm />}

          {/* Filters */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-[11px] font-black uppercase tracking-wider overflow-x-auto no-scrollbar pb-1">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setActiveFilter(filter.id)}
                  className={`${
                    activeFilter === filter.id
                      ? "text-white border-b-2 border-primary pb-1"
                      : "text-text-muted hover:text-white pb-1"
                  } cursor-pointer shrink-0 transition-all bg-transparent border-0 font-[inherit] tracking-[inherit] uppercase`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Posts Feed */}
          <div className="flex flex-col gap-6">
            {showEmptyFeed && isAuthenticated ? (
              <div className="widget-box p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">No posts yet</h3>
                <p className="text-sm text-text-muted mb-4">
                  Be the first to share something! Create a post above to get started.
                </p>
              </div>
            ) : (
              <>
                {videoPost && <VideoPost {...videoPost} />}
                {pollPost && <PollPost {...pollPost} />}
                {galleryPost && <GalleryPost {...galleryPost} />}
                {textPosts.map((post) => (
                  <PostCard key={post.id} {...post} />
                ))}
              </>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="hidden lg:flex flex-col gap-6 order-3">
          {/* Stats Box */}
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
                <p className="text-4xl font-black text-white">{profileStats.postsCreated}</p>
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

          <EventsWidget />
          <ActivityWidget />
          <GroupsWidget />

          {/* Calendar */}
          <div className="widget-box">
            <h3 className="text-xs font-black uppercase tracking-widest text-text-muted mb-4">
              January 2026
            </h3>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px]">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="font-bold text-text-muted py-1">
                  {day}
                </div>
              ))}
              {[
                29, 30, 31, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
                16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31,
                1,
              ].map((day, i) => (
                <div
                  key={i}
                  className={`py-1 rounded ${
                    i < 3 || i > 33
                      ? "text-text-muted/50"
                      : day === 5
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
