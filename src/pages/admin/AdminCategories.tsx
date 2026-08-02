import { useEffect, useState, type FormEvent } from "react";
import api from "../../services/api";
import { useToast } from "../../context/toastContext";

interface CategoryRecord {
  _id: string;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
}

const AdminCategories = () => {
  const { pushToast } = useToast();
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    image: "",
    isActive: true,
  });

  const fetchCategories = async () => {
    const response = await api.get("/admin/categories");
    const items = response.data.data?.docs ?? response.data.data ?? [];
    setCategories(Array.isArray(items) ? items : []);
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        await fetchCategories();
      } catch {
        pushToast("Unable to load categories.", "error");
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, [pushToast]);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const response = await api.post("/admin/categories", form);
      const createdCategory = response.data.data?.doc || response.data.data;
      setCategories((current) => [createdCategory, ...current]);
      setForm({ name: "", slug: "", description: "", image: "", isActive: true });
      pushToast("Category created!", "success");
    } catch {
      pushToast("Unable to create category. Please try again.", "error");
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-500">
        Loading categories…
      </div>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-slate-500";
  const labelClass = "mb-1 block text-sm font-medium text-slate-700";

  return (
    <div className="space-y-6 text-slate-900">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-slate-900">Create category</h3>
        <form
          className="mt-4 grid gap-4 md:grid-cols-2"
          onSubmit={handleCreate}
        >
          <div>
            <label className={labelClass}>Name</label>
            <input
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Slug</label>
            <input
              value={form.slug}
              onChange={(event) =>
                setForm({ ...form, slug: event.target.value })
              }
              className={inputClass}
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Description</label>
            <textarea
              value={form.description}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
              className={`${inputClass} min-h-24`}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Image URL</label>
            <input
              value={form.image}
              onChange={(event) =>
                setForm({ ...form, image: event.target.value })
              }
              className={inputClass}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) =>
                setForm({ ...form, isActive: event.target.checked })
              }
              className="rounded border-slate-300"
            />
            <label className="text-sm text-slate-700">Active</label>
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Create category
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-slate-900">Category list</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-3 py-3">Name</th>
                <th className="px-3 py-3">Slug</th>
                <th className="px-3 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category._id} className="border-b border-slate-100">
                  <td className="px-3 py-3 font-medium text-slate-900">
                    {category.name}
                  </td>
                  <td className="px-3 py-3 text-slate-600">{category.slug}</td>
                  <td className="px-3 py-3 text-slate-700">
                    {category.isActive ? "Active" : "Inactive"}
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

export default AdminCategories;