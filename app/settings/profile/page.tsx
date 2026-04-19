"use client";

import { useState } from "react";
import { toast } from "sonner";
import SettingsLayout from "@/components/SettingsLayout";
import HexagonAvatar from "@/components/HexagonAvatar";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/AuthContext";

export default function ProfileInfoPage() {
  const { user, isDemo } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullName: user?.name ?? "Marina Valentine",
    username: "marinavalentine",
    email: user?.email ?? "marina@vikinger.com",
    country: "United States",
    bio: "I'm a video game enthusiast and streamer. Love to play and share my experiences with others!",
  });

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isDemo) {
        await new Promise((r) => setTimeout(r, 500));
      } else {
        const response = await fetch("/api/users/me", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            display_name: form.fullName,
            username: form.username,
            email: form.email,
            country: form.country,
            bio: form.bio,
          }),
        });
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body.error || "Save failed");
        }
      }
      toast.success("Profile saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleUploadAvatar = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "avatars");
      try {
        if (isDemo) {
          await new Promise((r) => setTimeout(r, 500));
          toast.success("Avatar updated (demo)");
          return;
        }
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (!response.ok) throw new Error("Upload failed");
        toast.success("Avatar updated");
      } catch {
        toast.error("Avatar upload failed");
      }
    };
    input.click();
  };

  const handleDeleteAvatar = () => {
    if (!confirm("Delete current avatar?")) return;
    toast.success("Avatar removed");
  };

  const handleUploadCover = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      if (!input.files?.[0]) return;
      toast.success("Cover uploaded (demo)");
    };
    input.click();
  };

  return (
    <SettingsLayout
      title="Account Settings"
      description="Manage your profile info and privacy settings"
    >
      <div className="widget-box">
        <h3 className="text-xs font-black uppercase tracking-widest text-text-muted mb-6">
          Profile Info
        </h3>

        <div className="flex items-start gap-6 mb-8 pb-8 border-b border-border">
          <HexagonAvatar
            src={user?.avatar ?? "/images/avatars/avatar_01.png"}
            level={user?.level ?? 24}
            size="xl"
          />
          <div className="flex-1">
            <h4 className="text-white font-bold text-sm mb-2">
              Change Your Avatar
            </h4>
            <p className="text-text-muted text-xs mb-4">
              110x110px size minimum. Max 2MB.
            </p>
            <div className="flex gap-3">
              <Button onClick={handleUploadAvatar} size="sm">
                Upload Avatar
              </Button>
              <Button onClick={handleDeleteAvatar} size="sm" variant="outline">
                Delete
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-8 pb-8 border-b border-border">
          <h4 className="text-white font-bold text-sm mb-4">Profile Cover</h4>
          <button
            type="button"
            onClick={handleUploadCover}
            className="w-full h-32 rounded-xl bg-linear-to-r from-primary via-accent-blue to-secondary flex items-center justify-center cursor-pointer hover:opacity-90 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <div className="text-center">
              <svg
                className="w-8 h-8 text-white/60 mx-auto mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                ></path>
              </svg>
              <p className="text-white/60 text-xs font-bold">
                Click to upload cover photo
              </p>
            </div>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Full Name">
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              className="form-input"
            />
          </FormField>
          <FormField label="Username">
            <input
              type="text"
              value={form.username}
              onChange={(e) => update("username", e.target.value)}
              className="form-input"
            />
          </FormField>
          <FormField label="Email">
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className="form-input"
            />
          </FormField>
          <FormField label="Country">
            <select
              value={form.country}
              onChange={(e) => update("country", e.target.value)}
              className="form-input"
            >
              <option>United States</option>
              <option>Canada</option>
              <option>United Kingdom</option>
              <option>Germany</option>
              <option>France</option>
              <option>Turkey</option>
            </select>
          </FormField>
          <div className="md:col-span-2">
            <FormField label="About Me">
              <textarea
                rows={4}
                value={form.bio}
                onChange={(e) => update("bio", e.target.value)}
                className="form-input resize-none"
              />
            </FormField>
          </div>
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

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-text-muted uppercase mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}
