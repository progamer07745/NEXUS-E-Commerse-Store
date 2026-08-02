import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

interface OrderItem {
  product?: {
    name: string;
  };
  quantity: number;
  price: number;
}

interface OrderRecord {
  _id: string;
  totalOrderPrice: number;
  status: string;
  createdAt: string;
  orderItems: OrderItem[];
}

const OrdersPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { pushToast } = useToast();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await api.get("/orders/my");
        const ordersData = response.data?.data?.orders ?? [];
        setOrders(Array.isArray(ordersData) ? ordersData : []);
      } catch (error: any) {
        pushToast("Unable to load your orders. Please try again later.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  if (loading) {
    return <div className="min-h-screen bg-slate-50 p-16 text-slate-700">Loading your orders…</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">My orders</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Order history</h1>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-slate-700">You have not placed any orders yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
                  <div>
                    <p className="text-sm text-slate-500">Order ID: {order._id}</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">{order.status}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Total</p>
                    <p className="mt-1 text-xl font-semibold text-slate-900">${order.totalOrderPrice.toFixed(2)}</p>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {order.orderItems.map((item, index) => (
                    <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="font-medium text-slate-900">{item.product?.name || "Product"}</p>
                      <p className="text-sm text-slate-500">{item.quantity} × ${item.price}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-sm text-slate-500">Purchased on {new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
