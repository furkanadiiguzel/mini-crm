import { Loader2 } from "lucide-react";

const VARIANTS = {
  primary:   "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white focus:ring-indigo-500",
  secondary: "bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 text-neutral-700 focus:ring-neutral-400",
  outline:   "border border-neutral-300 hover:bg-neutral-50 active:bg-neutral-100 text-neutral-700 focus:ring-neutral-400",
  ghost:     "hover:bg-neutral-100 active:bg-neutral-200 text-neutral-700 focus:ring-neutral-400",
  danger:    "bg-red-600 hover:bg-red-700 active:bg-red-800 text-white focus:ring-red-500",
};

const SIZES = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-4 py-2 text-sm gap-2",
  lg: "px-5 py-2.5 text-base gap-2",
};

const ICON_SIZES = { sm: 14, md: 16, lg: 18 };

export default function Button({
  children,
  variant = "primary",
  size = "md",
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  loading = false,
  disabled = false,
  className = "",
  ...props
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      className={[
        "inline-flex items-center justify-center font-semibold rounded-lg",
        "transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-offset-2",
        VARIANTS[variant] ?? VARIANTS.primary,
        SIZES[size] ?? SIZES.md,
        isDisabled ? "opacity-50 cursor-not-allowed" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {loading ? (
        <Loader2 size={ICON_SIZES[size]} className="animate-spin" />
      ) : (
        LeftIcon && <LeftIcon size={ICON_SIZES[size]} />
      )}
      {children}
      {!loading && RightIcon && <RightIcon size={ICON_SIZES[size]} />}
    </button>
  );
}
