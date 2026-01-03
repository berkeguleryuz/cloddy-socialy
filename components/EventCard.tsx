interface EventCardProps {
  title: string;
  date: string;
  time: string;
  location: string;
  participants: number;
  image: string;
}

export default function EventCard({
  title,
  date,
  time,
  location,
  participants,
  image,
}: EventCardProps) {
  return (
    <div className="card overflow-hidden flex flex-col md:flex-row border border-transparent hover:border-secondary/30 transition-all duration-300">
      <div className="w-full md:w-48 h-48 relative shrink-0">
        <img src={image} alt={title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-linear-to-r from-surface/20 to-surface"></div>
        <div className="absolute top-4 left-4 w-12 h-12 bg-white rounded-xl flex flex-col items-center justify-center text-surface shadow-xl">
          <span className="text-xs font-black">{date.split(" ")[0]}</span>
          <span className="text-[10px] font-bold uppercase">
            {date.split(" ")[1]}
          </span>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-black hover:text-secondary transition-colors cursor-pointer mb-2 uppercase">
            {title}
          </h3>
          <div className="flex items-center gap-4 text-[10px] font-bold text-text-muted">
            <div className="flex items-center gap-1">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              {time}
            </div>
            <div className="flex items-center gap-1">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                ></path>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                ></path>
              </svg>
              {location}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-6">
          <div className="flex -space-x-2 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <img
                key={i}
                src={`https:///images/avatars/avatar_0${
                  i + 1
                }.png`}
                className="inline-block h-6 w-6 rounded-full ring-2 ring-surface object-cover"
                alt="user"
              />
            ))}
            <div className="h-6 w-6 rounded-full ring-2 ring-surface bg-border text-[8px] font-bold flex items-center justify-center text-text-muted">
              +{participants - 4}
            </div>
          </div>
          <button className="px-4 py-2 bg-background text-secondary text-[10px] font-black rounded-lg border border-secondary/20 hover:bg-secondary hover:text-white transition-all uppercase tracking-wider">
            Interested
          </button>
        </div>
      </div>
    </div>
  );
}
