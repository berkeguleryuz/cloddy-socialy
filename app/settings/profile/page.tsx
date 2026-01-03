import SettingsLayout from "@/components/SettingsLayout";
import HexagonAvatar from "@/components/HexagonAvatar";

export default function ProfileInfoPage() {
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
            src="/images/avatars/avatar_01.png"
            level={24}
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
              <button className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-all">
                Upload Avatar
              </button>
              <button className="px-4 py-2 bg-background text-text-muted text-xs font-bold rounded-lg hover:text-white transition-all border border-border">
                Delete
              </button>
            </div>
          </div>
        </div>

        <div className="mb-8 pb-8 border-b border-border">
          <h4 className="text-white font-bold text-sm mb-4">Profile Cover</h4>
          <div className="w-full h-32 rounded-xl bg-linear-to-r from-primary via-accent-blue to-secondary flex items-center justify-center cursor-pointer hover:opacity-90 transition-all">
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
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-2">
              Full Name
            </label>
            <input
              type="text"
              defaultValue="Marina Valentine"
              className="w-full bg-background rounded-xl px-4 py-3 text-sm text-white border border-border focus:border-primary outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-2">
              Username
            </label>
            <input
              type="text"
              defaultValue="marinavalentine"
              className="w-full bg-background rounded-xl px-4 py-3 text-sm text-white border border-border focus:border-primary outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-2">
              Email
            </label>
            <input
              type="email"
              defaultValue="marina@vikinger.com"
              className="w-full bg-background rounded-xl px-4 py-3 text-sm text-white border border-border focus:border-primary outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-2">
              Country
            </label>
            <select className="w-full bg-background rounded-xl px-4 py-3 text-sm text-white border border-border focus:border-primary outline-none transition-all">
              <option>United States</option>
              <option>Canada</option>
              <option>United Kingdom</option>
              <option>Germany</option>
              <option>France</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-text-muted uppercase mb-2">
              About Me
            </label>
            <textarea
              rows={4}
              defaultValue="I'm a video game enthusiast and streamer. Love to play and share my experiences with others!"
              className="w-full bg-background rounded-xl px-4 py-3 text-sm text-white border border-border focus:border-primary outline-none transition-all resize-none"
            />
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
