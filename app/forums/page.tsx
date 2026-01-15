"use client";

import { useState } from "react";
import HexagonAvatar from "@/components/HexagonAvatar";

const categories = [
  {
    id: 1,
    name: "Gaming",
    icon: "🎮",
    color: "#7c3aed",
    discussions: 328,
    members: 1562,
  },
  {
    id: 2,
    name: "Esports",
    icon: "🏆",
    color: "#f59e0b",
    discussions: 156,
    members: 843,
  },
  {
    id: 3,
    name: "Tech Talk",
    icon: "💻",
    color: "#06b6d4",
    discussions: 412,
    members: 2104,
  },
  {
    id: 4,
    name: "Music",
    icon: "🎵",
    color: "#ec4899",
    discussions: 89,
    members: 456,
  },
];

const topics = [
  {
    id: 1,
    title: "What's your favorite game of 2024?",
    category: "Gaming",
    categoryColor: "#7c3aed",
    author: {
      name: "Marina Valentine",
      avatar: "/images/avatars/avatar_01.png",
      level: 24,
    },
    replies: 48,
    views: 1234,
    lastActivity: "2 hours ago",
    isPinned: true,
  },
  {
    id: 2,
    title: "Best streaming setup for beginners?",
    category: "Tech Talk",
    categoryColor: "#06b6d4",
    author: {
      name: "Nick Grissom",
      avatar: "/images/avatars/avatar_02.png",
      level: 18,
    },
    replies: 32,
    views: 856,
    lastActivity: "4 hours ago",
    isPinned: false,
  },
  {
    id: 3,
    title: "Tournament predictions for this weekend",
    category: "Esports",
    categoryColor: "#f59e0b",
    author: {
      name: "Sarah Diamond",
      avatar: "/images/avatars/avatar_03.png",
      level: 31,
    },
    replies: 67,
    views: 2341,
    lastActivity: "6 hours ago",
    isPinned: true,
  },
  {
    id: 4,
    title: "Share your gaming playlists!",
    category: "Music",
    categoryColor: "#ec4899",
    author: {
      name: "James Thunder",
      avatar: "/images/avatars/avatar_04.png",
      level: 15,
    },
    replies: 21,
    views: 512,
    lastActivity: "12 hours ago",
    isPinned: false,
  },
  {
    id: 5,
    title: "New GPU releases - worth the upgrade?",
    category: "Tech Talk",
    categoryColor: "#06b6d4",
    author: {
      name: "Olivia Chen",
      avatar: "/images/avatars/avatar_05.png",
      level: 27,
    },
    replies: 89,
    views: 3456,
    lastActivity: "1 day ago",
    isPinned: false,
  },
];

export default function ForumsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-8 animate-in slide-in-from-bottom-4 duration-700">
      <div className="relative rounded-xl overflow-hidden bg-linear-to-r from-primary via-secondary to-primary p-8">
        <div className="absolute inset-0 bg-linear-to-r from-primary/10 to-secondary/10 bg-right bg-no-repeat opacity-20"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black uppercase tracking-tight text-white mb-2">
            FORUMS
          </h1>
          <p className="text-sm text-white/80 font-medium max-w-md">
            Join the conversation! Discuss your favorite games, share
            strategies, and connect with fellow gamers.
          </p>
        </div>
        <div className="absolute -right-4 -bottom-4 w-32 h-32 rounded-full bg-white/10 blur-3xl"></div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-black uppercase tracking-wide">
            Forum Categories
          </h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-linear-to-r from-primary to-secondary text-white text-xs font-black rounded-lg hover:opacity-90 transition-opacity uppercase tracking-wider"
          >
            + New Discussion
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() =>
                setSelectedCategory(
                  selectedCategory === category.name ? null : category.name
                )
              }
              className={`widget-box p-5 text-left transition-all duration-300 hover:scale-[1.02] ${
                selectedCategory === category.name ? "ring-2 ring-primary" : ""
              }`}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3"
                style={{ backgroundColor: `${category.color}20` }}
              >
                {category.icon}
              </div>
              <h3 className="text-sm font-black uppercase mb-1">
                {category.name}
              </h3>
              <div className="flex items-center gap-3 text-[10px] font-bold text-text-muted">
                <span>{category.discussions} discussions</span>
                <span>•</span>
                <span>{category.members} members</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-black uppercase tracking-wide">
            {selectedCategory ? `${selectedCategory} Topics` : "Newest Topics"}
          </h2>
          <div className="flex items-center gap-2">
            <select className="bg-surface-light border border-border text-white text-xs font-bold px-3 py-2 rounded-lg outline-none cursor-pointer">
              <option>Newest</option>
              <option>Most Replies</option>
              <option>Most Views</option>
            </select>
          </div>
        </div>

        <div className="widget-box divide-y divide-border">
          {topics
            .filter((t) => !selectedCategory || t.category === selectedCategory)
            .map((topic) => (
              <div
                key={topic.id}
                className="p-4 hover:bg-surface-light/50 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <HexagonAvatar
                    src={topic.author.avatar}
                    size="md"
                    level={topic.author.level}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {topic.isPinned ? (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-primary/20 text-primary rounded">
                          Pinned
                        </span>
                      ) : null}
                      <span
                        className="text-[10px] font-black uppercase px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: `${topic.categoryColor}20`,
                          color: topic.categoryColor,
                        }}
                      >
                        {topic.category}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white hover:text-primary transition-colors truncate">
                      {topic.title}
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-[10px] font-bold text-text-muted">
                      <span>by {topic.author.name}</span>
                      <span>•</span>
                      <span>{topic.lastActivity}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-center shrink-0">
                    <div>
                      <div className="text-sm font-black text-white">
                        {topic.replies}
                      </div>
                      <div className="text-[10px] font-bold text-text-muted uppercase">
                        Replies
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-black text-white">
                        {topic.views.toLocaleString()}
                      </div>
                      <div className="text-[10px] font-bold text-text-muted uppercase">
                        Views
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {showCreateModal ? (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="widget-box w-full max-w-lg p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black uppercase">
                Create Discussion
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-text-muted hover:text-white transition-colors"
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase mb-2">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="Enter discussion title..."
                  className="w-full bg-surface-light border border-border rounded-lg px-4 py-3 text-sm font-medium text-white placeholder:text-text-muted outline-none focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted uppercase mb-2">
                  Category
                </label>
                <select className="w-full bg-surface-light border border-border rounded-lg px-4 py-3 text-sm font-medium text-white outline-none focus:border-primary transition-colors cursor-pointer">
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted uppercase mb-2">
                  Content
                </label>
                <textarea
                  placeholder="Write your discussion content..."
                  rows={5}
                  className="w-full bg-surface-light border border-border rounded-lg px-4 py-3 text-sm font-medium text-white placeholder:text-text-muted outline-none focus:border-primary transition-colors resize-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-black uppercase text-text-muted hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button className="px-6 py-2 bg-linear-to-r from-primary to-secondary text-white text-xs font-black rounded-lg hover:opacity-90 transition-opacity uppercase tracking-wider">
                  Post Discussion
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
