import { ChevronDown, AlertCircle } from "lucide-react";
import type { SelectHTMLAttributes } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
  placeholder?: string;
}

export default function Select({
  label, error, helperText, options = [], placeholder,
  disabled = false, className = "", id, ...props
}: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-neutral-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          disabled={disabled}
          className={[
            "w-full px-3 py-2.5 pr-9 rounded-lg border text-sm appearance-none transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-0",
            error
              ? "border-red-500 focus:ring-red-500 bg-red-50 text-neutral-900"
              : "border-neutral-300 focus:ring-indigo-500 focus:border-indigo-500 text-neutral-900",
            disabled ? "bg-neutral-100 cursor-not-allowed text-neutral-400" : "bg-white cursor-pointer",
            className,
          ].filter(Boolean).join(" ")}
          {...props}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
      </div>
      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
          <AlertCircle size={12} className="shrink-0" />{error}
        </p>
      )}
      {!error && helperText && <p className="mt-1.5 text-xs text-neutral-500">{helperText}</p>}
    </div>
  );
}
