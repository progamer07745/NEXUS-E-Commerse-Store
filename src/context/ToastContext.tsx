import { useMemo, useState, type ReactNode } from "react";
import { ToastContext, type Toast, type ToastContextType } from "./toastContext";

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

  const value = useMemo<ToastContextType>(
    () => ({ toasts, pushToast, removeToast }),
    [toasts],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};
