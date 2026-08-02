import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useState } from "react";

const Header = () => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();

  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
        <Link to="/" className="text-xl font-semibold text-slate-900">
          NEXUS
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link to="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            Shop
          </Link>
          {user ? (
            <Link to="/orders" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Orders
            </Link>
          ) : null}
          <Link to="/cart" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            Cart ({itemCount})
          </Link>
          {user?.role === "admin" || user?.isAdmin ? (
            <Link to="/admin" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
              Admin
            </Link>
          ) : null}
        </nav>

        {/* mobile */}
        <div className="flex items-center gap-3 md:hidden">
          <button onClick={() => setOpen((s) => !s)} className="p-2">
            <svg className="h-6 w-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-slate-600">Hello, {user.name}</span>
              <button
                onClick={logout}
                className="rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              Login
            </Link>
          )}
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-slate-100">
          <div className="flex flex-col gap-2 p-4">
            <Link to="/" className="text-base font-medium text-slate-700">Shop</Link>
            {user ? <Link to="/orders" className="text-base font-medium text-slate-700">Orders</Link> : null}
            <Link to="/cart" className="text-base font-medium text-slate-700">Cart ({itemCount})</Link>
            {user?.role === "admin" || user?.isAdmin ? <Link to="/admin" className="text-base font-medium text-slate-700">Admin</Link> : null}
            {user ? (
              <button onClick={logout} className="mt-2 rounded bg-slate-900 px-3 py-2 text-sm text-white">Logout</button>
            ) : (
              <Link to="/login" className="mt-2 rounded bg-slate-900 px-3 py-2 text-sm text-white">Login</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
