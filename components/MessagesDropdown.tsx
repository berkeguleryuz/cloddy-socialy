"use client";

import { useState } from "react";
import HexagonAvatar from "./HexagonAvatar";

const conversations = [
  {
    id: 1,
    user: {
      name: "Nick Grissom",
      avatar: "/images/avatars/avatar_02.png",
      level: 16,
      online: true,
    },
    lastMessage: "Can you stream the new game?",
    time: "2hrs",
    unread: true,
  },
  {
    id: 2,
    user: {
      name: "Matt Parker",
      avatar: "/images/avatars/avatar_04.png",
      level: 9,
      online: true,
    },
    lastMessage: "Can you stream the new game?",
    time: "2hrs",
    unread: false,
  },
  {
    id: 3,
    user: {
      name: "Neko Bebop",
      avatar: "/images/avatars/avatar_03.png",
      level: 12,
      online: true,
    },
    lastMessage: "Awesome! I'll see you there!",
    time: "54mins",
    unread: true,
  },
  {
    id: 4,
    user: {
      name: "Bearded Wonder",
      avatar: "/images/avatars/avatar_06.png",
      level: 6,
      online: false,
    },
    lastMessage: "Great! Then we'll meet with them at...",
    time: "2hrs",
    unread: false,
  },
  {
    id: 5,
    user: {
      name: "Sandra Strange",
      avatar: "/images/avatars/avatar_05.png",
      level: 27,
      online: true,
    },
    lastMessage: "Can you stream the new game?",
    time: "2hrs",
    unread: false,
  },
  {
    id: 6,
    user: {
      name: "James Murdock",
      avatar: "/images/avatars/avatar_07.png",
      level: 10,
      online: false,
    },
    lastMessage: "Great! Then we'll meet with them at...",
    time: "7hrs",
    unread: false,
  },
  {
    id: 7,
    user: {
      name: "The Green Goo",
      avatar: "/images/avatars/avatar_08.png",
      level: 5,
      online: true,
    },
    lastMessage: "Can you stream the new game?",
    time: "2hrs",
    unread: false,
  },
  {
    id: 8,
    user: {
      name: "Sarah Diamond",
      avatar: "/images/avatars/avatar_09.png",
      level: 26,
      online: false,
    },
    lastMessage: "I'm sending you the latest news of...",
    time: "16hrs",
    unread: false,
  },
];

interface Message {
  id: number;
  text: string;
  sent: boolean;
  time: string;
}

const mockMessages: Message[] = [
  {
    id: 1,
    text: "Hi Marina! It's been a long time!",
    sent: false,
    time: "Yesterday at 8:36PM",
  },
  { id: 2, text: "Hey Nick!", sent: true, time: "10:05AM" },
  {
    id: 3,
    text: "You're right, it's been a really long time! I think the last time we saw was at Neko's party",
    sent: true,
    time: "10:05AM",
  },
  {
    id: 4,
    text: "Yeah! I remember now! The stream launch party",
    sent: false,
    time: "10:06AM",
  },
  {
    id: 5,
    text: "That reminds me that I wanted to ask you something",
    sent: false,
    time: "10:06AM",
  },
  { id: 6, text: "Can you stream the new game?", sent: false, time: "10:07AM" },
];

export default function MessagesDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<
    (typeof conversations)[0] | null
  >(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");

  const filteredConversations = conversations.filter((c) =>
    c.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // In a real app, this would send the message
      setNewMessage("");
    }
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 bg-surface rounded-lg flex items-center justify-center text-text-muted cursor-pointer hover:bg-primary hover:text-white transition-all border border-border relative"
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
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
        <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-accent-blue rounded-full border-2 border-surface" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setIsOpen(false);
              setSelectedConversation(null);
            }}
          />

          <div className="absolute right-0 top-14 w-[380px] bg-surface rounded-xl border border-border shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
            <div className="p-4 border-b border-border bg-primary">
              <div className="flex items-center gap-3">
                <button
                  onClick={selectedConversation ? handleBackToList : undefined}
                  className={`text-white ${
                    selectedConversation
                      ? "hover:bg-white/20 p-1 rounded-lg transition-colors"
                      : ""
                  }`}
                >
                  {selectedConversation ? (
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
                  ) : (
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
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  )}
                </button>
                <span className="text-white font-bold text-sm">
                  Messages / Chat
                </span>
              </div>
            </div>

            {selectedConversation ? (
              /* Individual Chat View */
              <div className="flex flex-col h-[450px]">
                <div className="p-4 border-b border-border flex items-center gap-3">
                  <div className="relative">
                    <HexagonAvatar
                      src={selectedConversation.user.avatar}
                      level={selectedConversation.user.level}
                      size="md"
                    />
                    {selectedConversation.user.online && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-secondary rounded-full border-2 border-surface" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">
                      {selectedConversation.user.name}
                    </h3>
                    <span
                      className={`text-[10px] font-bold uppercase ${
                        selectedConversation.user.online
                          ? "text-secondary"
                          : "text-text-muted"
                      }`}
                    >
                      {selectedConversation.user.online ? "ONLINE" : "OFFLINE"}
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
                            src={selectedConversation.user.avatar}
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
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleSendMessage()
                      }
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
            ) : (
              /* Conversation List View */
              <div className="h-[450px] flex flex-col">
                <div className="flex-1 overflow-y-auto">
                  {filteredConversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation)}
                      className="w-full p-4 flex items-center gap-3 hover:bg-background/50 transition-colors text-left border-b border-border/50"
                    >
                      <div className="relative shrink-0">
                        <HexagonAvatar
                          src={conversation.user.avatar}
                          level={conversation.user.level}
                          size="md"
                        />
                        {conversation.user.online && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-secondary rounded-full border-2 border-surface" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <h3 className="text-sm font-bold truncate">
                            {conversation.user.name}
                          </h3>
                          <span className="text-[10px] text-text-muted shrink-0">
                            {conversation.time}
                          </span>
                        </div>
                        <p className="text-xs text-text-muted truncate">
                          {conversation.lastMessage}
                        </p>
                      </div>
                      {conversation.unread && (
                        <div className="w-2.5 h-2.5 bg-primary rounded-full shrink-0" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="p-4 border-t border-border">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search Messages..."
                      className="w-full bg-background rounded-xl px-4 py-3 pr-10 text-sm text-white placeholder-text-muted outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <svg
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
