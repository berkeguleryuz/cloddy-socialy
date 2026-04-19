"use client";

import { memo, useCallback } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useRespondToEvent } from "@/hooks/useEvents";
import { useAuth } from "./AuthContext";

interface EventCardProps {
  id?: string;
  title: string;
  date: string;
  time: string;
  location: string;
  participants: number;
  image?: string | null;
  userStatus?: "going" | "interested" | null;
}

const DEFAULT_EVENT_IMAGE = "/images/covers/cover_01.png";

const EventCard = memo(function EventCard({
  id,
  title,
  date,
  time,
  location,
  participants,
  image,
  userStatus,
}: EventCardProps) {
  const t = useTranslations("events");
  const tc = useTranslations("common");
  const { isAuthenticated } = useAuth();
  const respond = useRespondToEvent();
  const imageSrc = image && image.trim() !== "" ? image : DEFAULT_EVENT_IMAGE;

  const handleInterested = useCallback(() => {
    if (!isAuthenticated) {
      toast.info(t("signInToRsvp"));
      return;
    }
    if (!id) return;
    respond.mutate(
      { eventId: id, status: "interested" },
      {
        onSuccess: () => toast.success(t("interestedSaved")),
        onError: (err) => toast.error(err.message || tc("error")),
      }
    );
  }, [id, isAuthenticated, respond, t, tc]);

  const buttonLabel =
    userStatus === "going"
      ? t("going")
      : userStatus === "interested"
      ? t("interested")
      : t("interestedCta");

  return (
    <div className="card overflow-hidden flex flex-col md:flex-row border border-transparent hover:border-secondary/30 transition-all duration-300">
      <div className="w-full md:w-48 h-48 relative shrink-0">
        <Image src={imageSrc} alt={title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 192px" />
        <div className="absolute inset-0 bg-linear-to-r from-surface/20 to-surface"></div>
        <div className="absolute top-4 left-4 w-12 h-12 bg-white rounded-xl flex flex-col items-center justify-center text-surface shadow-xl z-10">
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
              <div key={i} className="relative inline-block h-6 w-6 rounded-full ring-2 ring-surface overflow-hidden">
                <Image
                  src={`/images/avatars/avatar_0${i + 1}.png`}
                  fill
                  className="object-cover"
                  alt="user"
                  sizes="24px"
                />
              </div>
            ))}
            {participants > 4 && (
              <div className="h-6 w-6 rounded-full ring-2 ring-surface bg-border text-[8px] font-bold flex items-center justify-center text-text-muted">
                +{participants - 4}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleInterested}
            disabled={respond.isPending}
            className="px-4 py-2 bg-background text-secondary text-[10px] font-black rounded-lg border border-secondary/20 hover:bg-secondary hover:text-white transition-all uppercase tracking-wider disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
});

export default EventCard;
