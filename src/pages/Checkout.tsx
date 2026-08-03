import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/authContext";
import { useCart } from "../context/cartContext";
import { useToast } from "../context/toastContext";

const CheckoutPage = () => {
  const { pushToast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [shipping, setShipping] = useState({
    details: "",
    phone: "",
    city: "",
    postalCode: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("card");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (!shipping.details || !shipping.phone || !shipping.city) {
      setError("Please fill in all required shipping information.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/orders", {
        // NOTE: we deliberately do NOT send the price from the client.
        // The server recalculates it from the database to prevent tampering.
        orderItems: items.map((item) => ({
          product: item._id,
          quantity: item.quantity,
        })),
        shippingAddress: shipping,
        paymentMethodType: paymentMethod,
      });
      // UX feedback
      pushToast("Order placed successfully!", "success");
      setSuccess("Order placed successfully! Your order is on its way.");
      clearCart();
      navigate("/");
    } catch {
      pushToast("Unable to place your order. Please try again.", "error");
      setError("Unable to place your order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Checkout</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Complete your purchase</h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Shipping details</h2>
                <p className="mt-2 text-sm text-slate-500">Enter the address where your order should be delivered.</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm text-slate-700">
                  Address
                  <input
                    value={shipping.details}
                    onChange={(event) => setShipping({ ...shipping, details: event.target.value })}
                    className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
                    placeholder="Street address, building, apartment"
                    required
                  />
                </label>
                <label className="block text-sm text-slate-700">
                  City
                  <input
                    value={shipping.city}
                    onChange={(event) => setShipping({ ...shipping, city: event.target.value })}
                    className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
                    placeholder="City"
                    required
                  />
                </label>
                <label className="block text-sm text-slate-700">
                  Phone
                  <input
                    value={shipping.phone}
                    onChange={(event) => setShipping({ ...shipping, phone: event.target.value })}
                    className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
                    placeholder="Phone number"
                    required
                  />
                </label>
                <label className="block text-sm text-slate-700">
                  Postal code
                  <input
                    value={shipping.postalCode}
                    onChange={(event) => setShipping({ ...shipping, postalCode: event.target.value })}
                    className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
                    placeholder="Postal code"
                  />
                </label>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-slate-900">Payment</h2>
                <div className="mt-3 space-y-3">
                  <label className="flex items-center gap-3 rounded-2xl border border-slate-300 px-4 py-3">
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={() => setPaymentMethod("card")}
                    />
                    <span>Card payment</span>
                  </label>
                  <label className="flex items-center gap-3 rounded-2xl border border-slate-300 px-4 py-3">
                    <input
                      type="radio"
                      name="payment"
                      value="cash"
                      checked={paymentMethod === "cash"}
                      onChange={() => setPaymentMethod("cash")}
                    />
                    <span>Cash on delivery</span>
                  </label>
                </div>
              </div>

              {error && <div className="rounded-2xl bg-rose-500/10 p-4 text-sm text-rose-600">{error}</div>}
              {success && <div className="rounded-2xl bg-emerald-500/10 p-4 text-sm text-emerald-700">{success}</div>}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Placing order..." : `Pay ${total.toFixed(2)} EGP`}
              </button>
            </div>
          </form>

          <aside className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Order summary</h2>
            <div className="mt-4 space-y-4">
                {items.map((item) => (
                  <div key={item._id} className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-slate-900">{item.name}</p>
                      <p className="text-sm text-slate-500">{item.quantity} × {item.price} EGP</p>
                    </div>
                    <p className="font-semibold text-slate-900">{(item.price * item.quantity).toFixed(2)} EGP</p>
                  </div>
                ))}
            </div>
            <div className="mt-6 rounded-3xl bg-slate-50 p-5">
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>Order total</span>
                <span className="font-semibold text-slate-900">{total.toFixed(2)} EGP</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
