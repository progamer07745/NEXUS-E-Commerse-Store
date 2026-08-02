import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      if (user.role === "admin" || user.isAdmin) {
        navigate("/admin");
      } else {
        navigate("/");
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    try {
      if (mode === "login") {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password, form.passwordConfirm);
      }
    } catch (err) {
      setError("Unable to continue. Please check your credentials and try again.");
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-slate-100">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Account access</p>
          <h1 className="mt-2 text-3xl font-semibold">Sign in to your account</h1>
          <p className="mt-2 text-sm text-slate-400">
            Access your profile, track orders, and manage your shopping experience.
          </p>
        </div>

        <div className="mb-6 flex rounded-full bg-slate-800 p-1">
          <button
            type="button"
            className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition ${
              mode === "login" ? "bg-white text-slate-900" : "text-slate-300"
            }`}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition ${
              mode === "register" ? "bg-white text-slate-900" : "text-slate-300"
            }`}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === "register" && (
            <div>
              <label className="mb-1 block text-sm text-slate-400">Name</label>
              <input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none ring-0"
                placeholder="Your full name"
                required
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm text-slate-400">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none ring-0"
              placeholder="you@example.com"
              required
            />
          </div>

            <div>
            <label className="mb-1 block text-sm text-slate-400">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none ring-0"
              placeholder="••••••••"
              required
            />
          </div>

          {mode === "register" && (
            <div>
              <label className="mb-1 block text-sm text-slate-400">Confirm Password</label>
              <input
                type="password"
                value={form.passwordConfirm}
                onChange={(event) => setForm({ ...form, passwordConfirm: event.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none ring-0"
                placeholder="Confirm password"
                required
              />
            </div>
          )}

          {error && (
            <p className="rounded-lg border border-rose-700/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-lg bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
          >
            {mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
