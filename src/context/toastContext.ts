import { createContext, useContext } from "react";

export interface Toast {
  id: number;
  message: string;
  type?: "success" | "error" | "info";
}

export interface ToastContextType {
  toasts: Toast[];
  pushToast: (message: string, type?: Toast["type"]) => void;
  removeToast: (id: number) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};