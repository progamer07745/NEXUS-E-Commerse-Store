import { useEffect, useState, type FormEvent } from "react";
import api from "../../services/api";

interface CategoryRecord {
  _id: string;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
}

const AdminCategories = () => {
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
    const items = response.data.data?.docs || [];
    setCategories(items);
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        await fetchCategories();
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    const response = await api.post("/admin/categories", form);
    const createdCategory = response.data.data?.doc || response.data.data;
    setCategories((current) => [createdCategory, ...current]);
    setForm({ name: "", slug: "", description: "", image: "", isActive: true });
  };

  if (loading) {
    return <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 text-slate-300">Loading categories…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
        <h3 className="text-xl font-semibold">Create category</h3>
        <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={handleCreate}>
          <div>
            <label className="mb-1 block text-sm text-slate-400">Name</label>
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">Slug</label>
            <input
              value={form.slug}
              onChange={(event) => setForm({ ...form, slug: event.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm text-slate-400">Description</label>
            <textarea
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              className="min-h-24 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">Image URL</label>
            <input
              value={form.image}
              onChange={(event) => setForm({ ...form, image: event.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) => setForm({ ...form, isActive: event.target.checked })}
              className="rounded border-slate-700 bg-slate-800"
            />
            <label className="text-sm text-slate-400">Active</label>
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-slate-950 transition hover:bg-emerald-400">
              Create category
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
        <h3 className="text-xl font-semibold">Category list</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-800 text-slate-400">
              <tr>
                <th className="px-3 py-3">Name</th>
                <th className="px-3 py-3">Slug</th>
                <th className="px-3 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category._id} className="border-b border-slate-800/80">
                  <td className="px-3 py-3 font-medium text-white">{category.name}</td>
                  <td className="px-3 py-3 text-slate-300">{category.slug}</td>
                  <td className="px-3 py-3 text-slate-300">{category.isActive ? "Active" : "Inactive"}</td>
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
