import { createContext, useContext } from "react";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/utils/cn";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const { toasts, toast } = useToast();

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(({ id, message, variant }) => (
          <div
            key={id}
            className={cn(
              "rounded-lg px-4 py-3 text-sm font-medium shadow-lg pointer-events-auto animate-in fade-in slide-in-from-right-4",
              variant === "success" && "bg-emerald-600 text-white",
              variant === "error" && "bg-red-600 text-white",
              variant === "info" && "bg-slate-700 text-white"
            )}
          >
            {message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToastContext must be inside ToastProvider");
  return ctx;
}