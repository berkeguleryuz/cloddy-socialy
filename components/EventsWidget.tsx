"use client";

const events = [
  {
    id: 1,
    title: "Breakfast with Neko",
    time: "9:00 AM",
    date: "Today",
    image: "/images/avatars/avatar_03.png",
    attendees: 12,
    color: "from-secondary to-accent-blue",
  },
  {
    id: 2,
    title: "FLAVOR Meeting",
    time: "2:30 PM",
    date: "Today",
    image: "/images/avatars/avatar_07.png",
    attendees: 8,
    color: "from-primary to-secondary",
  },
  {
    id: 3,
    title: "Streaming Party",
    time: "8:00 PM",
    date: "Tomorrow",
    image: "/images/avatars/avatar_02.png",
    attendees: 45,
    color: "from-accent-orange to-accent-yellow",
  },
  {
    id: 4,
    title: "Gaming Tournament",
    time: "6:00 PM",
    date: "Sat, Jan 11",
    image: "/images/avatars/avatar_05.png",
    attendees: 120,
    color: "from-accent-blue to-primary",
  },
];

export default function EventsWidget() {
  return (
    <div className="widget-box">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-text-muted">
          Upcoming Events
        </h3>
        <button className="text-[10px] text-primary font-bold hover:underline">
          View All
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {events.map((event) => (
          <div
            key={event.id}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-background/50 transition-colors cursor-pointer group"
          >
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${event.color} flex items-center justify-center shrink-0 overflow-hidden`}
            >
              <img
                src={event.image}
                alt={event.title}
                className="w-10 h-10 rounded-lg object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-white truncate group-hover:text-primary transition-colors">
                {event.title}
              </h4>
              <div className="flex items-center gap-2 text-[10px] text-text-muted">
                <span>{event.date}</span>
                <span>•</span>
                <span>{event.time}</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <svg
                  className="w-3 h-3 text-text-muted"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                <span className="text-[10px] text-text-muted">
                  {event.attendees} attending
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
