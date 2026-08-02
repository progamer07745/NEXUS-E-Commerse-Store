import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import type { IProduct } from "../types/product";
import { useCart } from "../context/cartContext";
import { useToast } from "../context/toastContext";

const ProductDetails = () => {
  const { pushToast } = useToast();
  const { id } = useParams();

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

  const currentPrice = currentVariant ? currentVariant.price : product?.price;
  const currentStock = currentVariant ? currentVariant.stock : product?.stock;

  const activeImages =
    currentVariant?.images && currentVariant.images.length > 0
      ? currentVariant.images
      : product?.images;

  const handleOptionChange = (optionName: string, val: string) => {
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

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        const productData = (response.data.data || response.data) as IProduct;
        setProduct(productData);

        const firstImage = productData.images?.[0] || productData.image || "";
        setSelectedImage(firstImage);

        if (productData?.variants && productData.variants.length > 0) {
          const defaultValue =
            productData.variants.find((v) => (v.stock ?? 0) > 0) ||
            productData.variants[0];
          const defaultOptions: { [key: string]: string } = {};

          defaultValue.options.forEach((opt) => {
            defaultOptions[opt.name] = opt.value;
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
    if (id) fetchProductDetails();
  }, [id, pushToast]);

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

  const isAvailable = (currentStock ?? 0) > 0;


  return (
    <div
      className="min-h-screen flex flex-col bg-[#fcf9f8] text-left"
      dir="ltr"
    >
      <main className="flex-grow max-w-[1280px] w-full mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* قسم الصور */}
          <div className="space-y-4">
            <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-[#f0edec] border border-[#c2c8c3]/20">
              <img
                src={selectedImage || product.image}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
            </div>

            {/* لو فيه صور فرعية إضافية (Images Array) نعرضها كمعرض مصغر */}
            {product.images && product.images.length > 0 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {activeImages?.map((img, index) => (
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
            </div>

            {Object.keys(availableOptions).length > 0 && (
              <div className="space-y-4 py-4 border-t border-b border-[#c2c8c3]/20">
                {Object.entries(availableOptions).map(
                  ([optionName, values]) => (
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
                              onClick={() => handleOptionChange(optionName, val)}
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
                  ),
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
                  {currentStock && currentStock > 0
                    ? "In Stock"
                    : "Out of Stock"}
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
