"use client";

import { useState } from "react";
import { toast } from "sonner";
import SettingsLayout from "@/components/SettingsLayout";
import { Button } from "@/components/ui/Button";

const INITIAL: Record<string, boolean> = {
  email: true,
  push: true,
  friendRequests: true,
  messages: true,
  groupInvitations: false,
  postReactions: true,
  commentReplies: true,
  questCompletions: true,
  badgeUnlocks: true,
  levelUp: true,
};

const LABELS: Array<{ key: keyof typeof INITIAL; title: string; description: string }> = [
  { key: "email", title: "Email Notifications", description: "Receive email updates about activity" },
  { key: "push", title: "Push Notifications", description: "Browser push notifications for new activity" },
  { key: "friendRequests", title: "Friend Requests", description: "Notify me of new friend requests" },
  { key: "messages", title: "Message Notifications", description: "Notify me of new messages" },
  { key: "groupInvitations", title: "Group Invitations", description: "Notify me when invited to groups" },
  { key: "postReactions", title: "Post Reactions", description: "Notify when someone reacts to my posts" },
  { key: "commentReplies", title: "Comment Replies", description: "Notify when someone replies to my comments" },
  { key: "questCompletions", title: "Quest Completions", description: "Notify when I complete a quest" },
  { key: "badgeUnlocks", title: "Badge Unlocks", description: "Notify when I unlock a new badge" },
  { key: "levelUp", title: "Level Up", description: "Notify when I level up" },
];

export default function NotificationsPage() {
  const [settings, setSettings] = useState(INITIAL);
  const [saving, setSaving] = useState(false);

  const toggle = (key: keyof typeof INITIAL) =>
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      toast.success("Notification preferences saved");
    } finally {
      setSaving(false);
    }
  };

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
          {LABELS.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between p-4 bg-background rounded-xl border border-border hover:border-primary/30 transition-all"
            >
              <div>
                <h5 className="text-white font-bold text-sm">{item.title}</h5>
                <p className="text-text-muted text-xs mt-1">{item.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings[item.key]}
                  onChange={() => toggle(item.key)}
                />
                <div className="w-11 h-6 bg-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary border border-border"></div>
              </label>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-8">
          <Button onClick={handleSave} loading={saving}>
            Save Changes
          </Button>
        </div>
      </div>
    </SettingsLayout>
  );
}
