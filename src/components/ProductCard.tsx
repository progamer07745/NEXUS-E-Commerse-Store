import { memo } from "react";
import type { IProduct } from "../types/product";
import { useNavigate } from "react-router-dom";

interface ProductCardProps {
  product: IProduct;
}

function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();
  const imageSrc = product.image || product.images?.[0] || "";

  return (
    <div
      onClick={() => navigate(`/products/${product._id}`)}
      className="group cursor-pointer flex flex-col"
    >
      <div className="aspect-[4/5] rounded-xl overflow-hidden mb-4 bg-[#f0edec] relative">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#737874] text-sm">
            No image
          </div>
        )}
      </div>

      <div className="flex flex-col flex-grow">
        <h3 className="font-semibold text-lg text-[#1c1b1b] mb-1 group-hover:opacity-70 transition-opacity">
          {product.name}
        </h3>
        <p className="text-sm text-[#737874] line-clamp-1 mb-2">{product.description}</p>
        <div className="flex items-center justify-between mt-auto">
          <span className="font-bold text-[#172820]">
            {product.price} <span className="text-xs text-[#737874]">EGP</span>
          </span>
          <button className="text-xs font-semibold uppercase tracking-wider bg-[#172820] text-white px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            View
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(ProductCard);