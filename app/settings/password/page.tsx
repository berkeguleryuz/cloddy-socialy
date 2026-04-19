"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import SettingsLayout from "@/components/SettingsLayout";
import { Button } from "@/components/ui/Button";

function scorePassword(pw: string): { score: number; label: string } {
  if (!pw) return { score: 0, label: "—" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ["Weak", "Weak", "Fair", "Good", "Strong", "Very strong"];
  return { score, label: labels[score] ?? "Weak" };
}

export default function ChangePasswordPage() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [twoFactor, setTwoFactor] = useState(false);
  const [saving, setSaving] = useState(false);

  const strength = useMemo(() => scorePassword(next), [next]);
  const strengthPercent = (strength.score / 5) * 100;

  const handleUpdate = async () => {
    if (!current) return toast.error("Enter current password");
    if (next.length < 8) return toast.error("New password must be 8+ characters");
    if (next !== confirm) return toast.error("Passwords don't match");

    setSaving(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: current,
          password: next,
        }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "Update failed");
      }
      setCurrent("");
      setNext("");
      setConfirm("");
      toast.success("Password updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsLayout
      title="Account Settings"
      description="Change your account password"
    >
      <div className="widget-box">
        <h3 className="text-xs font-black uppercase tracking-widest text-text-muted mb-6">
          Change Password
        </h3>

        <div className="max-w-md space-y-6">
          <Field label="Current Password">
            <input
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              placeholder="Enter your current password"
              className="form-input"
              autoComplete="current-password"
            />
          </Field>
          <div>
            <Field label="New Password">
              <input
                type="password"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                placeholder="Enter new password"
                className="form-input"
                autoComplete="new-password"
              />
            </Field>
            <p className="text-text-muted text-xs mt-2">
              Password must be at least 8 characters with uppercase, lowercase,
              and numbers
            </p>
          </div>
          <Field label="Confirm New Password">
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm new password"
              className="form-input"
              autoComplete="new-password"
            />
          </Field>

          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-text-muted">Password Strength</span>
              <span
                className={
                  strength.score >= 4
                    ? "text-secondary font-bold"
                    : strength.score >= 2
                    ? "text-accent-blue font-bold"
                    : "text-accent-orange font-bold"
                }
              >
                {strength.label}
              </span>
            </div>
            <div className="h-1.5 bg-background rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  strength.score >= 4
                    ? "bg-secondary"
                    : strength.score >= 2
                    ? "bg-accent-blue"
                    : "bg-accent-orange"
                }`}
                style={{ width: `${strengthPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border">
          <h4 className="text-white font-bold text-sm mb-4">
            Two-Factor Authentication
          </h4>
          <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-border">
            <div>
              <h5 className="text-white font-bold text-sm">Enable 2FA</h5>
              <p className="text-text-muted text-xs mt-1">
                Add an extra layer of security to your account
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={twoFactor}
                onChange={(e) => {
                  setTwoFactor(e.target.checked);
                  toast.success(
                    e.target.checked ? "2FA enabled" : "2FA disabled"
                  );
                }}
              />
              <div className="w-11 h-6 bg-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary border border-border"></div>
            </label>
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <Button onClick={handleUpdate} loading={saving}>
            Update Password
          </Button>
        </div>
      </div>
    </SettingsLayout>
  );
}

function Field({
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
