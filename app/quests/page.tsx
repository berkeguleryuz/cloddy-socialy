"use client";

import { useState } from "react";
import HexagonAvatar from "@/components/HexagonAvatar";

interface Quest {
  id: number;
  name: string;
  description: string;
  exp: number;
  completed: boolean;
  friendsCompleted?: number;
  featured?: boolean;
}

const featuredQuests: Quest[] = [
  {
    id: 1,
    name: "Social King",
    description: "You have linked at least 8 social networks to your profile",
    exp: 60,
    completed: true,
    friendsCompleted: 24,
    featured: true,
  },
  {
    id: 2,
    name: "Friendly User",
    description: "Give 50 like and/or love reactions on your friends' posts",
    exp: 40,
    completed: true,
    friendsCompleted: 33,
    featured: true,
  },
  {
    id: 3,
    name: "Nothing to Hide",
    description: "You have completed all your profile information fields",
    exp: 40,
    completed: true,
    friendsCompleted: 24,
    featured: true,
  },
  {
    id: 4,
    name: "Store Manager",
    description: "You have uploaded at least 10 items in your shop",
    exp: 100,
    completed: true,
    friendsCompleted: 5,
    featured: true,
  },
];

const allQuests: Quest[] = [
  {
    id: 5,
    name: "Press Start!",
    description: "Post a status update or any other post for the first time",
    exp: 20,
    completed: true,
  },
  {
    id: 6,
    name: "Nothing to Hide",
    description: "You have completed all your profile information fields",
    exp: 40,
    completed: true,
  },
  {
    id: 7,
    name: "Friendly User",
    description: "Give 50 like and/or love reactions on your friends' posts",
    exp: 40,
    completed: true,
  },
  {
    id: 8,
    name: "People's Herald",
    description: "Shared 20 friend's posts on your profile page",
    exp: 60,
    completed: false,
  },
  {
    id: 9,
    name: "The Recycler",
    description: "Shared 10 friend's posts that are at least one year old",
    exp: 40,
    completed: false,
  },
  {
    id: 10,
    name: "Social King",
    description: "You have linked at least 8 social networks to your profile",
    exp: 60,
    completed: true,
  },
  {
    id: 11,
    name: "Buffed Profile",
    description: "You have posted every day for at least 30 days in a row",
    exp: 60,
    completed: false,
  },
  {
    id: 12,
    name: "Hear The People",
    description: "You have created and posted your first poll",
    exp: 20,
    completed: true,
  },
  {
    id: 13,
    name: "Store Manager",
    description: "You have uploaded at least 10 items in your shop",
    exp: 100,
    completed: true,
  },
  {
    id: 14,
    name: "Community Builder",
    description: "Invited 20 friends who successfully joined the platform",
    exp: 80,
    completed: false,
  },
  {
    id: 15,
    name: "Event Master",
    description: "Created and hosted 5 successful community events",
    exp: 60,
    completed: false,
  },
  {
    id: 16,
    name: "Forum Champion",
    description: "Started 10 discussion topics with 50+ replies each",
    exp: 80,
    completed: false,
  },
];

function FeaturedQuestCard({ quest }: { quest: Quest }) {
  return (
    <div className="widget-box p-6 flex flex-col gap-4 transition-all duration-300 hover:translate-y-[-4px] border-l-4 border-primary">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-linear-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white font-black text-lg">
            {quest.exp}
          </div>
          <div>
            <span className="text-[10px] text-text-muted font-bold uppercase">
              EXP
            </span>
            <h3 className="text-sm font-bold">{quest.name}</h3>
          </div>
        </div>
        {quest.completed ? (
          <div className="px-3 py-1 bg-accent-green/20 text-accent-green text-[10px] font-bold rounded-lg uppercase">
            completed
          </div>
        ) : null}
      </div>

      <p className="text-xs text-text-muted font-medium leading-relaxed">
        {quest.description}
      </p>

      {quest.friendsCompleted ? (
        <div className="flex items-center gap-3 pt-4 border-t border-border">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full border-2 border-surface overflow-hidden"
              >
                <img
                  src={`https:///images/avatars/avatar_0${i}.png`}
                  alt="Friend"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
          <span className="text-[10px] text-text-muted font-bold">
            +{quest.friendsCompleted} friends
          </span>
          <span className="text-[10px] text-primary font-bold">
            completed this quest
          </span>
        </div>
      ) : null}
    </div>
  );
}

