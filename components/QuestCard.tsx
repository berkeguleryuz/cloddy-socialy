import HexagonAvatar from "./HexagonAvatar";

interface QuestCardProps {
  name: string;
  description: string;
  image: string;
  progress: number;
  total: number;
  reward: number;
  isFeatured?: boolean;
}

export default function QuestCard({
  name,
  description,
  image,
  progress,
  total,
  reward,
  isFeatured,
}: QuestCardProps) {
  const percent = Math.min(100, (progress / total) * 100);

  return (
    <div
      className={`card p-6 flex flex-col gap-6 transition-all hover:translate-y-[-4px] ${
        isFeatured ? "border-l-4 border-secondary" : ""
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 shrink-0">
          <HexagonAvatar src={image} size="sm" className="w-full h-full" />
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-bold uppercase">{name}</h3>
          <p className="text-[10px] text-text-muted font-bold leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-[10px] font-bold">
          <span className="text-text-muted">PROGRESS</span>
          <span className="text-white">
            {progress}/{total}
          </span>
        </div>
        <div className="h-1.5 bg-background rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-primary to-secondary transition-all duration-1000"
            style={{ width: `${percent}%` }}
          ></div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
            <svg
              className="w-3.5 h-3.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5z"></path>
            </svg>
          </div>
          <span className="text-xs font-black">+{reward} EXP</span>
        </div>
        {percent === 100 ? (
          <button className="px-4 py-2 bg-secondary/10 text-secondary text-[10px] font-bold rounded-lg uppercase tracking-wider">
            Completed
          </button>
        ) : (
          <button className="px-4 py-2 bg-primary text-white text-[10px] font-bold rounded-lg uppercase tracking-wider shadow-lg shadow-primary/20">
            Active
          </button>
        )}
      </div>
    </div>
  );
}
