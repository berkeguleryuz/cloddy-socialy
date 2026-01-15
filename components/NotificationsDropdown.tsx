"use client";

import { useState } from "react";
import HexagonAvatar from "./HexagonAvatar";

const notifications = [
  {
    id: 1,
    type: "like",
    user: {
      name: "Nick Grissom",
      avatar: "/images/avatars/avatar_02.png",
    },
    action: "liked your post",
    time: "2 mins ago",
    read: false,
  },
  {
    id: 2,
    type: "comment",
    user: {
      name: "Neko Bebop",
      avatar: "/images/avatars/avatar_03.png",
    },
    action: "commented on your photo",
    time: "15 mins ago",
    read: false,
  },
  {
    id: 3,
    type: "follow",
    user: {
      name: "Matt Parker",
      avatar: "/images/avatars/avatar_04.png",
    },
    action: "started following you",
    time: "1 hour ago",
    read: true,
  },
  {
    id: 4,
    type: "badge",
    user: {
      name: "System",
      avatar: "/images/badges/badge_gold-s.png",
    },
    action: "You earned the Gold User badge!",
    time: "3 hours ago",
    read: true,
  },
  {
    id: 5,
    type: "mention",
    user: {
      name: "Sandra Strange",
      avatar: "/images/avatars/avatar_05.png",
    },
    action: "mentioned you in a comment",
    time: "5 hours ago",
    read: true,
  },
];

export default function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState(notifications);

  const unreadCount = items.filter((n) => !n.read).length;

  const markAllRead = () => {
    setItems(items.map((n) => ({ ...n, read: true })));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "like":
        return (
          <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
            <svg
              className="w-3 h-3 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
      case "comment":
        return (
          <div className="w-6 h-6 rounded-full bg-accent-blue flex items-center justify-center">
            <svg
              className="w-3 h-3 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
      case "follow":
        return (
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
            <svg
              className="w-3 h-3 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
            </svg>
          </div>
        );
      case "badge":
        return (
          <div className="w-6 h-6 rounded-full bg-accent-yellow flex items-center justify-center">
            <svg
              className="w-3 h-3 text-background"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-6 h-6 rounded-full bg-accent-orange flex items-center justify-center">
            <svg
              className="w-3 h-3 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M14.243 5.757a6 6 0 10-.986 9.284 1 1 0 111.087 1.678A8 8 0 1118 10a3 3 0 01-4.8 2.401A4 4 0 1114 10a1 1 0 102 0c0-1.537-.586-3.07-1.757-4.243zM12 10a2 2 0 10-4 0 2 2 0 004 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 bg-surface rounded-lg flex items-center justify-center text-text-muted cursor-pointer hover:bg-accent-orange hover:text-white transition-all border border-border relative"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 ? (
          <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent-orange text-[10px] font-bold rounded-full flex items-center justify-center text-white">
            {unreadCount}
          </div>
        ) : null}
      </button>

      {isOpen ? (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-14 w-[380px] bg-surface rounded-xl border border-border shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
            <div className="p-4 border-b border-border bg-accent-orange flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span className="text-white font-bold text-sm">
                  Notifications
                </span>
              </div>
              {unreadCount > 0 ? (
                <button
                  onClick={markAllRead}
                  className="text-xs text-white/80 hover:text-white transition-colors"
                >
                  Mark all as read
                </button>
              ) : null}
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {items.length === 0 ? (
                <div className="p-8 text-center">
                  <svg
                    className="w-12 h-12 mx-auto text-text-muted mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  <p className="text-text-muted text-sm">
                    No notifications yet
                  </p>
                </div>
              ) : (
                items.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-border/50 flex items-start gap-3 hover:bg-background/30 transition-colors ${
                      !notification.read ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className="relative shrink-0">
                      {notification.type === "badge" ? (
                        <div className="w-10 h-10 rounded-lg overflow-hidden">
                          <img
                            src={notification.user.avatar}
                            alt=""
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ) : (
                        <HexagonAvatar
                          src={notification.user.avatar}
                          size="sm"
                        />
                      )}
                      <div className="absolute -bottom-1 -right-1">
                        {getTypeIcon(notification.type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-bold text-white">
                          {notification.user.name}
                        </span>{" "}
                        <span className="text-text-muted">
                          {notification.action}
                        </span>
                      </p>
                      <span className="text-xs text-text-muted">
                        {notification.time}
                      </span>
                    </div>
                    {!notification.read ? (
                      <div className="w-2 h-2 rounded-full bg-accent-orange shrink-0 mt-2" />
                    ) : null}
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-border bg-background/30">
              <button className="w-full py-2.5 text-sm text-accent-orange font-bold hover:underline">
                View All Notifications
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
