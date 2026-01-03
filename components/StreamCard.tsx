import Link from "next/link";

interface StreamCardProps {
  title: string;
  streamer: {
    name: string;
    avatar: string;
    level: number;
  };
  thumbnail: string;
  viewers?: number;
  isLive?: boolean;
  platform: "twitch" | "youtube" | "facebook";
  category: string;
  duration?: string;
}

const platformIcons = {
  twitch: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
    </svg>
  ),
  youtube: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
  facebook: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
};

const platformColors = {
  twitch: "text-[#9146FF]",
  youtube: "text-[#FF0000]",
  facebook: "text-[#1877F2]",
};

export default function StreamCard({
  title,
  streamer,
  thumbnail,
  viewers = 0,
  isLive = false,
  platform,
  category,
  duration,
}: StreamCardProps) {
  return (
    <div className="widget-box overflow-hidden group transition-all duration-300 hover:translate-y-[-4px]">
      <div className="relative aspect-video overflow-hidden">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-linear-to-t from-surface via-transparent to-transparent" />

        {isLive ? (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 bg-accent-red rounded-lg">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-[9px] font-bold text-white uppercase">
              Live
            </span>
          </div>
        ) : (
          <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-lg">
            <span className="text-[9px] font-bold text-white uppercase">
              Offline
            </span>
          </div>
        )}

        {isLive && viewers > 0 && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-lg">
            <svg
              className="w-3 h-3 text-accent-red"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path
                fillRule="evenodd"
                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-[10px] font-bold text-white">
              {viewers.toLocaleString()}
            </span>
          </div>
        )}

        {!isLive && duration && (
          <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-lg">
            <span className="text-[10px] font-bold text-white">{duration}</span>
          </div>
        )}

        <div
          className={`absolute bottom-3 left-3 p-2 bg-black/60 backdrop-blur-sm rounded-lg ${platformColors[platform]}`}
        >
          {platformIcons[platform]}
        </div>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
          <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/50">
            <svg
              className="w-6 h-6 text-white ml-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-0.5 bg-primary/20 text-primary text-[9px] font-bold rounded uppercase">
            {category}
          </span>
        </div>

        <h3 className="text-sm font-bold mb-3 line-clamp-2 hover:text-primary transition-colors cursor-pointer">
          {title}
        </h3>

        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-primary/30">
              <img
                src={streamer.avatar}
                alt={streamer.name}
                className="w-full h-full object-cover"
              />
            </div>
            {isLive && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-accent-green border-2 border-surface rounded-full" />
            )}
          </div>
          <div>
            <Link href="/profile">
              <p className="text-xs font-bold hover:text-primary transition-colors cursor-pointer">
                {streamer.name}
              </p>
            </Link>
            <p className="text-[10px] text-text-muted font-medium">
              Level {streamer.level}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
