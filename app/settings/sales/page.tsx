import SettingsLayout from "@/components/SettingsLayout";

const salesData = [
  {
    date: "Dec 28, 2024",
    item: "Cosmic Avatar Pack",
    buyer: "Nick Grissom",
    amount: 15.0,
    fee: 1.5,
    net: 13.5,
  },
  {
    date: "Dec 27, 2024",
    item: "Space Explorer Badge",
    buyer: "Sarah Diamond",
    amount: 5.0,
    fee: 0.5,
    net: 4.5,
  },
  {
    date: "Dec 25, 2024",
    item: "Neon Profile Theme",
    buyer: "Jett Spiegel",
    amount: 12.0,
    fee: 1.2,
    net: 10.8,
  },
  {
    date: "Dec 20, 2024",
    item: "Cosmic Avatar Pack",
    buyer: "Alex Storm",
    amount: 15.0,
    fee: 1.5,
    net: 13.5,
  },
  {
    date: "Dec 18, 2024",
    item: "Galaxy Sticker Pack",
    buyer: "Rosie Phoenix",
    amount: 8.0,
    fee: 0.8,
    net: 7.2,
  },
];

export default function SalesStatementPage() {
  const totalSales = salesData.reduce((sum, s) => sum + s.amount, 0);
  const totalFees = salesData.reduce((sum, s) => sum + s.fee, 0);
  const totalNet = salesData.reduce((sum, s) => sum + s.net, 0);

  return (
    <SettingsLayout
      title="Account Settings"
      description="View your sales history and statements"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="widget-box">
          <h3 className="text-xs font-black uppercase tracking-widest text-text-muted mb-2">
            Total Sales
          </h3>
          <p className="text-3xl font-black text-white">
            ${totalSales.toFixed(2)}
          </p>
        </div>
        <div className="widget-box">
          <h3 className="text-xs font-black uppercase tracking-widest text-text-muted mb-2">
            Platform Fees
          </h3>
          <p className="text-3xl font-black text-white">
            -${totalFees.toFixed(2)}
          </p>
        </div>
        <div className="widget-box bg-linear-to-br from-secondary/90 to-secondary">
          <h3 className="text-xs font-black uppercase tracking-widest text-white/60 mb-2">
            Net Earnings
          </h3>
          <p className="text-3xl font-black text-white">
            ${totalNet.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="widget-box">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-black uppercase tracking-widest text-text-muted">
            Sales History
          </h3>
          <select className="bg-background rounded-lg px-4 py-2 text-sm text-white border border-border focus:border-primary outline-none">
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
            <option>This Year</option>
            <option>All Time</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-black uppercase tracking-widest text-text-muted py-3">
                  Date
                </th>
                <th className="text-left text-xs font-black uppercase tracking-widest text-text-muted py-3">
                  Item
                </th>
                <th className="text-left text-xs font-black uppercase tracking-widest text-text-muted py-3">
                  Buyer
                </th>
                <th className="text-right text-xs font-black uppercase tracking-widest text-text-muted py-3">
                  Amount
                </th>
                <th className="text-right text-xs font-black uppercase tracking-widest text-text-muted py-3">
                  Fee
                </th>
                <th className="text-right text-xs font-black uppercase tracking-widest text-text-muted py-3">
                  Net
                </th>
              </tr>
            </thead>
            <tbody>
              {salesData.map((sale, i) => (
                <tr
                  key={i}
                  className="border-b border-border/50 hover:bg-background/50"
                >
                  <td className="py-4 text-sm text-text-muted">{sale.date}</td>
                  <td className="py-4 text-sm text-white font-medium">
                    {sale.item}
                  </td>
                  <td className="py-4 text-sm text-white">{sale.buyer}</td>
                  <td className="py-4 text-sm text-white text-right">
                    ${sale.amount.toFixed(2)}
                  </td>
                  <td className="py-4 text-sm text-text-muted text-right">
                    -${sale.fee.toFixed(2)}
                  </td>
                  <td className="py-4 text-sm text-secondary font-bold text-right">
                    ${sale.net.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mt-6">
          <button className="px-6 py-2 bg-primary text-white font-bold text-sm rounded-lg hover:bg-primary/90 transition-all">
            Download CSV
          </button>
        </div>
      </div>
    </SettingsLayout>
  );
}
