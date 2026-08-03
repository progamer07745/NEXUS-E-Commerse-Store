import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import type { IProduct } from "../types/product";
import { useCart } from "../context/cartContext";
import { useToast } from "../context/toastContext";

const ProductDetails = () => {
  const { pushToast } = useToast();
  const { slug } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  const activeImages = useMemo(() => {
    const images = product?.images?.filter(Boolean) || [];
    return images.length > 0 ? images : product?.image ? [product.image] : [];
  }, [product]);

  const handlePrevImage = () => {
    if (activeImages.length <= 1) return;
    const currentIndex = activeImages.indexOf(selectedImage);
    const prevIndex = (currentIndex - 1 + activeImages.length) % activeImages.length;
    setSelectedImage(activeImages[prevIndex]);
  };

  const handleNextImage = () => {
    if (activeImages.length <= 1) return;
    const currentIndex = activeImages.indexOf(selectedImage);
    const nextIndex = (currentIndex + 1) % activeImages.length;
    setSelectedImage(activeImages[nextIndex]);
  };

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        // URL is "product-title-objectId" - backend parses trailing ObjectId,
        // fall back to slug-only lookup if the compound lookup fails.
        const rawSlug = slug || "";
        const parts = rawSlug.split("-");
        const potentialId = parts[parts.length - 1];
        const isObjectId = /^[a-f\d]{24}$/i.test(potentialId || "");

        let productData: IProduct | null = null;

        if (isObjectId) {
          try {
            const response = await api.get(`/products/${rawSlug}`);
            productData = (response.data.data || response.data) as IProduct;
          } catch {
            productData = null;
          }
        }

        if (!productData) {
          const slugOnly = rawSlug.replace(/-[a-f\d]{24}$/i, "");
          const response = await api.get(`/products/slug/${slugOnly}`);
          productData =
            (response.data.data?.product ||
              response.data.data ||
              response.data) as IProduct;
        }

        setProduct(productData);
        setSelectedImage(productData?.images?.[0] || productData?.image || "");
      } catch {
        pushToast("Unable to load product details. Please try again.", "error");
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchProductDetails();
  }, [slug, pushToast]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fcf9f8]" dir="ltr">
        <div className="flex-grow flex justify-center items-center">
          <p className="text-[#545f73] font-semibold animate-pulse text-lg">
            Loading product details...
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fcf9f8]" dir="ltr">
        <div className="flex-grow flex justify-center items-center">
          <p className="text-xl font-bold text-[#172820]">Product not found.</p>
        </div>
      </div>
    );
  }

  const isAvailable = product.stock > 0;
  const isLowStock = isAvailable && product.stock <= 10;

  const handleAddToCart = () => {
    addToCart(product, Math.max(1, Math.min(quantity, product.stock)));
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-[#fcf9f8] text-left"
      dir="ltr"
    >
      <main className="flex-grow max-w-[1280px] w-full mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Images section */}
          <div className="space-y-4">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#f0edec] border border-[#c2c8c3]/20">
              <img
                src={selectedImage || product.image}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />

              {activeImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    aria-label="Previous image"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur border border-[#c2c8c3]/30 flex items-center justify-center text-[#172820] shadow-md hover:bg-white transition-all"
                  >
                    ‹
                  </button>
                  <button
                    onClick={handleNextImage}
                    aria-label="Next image"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur border border-[#c2c8c3]/30 flex items-center justify-center text-[#172820] shadow-md hover:bg-white transition-all"
                  >
                    ›
                  </button>

                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {activeImages.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(img)}
                        aria-label={`Go to image ${index + 1}`}
                        className={`w-2 h-2 rounded-full transition-all ${
                          selectedImage === img
                            ? "bg-[#172820] scale-110"
                            : "bg-white/70 hover:bg-white"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Stock warning under product images */}
            {!isAvailable ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                Stock is finished
              </div>
            ) : isLowStock ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                ⚠ {product.stock} is remaining in the stock
              </div>
            ) : (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                ✓ In stock
              </div>
            )}

            {/* Thumbnail gallery */}
            {activeImages.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {activeImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(img)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === img
                        ? "border-[#172820]"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product details + Buy actions */}
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#545f73] bg-[#f0edec] px-3 py-1 rounded-full">
                {product.brand || "NEXUS Collection"}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-[#172820] mt-3">
                {product.name}
              </h1>
            </div>

            <div className="text-2xl font-bold text-[#172820]">
              {product.price}{" "}
              <span className="text-sm font-normal text-[#737874]">EGP</span>
            </div>

            <p className="text-[#424844] leading-relaxed text-base border-t border-b border-[#c2c8c3]/20 py-4">
              {product.description}
            </p>

            <div className="space-y-2 text-sm text-[#737874]">
              <p>
                Availability:{" "}
                <span className="text-[#172820] font-semibold">
                  {isAvailable ? "In Stock" : "Out of Stock"}
                </span>
              </p>
              <p>
                Category:{" "}
                <span className="text-[#172820] font-semibold">
                  {product.category?.name}
                </span>
              </p>
            </div>

            {/* Quantity selector */}
            {isAvailable && (
              <div className="flex items-center gap-4">
                <label className="text-sm font-semibold uppercase tracking-wider text-[#172820]">
                  Quantity
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 rounded-full border border-[#c2c8c3]/40 bg-white text-[#172820] font-bold hover:border-[#172820] transition-all"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="w-10 text-center font-semibold text-[#172820]">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity((q) => Math.min(product.stock, q + 1))
                    }
                    className="w-9 h-9 rounded-full border border-[#c2c8c3]/40 bg-white text-[#172820] font-bold hover:border-[#172820] transition-all"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Add to cart button */}
            <div className="pt-4">
              <button
                disabled={!isAvailable}
                onClick={handleAddToCart}
                className={`w-full py-4 rounded-full font-medium transition-all duration-300 ${
                  isAvailable
                    ? "bg-[#172820] text-white hover:bg-[#2c3e35] shadow-md hover:-translate-y-0.5"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isAvailable ? "Add to Cart" : "Out of Stock"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetails;