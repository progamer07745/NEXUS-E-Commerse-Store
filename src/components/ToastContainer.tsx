import { useToast } from "../context/toastContext";

const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`max-w-sm rounded-md px-4 py-2 text-sm shadow-lg transition-opacity duration-200 ${
            t.type === "success" ? "bg-emerald-600 text-white" : t.type === "error" ? "bg-rose-600 text-white" : "bg-slate-800 text-white"
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="truncate">{t.message}</div>
            <button onClick={() => removeToast(t.id)} className="ml-2 text-xs opacity-80">✕</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
