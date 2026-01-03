import SettingsLayout from "@/components/SettingsLayout";

const downloads = [
  {
    id: 1,
    name: "Cyberpunk UI Kit",
    type: "Design Asset",
    size: "124 MB",
    date: "Dec 25, 2024",
    image: "/images/covers/cover_01.png",
  },
  {
    id: 2,
    name: "Retro Sound Pack",
    type: "Audio",
    size: "56 MB",
    date: "Dec 20, 2024",
    image: "/images/covers/cover_02.png",
  },
  {
    id: 3,
    name: "Character Sprite Sheet",
    type: "Graphics",
    size: "32 MB",
    date: "Dec 15, 2024",
    image: "/images/covers/cover_03.png",
  },
  {
    id: 4,
    name: "3D Model - Spaceship",
    type: "3D Asset",
    size: "256 MB",
    date: "Dec 10, 2024",
    image: "/images/covers/cover_04.png",
  },
];

export default function DownloadsPage() {
  return (
    <SettingsLayout
      title="Account Settings"
      description="Access your purchased downloads"
    >
      <div className="widget-box">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-black uppercase tracking-widest text-text-muted">
            My Downloads
          </h3>
          <span className="text-text-muted text-xs">
            {downloads.length} items
          </span>
        </div>

        <div className="space-y-4">
          {downloads.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-4 bg-background rounded-xl border border-border hover:border-primary/30 transition-all"
            >
              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="text-white font-bold text-sm truncate">
                  {item.name}
                </h5>
                <p className="text-text-muted text-xs mt-1">
                  {item.type} • {item.size} • Purchased {item.date}
                </p>
              </div>
              <button className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2">
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
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  ></path>
                </svg>
                Download
              </button>
            </div>
          ))}
        </div>

        {downloads.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 text-text-muted mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
              ></path>
            </svg>
            <p className="text-text-muted">No downloads yet</p>
            <button className="mt-4 px-6 py-2 bg-primary text-white font-bold text-sm rounded-lg hover:bg-primary/90 transition-all">
              Browse Marketplace
            </button>
          </div>
        )}
      </div>
    </SettingsLayout>
  );
}
