import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Label = ({
  htmlFor,
  children,
  required,
}: {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
}) => (
  <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-surface-800">
    {children}
    {required && (
      <span className="ml-0.5 text-red-500" aria-hidden="true">
        *
      </span>
    )}
  </label>
);

export const FieldError = ({ id, message }: { id: string; message?: string }) => {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-sm text-red-600">
      {message}
    </p>
  );
};

export const FieldHint = ({ children }: { children: React.ReactNode }) => (
  <p className="mt-1.5 text-sm text-surface-500">{children}</p>
);

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, error, id, ...props }, ref) => {
  return (
    <input
      ref={ref}
      id={id}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
      className={cn(
        "block h-11 w-full rounded-lg border bg-white px-3.5 text-sm text-surface-900",
        "placeholder:text-surface-400 transition-shadow",
        "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500",
        error ? "border-red-400" : "border-surface-200",
        className
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, id, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          "block w-full min-h-[110px] rounded-lg border bg-white px-3.5 py-2.5 text-sm text-surface-900",
          "placeholder:text-surface-400 transition-shadow",
          "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500",
          error ? "border-red-400" : "border-surface-200",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";
