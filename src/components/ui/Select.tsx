import { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

/**
 * Equivalente al "ComboBox" del boceto original (Excalidraw).
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, id, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          id={id}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            "block h-11 w-full appearance-none rounded-lg border bg-white px-3.5 pr-10 text-sm text-surface-900",
            "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500",
            error ? "border-red-400" : "border-surface-200",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400"
          aria-hidden="true"
        />
      </div>
    );
  }
);
Select.displayName = "Select";
