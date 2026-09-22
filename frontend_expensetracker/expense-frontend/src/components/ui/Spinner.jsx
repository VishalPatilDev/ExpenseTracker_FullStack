import { cn } from "@/utils/cn";

export default function Spinner({ className }) {
  return (
    <div
      className={cn(
        "inline-block h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70",
        className
      )}
      aria-label="Loading"
    />
  );
}