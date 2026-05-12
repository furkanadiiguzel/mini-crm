const SIZES = {
  sm: { outer: "w-8 h-8",   text: "text-xs"  },
  md: { outer: "w-10 h-10", text: "text-sm"  },
  lg: { outer: "w-12 h-12", text: "text-base" },
};

const PALETTE = [
  "bg-indigo-100 text-indigo-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-violet-100 text-violet-700",
  "bg-sky-100 text-sky-700",
];

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (name[0] ?? "?").toUpperCase();
}

function getColor(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export default function Avatar({ name = "", size = "md", className = "" }) {
  const { outer, text } = SIZES[size] ?? SIZES.md;
  const color    = getColor(name);
  const initials = getInitials(name);

  return (
    <div
      className={[
        "flex items-center justify-center rounded-full font-semibold shrink-0",
        outer,
        text,
        color,
        className,
      ].join(" ")}
      title={name}
    >
      {initials}
    </div>
  );
}
