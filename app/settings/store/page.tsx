import SettingsLayout from "@/components/SettingsLayout";

export default function StorePage() {
  return (
    <SettingsLayout
      title="Account Settings"
      description="Manage your store account and balance"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="widget-box bg-linear-to-br from-secondary/90 to-secondary">
          <h3 className="text-xs font-black uppercase tracking-widest text-white/60 mb-2">
            Available Balance
          </h3>
          <p className="text-4xl font-black text-white mb-4">$250.32</p>
          <button className="px-6 py-2 bg-white text-secondary font-bold text-sm rounded-lg hover:bg-white/90 transition-all">
            Withdraw
          </button>
        </div>

        <div className="widget-box">
          <h3 className="text-xs font-black uppercase tracking-widest text-text-muted mb-2">
            Pending
          </h3>
          <p className="text-3xl font-black text-white mb-4">$45.00</p>
          <p className="text-text-muted text-xs">Clears in 7 days</p>
        </div>

        <div className="widget-box">
          <h3 className="text-xs font-black uppercase tracking-widest text-text-muted mb-2">
            Total Earned
          </h3>
          <p className="text-3xl font-black text-white mb-4">$1,250.32</p>
          <p className="text-text-muted text-xs">Since January 2023</p>
        </div>
      </div>

      <div className="widget-box">
        <h3 className="text-xs font-black uppercase tracking-widest text-text-muted mb-6">
          Payment Methods
        </h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-background rounded-xl border border-border">
            <div className="w-12 h-8 bg-[#1434CB] rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">VISA</span>
            </div>
            <div className="flex-1">
              <p className="text-white font-bold text-sm">
                •••• •••• •••• 4242
              </p>
              <p className="text-text-muted text-xs">Expires 12/25</p>
            </div>
            <span className="px-3 py-1 bg-secondary/20 text-secondary text-xs font-bold rounded-full">
              Default
            </span>
          </div>
          <div className="flex items-center gap-4 p-4 bg-background rounded-xl border border-border">
            <div className="w-12 h-8 bg-[#002987] rounded flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">PayPal</span>
            </div>
            <div className="flex-1">
              <p className="text-white font-bold text-sm">
                marina@vikinger.com
              </p>
              <p className="text-text-muted text-xs">PayPal Account</p>
            </div>
            <button className="text-text-muted text-xs hover:text-white transition-all">
              Set as Default
            </button>
          </div>
        </div>

        <button className="mt-6 w-full py-3 border border-dashed border-border rounded-xl text-text-muted font-bold text-sm hover:border-primary hover:text-primary transition-all">
          + Add Payment Method
        </button>
      </div>

      <div className="widget-box">
        <h3 className="text-xs font-black uppercase tracking-widest text-text-muted mb-6">
          Recent Transactions
        </h3>
        <div className="space-y-3">
          {[
            {
              type: "Sale",
              item: "Cosmic Avatar Pack",
              amount: "+$15.00",
              date: "Dec 28, 2024",
            },
            {
              type: "Withdrawal",
              item: "To PayPal",
              amount: "-$100.00",
              date: "Dec 25, 2024",
            },
            {
              type: "Sale",
              item: "Space Explorer Badge",
              amount: "+$5.00",
              date: "Dec 20, 2024",
            },
          ].map((tx, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-3 border-b border-border last:border-0"
            >
              <div>
                <p className="text-white font-bold text-sm">{tx.item}</p>
                <p className="text-text-muted text-xs">
                  {tx.type} • {tx.date}
                </p>
              </div>
              <span
                className={`font-bold text-sm ${
                  tx.amount.startsWith("+") ? "text-secondary" : "text-white"
                }`}
              >
                {tx.amount}
              </span>
            </div>
          ))}
        </div>
      </div>
    </SettingsLayout>
  );
}
