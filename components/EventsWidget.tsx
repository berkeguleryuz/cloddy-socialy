"use client";

import { useMemo, memo } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useAuth } from "./AuthContext";
import { useData } from "./DataContext";
import { demoEvents, eventColors } from "@/constants/demoData";

// Helper to format date
function formatEventDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return "Tomorrow";
  } else {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }
}

// Helper to format time
function formatEventTime(timeString: string | null): string {
  if (!timeString) return "TBD";
  try {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  } catch {
    return timeString;
  }
}

const EventsWidget = memo(function EventsWidget() {
  const { isDemo, isAuthenticated } = useAuth();
  const tw = useTranslations("widgets");
  const { events: eventsData } = useData();

  // Transform events data or use demo data
  const { events, showEmpty } = useMemo(() => {
    // Only show demo data for demo mode or unauthenticated users
    if (isDemo || !isAuthenticated) {
      return { events: demoEvents, showEmpty: false };
    }

    // For authenticated users, show real data or empty state
    if (!eventsData.items || eventsData.items.length === 0) {
      return { events: [], showEmpty: true };
    }

    // Transform real events data
    const transformedEvents = eventsData.items.slice(0, 4).map((event: any, index: number) => ({
      id: event.id,
      title: event.title,
      time: formatEventTime(event.event_time),
      date: formatEventDate(event.event_date),
      image: event.image_url || `/images/avatars/avatar_0${(index % 8) + 1}.png`,
      attendees: event.participants_count || 0,
      color: eventColors[index % eventColors.length],
    }));

    return { events: transformedEvents, showEmpty: false };
  }, [isDemo, isAuthenticated, eventsData.items]);
  return (
    <div className="widget-box">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-text-muted">
          {tw("eventsTitle")}
        </h3>
        <Link
          href="/events"
          className="text-[10px] text-primary font-bold hover:underline"
        >
          {tw("viewAll")}
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {showEmpty ? (
          <div className="p-4 text-center">
            <p className="text-xs text-text-muted">{tw("eventsEmpty")}</p>
            <p className="text-[10px] text-text-muted mt-1">
              {tw("eventsEmptyHint")}
            </p>
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-background/50 transition-colors cursor-pointer group"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-linear-to-br ${event.color} flex items-center justify-center shrink-0 overflow-hidden`}
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
          ))
        )}
      </div>
    </div>
  );
});

export default EventsWidget;
