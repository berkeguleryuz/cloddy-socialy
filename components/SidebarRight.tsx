"use client";

import { useState } from "react";
import HexagonAvatar from "./HexagonAvatar";

interface Friend {
  id: number;
  name: string;
  avatar: string;
  online: boolean;
  status: string;
  level: number;
}

interface Message {
  id: number;
  text: string;
  sent: boolean;
  time: string;
}

const mockMessages: Message[] = [
  {
    id: 1,
    text: "Hi! How are you doing?",
    sent: false,
    time: "Yesterday at 8:36PM",
  },
  { id: 2, text: "Hey! I'm doing great, thanks!", sent: true, time: "10:05AM" },
  {
    id: 3,
    text: "Just finished streaming, it was amazing!",
    sent: true,
    time: "10:05AM",
  },
  {
    id: 4,
    text: "Nice! I saw you had a lot of viewers!",
    sent: false,
    time: "10:06AM",
  },
  {
    id: 5,
    text: "Yeah, we'll have to play together sometime",
    sent: false,
    time: "10:06AM",
  },
  {
    id: 6,
    text: "For sure! Let me know when you're free",
    sent: true,
    time: "10:07AM",
  },
];

export default function SidebarRight() {
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const friends: Friend[] = [
    {
      id: 1,
      name: "Marina Valentine",
      avatar: "01.png",
      online: true,
      status: "Eating dinner...",
      level: 12,
    },
    {
      id: 2,
      name: "Nicholas Grissom",
      avatar: "02.png",
      online: true,
      status: "Playing Cyberpunk",
      level: 24,
    },
    {
      id: 3,
      name: "Sarah Jenkins",
      avatar: "03.png",
      online: false,
      status: "Offline",
      level: 8,
    },
    {
      id: 4,
      name: "Marcus Peterson",
      avatar: "04.png",
      online: true,
      status: "Working on project",
      level: 15,
    },
    {
      id: 5,
      name: "Sarah Diamond",
      avatar: "05.png",
      online: true,
      status: "Streaming",
      level: 42,
    },
    {
      id: 6,
      name: "Bearded Wonder",
      avatar: "06.png",
      online: false,
      status: "Offline",
      level: 10,
    },
    {
      id: 7,
      name: "Neko Bebop",
      avatar: "07.png",
      online: true,
      status: "Available",
      level: 5,
    },
    {
      id: 8,
      name: "James Murdock",
      avatar: "08.png",
      online: true,
      status: "Playing Games",
      level: 31,
    },
    {
      id: 9,
      name: "The Green Goo",
      avatar: "09.png",
      online: false,
      status: "Offline",
      level: 2,
    },
    {
      id: 10,
      name: "Destroy Dex",
      avatar: "10.png",
      online: true,
      status: "Available",
      level: 19,
    },
  ];

  const filteredFriends = friends.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setNewMessage("");
    }
  };

  const handleFriendClick = (friend: Friend) => {
    setSelectedFriend(friend);
  };

  const handleCloseChat = () => {
    setSelectedFriend(null);
  };

  return (
    <>
      <aside className="fixed right-0 top-20 bottom-0 w-[80px] hover:w-[300px] bg-surface border-l border-border hidden xl:flex flex-col z-40 transition-all duration-300 group shadow-2xl">
        <div className="flex-1 overflow-y-auto py-8 no-scrollbar">
          <div className="px-5 mb-6 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
            <h2 className="text-xs font-black uppercase text-text-muted tracking-widest whitespace-nowrap">
              Friends
            </h2>
            <div className="w-2 h-2 rounded-full bg-secondary"></div>
          </div>

          <div className="flex flex-col">
            {filteredFriends.map((friend) => (
              <button
                key={`${friend.id}-${friend.name}`}
                onClick={() => handleFriendClick(friend)}
                className="px-4 py-3 flex items-center gap-4 hover:bg-background/30 cursor-pointer transition-colors relative text-left w-full"
              >
                <div className="relative shrink-0">
                  <HexagonAvatar
                    src={`/images/avatars/avatar_${friend.avatar}`}
                    size="sm"
                    level={friend.level}
                  />
                  {friend.online && (
                    <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-secondary rounded-full border-2 border-surface z-30"></div>
                  )}
                </div>

                <div className="flex flex-col min-w-0 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap overflow-hidden">
                  <h3 className="text-xs font-black truncate text-white">
                    {friend.name}
                  </h3>
                  <p className="text-[10px] font-bold text-text-muted truncate leading-tight">
                    {friend.status}
                  </p>
                </div>

                <div className="absolute left-[-10px] top-1/2 -translate-y-1/2 -translate-x-full px-3 py-1.5 bg-surface border border-border rounded-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:hidden transition-all pointer-events-none shadow-xl">
                  {friend.name}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-border bg-surface opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Messages..."
              className="w-full bg-background border-none rounded-xl py-3 pl-10 pr-4 text-[11px] font-bold text-white placeholder-text-muted focus:ring-1 focus:ring-primary outline-none"
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
        </div>
      </aside>

      {selectedFriend && (
        <div className="fixed right-[80px] xl:right-[300px] top-20 bottom-0 w-[380px] bg-surface border-l border-border z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
          <div className="p-4 border-b border-border bg-primary flex items-center gap-3">
            <button
              onClick={handleCloseChat}
              className="text-white hover:bg-white/20 p-1 rounded-lg transition-colors"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <span className="text-white font-bold text-sm">
              Messages / Chat
            </span>
          </div>

          <div className="p-4 border-b border-border flex items-center gap-3">
            <div className="relative">
              <HexagonAvatar
                src={`/images/avatars/avatar_${selectedFriend.avatar}`}
                level={selectedFriend.level}
                size="md"
              />
              {selectedFriend.online && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-secondary rounded-full border-2 border-surface" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold">{selectedFriend.name}</h3>
              <span
                className={`text-[10px] font-bold uppercase ${
                  selectedFriend.online ? "text-secondary" : "text-text-muted"
                }`}
              >
                {selectedFriend.online ? "ONLINE" : "OFFLINE"}
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {mockMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sent ? "justify-end" : "justify-start"
                }`}
              >
                <div className="flex items-end gap-2 max-w-[80%]">
                  {!message.sent && (
                    <HexagonAvatar
                      src={`/images/avatars/avatar_${selectedFriend.avatar}`}
                      size="sm"
                    />
                  )}
                  <div>
                    <div
                      className={`px-4 py-3 rounded-2xl text-xs font-medium ${
                        message.sent
                          ? "bg-primary text-white rounded-br-md"
                          : "bg-background text-white rounded-bl-md"
                      }`}
                    >
                      {message.text}
                    </div>
                    <p
                      className={`text-[10px] text-text-muted mt-1 ${
                        message.sent ? "text-right" : ""
                      }`}
                    >
                      {message.time}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Write a message..."
                className="flex-1 bg-background rounded-xl px-4 py-3 text-sm text-white placeholder-text-muted outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                onClick={handleSendMessage}
                className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white hover:bg-primary/80 transition-colors"
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
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
