import SettingsLayout from "@/components/SettingsLayout";
import HexagonAvatar from "@/components/HexagonAvatar";

const invitations = [
  {
    id: 1,
    group: {
      name: "RPG Masters",
      image: "/images/covers/cover_04.png",
    },
    invitedBy: {
      name: "Nick Grissom",
      avatar: "/images/avatars/avatar_02.png",
      level: 24,
    },
    time: "2 hours ago",
  },
  {
    id: 2,
    group: {
      name: "Digital Artists",
      image: "/images/covers/cover_05.png",
    },
    invitedBy: {
      name: "Sarah Diamond",
      avatar: "/images/avatars/avatar_04.png",
      level: 9,
    },
    time: "1 day ago",
  },
];

export default function InvitationsPage() {
  return (
    <SettingsLayout
      title="Account Settings"
      description="Manage your group invitations"
    >
      <div className="widget-box">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-black uppercase tracking-widest text-text-muted">
            Group Invitations
          </h3>
          <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-full">
            {invitations.length} Pending
          </span>
        </div>

        <div className="space-y-4">
          {invitations.map((invitation) => (
            <div
              key={invitation.id}
              className="flex items-center gap-4 p-4 bg-background rounded-xl border border-border"
            >
              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                <img
                  src={invitation.group.image}
                  alt={invitation.group.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h5 className="text-white font-bold text-sm">
                  {invitation.group.name}
                </h5>
                <div className="flex items-center gap-2 mt-2">
                  <HexagonAvatar
                    src={invitation.invitedBy.avatar}
                    level={invitation.invitedBy.level}
                    size="sm"
                  />
                  <p className="text-text-muted text-xs">
                    Invited by{" "}
                    <span className="text-white">
                      {invitation.invitedBy.name}
                    </span>{" "}
                    • {invitation.time}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-all">
                  Join
                </button>
                <button className="px-4 py-2 bg-background text-text-muted text-xs font-bold rounded-lg hover:text-white transition-all border border-border">
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>

        {invitations.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 text-text-muted mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              ></path>
            </svg>
            <p className="text-text-muted">No pending invitations</p>
          </div>
        )}
      </div>
    </SettingsLayout>
  );
}
