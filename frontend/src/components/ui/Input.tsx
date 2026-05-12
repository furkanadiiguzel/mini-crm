import { AlertCircle } from "lucide-react";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export default function Input({
  label,
  error,
  helperText,
  disabled = false,
  className = "",
  id,
  ...props
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-neutral-700 mb-1">
          {label}
        </label>
      )}
      <input
        id={inputId}
        disabled={disabled}
        className={[
          "w-full px-3 py-2.5 rounded-lg border text-sm text-neutral-900",
          "placeholder-neutral-400 transition-colors duration-150",
          "focus:outline-none focus:ring-2 focus:ring-offset-0",
          error
            ? "border-red-500 focus:ring-red-500 bg-red-50 animate-shake"
            : "border-neutral-300 focus:ring-indigo-500 focus:border-indigo-500",
          disabled ? "bg-neutral-100 cursor-not-allowed text-neutral-400" : "bg-white",
          className,
        ].filter(Boolean).join(" ")}
        {...props}
      />
      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
          <AlertCircle size={12} className="shrink-0" />
          {error}
        </p>
      )}
      {!error && helperText && (
        <p className="mt-1.5 text-xs text-neutral-500">{helperText}</p>
      )}
    </div>
  );
}
