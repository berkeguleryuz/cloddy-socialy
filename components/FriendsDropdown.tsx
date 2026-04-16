"use client";

import { useState, useMemo, useCallback, memo } from "react";
import HexagonAvatar from "./HexagonAvatar";
import { useAuth } from "./AuthContext";
import { useData } from "./DataContext";

// Demo friend requests - shown when not authenticated
const demoFriendRequests = [
  {
    id: 1,
    user: {
      name: "Nick Grissom",
      avatar: "/images/avatars/avatar_02.png",
      level: 16,
    },
    mutualFriends: 5,
  },
  {
    id: 2,
    user: {
      name: "Neko Bebop",
      avatar: "/images/avatars/avatar_03.png",
      level: 12,
    },
    mutualFriends: 3,
  },
  {
    id: 3,
    user: {
      name: "Sandra Strange",
      avatar: "/images/avatars/avatar_05.png",
      level: 27,
    },
    mutualFriends: 8,
  },
];

const FriendsDropdown = memo(function FriendsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<(string | number)[]>([]);

  const { isDemo, isAuthenticated } = useAuth();
  const { social } = useData();

  // Transform friend requests data or use demo data
  const allRequests = useMemo(() => {
    if (isDemo || !isAuthenticated || !social.friendRequests || social.friendRequests.length === 0) {
      return demoFriendRequests;
    }

    // Transform real friend requests data
    return social.friendRequests.map((req: any, index: number) => ({
      id: req.id || index,
      user: {
        name: req.sender?.display_name || "User",
        avatar: req.sender?.avatar_url || `/images/avatars/avatar_0${(index % 8) + 1}.png`,
        level: req.sender?.level || 1,
      },
      mutualFriends: req.mutual_friends_count || 0,
    }));
  }, [isDemo, isAuthenticated, social.friendRequests]);

  // Filter out dismissed requests
  const requests = useMemo(() => {
    return allRequests.filter((r) => !dismissedIds.includes(r.id));
  }, [allRequests, dismissedIds]);

  const handleAccept = useCallback(async (id: string | number) => {
    // In demo mode, just dismiss the request visually
    if (isDemo || !isAuthenticated) {
      setDismissedIds((prev) => [...prev, id]);
      return;
    }

    // In real mode, call the API to accept the friend request
    try {
      const response = await fetch("/api/friends/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: id }),
      });
      if (response.ok) {
        setDismissedIds((prev) => [...prev, id]);
      }
    } catch (error) {
      console.error("Failed to accept friend request:", error);
    }
  }, [isDemo, isAuthenticated]);

  const handleDecline = useCallback(async (id: string | number) => {
    // In demo mode, just dismiss the request visually
    if (isDemo || !isAuthenticated) {
      setDismissedIds((prev) => [...prev, id]);
      return;
    }

    // In real mode, call the API to decline the friend request
    try {
      const response = await fetch("/api/friends/decline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: id }),
      });
      if (response.ok) {
        setDismissedIds((prev) => [...prev, id]);
      }
    } catch (error) {
      console.error("Failed to decline friend request:", error);
    }
  }, [isDemo, isAuthenticated]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 bg-surface rounded-lg flex items-center justify-center text-text-muted cursor-pointer hover:bg-secondary hover:text-white transition-all border border-border relative"
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
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
        {requests.length > 0 ? (
          <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-secondary text-[10px] font-bold rounded-full flex items-center justify-center text-white">
            {requests.length}
          </div>
        ) : null}
      </button>

      {isOpen ? (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-14 w-[360px] bg-surface rounded-xl border border-border shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
            <div className="p-4 border-b border-border bg-secondary">
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
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
                <span className="text-white font-bold text-sm">
                  Friend Requests
                </span>
                <span className="ml-auto text-xs bg-white/20 px-2 py-0.5 rounded-full text-white">
                  {requests.length} pending
                </span>
              </div>
            </div>

            <div className="max-h-[350px] overflow-y-auto">
              {requests.length === 0 ? (
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
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <p className="text-text-muted text-sm">
                    No pending friend requests
                  </p>
                </div>
              ) : (
                requests.map((request) => (
                  <div
                    key={request.id}
                    className="p-4 border-b border-border/50 hover:bg-background/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <HexagonAvatar
                        src={request.user.avatar}
                        level={request.user.level}
                        size="md"
                      />
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-white">
                          {request.user.name}
                        </h4>
                        <p className="text-xs text-text-muted">
                          {request.mutualFriends} mutual friends
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAccept(request.id)}
                        className="flex-1 py-2 bg-secondary text-white text-xs font-bold rounded-lg hover:bg-secondary/80 transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleDecline(request.id)}
                        className="flex-1 py-2 bg-background text-text-muted text-xs font-bold rounded-lg hover:bg-background/80 transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-border bg-background/30">
              <button className="w-full py-2.5 text-sm text-primary font-bold hover:underline">
                View All Friends
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
});

export default FriendsDropdown;
