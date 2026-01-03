import HexagonAvatar from "./HexagonAvatar";
import Link from "next/link";

interface GroupCardProps {
  name: string;
  avatar: string;
  cover: string;
  members: string;
  posts: string;
  isPrivate?: boolean;
  category?: string;
  memberAvatars?: string[];
  lastActivity?: string;
}

export default function GroupCard({
  name,
  avatar,
  cover,
  members,
  posts,
  isPrivate,
  category = "Gaming",
  memberAvatars = [],
  lastActivity = "2 hours ago",
}: GroupCardProps) {
  return (
    <div className="widget-box overflow-hidden group transition-all duration-300 hover:translate-y-[-4px]">
      <div className="h-32 overflow-hidden relative">
        <img
          src={cover}
          alt="Cover"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-linear-to-t from-surface via-surface/50 to-transparent" />

        <div
          className={`absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase ${
            isPrivate
              ? "bg-accent-red/20 text-accent-red"
              : "bg-accent-green/20 text-accent-green"
          }`}
        >
          {isPrivate ? (
            <>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              Private
            </>
          ) : (
            <>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z"
                  clipRule="evenodd"
                />
              </svg>
              Public
            </>
          )}
        </div>

        <div className="absolute top-3 left-3 px-2.5 py-1 bg-primary/80 backdrop-blur-sm rounded-lg text-[9px] font-bold text-white uppercase">
          {category}
        </div>
      </div>

      <div className="px-6 pb-6 flex flex-col items-center relative z-10">
        <div className="w-16 h-16 -mt-8 mb-4">
          <HexagonAvatar src={avatar} size="md" className="w-full h-full" />
        </div>

        <Link href="/groups">
          <h3 className="text-sm font-bold hover:text-primary cursor-pointer transition-colors mb-1 text-center">
            {name}
          </h3>
        </Link>

        <p className="text-[10px] text-text-muted font-medium mb-4">
          Last activity {lastActivity}
        </p>

        {memberAvatars.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <div className="flex -space-x-2">
              {memberAvatars.slice(0, 4).map((avatar, i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full border-2 border-surface overflow-hidden"
                >
                  <img
                    src={avatar}
                    alt="Member"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            {memberAvatars.length > 4 && (
              <span className="text-[10px] text-text-muted font-bold">
                +{memberAvatars.length - 4} more
              </span>
            )}
          </div>
        )}

        <div className="flex justify-center gap-8 w-full mb-6">
          <div className="flex flex-col items-center">
            <span className="text-xs font-black">{members}</span>
            <span className="text-[10px] text-text-muted font-bold uppercase">
              Members
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs font-black">{posts}</span>
            <span className="text-[10px] text-text-muted font-bold uppercase">
              Posts
            </span>
          </div>
        </div>

        <button className="w-full py-3 bg-secondary text-white text-xs font-bold rounded-xl shadow-[0_6px_20px_rgba(35,210,226,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all">
          JOIN GROUP +
        </button>
      </div>
    </div>
  );
}
