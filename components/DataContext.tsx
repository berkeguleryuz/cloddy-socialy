"use client";

import { createContext, useContext, ReactNode } from "react";
import { useAuth } from "./AuthContext";

// Demo posts data
const demoPosts = {
  textPosts: [
    {
      id: 1,
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
  ],
  videoPost: {
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
  },
  pollPost: {
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
  },
  galleryPost: {
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
  },
};

// Empty data for authenticated users
const emptyPosts = {
  textPosts: [],
  videoPost: null,
  pollPost: null,
  galleryPost: null,
};

interface DataContextType {
  posts: typeof demoPosts | typeof emptyPosts;
  isDemo: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { isDemo } = useAuth();

  const posts = isDemo ? demoPosts : emptyPosts;

  return (
    <DataContext.Provider value={{ posts, isDemo }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}

// Export demo data for direct usage in page.tsx when needed
export { demoPosts, emptyPosts };
