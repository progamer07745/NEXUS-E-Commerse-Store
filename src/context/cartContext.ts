import { createContext, useContext } from "react";
import type { IProduct, IVariant } from "../types/product";

export interface CartProduct extends IProduct {
  quantity: number;
  selectedVariant?: IVariant;
}

export interface CartContextType {
  items: CartProduct[];
  itemCount: number;
  total: number;
  addToCart: (product: IProduct, quantity?: number, selectedVariant?: IVariant) => void;
  removeFromCart: (id: string) => void;
  changeQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};