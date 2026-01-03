import SettingsLayout from "@/components/SettingsLayout";

const items = [
  {
    id: 1,
    name: "Cosmic Avatar Pack",
    price: 15.0,
    sales: 42,
    status: "Active",
    image: "/images/covers/cover_01.png",
  },
  {
    id: 2,
    name: "Space Explorer Badge",
    price: 5.0,
    sales: 128,
    status: "Active",
    image: "/images/covers/cover_02.png",
  },
  {
    id: 3,
    name: "Neon Profile Theme",
    price: 12.0,
    sales: 67,
    status: "Active",
    image: "/images/covers/cover_03.png",
  },
  {
    id: 4,
    name: "Galaxy Sticker Pack",
    price: 8.0,
    sales: 89,
    status: "Pending Review",
    image: "/images/covers/cover_04.png",
  },
];

export default function ManageItemsPage() {
  return (
    <SettingsLayout
      title="Account Settings"
      description="Manage your store items"
    >
      <div className="widget-box">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-black uppercase tracking-widest text-text-muted">
            My Items
          </h3>
          <button className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-all">
            Add New Item
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 p-4 bg-background rounded-xl border border-border hover:border-primary/30 transition-all"
            >
              <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h5 className="text-white font-bold text-sm truncate">
                    {item.name}
                  </h5>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full shrink-0 ${
                      item.status === "Active"
                        ? "bg-secondary/20 text-secondary"
                        : "bg-yellow-500/20 text-yellow-500"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <p className="text-secondary font-bold text-lg mb-1">
                  ${item.price.toFixed(2)}
                </p>
                <p className="text-text-muted text-xs">{item.sales} sales</p>
              </div>
              <div className="flex flex-col gap-2">
                <button className="w-8 h-8 bg-surface rounded-lg flex items-center justify-center text-text-muted hover:text-primary transition-all border border-border">
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
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    ></path>
                  </svg>
                </button>
                <button className="w-8 h-8 bg-surface rounded-lg flex items-center justify-center text-text-muted hover:text-red-500 transition-all border border-border">
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SettingsLayout>
  );
}
