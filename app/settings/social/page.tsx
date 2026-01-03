import SettingsLayout from "@/components/SettingsLayout";

export default function SocialStreamPage() {
  return (
    <SettingsLayout
      title="Account Settings"
      description="Manage your social profiles and streaming settings"
    >
      <div className="widget-box">
        <h3 className="text-xs font-black uppercase tracking-widest text-text-muted mb-6">
          Social & Stream
        </h3>

        <div className="mb-8 pb-8 border-b border-border">
          <h4 className="text-white font-bold text-sm mb-6">Social Profiles</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 bg-background rounded-xl p-4 border border-border">
              <div className="w-10 h-10 rounded-lg bg-[#1877F2] flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Facebook Profile URL"
                className="flex-1 bg-transparent text-sm text-white placeholder-text-muted outline-none"
              />
            </div>
            <div className="flex items-center gap-3 bg-background rounded-xl p-4 border border-border">
              <div className="w-10 h-10 rounded-lg bg-[#1DA1F2] flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Twitter Profile URL"
                className="flex-1 bg-transparent text-sm text-white placeholder-text-muted outline-none"
              />
            </div>
            <div className="flex items-center gap-3 bg-background rounded-xl p-4 border border-border">
              <div className="w-10 h-10 rounded-lg bg-linear-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Instagram Profile URL"
                className="flex-1 bg-transparent text-sm text-white placeholder-text-muted outline-none"
              />
            </div>
            <div className="flex items-center gap-3 bg-background rounded-xl p-4 border border-border">
              <div className="w-10 h-10 rounded-lg bg-[#9146FF] flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Twitch Channel URL"
                className="flex-1 bg-transparent text-sm text-white placeholder-text-muted outline-none"
              />
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold text-sm mb-6">
            Streaming Settings
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-border">
              <div>
                <h5 className="text-white font-bold text-sm">
                  Stream Notifications
                </h5>
                <p className="text-text-muted text-xs mt-1">
                  Notify followers when you go live
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  defaultChecked
                />
                <div className="w-11 h-6 bg-background peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-border">
              <div>
                <h5 className="text-white font-bold text-sm">
                  Auto-post to Social
                </h5>
                <p className="text-text-muted text-xs mt-1">
                  Automatically share stream to connected socials
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-background peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
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
