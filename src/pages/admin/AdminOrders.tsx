import { useEffect, useState } from "react";
import api from "../../services/api";

interface OrderItem {
  product?: {
    name: string;
  };
  quantity: number;
  price: number;
}

interface OrderRecord {
  _id: string;
  status: string;
  totalOrderPrice: number;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
  orderItems: OrderItem[];
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    const response = await api.get("/admin/orders");
    const items = response.data.data?.docs || [];
    setOrders(items);
  };

  useEffect(() => {
    const loadOrders = async () => {
      try {
        await fetchOrders();
      } catch (_error: any) {
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const updateStatus = async (orderId: string, status: string) => {
    await api.patch(`/admin/orders/${orderId}`, { status });
    setOrders((current) => current.map((order) => (order._id === orderId ? { ...order, status } : order)));
  };

  if (loading) {
    return <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 text-slate-300">Loading orders…</div>;
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
      <h3 className="text-xl font-semibold">Orders</h3>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-800 text-slate-400">
            <tr>
              <th className="px-3 py-3">Customer</th>
              <th className="px-3 py-3">Items</th>
              <th className="px-3 py-3">Total</th>
              <th className="px-3 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="border-b border-slate-800/80">
                <td className="px-3 py-3">
                  <div className="font-medium text-white">{order.user?.name || "Guest"}</div>
                  <div className="text-slate-400">{order.user?.email}</div>
                </td>
                <td className="px-3 py-3 text-slate-300">
                  {order.orderItems.map((item) => item.product?.name || "Item").join(", ")}
                </td>
                <td className="px-3 py-3 text-slate-300">${order.totalOrderPrice}</td>
                <td className="px-3 py-3">
                  <select
                    value={order.status}
                    onChange={(event) => updateStatus(order._id, event.target.value)}
                    className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;
