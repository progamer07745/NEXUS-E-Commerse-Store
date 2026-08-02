import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { IProduct, IVariant } from "../types/product";
import { useToast } from "./ToastContext";

export interface CartProduct extends IProduct {
  quantity: number;
  selectedVariant?: IVariant;
}

interface CartContextType {
  items: CartProduct[];
  itemCount: number;
  total: number;
  addToCart: (product: IProduct, quantity?: number, selectedVariant?: IVariant) => void;
  removeFromCart: (id: string) => void;
  changeQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartProduct[]>([]);

  useEffect(() => {
    const storedCart = typeof window !== "undefined" ? localStorage.getItem("cart") : null;
    if (storedCart) {
      setItems(JSON.parse(storedCart));
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cart", JSON.stringify(items));
    }
  }, [items]);

  const toast = useToast();

  const addToCart = (product: IProduct, quantity = 1, selectedVariant?: IVariant) => {
    setItems((prevItems) => {
      const existing = prevItems.find((item) => item._id === product._id);
      if (existing) {
        const updated = prevItems.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + quantity, selectedVariant: selectedVariant ?? item.selectedVariant }
            : item,
        );
        // Notify user
        toast.pushToast(`${product.name} quantity updated in cart`, "success");
        return updated;
      }
      // Notify user
      toast.pushToast(`${product.name} added to cart`, "success");
      return [...prevItems, { ...product, quantity, selectedVariant }];
    });
  };

  const removeFromCart = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item._id !== id));
  };

  const changeQuantity = (id: string, quantity: number) => {
    setItems((prevItems) =>
      prevItems
        .map((item) => (item._id === id ? { ...item, quantity: Math.max(1, quantity) } : item))
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

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
