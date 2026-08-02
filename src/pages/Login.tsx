import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const LoginPage = () => {
  const { user, login, register } = useAuth();
  const { pushToast } = useToast();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

    setLoading(true);
    try {
      if (mode === "login") {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password, form.passwordConfirm);
      }
    } catch (err) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : undefined;
      setError("Unable to continue. Please check your credentials and try again.");
      pushToast(message || "Unable to continue. Please check your credentials and try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none ring-0 transition focus:border-slate-500";
  const labelClass = "mb-1 block text-sm font-medium text-slate-700";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 text-slate-900">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Account access</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Sign in to your account</h1>
          <p className="mt-2 text-sm text-slate-600">
            Access your profile, track orders, and manage your shopping experience.
          </p>
        </div>

        <div className="mb-6 flex rounded-full bg-slate-100 p-1">
          <button
            type="button"
            disabled={loading}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition ${
              mode === "login" ? "bg-slate-900 text-white" : "text-slate-600"
            } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            type="button"
            disabled={loading}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition ${
              mode === "register" ? "bg-slate-900 text-white" : "text-slate-600"
            } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === "register" && (
            <div>
              <label className={labelClass}>Name</label>
              <input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                className={inputClass}
                placeholder="Your full name"
                required
              />
            </div>
          )}

          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              className={inputClass}
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className={labelClass}>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              className={inputClass}
              placeholder="••••••••"
              required
            />
          </div>

          {mode === "register" && (
            <div>
              <label className={labelClass}>Confirm Password</label>
              <input
                type="password"
                value={form.passwordConfirm}
                onChange={(event) => setForm({ ...form, passwordConfirm: event.target.value })}
                className={inputClass}
                placeholder="Confirm password"
                required
              />
            </div>
          )}

          {error && (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <span className="inline-flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                {mode === "login" ? "Signing in..." : "Creating account..."}
              </span>
            ) : mode === "login" ? (
              "Sign in"
            ) : (
              "Create account"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;