export default function QuestsPage() {
  const [filter, setFilter] = useState<"all" | "completed" | "inprogress">(
    "all"
  );

  const filteredQuests = allQuests.filter((quest) => {
    if (filter === "completed") return quest.completed;
    if (filter === "inprogress") return !quest.completed;
    return true;
  });

  const completedCount = allQuests.filter((q) => q.completed).length;
  const totalExp = allQuests
    .filter((q) => q.completed)
    .reduce((sum, q) => sum + q.exp, 0);

  return (
    <div className="flex flex-col gap-8 animate-in slide-in-from-bottom-4 duration-700">
      <div className="widget-box p-8 bg-linear-to-r from-secondary/10 via-transparent to-primary/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-primary/5 to-secondary/5 opacity-5" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-wider mb-2">
              Quests
            </h1>
            <p className="text-sm text-text-muted font-medium">
              Complete quests to earn experience points and unlock badges!
            </p>
          </div>
          <div className="hidden md:flex gap-6">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-secondary">
                {completedCount}
              </span>
              <span className="text-[10px] text-text-muted font-bold uppercase">
                Completed
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-primary">
                {totalExp}
              </span>
              <span className="text-[10px] text-text-muted font-bold uppercase">
                EXP Earned
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-linear-to-b from-primary to-secondary rounded-full" />
          <h2 className="text-lg font-black uppercase">Featured Quests</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {featuredQuests.map((quest) => (
            <FeaturedQuestCard key={quest.id} quest={quest} />
          ))}
        </div>

        <div className="widget-box p-6 flex items-center justify-between bg-linear-to-r from-primary/5 to-secondary/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-primary"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold">Gain EXP and level up!</h3>
              <p className="text-xs text-text-muted">
                Complete more quests to unlock exclusive rewards
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-linear-to-b from-secondary to-primary rounded-full" />
            <h2 className="text-lg font-black uppercase">Browse All Quests</h2>
          </div>

          <div className="flex gap-2">
            {[
              { id: "all", label: "All" },
              { id: "completed", label: "Completed" },
              { id: "inprogress", label: "In Progress" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as typeof filter)}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  filter === f.id
                    ? "bg-primary text-white"
                    : "bg-surface text-text-muted hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="widget-box overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 bg-background/50 text-xs font-bold text-text-muted uppercase border-b border-border">
            <div className="col-span-5">Quest</div>
            <div className="col-span-4">Description</div>
            <div className="col-span-1 text-center">Experience</div>
            <div className="col-span-2 text-center">Progress</div>
          </div>

          {filteredQuests.map((quest) => (
            <div
              key={quest.id}
              className="grid grid-cols-12 gap-4 p-4 border-b border-border last:border-0 items-center hover:bg-background/30 transition-colors"
            >
              <div className="col-span-5 flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    quest.completed
                      ? "bg-accent-green/20 text-accent-green"
                      : "bg-primary/20 text-primary"
                  }`}
                >
                  {quest.completed ? (
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <span className="text-sm font-bold">{quest.name}</span>
              </div>
              <div className="col-span-4 text-xs text-text-muted font-medium">
                {quest.description}
              </div>
              <div className="col-span-1 text-center">
                <span className="text-xs font-bold text-primary">
                  {quest.exp} EXP
                </span>
              </div>
              <div className="col-span-2 flex justify-center">
                {quest.completed ? (
                  <div className="px-3 py-1 bg-accent-green/20 text-accent-green text-[10px] font-bold rounded-full uppercase">
                    Complete
                  </div>
                ) : (
                  <div className="w-full max-w-[100px] h-2 bg-background rounded-full overflow-hidden">
                    <div className="h-full bg-linear-to-r from-primary to-secondary w-1/3" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
