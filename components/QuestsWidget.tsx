"use client";

import { useMemo, memo, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { useQuests } from "@/hooks/useQuests";
import { demoQuests } from "@/constants/demoData";

// Quest icon components
const questIconMap: Record<string, ReactNode> = {
  crown: (
    <svg className="w-5 h-5 text-accent-yellow" fill="currentColor" viewBox="0 0 20 20">
      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
    </svg>
  ),
  map: (
    <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z" clipRule="evenodd" />
    </svg>
  ),
  edit: (
    <svg className="w-5 h-5 text-secondary" fill="currentColor" viewBox="0 0 20 20">
      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
    </svg>
  ),
  default: (
    <svg className="w-5 h-5 text-accent-blue" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
};

const QuestsWidget = memo(function QuestsWidget() {
  const { isDemo, isAuthenticated } = useAuth();
  const questsData = useQuests();

  // Transform quests data or use demo data
  const { quests, showEmpty } = useMemo(() => {
    // Only show demo data for demo mode or unauthenticated users
    if (isDemo || !isAuthenticated) {
      return { quests: demoQuests, showEmpty: false };
    }

    // For authenticated users, show real data or empty state
    if (!questsData.data?.quests || questsData.data.quests.length === 0) {
      return { quests: [], showEmpty: true };
    }

    // Transform real quests data
    const transformedQuests = questsData.data.quests.slice(0, 3).map((quest: any) => ({
      id: quest.id,
      title: quest.title,
      description: quest.description,
      progress: quest.progress || 0,
      exp: quest.experience_points || 100,
      icon: quest.icon || "default",
    }));

    return { quests: transformedQuests, showEmpty: false };
  }, [isDemo, isAuthenticated, questsData.data]);

  return (
    <div className="widget-box">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-text-muted">
          Open Quests
        </h3>
        <span className="text-[10px] text-primary font-bold">View All</span>
      </div>

      <div className="flex flex-col gap-4">
        {showEmpty ? (
          <div className="p-4 text-center">
            <p className="text-xs text-text-muted">No active quests yet.</p>
            <p className="text-[10px] text-text-muted mt-1">Check back soon for new challenges!</p>
          </div>
        ) : (
          quests.map((quest) => (
            <div
              key={quest.id}
              className="p-3 rounded-xl bg-background/50 hover:bg-background transition-colors cursor-pointer group"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-linear-to-br from-primary/20 to-secondary/20 flex items-center justify-center shrink-0">
                  {questIconMap[quest.icon] || questIconMap.default}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-white truncate group-hover:text-primary transition-colors">
                      {quest.title}
                    </h4>
                    <span className="text-[10px] font-bold text-primary shrink-0">
                      +{quest.exp} EXP
                    </span>
                  </div>
                  <p className="text-[10px] text-text-muted mt-0.5 truncate">
                    {quest.description}
                  </p>
                  <div className="mt-2 h-1.5 bg-background rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-primary to-secondary transition-all duration-500"
                      style={{ width: `${quest.progress}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-text-muted mt-1 block">
                    {quest.progress}% completed
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
});

export default QuestsWidget;
