import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";

const links = [
  { to: "/admin", label: "Overview" },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/users", label: "Users" },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="w-full border-b border-slate-200 bg-white p-6 lg:w-72 lg:border-b-0 lg:border-r">
          <div className="mb-8">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
              Admin Panel
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">
              E-Commerce HQ
            </h1>
          </div>

          <nav className="space-y-2">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/admin"}
                className={({ isActive }) =>
                  `block rounded-lg px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Signed in
            </p>
            <p className="mt-2 font-semibold text-slate-900">
              {user?.name || "Admin"}
            </p>
            <p className="text-sm text-slate-600">{user?.email}</p>
          </div>
        </aside>

        <div className="flex-1">
          <header className="border-b border-slate-200 bg-white px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Operations dashboard</p>
                <h2 className="text-xl font-semibold text-slate-900">
                  Manage your store
                </h2>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Logout
              </button>
            </div>
          </header>

          <main className="p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;