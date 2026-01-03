import SettingsLayout from "@/components/SettingsLayout";

export default function NotificationsPage() {
  const notificationSettings = [
    {
      title: "Email Notifications",
      description: "Receive email updates about activity",
      enabled: true,
    },
    {
      title: "Push Notifications",
      description: "Browser push notifications for new activity",
      enabled: true,
    },
    {
      title: "Friend Requests",
      description: "Notify me of new friend requests",
      enabled: true,
    },
    {
      title: "Message Notifications",
      description: "Notify me of new messages",
      enabled: true,
    },
    {
      title: "Group Invitations",
      description: "Notify me when invited to groups",
      enabled: false,
    },
    {
      title: "Post Reactions",
      description: "Notify when someone reacts to my posts",
      enabled: true,
    },
    {
      title: "Comment Replies",
      description: "Notify when someone replies to my comments",
      enabled: true,
    },
    {
      title: "Quest Completions",
      description: "Notify when I complete a quest",
      enabled: true,
    },
    {
      title: "Badge Unlocks",
      description: "Notify when I unlock a new badge",
      enabled: true,
    },
    { title: "Level Up", description: "Notify when I level up", enabled: true },
  ];

  return (
    <SettingsLayout
      title="Account Settings"
      description="Manage your notification preferences"
    >
      <div className="widget-box">
        <h3 className="text-xs font-black uppercase tracking-widest text-text-muted mb-6">
          Notifications
        </h3>

        <div className="space-y-3">
          {notificationSettings.map((setting, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-background rounded-xl border border-border hover:border-primary/30 transition-all"
            >
              <div>
                <h5 className="text-white font-bold text-sm">
                  {setting.title}
                </h5>
                <p className="text-text-muted text-xs mt-1">
                  {setting.description}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  defaultChecked={setting.enabled}
                />
                <div className="w-11 h-6 bg-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary border border-border"></div>
              </label>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-8">
          <button className="px-8 py-3 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary/90 transition-all">
            Save Changes
          </button>
        </div>
      </div>
    </SettingsLayout>
  );
}
