"use client";

const quests = [
  {
    id: 1,
    title: "Social King/Queen",
    description: "Get 100 reactions on your posts",
    progress: 67,
    exp: 120,
    icon: "👑",
  },
  {
    id: 2,
    title: "The Explorer",
    description: "Join 10 different groups",
    progress: 40,
    exp: 80,
    icon: "🗺️",
  },
  {
    id: 3,
    title: "Content Creator",
    description: "Create 50 posts",
    progress: 88,
    exp: 150,
    icon: "✍️",
  },
];

export default function QuestsWidget() {
  return (
    <div className="widget-box">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-text-muted">
          Open Quests
        </h3>
        <span className="text-[10px] text-primary font-bold">View All</span>
      </div>

      <div className="flex flex-col gap-4">
        {quests.map((quest) => (
          <div
            key={quest.id}
            className="p-3 rounded-xl bg-background/50 hover:bg-background transition-colors cursor-pointer group"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-linear-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-lg shrink-0">
                {quest.icon}
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
        ))}
      </div>
    </div>
  );
}
