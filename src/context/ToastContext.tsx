import { createContext, useContext, useState, type ReactNode } from "react";

interface Toast {
  id: number;
  message: string;
  type?: "success" | "error" | "info";
}

interface ToastContextType {
  toasts: Toast[];
  pushToast: (message: string, type?: Toast["type"]) => void;
  removeToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let nextId = 1;

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const pushToast = (message: string, type: Toast["type"] = "info") => {
    const id = nextId++;
    setToasts((s) => [...s, { id, message, type }]);
    // Auto-remove after 3.5s
    setTimeout(() => setToasts((s) => s.filter((t) => t.id !== id)), 3500);
  };

  const removeToast = (id: number) => setToasts((s) => s.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ toasts, pushToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};
