import { useEffect, useState, type FormEvent } from "react";
import api from "../../services/api";
import type { IProduct } from "../../types/product";
import { useToast } from "../../context/ToastContext";

interface ICategoryOption {
  _id: string;
  name: string;
}

interface VariantFormOption {
  name: string;
  value: string;
}

interface VariantForm {
  price: string;
  stock: string;
  images: string;
  options: VariantFormOption[];
}

interface ProductFormState {
  name: string;
  description: string;
  price: string;
  stock: string;
  brand: string;
  image: string;
  images: string;
  category: string;
  slug: string;
  status: string;
  variants: VariantForm[];
}

const emptyVariant = (): VariantForm => ({
  price: "",
  stock: "",
  images: "",
  options: [{ name: "Color", value: "Default" }],
});

const createDefaultForm = (): ProductFormState => ({
  name: "",
  description: "",
  price: "",
  stock: "",
  brand: "",
  image: "",
  images: "",
  category: "",
  slug: "",
  status: "active",
  variants: [emptyVariant()],
});

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80";

const AdminProducts = () => {
  const { pushToast } = useToast();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategoryOption[]>([]);
  const [form, setForm] = useState<ProductFormState>(createDefaultForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    const response = await api.get("/admin/products");
    const items = response.data?.data?.docs ?? response.data?.data ?? [];
    setProducts(Array.isArray(items) ? items : []);
  };

  const fetchCategories = async () => {
    const response = await api.get("/admin/categories");
    const items = response.data?.data?.docs ?? response.data?.data ?? [];
    setCategories(Array.isArray(items) ? items : []);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchProducts(), fetchCategories()]);
      } catch {
        pushToast("Unable to load admin data.", "error");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const startEdit = (product: IProduct) => {
    setEditingId(product._id);
    setForm({
      name: product.name || "",
      description: product.description || "",
      price: String(product.price ?? ""),
      stock: String(product.stock ?? ""),
      brand: product.brand || "",
      image: product.image || "",
      images: (product.images || []).join("\n"),
      category: typeof product.category === "object" ? product.category._id : (product.category as unknown as string) || "",
      slug: product.slug || "",
      status: product.status || "active",
      variants: (product.variants || []).map((variant) => ({
        price: String(variant.price ?? ""),
        stock: String(variant.stock ?? ""),
        images: (variant.images || []).join("\n"),
        options:
          variant.options && variant.options.length > 0
            ? variant.options.map((opt) => ({ name: opt.name, value: opt.value }))
            : [{ name: "Color", value: "Default" }],
      })),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setForm(createDefaultForm());
    setEditingId(null);
  };

  const updateVariant = (index: number, patch: Partial<VariantForm>) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((variant, idx) =>
        idx === index ? { ...variant, ...patch } : variant,
      ),
    }));
  };

  const updateVariantOption = (
    variantIndex: number,
    optionIndex: number,
    patch: Partial<VariantFormOption>,
  ) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((variant, idx) =>
        idx === variantIndex
          ? {
              ...variant,
              options: variant.options.map((opt, optIdx) =>
                optIdx === optionIndex ? { ...opt, ...patch } : opt,
              ),
            }
          : variant,
      ),
    }));
  };

  const buildImageList = (raw: string): string[] =>
    raw
      .split("\n")
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

  const buildPayload = () => {
    const mainImage = form.image || FALLBACK_IMAGE;
    const imageList = buildImageList(form.images);
    const allImages = imageList.length > 0 ? imageList : [mainImage];

    const variants = form.variants.map((variant) => ({
      options: variant.options.filter((opt) => opt.name.trim() && opt.value.trim()),
      price: Number(variant.price),
      stock: Number(variant.stock),
      images:
        buildImageList(variant.images).length > 0
          ? buildImageList(variant.images)
          : allImages,
    }));

    return {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      stock: Number(form.stock),
      brand: form.brand || "Generic",
      slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-"),
      image: mainImage,
      images: allImages,
      category: form.category,
      status: form.status,
      variants,
    };
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.category) {
      pushToast("Please select a category.", "error");
      return;
    }

    setSaving(true);

    try {
      const payload = buildPayload();

      if (editingId) {
        await api.patch(`/admin/products/${editingId}`, payload);
        pushToast("Product updated successfully!", "success");
      } else {
        const response = await api.post("/admin/products", payload);
        const createdProduct = response.data.data?.doc || response.data.data?.product;
        if (createdProduct) {
          setProducts((current) => [createdProduct, ...current]);
        }
        pushToast("Product created successfully!", "success");
      }

      await fetchProducts();
      resetForm();
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Unable to save product. Please try again.";
      pushToast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/admin/products/${productId}`);
      setProducts((current) => current.filter((product) => product._id !== productId));
      pushToast("Product deleted.", "success");
    } catch {
      pushToast("Unable to delete product. Please try again.", "error");
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-slate-500";
  const labelClass = "mb-1 block text-sm font-medium text-slate-700";

  if (loading) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-500">Loading products…</div>;
  }

  return (
    <div className="space-y-6 text-slate-900">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">
              {editingId ? "Edit product" : "Create product"}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {editingId
                ? "Update product details and variants."
                : "Add a new product to your inventory."}
            </p>
          </div>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50"
            >
              Cancel edit
            </button>
          )}
        </div>

        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div>
            <label className={labelClass}>Name</label>
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Slug</label>
            <input
              value={form.slug}
              onChange={(event) => setForm({ ...form, slug: event.target.value })}
              className={inputClass}
              placeholder="product-slug"
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Description</label>
            <textarea
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              className={`${inputClass} min-h-24`}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Price</label>
            <input
              type="number"
              min="0"
              step="any"
              value={form.price}
              onChange={(event) => setForm({ ...form, price: event.target.value })}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Stock</label>
            <input
              type="number"
              min="0"
              value={form.stock}
              onChange={(event) => setForm({ ...form, stock: event.target.value })}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Brand</label>
            <input
              value={form.brand}
              onChange={(event) => setForm({ ...form, brand: event.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Category</label>
            <select
              value={form.category}
              onChange={(event) => setForm({ ...form, category: event.target.value })}
              className={inputClass}
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
          <div>
            <label className={labelClass}>Status</label>
            <select
              value={form.status}
              onChange={(event) => setForm({ ...form, status: event.target.value })}
              className={inputClass}
            >
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="out_of_stock">Out of stock</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Card image URL</label>
            <input
              value={form.image}
              onChange={(event) => setForm({ ...form, image: event.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Gallery images (one URL per line)</label>
            <textarea
              value={form.images}
              onChange={(event) => setForm({ ...form, images: event.target.value })}
              className={`${inputClass} min-h-20`}
              placeholder={"https://...jpg\nhttps://...png"}
            />
          </div>

          {/* Variants section */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-slate-900">Variants</h4>
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, variants: [...prev.variants, emptyVariant()] }))}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                + Add variant
              </button>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Each variant defines price, stock and images for a combination of options (e.g. Color/Silver).
            </p>

            <div className="mt-4 space-y-4">
              {form.variants.map((variant, variantIndex) => (
                <div key={variantIndex} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-semibold text-slate-700">Variant #{variantIndex + 1}</h5>
                    <button
                      type="button"
                      onClick={() => {
                        setForm((prev) => ({
                          ...prev,
                          variants: prev.variants.filter((_, idx) => idx !== variantIndex),
                        }));
                      }}
                      disabled={form.variants.length === 1}
                      className="text-sm text-rose-600 transition hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    {variant.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex gap-2">
                        <input
                          value={option.name}
                          placeholder="Option name (e.g. Color)"
                          onChange={(event) =>
                            updateVariantOption(variantIndex, optionIndex, { name: event.target.value })
                          }
                          className={inputClass}
                        />
                        <input
                          value={option.value}
                          placeholder="Value (e.g. Silver)"
                          onChange={(event) =>
                            updateVariantOption(variantIndex, optionIndex, { value: event.target.value })
                          }
                          className={inputClass}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              variants: prev.variants.map((v, idx) =>
                                idx === variantIndex
                                  ? { ...v, options: v.options.filter((_, oi) => oi !== optionIndex) }
                                  : v,
                              ),
                            }))
                          }
                          className="shrink-0 text-sm text-rose-600 transition hover:text-rose-700"
                          title="Remove option"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          variants: prev.variants.map((v, idx) =>
                            idx === variantIndex
                              ? { ...v, options: [...v.options, { name: "", value: "" }] }
                              : v,
                          ),
                        }))
                      }
                      className="justify-self-start rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 transition hover:bg-white"
                    >
                      + Option
                    </button>
                  </div>

                  <div className="mt-3 grid gap-3 md:grid-cols-4">
                    <div>
                      <label className={labelClass}>Price</label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={variant.price}
                        onChange={(event) => updateVariant(variantIndex, { price: event.target.value })}
                        className={inputClass}
                        required
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Stock</label>
                      <input
                        type="number"
                        min="0"
                        value={variant.stock}
                        onChange={(event) => updateVariant(variantIndex, { stock: event.target.value })}
                        className={inputClass}
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelClass}>Variant images (one URL per line)</label>
                      <textarea
                        value={variant.images}
                        onChange={(event) => updateVariant(variantIndex, { images: event.target.value })}
                        className={`${inputClass} min-h-16`}
                        placeholder="https://...jpg"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-70"
            >
              {saving ? "Saving..." : editingId ? "Update product" : "Create product"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-slate-900">Inventory</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
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
                <tr key={product._id} className="border-b border-slate-100">
                  <td className="px-3 py-3">
                    <div className="font-medium text-slate-900">{product.name}</div>
                    <div className="text-slate-500">{product.brand}</div>
                  </td>
                  <td className="px-3 py-3 text-slate-600">{product.category?.name || "—"}</td>
                  <td className="px-3 py-3 text-slate-700">{product.price} EGP</td>
                  <td className="px-3 py-3 text-slate-700">{product.stock}</td>
                  <td className="px-3 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        product.status === "active"
                          ? "bg-emerald-50 text-emerald-700"
                          : product.status === "draft"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(product)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="rounded-lg border border-rose-300 px-3 py-2 text-sm text-rose-600 transition hover:bg-rose-50"
                      >
                        Delete
                      </button>
                    </div>
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