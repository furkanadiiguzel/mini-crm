const VARIANTS = {
  NEW:       { label: "Yeni",       cls: "bg-blue-50 text-blue-700 ring-blue-600/20"    },
  QUALIFIED: { label: "Nitelikli",  cls: "bg-amber-50 text-amber-700 ring-amber-600/20" },
  PROPOSAL:  { label: "Teklif",     cls: "bg-orange-50 text-orange-700 ring-orange-600/20" },
  WON:       { label: "Kazanıldı",  cls: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" },
  LOST:      { label: "Kaybedildi", cls: "bg-red-50 text-red-700 ring-red-600/20"       },
  // Generic
  success:   { label: "Başarılı",   cls: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" },
  warning:   { label: "Uyarı",      cls: "bg-amber-50 text-amber-700 ring-amber-600/20" },
  danger:    { label: "Hata",       cls: "bg-red-50 text-red-700 ring-red-600/20"       },
  info:      { label: "Bilgi",      cls: "bg-blue-50 text-blue-700 ring-blue-600/20"    },
  default:   { label: "",           cls: "bg-neutral-100 text-neutral-600 ring-neutral-500/20" },
};

const DOT_COLORS = {
  NEW:       "bg-blue-500",
  QUALIFIED: "bg-amber-500",
  PROPOSAL:  "bg-orange-500",
  WON:       "bg-emerald-500",
  LOST:      "bg-red-500",
  success:   "bg-emerald-500",
  warning:   "bg-amber-500",
  danger:    "bg-red-500",
  info:      "bg-blue-500",
  default:   "bg-neutral-400",
};

const SIZES = {
  sm: "text-xs px-2 py-0.5 gap-1",
  md: "text-sm px-2.5 py-1 gap-1.5",
};

export default function Badge({
  variant = "default",
  size = "sm",
  dot = false,
  label,
  children,
  className = "",
}) {
  const meta = VARIANTS[variant] ?? VARIANTS.default;
  const text = children ?? label ?? meta.label;
  const dotColor = DOT_COLORS[variant] ?? DOT_COLORS.default;

  return (
    <span
      className={[
        "inline-flex items-center font-medium rounded-full ring-1",
        meta.cls,
        SIZES[size] ?? SIZES.sm,
        className,
      ].join(" ")}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
      )}
      {text}
    </span>
  );
}
