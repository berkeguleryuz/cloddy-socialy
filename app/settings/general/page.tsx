import SettingsLayout from "@/components/SettingsLayout";

export default function GeneralSettingsPage() {
  return (
    <SettingsLayout
      title="Account Settings"
      description="Manage your general preferences"
    >
      <div className="widget-box">
        <h3 className="text-xs font-black uppercase tracking-widest text-text-muted mb-6">
          General Settings
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 pb-8 border-b border-border">
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-2">
              Language
            </label>
            <select className="w-full bg-background rounded-xl px-4 py-3 text-sm text-white border border-border focus:border-primary outline-none transition-all">
              <option>English (US)</option>
              <option>English (UK)</option>
              <option>Español</option>
              <option>Français</option>
              <option>Deutsch</option>
              <option>Türkçe</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-2">
              Timezone
            </label>
            <select className="w-full bg-background rounded-xl px-4 py-3 text-sm text-white border border-border focus:border-primary outline-none transition-all">
              <option>UTC -08:00 (Pacific Time)</option>
              <option>UTC -05:00 (Eastern Time)</option>
              <option>UTC +00:00 (GMT)</option>
              <option>UTC +01:00 (Central European Time)</option>
              <option>UTC +03:00 (Turkey Time)</option>
            </select>
          </div>
        </div>

        <div className="mb-8 pb-8 border-b border-border">
          <h4 className="text-white font-bold text-sm mb-6">
            Privacy Settings
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-border">
              <div>
                <h5 className="text-white font-bold text-sm">
                  Profile Visibility
                </h5>
                <p className="text-text-muted text-xs mt-1">
                  Who can see your profile
                </p>
              </div>
              <select className="bg-surface rounded-lg px-4 py-2 text-sm text-white border border-border focus:border-primary outline-none">
                <option>Everyone</option>
                <option>Friends Only</option>
                <option>Friends of Friends</option>
                <option>Private</option>
              </select>
            </div>
            <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-border">
              <div>
                <h5 className="text-white font-bold text-sm">Online Status</h5>
                <p className="text-text-muted text-xs mt-1">
                  Show when you&apos;re online
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  defaultChecked
                />
                <div className="w-11 h-6 bg-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary border border-border"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-border">
              <div>
                <h5 className="text-white font-bold text-sm">
                  Activity Status
                </h5>
                <p className="text-text-muted text-xs mt-1">
                  Show your recent activity
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  defaultChecked
                />
                <div className="w-11 h-6 bg-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary border border-border"></div>
              </label>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold text-sm mb-6">Theme</h4>
          <div className="flex gap-4">
            <div className="flex-1 p-4 bg-background rounded-xl border-2 border-primary cursor-pointer">
              <div className="w-full h-8 bg-surface rounded-lg mb-3"></div>
              <p className="text-white font-bold text-sm text-center">
                Dark Mode
              </p>
            </div>
            <div className="flex-1 p-4 bg-background rounded-xl border border-border cursor-pointer hover:border-primary/50 transition-all">
              <div className="w-full h-8 bg-white rounded-lg mb-3"></div>
              <p className="text-text-muted font-bold text-sm text-center">
                Light Mode
              </p>
            </div>
          </div>
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
