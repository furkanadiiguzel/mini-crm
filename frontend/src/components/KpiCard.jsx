const COLOR_MAP = {
  indigo: {
    strip: "bg-indigo-500",
    icon:  "bg-indigo-50 text-indigo-600",
  },
  green: {
    strip: "bg-green-500",
    icon:  "bg-green-50 text-green-600",
  },
  yellow: {
    strip: "bg-yellow-400",
    icon:  "bg-yellow-50 text-yellow-600",
  },
  blue: {
    strip: "bg-blue-500",
    icon:  "bg-blue-50 text-blue-600",
  },
};

export default function KpiCard({ title, value, icon: Icon, color = "indigo", subtitle }) {
  const c = COLOR_MAP[color] ?? COLOR_MAP.indigo;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex overflow-hidden">
      {/* Left color strip */}
      <div className={`w-1.5 shrink-0 ${c.strip}`} />

      <div className="flex items-center gap-4 px-5 py-5 flex-1">
        {/* Icon */}
        <div className={`flex items-center justify-center w-11 h-11 rounded-xl shrink-0 ${c.icon}`}>
          <Icon size={22} />
        </div>

        {/* Text */}
        <div className="min-w-0">
          <p className="text-sm text-gray-500 truncate">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-0.5 leading-none">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-1 truncate">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}
