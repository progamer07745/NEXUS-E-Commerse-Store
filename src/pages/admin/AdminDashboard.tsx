import { useEffect, useState } from "react";
import api from "../../services/api";

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  pendingOrders: number;
  lowStockProducts: number;
  totalRevenue: number;
}

interface RecentOrder {
  _id: string;
  status: string;
  totalOrderPrice: number;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
}

const cards = [
  { label: "Products", key: "totalProducts" as const },
  { label: "Orders", key: "totalOrders" as const },
  { label: "Users", key: "totalUsers" as const },
  { label: "Pending", key: "pendingOrders" as const },
  { label: "Low stock", key: "lowStockProducts" as const },
  { label: "Revenue", key: "totalRevenue" as const },
];

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get("/admin/dashboard/stats");
        const payload = response.data.data;
        setStats(payload.stats);
        setRecentOrders(payload.recentOrders || []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-500">
        Loading dashboard…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
              {card.label}
            </p>
            <p className="mt-4 text-3xl font-semibold text-slate-900">
              {card.key === "totalRevenue"
                ? `$${(stats?.[card.key] || 0).toLocaleString()}`
                : stats?.[card.key] ?? 0}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-slate-900">Recent orders</h3>
          <span className="text-sm text-slate-500">Latest activity</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-3 py-3">Customer</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Amount</th>
                <th className="px-3 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order._id} className="border-b border-slate-100">
                  <td className="px-3 py-3">
                    <div className="font-medium text-slate-900">
                      {order.user?.name || "Guest"}
                    </div>
                    <div className="text-slate-500">{order.user?.email}</div>
                  </td>
                  <td className="px-3 py-3 text-slate-700">{order.status}</td>
                  <td className="px-3 py-3 text-slate-700">
                    ${order.totalOrderPrice}
                  </td>
                  <td className="px-3 py-3 text-slate-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;