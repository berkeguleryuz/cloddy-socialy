import SettingsLayout from "@/components/SettingsLayout";

const groups = [
  {
    id: 1,
    name: "Cosmo Gamers",
    members: 1250,
    role: "Admin",
    image: "/images/covers/cover_01.png",
  },
  {
    id: 2,
    name: "Streamers United",
    members: 856,
    role: "Moderator",
    image: "/images/covers/cover_02.png",
  },
  {
    id: 3,
    name: "Art & Design",
    members: 2340,
    role: "Member",
    image: "/images/covers/cover_03.png",
  },
];

export default function ManageGroupsPage() {
  return (
    <SettingsLayout
      title="Account Settings"
      description="Manage your groups and memberships"
    >
      <div className="widget-box">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-black uppercase tracking-widest text-text-muted">
            Manage Groups
          </h3>
          <button className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-all">
            Create Group
          </button>
        </div>

        <div className="space-y-4">
          {groups.map((group) => (
            <div
              key={group.id}
              className="flex items-center gap-4 p-4 bg-background rounded-xl border border-border hover:border-primary/30 transition-all"
            >
              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                <img
                  src={group.image}
                  alt={group.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h5 className="text-white font-bold text-sm">{group.name}</h5>
                <p className="text-text-muted text-xs mt-1">
                  {group.members.toLocaleString()} members
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 text-xs font-bold rounded-full ${
                    group.role === "Admin"
                      ? "bg-primary/20 text-primary"
                      : group.role === "Moderator"
                      ? "bg-secondary/20 text-secondary"
                      : "bg-background text-text-muted"
                  }`}
                >
                  {group.role}
                </span>
                <button className="w-9 h-9 bg-surface rounded-lg flex items-center justify-center text-text-muted hover:text-white transition-all border border-border">
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
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    ></path>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SettingsLayout>
  );
}
