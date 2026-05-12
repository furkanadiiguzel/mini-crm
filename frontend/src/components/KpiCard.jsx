import { ArrowUp, ArrowDown } from "lucide-react";
import useCountUp from "../hooks/useCountUp";

const COLOR_MAP = {
  indigo: { bg: "bg-indigo-50",  icon: "text-indigo-600",  ring: "ring-indigo-100"  },
  green:  { bg: "bg-green-50",   icon: "text-green-600",   ring: "ring-green-100"   },
  yellow: { bg: "bg-amber-50",   icon: "text-amber-500",   ring: "ring-amber-100"   },
  blue:   { bg: "bg-sky-50",     icon: "text-sky-600",     ring: "ring-sky-100"     },
  purple: { bg: "bg-violet-50",  icon: "text-violet-600",  ring: "ring-violet-100"  },
  red:    { bg: "bg-red-50",     icon: "text-red-600",     ring: "ring-red-100"     },
};

function AnimatedValue({ value }) {
  const isNumber = typeof value === "number";
  const count = useCountUp(isNumber ? value : 0);
  if (!isNumber) return <>{value}</>;
  return <>{count.toLocaleString("tr-TR")}</>;
}

export default function KpiCard({
  title,
  value,
  icon: Icon,
  color = "indigo",
  trend,       // { direction: "up"|"down", value: number, label?: string }
}) {
  const c = COLOR_MAP[color] ?? COLOR_MAP.indigo;
  const trendUp = trend?.direction === "up";
  const TrendIcon = trendUp ? ArrowUp : ArrowDown;

  return (
    <div className="group bg-white rounded-2xl border border-neutral-100 shadow-sm px-5 py-5 flex items-center gap-4 transition-all duration-200 hover:shadow-md hover:border-neutral-200 cursor-default overflow-hidden">
      {/* Icon — scales on hover */}
      <div
        className={[
          "flex items-center justify-center w-12 h-12 rounded-xl shrink-0",
          "ring-1 transition-transform duration-200 group-hover:scale-110",
          c.bg, c.ring,
        ].join(" ")}
      >
        <Icon size={22} className={c.icon} />
      </div>

      {/* Text block */}
      <div className="min-w-0 flex-1">
        {/* Label */}
        <p className="text-sm font-medium text-neutral-500 truncate">{title}</p>

        {/* Value */}
        <p className="text-3xl font-bold text-neutral-900 mt-0.5 leading-none tabular-nums">
          <AnimatedValue value={value} />
        </p>

        {/* Trend row */}
        {trend ? (
          <p
            className={[
              "flex items-center gap-0.5 mt-1.5 text-xs font-semibold",
              trendUp ? "text-emerald-600" : "text-red-500",
            ].join(" ")}
          >
            <TrendIcon size={12} strokeWidth={2.5} />
            <span>{Math.abs(trend.value)}%</span>
            <span className="font-normal text-neutral-400 ml-0.5">
              {trend.label ?? "geçen aya göre"}
            </span>
          </p>
        ) : (
          /* placeholder keeps card height consistent */
          <div className="mt-1.5 h-4" />
        )}
      </div>
    </div>
  );
}
