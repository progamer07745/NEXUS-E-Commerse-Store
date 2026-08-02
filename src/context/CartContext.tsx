import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { IProduct, IVariant } from "../types/product";
import { CartContext, type CartProduct } from "./cartContext";
import { useToast } from "./toastContext";

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartProduct[]>(() => {
    if (typeof window !== "undefined") {
      const storedCart = localStorage.getItem("cart");
      if (storedCart) {
        try {
          return JSON.parse(storedCart);
        } catch {
          return [];
        }
      }
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cart", JSON.stringify(items));
    }
  }, [items]);

  const toast = useToast();

  // Get the available stock for a product, accounting for selected variant
  const getMaxStock = (product: IProduct, selectedVariant?: IVariant) => {
    const stock = selectedVariant?.stock ?? product.stock;
    return Math.max(0, Number(stock) || 0);
  };

  const addToCart = (product: IProduct, quantity = 1, selectedVariant?: IVariant) => {
    setItems((prevItems) => {
      const existing = prevItems.find((item) => item._id === product._id);
      const currentQty = existing?.quantity ?? 0;
      // Use the variant that the existing item uses if no new variant was passed
      const effectiveVariant = selectedVariant ?? existing?.selectedVariant;
      const maxStock = getMaxStock(product, effectiveVariant);

      // Validate stock before adding
      if (currentQty + quantity > maxStock) {
        toast.pushToast(
          maxStock <= 0
            ? `${product.name} is out of stock`
            : `Only ${maxStock} ${maxStock === 1 ? "unit" : "units"} of ${product.name} available`,
          "error",
        );
        return prevItems;
      }

      if (existing) {
        const updated = prevItems.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + quantity, selectedVariant: effectiveVariant }
            : item,
        );
        toast.pushToast(`${product.name} quantity updated in cart`, "success");
        return updated;
      }

      toast.pushToast(`${product.name} added to cart`, "success");
      return [...prevItems, { ...product, quantity, selectedVariant: effectiveVariant }];
    });
  };

  const removeFromCart = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item._id !== id));
  };

  const changeQuantity = (id: string, quantity: number) => {
    setItems((prevItems) =>
      prevItems
        .map((item) => {
          if (item._id !== id) return item;
          const maxStock = getMaxStock(item, item.selectedVariant);
          const clamped = Math.min(Math.max(1, quantity), maxStock);
          if (quantity > maxStock) {
            toast.pushToast(`Only ${maxStock} ${maxStock === 1 ? "unit" : "units"} of ${item.name} available`, "error");
          }
          return { ...item, quantity: clamped };
        })
        .filter((item) => item.quantity > 0),
    );
  };

  const clearCart = () => setItems([]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce(
    (sum, item) => sum + (item.selectedVariant?.price ?? item.price) * item.quantity,
    0,
  );

  const value = useMemo(
    () => ({ items, itemCount, total, addToCart, removeFromCart, changeQuantity, clearCart }),
    [items, itemCount, total],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};