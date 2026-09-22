import { cn } from "@/utils/cn";
import Spinner from "./Spinner";

const variants = {
  primary: "bg-indigo-600 text-white hover:bg-indigo-500 focus:ring-indigo-500",
  danger: "bg-red-600 text-white hover:bg-red-500 focus:ring-red-500",
  ghost: "bg-transparent text-slate-400 hover:text-white hover:bg-slate-800 focus:ring-slate-500",
  outline:
    "bg-transparent border border-slate-600 text-slate-300 hover:border-slate-400 hover:text-white focus:ring-slate-500",
};

export default function Button({
  children,
  variant = "primary",
  loading = false,
  className,
  disabled,
  size = "md",
  ...props
}) {
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && <Spinner className="h-3.5 w-3.5" />}
      {children}
    </button>
  );
}