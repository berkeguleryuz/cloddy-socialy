import Link from "next/link";

export default function HomeBanner() {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-surface shadow-widget animate-in fade-in zoom-in duration-700">
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-linear-to-br from-primary/30 via-secondary/20 to-accent-blue/30"></div>

      <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mb-4">
            Newsfeed
          </h1>
          <p className="text-sm md:text-base text-text-muted font-bold max-w-lg mb-8 leading-relaxed">
            Check what your friends have been up to! Post updates, share images,
            and keep the community active with your accomplishments.
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
            <Link
              href="/profile"
              className="px-8 py-4 bg-primary text-white text-xs font-black uppercase rounded-lg shadow-[0_0_20px_rgba(119,80,248,0.4)] hover:scale-105 transition-transform"
            >
              My Profile
            </Link>
            <Link
              href="/members"
              className="px-8 py-4 bg-background border border-border text-white text-xs font-black uppercase rounded-lg hover:bg-border transition-colors"
            >
              Members List
            </Link>
          </div>
        </div>

        <div className="relative w-48 h-48 md:w-64 md:h-64 shrink-0">
          <div
            className="absolute inset-0 rounded-full border-border"
            style={{ borderWidth: "10px" }}
          ></div>
          <div
            className="absolute inset-0 rounded-full border-primary border-t-transparent border-r-transparent -rotate-45"
            style={{ borderWidth: "10px" }}
          ></div>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-white leading-none">
              82%
            </span>
            <span className="text-[10px] font-black uppercase text-text-muted tracking-widest mt-1">
              Profile Complete
            </span>
          </div>

          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent-blue p-2 rounded-lg shadow-xl animate-bounce">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                d="M12 4v16m8-8H4"
              ></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
