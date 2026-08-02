import { useEffect, useState } from "react";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";

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
  const { pushToast } = useToast();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    const response = await api.get("/admin/orders");
    const items = response.data.data?.docs || response.data.data || [];
    setOrders(Array.isArray(items) ? items : []);
  };

  useEffect(() => {
    const loadOrders = async () => {
      try {
        await fetchOrders();
      } catch {
        pushToast("Unable to load orders.", "error");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const updateStatus = async (orderId: string, status: string) => {
    try {
      await api.patch(`/admin/orders/${orderId}`, { status });
      setOrders((current) =>
        current.map((order) =>
          order._id === orderId ? { ...order, status } : order,
        ),
      );
      pushToast("Order status updated.", "success");
    } catch {
      pushToast("Unable to update status. Please try again.", "error");
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-500">
        Loading orders…
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-slate-900">
      <h3 className="text-xl font-semibold text-slate-900">Orders</h3>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-slate-500">
            <tr>
              <th className="px-3 py-3">Customer</th>
              <th className="px-3 py-3">Items</th>
              <th className="px-3 py-3">Total</th>
              <th className="px-3 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="border-b border-slate-100">
                <td className="px-3 py-3">
                  <div className="font-medium text-slate-900">
                    {order.user?.name || "Guest"}
                  </div>
                  <div className="text-slate-500">{order.user?.email}</div>
                </td>
                <td className="px-3 py-3 text-slate-700">
                  {order.orderItems
                    .map((item) => item.product?.name || "Item")
                    .join(", ")}
                </td>
                <td className="px-3 py-3 text-slate-700">
                  ${order.totalOrderPrice}
                </td>
                <td className="px-3 py-3">
                  <select
                    value={order.status}
                    onChange={(event) =>
                      updateStatus(order._id, event.target.value)
                    }
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-500"
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