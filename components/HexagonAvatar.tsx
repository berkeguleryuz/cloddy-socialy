interface HexagonAvatarProps {
  src: string;
  size?: "sm" | "md" | "lg" | "xl";
  level?: number;
  className?: string;
  progress?: number; // 0-100 for the border progress
}

export default function HexagonAvatar({
  src,
  size = "md",
  level,
  className = "",
  progress = 100,
}: HexagonAvatarProps) {
  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-12 h-12",
    lg: "w-24 h-24",
    xl: "w-40 h-40",
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center ${sizeClasses[size]} ${className}`}
    >
      <div className="absolute inset-0 hexagon-mask bg-border p-[3px]">
        <div
          className="w-full h-full bg-linear-to-b from-primary to-accent-blue hexagon-mask"
          style={{
            clipPath: `polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)`,
          }}
        ></div>
      </div>

      <div className="absolute inset-0 p-[5px]">
        <div className="w-full h-full bg-surface hexagon-mask"></div>
      </div>

      <div className="w-full h-full p-[8px] relative z-10">
        <div className="w-full h-full hexagon-mask bg-background overflow-hidden">
          <img src={src} alt="Avatar" className="w-full h-full object-cover" />
        </div>
      </div>

      {level !== undefined ? (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-7 z-20 flex items-center justify-center">
          <div className="absolute inset-0 shield-mask bg-background p-[2px]">
            <div className="w-full h-full shield-mask bg-primary"></div>
          </div>
          <span className="relative text-[10px] font-black text-white z-10 pt-0.5">
            {level}
          </span>
        </div>
      ) : null}
    </div>
  );
}
