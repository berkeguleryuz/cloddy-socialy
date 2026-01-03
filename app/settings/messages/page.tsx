import SettingsLayout from "@/components/SettingsLayout";
import HexagonAvatar from "@/components/HexagonAvatar";

const conversations = [
  {
    id: 1,
    user: {
      name: "Nick Grissom",
      avatar: "/images/avatars/avatar_02.png",
      level: 24,
    },
    lastMessage: "Hey! Have you seen the new update?",
    time: "2 min ago",
    unread: true,
  },
  {
    id: 2,
    user: {
      name: "Neko Bebop",
      avatar: "/images/avatars/avatar_03.png",
      level: 16,
    },
    lastMessage: "Thanks for watching my stream!",
    time: "15 min ago",
    unread: true,
  },
  {
    id: 3,
    user: {
      name: "Sarah Diamond",
      avatar: "/images/avatars/avatar_04.png",
      level: 9,
    },
    lastMessage: "See you at the event tomorrow!",
    time: "1 hour ago",
    unread: false,
  },
  {
    id: 4,
    user: {
      name: "Jett Spiegel",
      avatar: "/images/avatars/avatar_05.png",
      level: 31,
    },
    lastMessage: "Great game last night!",
    time: "3 hours ago",
    unread: false,
  },
];

export default function MessagesPage() {
  return (
    <SettingsLayout
      title="Account Settings"
      description="Manage your messages and conversations"
    >
      <div className="widget-box">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-black uppercase tracking-widest text-text-muted">
            Messages
          </h3>
          <button className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-all">
            New Message
          </button>
        </div>

        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full bg-background rounded-xl px-4 py-3 pl-10 text-sm text-white border border-border focus:border-primary outline-none transition-all"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </div>

        <div className="space-y-2">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all ${
                conv.unread
                  ? "bg-primary/10 border border-primary/30"
                  : "bg-background border border-border hover:border-primary/30"
              }`}
            >
              <HexagonAvatar
                src={conv.user.avatar}
                level={conv.user.level}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h5 className="text-white font-bold text-sm">
                    {conv.user.name}
                  </h5>
                  <span className="text-text-muted text-xs">{conv.time}</span>
                </div>
                <p
                  className={`text-xs truncate ${
                    conv.unread ? "text-white" : "text-text-muted"
                  }`}
                >
                  {conv.lastMessage}
                </p>
              </div>
              {conv.unread && (
                <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </SettingsLayout>
  );
}
