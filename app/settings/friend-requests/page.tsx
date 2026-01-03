import SettingsLayout from "@/components/SettingsLayout";
import HexagonAvatar from "@/components/HexagonAvatar";

const friendRequests = [
  {
    id: 1,
    user: {
      name: "Alex Storm",
      avatar: "/images/avatars/avatar_06.png",
      level: 18,
    },
    mutualFriends: 12,
    time: "2 hours ago",
  },
  {
    id: 2,
    user: {
      name: "Rosie Phoenix",
      avatar: "/images/avatars/avatar_07.png",
      level: 22,
    },
    mutualFriends: 8,
    time: "5 hours ago",
  },
  {
    id: 3,
    user: {
      name: "Derek Blaze",
      avatar: "/images/avatars/avatar_08.png",
      level: 15,
    },
    mutualFriends: 3,
    time: "1 day ago",
  },
];

export default function FriendRequestsPage() {
  return (
    <SettingsLayout
      title="Account Settings"
      description="Manage your friend requests"
    >
      <div className="widget-box">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-black uppercase tracking-widest text-text-muted">
            Friend Requests
          </h3>
          <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-full">
            {friendRequests.length} Pending
          </span>
        </div>

        <div className="space-y-4">
          {friendRequests.map((request) => (
            <div
              key={request.id}
              className="flex items-center gap-4 p-4 bg-background rounded-xl border border-border"
            >
              <HexagonAvatar
                src={request.user.avatar}
                level={request.user.level}
                size="lg"
              />
              <div className="flex-1">
                <h5 className="text-white font-bold text-sm">
                  {request.user.name}
                </h5>
                <p className="text-text-muted text-xs mt-1">
                  {request.mutualFriends} mutual friends • {request.time}
                </p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-all">
                  Accept
                </button>
                <button className="px-4 py-2 bg-background text-text-muted text-xs font-bold rounded-lg hover:text-white transition-all border border-border">
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-8 border-t border-border">
          <h4 className="text-xs font-black uppercase tracking-widest text-text-muted mb-4">
            Sent Requests
          </h4>
          <p className="text-text-muted text-sm">
            You have no pending sent requests.
          </p>
        </div>
      </div>
    </SettingsLayout>
  );
}
