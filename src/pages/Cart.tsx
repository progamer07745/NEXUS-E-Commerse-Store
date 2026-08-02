import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/cartContext";

const CartPage = () => {
  const { items, total, changeQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <h1 className="text-3xl font-semibold text-slate-900">Your cart is empty</h1>
            <p className="mt-4 text-slate-500">Add products to your cart and come back to complete checkout.</p>
            <Link
              to="/"
              className="mt-8 inline-flex rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Cart</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Your shopping bag</h1>
          </div>
          <button
            onClick={() => navigate("/checkout")}
            className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
          >
            Proceed to checkout
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item._id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">{item.name}</h2>
                    <p className="mt-1 text-sm text-slate-500">{item.brand}</p>
                    <p className="mt-2 text-slate-700">${(item.selectedVariant?.price ?? item.price).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => changeQuantity(item._id, item.quantity - 1)}
                      className="rounded-full border border-slate-300 px-3 py-2 text-slate-700"
                    >
                      −
                    </button>
                    <span className="min-w-[2rem] text-center text-sm text-slate-900">{item.quantity}</span>
                    <button
                      onClick={() => changeQuantity(item._id, item.quantity + 1)}
                      className="rounded-full border border-slate-300 px-3 py-2 text-slate-700"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="rounded-full border border-rose-500 px-3 py-2 text-rose-500 transition hover:bg-rose-500/10"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Order summary</h2>
            <div className="mt-4 flex justify-between text-sm text-slate-500">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="mt-6">
              <button
                onClick={() => navigate("/checkout")}
                className="w-full rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Checkout now
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
