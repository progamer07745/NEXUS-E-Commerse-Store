import { useEffect, useState, type FormEvent } from "react";
import api from "../../services/api";
import type { IProduct } from "../../types/product";

interface ICategoryOption {
  _id: string;
  name: string;
}

interface ProductFormState {
  name: string;
  description: string;
  price: string;
  stock: string;
  brand: string;
  image: string;
  category: string;
  slug: string;
}

const defaultForm = {
  name: "",
  description: "",
  price: "",
  stock: "",
  brand: "",
  image: "",
  category: "",
  slug: "",
};

const AdminProducts = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategoryOption[]>([]);
  const [form, setForm] = useState<ProductFormState>(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    const response = await api.get("/admin/products");
    const items = response.data.data?.docs || [];
    setProducts(items);
  };

  const fetchCategories = async () => {
    const response = await api.get("/admin/categories");
    const items = response.data.data?.docs || [];
    setCategories(items);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchProducts(), fetchCategories()]);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.category) {
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        stock: Number(form.stock),
        brand: form.brand || "Generic",
        slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-"),
        image: form.image || "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80",
        images: [
          form.image || "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80",
        ],
        category: form.category,
        status: "active",
        variants: [
          {
            options: [{ name: "Color", value: "Default" }],
            price: Number(form.price),
            stock: Number(form.stock),
            images: [
              form.image || "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80",
            ],
          },
        ],
      };

      const response = await api.post("/admin/products", payload);
      const createdProduct = response.data.data?.doc || response.data.data?.product;
      setProducts((current) => [createdProduct, ...current]);
      setForm(defaultForm);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId: string) => {
    try {
      await api.delete(`/admin/products/${productId}`);
      setProducts((current) => current.filter((product) => product._id !== productId));
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 text-slate-300">Loading products…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
        <h3 className="text-xl font-semibold">Create product</h3>
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
              placeholder="product-slug"
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
            <label className="mb-1 block text-sm text-slate-400">Price</label>
            <input
              type="number"
              value={form.price}
              onChange={(event) => setForm({ ...form, price: event.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">Stock</label>
            <input
              type="number"
              value={form.stock}
              onChange={(event) => setForm({ ...form, stock: event.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">Brand</label>
            <input
              value={form.brand}
              onChange={(event) => setForm({ ...form, brand: event.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
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
          <div>
            <label className="mb-1 block text-sm text-slate-400">Category</label>
            <select
              value={form.category}
              onChange={(event) => setForm({ ...form, category: event.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
              required
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-70"
            >
              {saving ? "Creating..." : "Create product"}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
        <h3 className="text-xl font-semibold">Inventory</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-800 text-slate-400">
              <tr>
                <th className="px-3 py-3">Product</th>
                <th className="px-3 py-3">Category</th>
                <th className="px-3 py-3">Price</th>
                <th className="px-3 py-3">Stock</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className="border-b border-slate-800/80">
                  <td className="px-3 py-3">
                    <div className="font-medium text-white">{product.name}</div>
                    <div className="text-slate-400">{product.brand}</div>
                  </td>
                  <td className="px-3 py-3 text-slate-300">{product.category?.name || "—"}</td>
                  <td className="px-3 py-3 text-slate-300">${product.price}</td>
                  <td className="px-3 py-3 text-slate-300">{product.stock}</td>
                  <td className="px-3 py-3 text-slate-300">{product.status}</td>
                  <td className="px-3 py-3">
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="rounded-lg border border-rose-500/30 px-3 py-2 text-sm text-rose-300 transition hover:bg-rose-500/10"
                    >
                      Delete
                    </button>
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

export default AdminProducts;
