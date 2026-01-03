import SettingsLayout from "@/components/SettingsLayout";

export default function AccountInfoPage() {
  return (
    <SettingsLayout
      title="Account Settings"
      description="Manage your account information"
    >
      <div className="widget-box">
        <h3 className="text-xs font-black uppercase tracking-widest text-text-muted mb-6">
          Account Info
        </h3>

        <div className="flex items-center gap-4 p-4 bg-secondary/10 rounded-xl border border-secondary/30 mb-8">
          <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              ></path>
            </svg>
          </div>
          <div>
            <h4 className="text-white font-bold text-sm">Verified Account</h4>
            <p className="text-text-muted text-xs">
              Your account has been verified since January 2024
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 pb-8 border-b border-border">
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-2">
              Account ID
            </label>
            <div className="bg-background rounded-xl px-4 py-3 text-sm text-text-muted border border-border">
              #VK-24680-MAR
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-2">
              Member Since
            </label>
            <div className="bg-background rounded-xl px-4 py-3 text-sm text-text-muted border border-border">
              January 15, 2023
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-2">
              Account Type
            </label>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-background rounded-xl px-4 py-3 text-sm text-white border border-border">
                Pro Member
              </div>
              <button className="px-4 py-3 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-all">
                Upgrade
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-2">
              Email Verified
            </label>
            <div className="flex items-center gap-2 bg-background rounded-xl px-4 py-3 text-sm border border-border">
              <span className="w-2 h-2 bg-secondary rounded-full"></span>
              <span className="text-white">marina@vikinger.com</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-black uppercase tracking-widest text-red-500 mb-4">
            Danger Zone
          </h4>
          <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-xl border border-red-500/30">
            <div>
              <h5 className="text-white font-bold text-sm">Delete Account</h5>
              <p className="text-text-muted text-xs mt-1">
                Permanently delete your account and all data
              </p>
            </div>
            <button className="px-4 py-2 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-all">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </SettingsLayout>
  );
}
