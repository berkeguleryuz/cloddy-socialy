"use client";

import { useState } from "react";
import HexagonAvatar from "@/components/HexagonAvatar";

const events = [
  {
    id: 1,
    title: "Pro Gaming Tournament Finals",
    date: new Date(2026, 0, 15),
    time: "7:00 PM",
    location: "Virtual Arena",
    description:
      "Watch the best teams compete for the championship title in this epic showdown!",
    image: "/images/covers/cover_01.png",
    participants: [
      {
        name: "Marina Valentine",
        avatar: "/images/avatars/avatar_01.png",
      },
      {
        name: "Nick Grissom",
        avatar: "/images/avatars/avatar_02.png",
      },
      {
        name: "Sarah Diamond",
        avatar: "/images/avatars/avatar_03.png",
      },
      {
        name: "James Thunder",
        avatar: "/images/avatars/avatar_04.png",
      },
    ],
    totalParticipants: 128,
    category: "Esports",
  },
  {
    id: 2,
    title: "Streamer Meetup & Network",
    date: new Date(2026, 0, 18),
    time: "3:00 PM",
    location: "Discord Voice",
    description:
      "Connect with fellow streamers, share tips, and grow your community together!",
    image: "/images/covers/cover_02.png",
    participants: [
      {
        name: "Olivia Chen",
        avatar: "/images/avatars/avatar_05.png",
      },
      {
        name: "Alex Storm",
        avatar: "/images/avatars/avatar_06.png",
      },
    ],
    totalParticipants: 45,
    category: "Social",
  },
  {
    id: 3,
    title: "New Game Release Party",
    date: new Date(2026, 0, 22),
    time: "9:00 PM",
    location: "Twitch Stream",
    description:
      "Join us for the midnight launch of the most anticipated game of the year!",
    image: "/images/covers/cover_03.png",
    participants: [
      {
        name: "Marina Valentine",
        avatar: "/images/avatars/avatar_01.png",
      },
    ],
    totalParticipants: 256,
    category: "Gaming",
  },
  {
    id: 4,
    title: "Weekly Community Game Night",
    date: new Date(2026, 0, 10),
    time: "8:00 PM",
    location: "Private Server",
    description:
      "Every Friday we gather for fun multiplayer games. All skill levels welcome!",
    image: "/images/covers/cover_04.png",
    participants: [
      {
        name: "Nick Grissom",
        avatar: "/images/avatars/avatar_02.png",
      },
      {
        name: "Sarah Diamond",
        avatar: "/images/avatars/avatar_03.png",
      },
    ],
    totalParticipants: 32,
    category: "Gaming",
  },
];

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function EventsPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<(typeof events)[0] | null>(
    null
  );

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    return { daysInMonth, startingDay };
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentDate);

  const getEventsForDay = (day: number) => {
    return events.filter(
      (e) =>
        e.date.getDate() === day &&
        e.date.getMonth() === currentDate.getMonth() &&
        e.date.getFullYear() === currentDate.getFullYear()
    );
  };

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
    setSelectedDate(null);
  };

  const handleDayClick = (day: number) => {
    const dayEvents = getEventsForDay(day);
    if (dayEvents.length > 0) {
      setSelectedDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      );
      if (dayEvents.length === 1) {
        setSelectedEvent(dayEvents[0]);
      }
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-in slide-in-from-bottom-4 duration-700">
      <div className="relative rounded-xl overflow-hidden bg-linear-to-r from-secondary via-primary to-secondary p-8">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-4 right-8 w-20 h-20 border-4 border-white/30 rounded-full"></div>
          <div className="absolute bottom-4 right-24 w-12 h-12 border-4 border-white/20 rounded-full"></div>
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black uppercase tracking-tight text-white mb-2">
            EVENTS
          </h1>
          <p className="text-sm text-white/80 font-medium max-w-md">
            Discover upcoming gaming events, tournaments, and community
            gatherings. Never miss a moment!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 widget-box p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black uppercase">
              {months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="w-8 h-8 rounded-lg bg-surface-light hover:bg-primary/20 text-text-muted hover:text-primary transition-colors flex items-center justify-center"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={handleNextMonth}
                className="w-8 h-8 rounded-lg bg-surface-light hover:bg-primary/20 text-text-muted hover:text-primary transition-colors flex items-center justify-center"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {daysOfWeek.map((day) => (
              <div
                key={day}
                className="text-center text-[10px] font-black uppercase text-text-muted py-2"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startingDay }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square"></div>
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEvents = getEventsForDay(day);
              const hasEvents = dayEvents.length > 0;
              const isSelected =
                selectedDate?.getDate() === day &&
                selectedDate?.getMonth() === currentDate.getMonth();

              return (
                <button
                  key={day}
                  onClick={() => handleDayClick(day)}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center relative transition-all ${
                    hasEvents
                      ? "bg-primary/20 hover:bg-primary/30 cursor-pointer"
                      : "hover:bg-surface-light"
                  } ${isSelected ? "ring-2 ring-primary" : ""}`}
                >
                  <span
                    className={`text-sm font-bold ${
                      hasEvents ? "text-white" : "text-text-muted"
                    }`}
                  >
                    {day}
                  </span>
                  {hasEvents && (
                    <div className="flex gap-0.5 mt-1">
                      {dayEvents.slice(0, 3).map((_, idx) => (
                        <div
                          key={idx}
                          className="w-1.5 h-1.5 rounded-full bg-primary"
                        ></div>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="widget-box p-6">
          <h3 className="text-sm font-black uppercase mb-4">
            {selectedDate
              ? `${months[selectedDate.getMonth()]} ${selectedDate.getDate()}`
              : "Upcoming Events"}
          </h3>

          <div className="space-y-4">
            {(selectedDate
              ? events.filter(
                  (e) =>
                    e.date.getDate() === selectedDate.getDate() &&
                    e.date.getMonth() === selectedDate.getMonth()
                )
              : events.slice(0, 3)
            ).map((event) => (
              <button
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className="w-full text-left p-3 rounded-lg bg-surface-light hover:bg-surface-light/80 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-primary/20 text-primary rounded">
                    {event.category}
                  </span>
                  <span className="text-[10px] font-bold text-text-muted">
                    {event.time}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white mb-1 line-clamp-1">
                  {event.title}
                </h4>
                <div className="flex items-center gap-1 text-[10px] font-medium text-text-muted">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {event.location}
                </div>
              </button>
            ))}

            {selectedDate &&
              events.filter(
                (e) =>
                  e.date.getDate() === selectedDate.getDate() &&
                  e.date.getMonth() === selectedDate.getMonth()
              ).length === 0 && (
                <p className="text-sm text-text-muted text-center py-4">
                  No events on this day
                </p>
              )}
          </div>
        </div>
      </div>

      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="widget-box w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-48">
              <img
                src={selectedEvent.image}
                alt={selectedEvent.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-surface to-transparent"></div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <div className="absolute bottom-4 left-4 right-4">
                <span className="text-[10px] font-black uppercase px-2 py-1 bg-primary text-white rounded mb-2 inline-block">
                  {selectedEvent.category}
                </span>
                <h3 className="text-lg font-black text-white">
                  {selectedEvent.title}
                </h3>
              </div>
            </div>

            <div className="p-6">
              <p className="text-sm text-text-muted mb-4">
                {selectedEvent.description}
              </p>

              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <div className="w-8 h-8 rounded-lg bg-surface-light flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-text-muted text-[10px] uppercase">
                      Date
                    </div>
                    <div className="text-white">
                      {months[selectedEvent.date.getMonth()]}{" "}
                      {selectedEvent.date.getDate()},{" "}
                      {selectedEvent.date.getFullYear()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold">
                  <div className="w-8 h-8 rounded-lg bg-surface-light flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-text-muted text-[10px] uppercase">
                      Time
                    </div>
                    <div className="text-white">{selectedEvent.time}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold">
                  <div className="w-8 h-8 rounded-lg bg-surface-light flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-text-muted text-[10px] uppercase">
                      Location
                    </div>
                    <div className="text-white">{selectedEvent.location}</div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-xs font-black uppercase text-text-muted mb-3">
                  {selectedEvent.totalParticipants} Going
                </h4>
                <div className="flex items-center">
                  <div className="flex -space-x-2">
                    {selectedEvent.participants.slice(0, 4).map((p, i) => (
                      <div key={i} className="ring-2 ring-surface rounded-full">
                        <HexagonAvatar src={p.avatar} size="sm" />
                      </div>
                    ))}
                  </div>
                  {selectedEvent.totalParticipants > 4 && (
                    <span className="ml-2 text-xs font-bold text-text-muted">
                      +{selectedEvent.totalParticipants - 4} more
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 py-3 bg-linear-to-r from-primary to-secondary text-white text-xs font-black rounded-lg hover:opacity-90 transition-opacity uppercase tracking-wider">
                  I&apos;m Going!
                </button>
                <button className="px-4 py-3 bg-surface-light text-text-muted text-xs font-black rounded-lg hover:text-white transition-colors uppercase tracking-wider">
                  Interested
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
