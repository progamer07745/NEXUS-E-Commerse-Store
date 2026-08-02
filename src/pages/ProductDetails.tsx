import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import type { IProduct } from "../types/product";
import { useCart } from "../context/cartContext";
import { useToast } from "../context/toastContext";

const ProductDetails = () => {
  const { pushToast } = useToast();
  const { slug } = useParams();

  const [product, setProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedOptions, setSelectedOptions] = useState<{
    [key: string]: string;
  }>({});
  const { addToCart } = useCart();

  const getAvailableOptions = () => {
    if (!product?.variants) return {};

    const optionsMap: { [key: string]: Set<string> } = {};
    product.variants.forEach((variant) => {
      variant.options.forEach((opt) => {
        if (!optionsMap[opt.name]) {
          optionsMap[opt.name] = new Set();
        }
        optionsMap[opt.name].add(opt.value);
      });
    });

    const result: { [key: string]: string[] } = {};
    Object.keys(optionsMap).forEach((key) => {
      result[key] = Array.from(optionsMap[key]);
    });
    return result;
  };

  const availableOptions = getAvailableOptions();

  const getCurrentVariant = () => {
    if (!product?.variants) return null;
    return product.variants.find((variant) => {
      return variant.options.every(
        (opt) => selectedOptions[opt.name] === opt.value,
      );
    });
  };

  const currentVariant = getCurrentVariant();

  // Variant price replaces the main price transparently - it is NOT an option button
  const currentPrice = currentVariant ? currentVariant.price : product?.price;
  const currentStock = currentVariant ? currentVariant.stock : product?.stock;

  // Use the STOCK option value (e.g. "10 items") if present, otherwise numeric stock
  const stockOption = currentVariant?.options.find(
    (opt) => opt.name.toLowerCase() === "stock",
  );
  const effectiveStock = stockOption
    ? Number(stockOption.value.replace(/\D/g, "")) || 0
    : (currentStock ?? 0);

  const activeImages = useMemo(() => {
    const variantImages = currentVariant?.images?.filter(Boolean) || [];
    const images = variantImages.length > 0 ? variantImages : product?.images || [];
    return images.length > 0 ? images : product?.image ? [product.image] : [];
  }, [currentVariant, product]);

  const handleOptionChange = (optionName: string, val: string) => {
    // Never treat "stock" as a selectable option
    if (optionName.toLowerCase() === "stock") return;

    const nextOptions = { ...selectedOptions, [optionName]: val };
    setSelectedOptions(nextOptions);

    const nextVariant = product?.variants?.find((variant) =>
      variant.options.every((opt) => nextOptions[opt.name] === opt.value),
    );
    const nextImages = nextVariant?.images?.filter(Boolean) || [];
    if (nextImages.length > 0) {
      setSelectedImage(nextImages[0]);
    }
  };

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

        const firstImage = productData?.images?.[0] || productData?.image || "";
        setSelectedImage(firstImage);

        if (productData?.variants && productData.variants.length > 0) {
          const defaultValue =
            productData.variants.find((v) => (v.stock ?? 0) > 0) ||
            productData.variants[0];
          const defaultOptions: { [key: string]: string } = {};

          defaultValue.options.forEach((opt) => {
            // Never auto-select a "stock" option - handled behind the scenes
            if (opt.name.toLowerCase() !== "stock") {
              defaultOptions[opt.name] = opt.value;
            }
          });
          const defaultImages = defaultValue.images?.filter(Boolean) || [];
          if (defaultImages.length > 0) {
            setSelectedImage(defaultImages[0]);
          }

          setSelectedOptions(defaultOptions);
        }
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

  const isAvailable = effectiveStock > 0;
  const isLowStock = isAvailable && effectiveStock <= 10;
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

              {/* Smooth gallery navigation */}
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

            {/* Persistent real-time stock warning under product images */}
            {!isAvailable ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                Stock is finished
              </div>
            ) : isLowStock ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                ⚠ {effectiveStock} is remaining in the stock
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

          {/* قسم تفاصيل المنتج والـ Buy Actions */}
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
              {currentPrice}{" "}
              <span className="text-sm font-normal text-[#737874]">EGP</span>
              {currentVariant && (
                <span className="ml-3 text-xs font-semibold uppercase tracking-wide text-[#545f73] bg-[#f0edec] px-2.5 py-1 rounded-full">
                  Selected variant
                </span>
              )}
            </div>

            {Object.keys(availableOptions).length > 0 && (
              <div className="space-y-4 py-4 border-t border-b border-[#c2c8c3]/20">
                {Object.entries(availableOptions).map(
                  ([optionName, values]) => {
                    // NEVER render "stock" as a selectable option button
                    if (optionName.toLowerCase() === "stock") return null;
                    return (
                      <div key={optionName} className="space-y-2">
                        <label className="text-sm font-semibold uppercase tracking-wider text-[#172820]">
                          {optionName}:{" "}
                          <span className="font-normal text-[#545f73]">
                            {selectedOptions[optionName]}
                          </span>
                        </label>
                        <div className="flex gap-3 flex-wrap">
                          {values.map((val) => {
                            const isSelected =
                              selectedOptions[optionName] === val;
                            return (
                              <button
                                key={val}
                                onClick={() =>
                                  handleOptionChange(optionName, val)
                                }
                                className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                                  isSelected
                                    ? "border-[#172820] bg-[#172820] text-white shadow-sm"
                                    : "border-[#c2c8c3]/40 bg-white text-[#172820] hover:border-[#172820]"
                                }`}
                              >
                                {val}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            )}

            <p className="text-[#424844] leading-relaxed text-base border-t border-b border-[#c2c8c3]/20 py-4">
              {product.description}
            </p>

            {/* تفاصيل المخزون والحالة */}
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
                  {product.category.name}
                </span>
              </p>
            </div>

            {/* زر إضافة للسلة */}
            <div className="pt-4">
              <button
                disabled={!isAvailable}
                onClick={() => addToCart(product, 1, currentVariant ?? undefined)}
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
