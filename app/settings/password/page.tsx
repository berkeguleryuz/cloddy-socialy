import SettingsLayout from "@/components/SettingsLayout";

export default function ChangePasswordPage() {
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
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-2">
              Current Password
            </label>
            <input
              type="password"
              placeholder="Enter your current password"
              className="w-full bg-background rounded-xl px-4 py-3 text-sm text-white border border-border focus:border-primary outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-2">
              New Password
            </label>
            <input
              type="password"
              placeholder="Enter new password"
              className="w-full bg-background rounded-xl px-4 py-3 text-sm text-white border border-border focus:border-primary outline-none transition-all"
            />
            <p className="text-text-muted text-xs mt-2">
              Password must be at least 8 characters with uppercase, lowercase,
              and numbers
            </p>
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              placeholder="Confirm new password"
              className="w-full bg-background rounded-xl px-4 py-3 text-sm text-white border border-border focus:border-primary outline-none transition-all"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-text-muted">Password Strength</span>
              <span className="text-secondary font-bold">Strong</span>
            </div>
            <div className="h-1.5 bg-background rounded-full overflow-hidden">
              <div className="h-full bg-secondary w-4/5 transition-all"></div>
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
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary border border-border"></div>
            </label>
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <button className="px-8 py-3 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary/90 transition-all">
            Update Password
          </button>
        </div>
      </div>
    </SettingsLayout>
  );
}
