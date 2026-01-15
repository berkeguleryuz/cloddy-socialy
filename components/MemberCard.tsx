import HexagonAvatar from "./HexagonAvatar";
import Link from "next/link";

interface MemberCardProps {
  name: string;
  avatar: string;
  cover: string;
  level: number;
  stats: {
    posts: string;
    friends: string;
    visits: string;
  };
  tagline?: string;
  bio?: string;
  badges?: number;
}

export default function MemberCard({
  name,
  avatar,
  cover,
  level,
  stats,
  tagline = "www.vikinger.com",
  bio = "Hello! I'm a passionate gamer who loves streaming and connecting with my community. Come check out my profile!",
  badges = 9,
}: MemberCardProps) {
  return (
    <div className="widget-box overflow-hidden group transition-all duration-300 hover:translate-y-[-2px]">
      <div className="h-20 overflow-hidden relative">
        <img
          src={cover}
          alt="Cover"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-linear-to-t from-surface to-transparent" />
      </div>

      <div className="px-6 pb-6 -mt-6 flex gap-6">
        <div className="shrink-0 flex flex-col items-center">
          <div className="relative">
            <HexagonAvatar src={avatar} level={level} size="lg" />
            {badges > 0 ? (
              <Link
                href="/profile"
                className="absolute -right-1 -bottom-1 bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md hover:bg-secondary transition-colors"
              >
                +{badges}
              </Link>
            ) : null}
          </div>
        </div>

        <div className="flex-1 pt-6 flex flex-col min-w-0">
          <Link href="/profile">
            <h3 className="text-sm font-bold hover:text-primary cursor-pointer transition-colors truncate">
              {name}
            </h3>
          </Link>
          <p className="text-[10px] text-text-muted font-bold mb-3 truncate">
            {tagline}
          </p>

          <div className="flex gap-6 mb-3">
            <div className="flex flex-col">
              <span className="text-xs font-black">{stats.posts}</span>
              <span className="text-[9px] text-text-muted font-bold uppercase">
                posts
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black">{stats.friends}</span>
              <span className="text-[9px] text-text-muted font-bold uppercase">
                friends
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black">{stats.visits}</span>
              <span className="text-[9px] text-text-muted font-bold uppercase">
                visits
              </span>
            </div>
          </div>

          <p className="text-[11px] text-text-muted font-medium leading-relaxed line-clamp-2 mb-4">
            {bio}
          </p>

          <div className="flex gap-3">
            <button className="flex-1 py-2.5 bg-primary text-white text-[10px] font-bold rounded-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-wide">
              Add Friend +
            </button>
            <button className="flex-1 py-2.5 bg-surface border border-border text-white text-[10px] font-bold rounded-lg hover:bg-background transition-all uppercase tracking-wide">
              Send Message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
