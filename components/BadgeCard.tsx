interface BadgeCardProps {
  name: string;
  description: string;
  image: string;
  unlocked?: boolean;
  exp: number;
  hasNextTier?: boolean;
}

export default function BadgeCard({
  name,
  description,
  image,
  unlocked = true,
  exp,
  hasNextTier,
}: BadgeCardProps) {
  return (
    <div
      className={`widget-box p-5 flex flex-col items-center text-center transition-all duration-300 group relative ${
        !unlocked ? "opacity-50" : "hover:translate-y-[-4px]"
      }`}
    >
      {hasNextTier && (
        <div className="absolute top-3 left-3 text-[9px] font-bold text-text-muted uppercase tracking-wider">
          Next Tier:
        </div>
      )}

      <div className="absolute top-3 right-3 bg-primary/20 text-primary text-[10px] font-bold px-2 py-1 rounded-md">
        {exp} EXP
      </div>

      <div
        className={`w-20 h-20 mb-4 mt-4 relative ${
          !unlocked ? "grayscale" : ""
        }`}
      >
        {unlocked && (
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-125 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        )}
        <img
          src={image}
          alt={name}
          className="w-full h-full object-contain relative z-10 drop-shadow-lg"
        />
      </div>

      <h3 className="text-xs font-bold mb-2 uppercase tracking-wide">{name}</h3>

      <p className="text-[10px] text-text-muted font-medium leading-relaxed line-clamp-2">
        {description}
      </p>

      {!unlocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
          <div className="w-8 h-8 bg-surface rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-text-muted"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
