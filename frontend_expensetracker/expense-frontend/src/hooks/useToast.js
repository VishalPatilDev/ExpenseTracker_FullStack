import { useState, useCallback } from "react";

/**
 * Lightweight toast state — pair with a <ToastContainer /> component.
 * Returns { toasts, toast }
 *   toast.success(msg) | toast.error(msg) | toast.info(msg)
 */
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, variant = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const toast = {
    success: (msg) => push(msg, "success"),
    error: (msg) => push(msg, "error"),
    info: (msg) => push(msg, "info"),
  };

  return { toasts, toast };
}