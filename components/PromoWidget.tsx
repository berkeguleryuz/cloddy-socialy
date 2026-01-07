export default function PromoWidget() {
  return (
    <div className="rounded-xl p-5 relative overflow-hidden bg-gradient-to-br from-secondary via-[#1cd19e] to-accent-blue">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern
              id="promoPattern"
              patternUnits="userSpaceOnUse"
              width="40"
              height="40"
            >
              <circle cx="20" cy="20" r="2" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#promoPattern)" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-black text-white">CLODDY</h3>
            <p className="text-[10px] text-white/70 font-medium">
              Premium Network
            </p>
          </div>
        </div>

        <p className="text-xs text-white/90 mb-4 leading-relaxed">
          Unlock exclusive badges, premium themes and unlimited quest rewards!
        </p>

        <button className="w-full py-2.5 bg-white text-secondary font-bold text-xs rounded-lg hover:bg-white/90 transition-colors shadow-lg">
          Upgrade Now
        </button>
      </div>
    </div>
  );
}
