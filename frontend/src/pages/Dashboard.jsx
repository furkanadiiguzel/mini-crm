import { useEffect, useState, useCallback } from "react";
import {
  Users, TrendingUp, DollarSign, UserPlus,
  RefreshCw, BarChart2, PieChart as PieIcon,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList,
  PieChart, Pie,
} from "recharts";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import KpiCard from "../components/KpiCard";
import RecentCustomersTable from "../components/RecentCustomersTable";

// ── Helpers ───────────────────────────────────────────────────────────────────

const currency = (val) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency", currency: "TRY",
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(Number(val) || 0);

const compact = (val) =>
  new Intl.NumberFormat("tr-TR", { notation: "compact", compactDisplay: "short" }).format(val);

const STAGE_META = {
  NEW:       { label: "Yeni",       color: "#6366F1" },
  QUALIFIED: { label: "Nitelikli",  color: "#F59E0B" },
  PROPOSAL:  { label: "Teklif",     color: "#F97316" },
  WON:       { label: "Kazanılan",  color: "#10B981" },
  LOST:      { label: "Kaybedilen", color: "#EF4444" },
};

function greeting(firstName) {
  const h = new Date().getHours();
  const sal = h < 12 ? "Günaydın" : h < 18 ? "İyi günler" : "İyi akşamlar";
  return firstName ? `${sal}, ${firstName}! 👋` : `${sal}! 👋`;
}

function todayStr() {
  return new Intl.DateTimeFormat("tr-TR", {
    weekday: "long", day: "numeric", month: "long",
  }).format(new Date());
}

// ── Skeleton pieces ───────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm px-5 py-5 flex items-center gap-4 animate-pulse shrink-0">
      <div className="w-12 h-12 rounded-xl bg-gray-200 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-7 bg-gray-200 rounded w-1/3" />
        <div className="h-3 bg-gray-200 rounded w-2/5" />
      </div>
    </div>
  );
}

function SkeletonBlock({ className = "" }) {
  return <div className={`bg-gray-200 rounded-lg animate-pulse ${className}`} />;
}

// ── Chart Tooltip ─────────────────────────────────────────────────────────────

function BarTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-sm min-w-[160px]">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
        <span className="font-semibold text-gray-900">{d.label}</span>
      </div>
      <p className="text-gray-500">Fırsat: <span className="font-semibold text-gray-800">{d.count}</span></p>
      <p className="text-gray-500">Tutar: <span className="font-semibold text-gray-800">{currency(d.total_amount)}</span></p>
    </div>
  );
}

function DonutTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-sm">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
        <span className="font-semibold text-gray-900">{d.label}</span>
      </div>
      <p className="text-gray-500">Fırsat: <span className="font-semibold text-gray-800">{d.count}</span></p>
      <p className="text-gray-500">Tutar: <span className="font-semibold text-gray-800">{currency(d.total_amount)}</span></p>
    </div>
  );
}

// ── Legend ────────────────────────────────────────────────────────────────────

function ChartLegend({ data }) {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4">
      {data.map(({ label, color, count }) => (
        <div key={label} className="flex items-center gap-1.5 text-xs text-gray-600">
          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
          <span>{label}</span>
          <span className="text-gray-400 font-medium">({count})</span>
        </div>
      ))}
    </div>
  );
}

// ── Period pills ──────────────────────────────────────────────────────────────

const PERIODS = ["Bu Ay", "Son 3 Ay", "Bu Yıl"];

function PeriodPicker({ value, onChange }) {
  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
      {PERIODS.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={[
            "px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150",
            value === p
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700",
          ].join(" ")}
        >
          {p}
        </button>
      ))}
    </div>
  );
}

// ── Chart section ─────────────────────────────────────────────────────────────

function ChartSection({ chartData }) {
  const [chartType, setChartType] = useState("bar");
  const [period, setPeriod]       = useState("Bu Ay");

  const totalAmount = chartData.reduce((s, d) => s + Number(d.total_amount || 0), 0);

  const isEmpty = chartData.length === 0;

  return (
    <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-100 shadow-sm p-6 flex flex-col min-h-[400px]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 className="text-base font-semibold text-gray-900">Fırsat Dağılımı</h2>

        <div className="flex items-center gap-2">
          {/* Period selector */}
          <PeriodPicker value={period} onChange={setPeriod} />

          {/* Chart type toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5 ml-1">
            <button
              onClick={() => setChartType("bar")}
              title="Sütun grafik"
              className={[
                "p-1.5 rounded-md transition-all duration-150",
                chartType === "bar" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600",
              ].join(" ")}
            >
              <BarChart2 size={14} />
            </button>
            <button
              onClick={() => setChartType("donut")}
              title="Halka grafik"
              className={[
                "p-1.5 rounded-md transition-all duration-150",
                chartType === "donut" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600",
              ].join(" ")}
            >
              <PieIcon size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Chart body */}
      <div className="flex-1">
        {isEmpty ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-gray-400">Henüz fırsat verisi bulunmuyor.</p>
          </div>
        ) : chartType === "bar" ? (
          <>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} margin={{ top: 24, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#F3F4F6" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#9CA3AF" }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  tickFormatter={compact}
                  tick={{ fontSize: 11, fill: "#9CA3AF" }}
                  axisLine={false} tickLine={false} width={48}
                />
                <Tooltip content={<BarTooltip />} cursor={{ fill: "#F9FAFB", radius: 6 }} />
                <Bar dataKey="total_amount" radius={[4, 4, 0, 0]} maxBarSize={52}>
                  {chartData.map((entry) => (
                    <Cell key={entry.stage} fill={entry.color} />
                  ))}
                  <LabelList
                    dataKey="count"
                    position="top"
                    formatter={(v) => v}
                    style={{ fontSize: 11, fill: "#9CA3AF", fontWeight: 600 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <ChartLegend data={chartData} />
          </>
        ) : (
          <>
            <div className="relative">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%" cy="50%"
                    innerRadius={72} outerRadius={108}
                    paddingAngle={3}
                    dataKey="total_amount"
                    strokeWidth={0}
                  >
                    {chartData.map((entry) => (
                      <Cell key={entry.stage} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<DonutTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Donut center label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-xs font-medium text-gray-400">Toplam</p>
                <p className="text-base font-bold text-gray-900 mt-0.5">{currency(totalAmount)}</p>
              </div>
            </div>
            <ChartLegend data={chartData} />
          </>
        )}
      </div>
    </div>
  );
}

// ── Welcome Banner ─────────────────────────────────────────────────────────────

function WelcomeBanner({ user, activeOpportunities }) {
  const firstName = user?.first_name || user?.username || "";
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 p-6 text-white">
      {/* Decorative circles */}
      <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10" />
      <div className="absolute -bottom-6 -right-2 w-24 h-24 rounded-full bg-white/[0.07]" />
      <div className="absolute top-4 right-32 w-12 h-12 rounded-full bg-purple-400/20" />

      <div className="relative z-10">
        <h1 className="text-xl sm:text-2xl font-bold leading-snug">
          {greeting(firstName)}
        </h1>
        <p className="mt-1.5 text-indigo-200 text-sm">
          Bugün {todayStr()}
          {activeOpportunities > 0 && (
            <> — <span className="text-white font-semibold">{activeOpportunities}</span> aktif fırsatınız var.</>
          )}
        </p>
      </div>
    </div>
  );
}

// ── KPI Section ───────────────────────────────────────────────────────────────

function KpiSection({ data, activeOpportunities }) {
  const cards = [
    {
      title: "Toplam Müşteri",
      value: data.total_customers,
      icon: Users,
      color: "indigo",
      trend: data.new_customers_last_30_days > 0
        ? { direction: "up", value: data.new_customers_last_30_days, label: "yeni son 30 günde" }
        : null,
    },
    {
      title: "Bu Ay Kazanılan",
      value: currency(data.won_revenue_this_month),
      icon: DollarSign,
      color: "green",
    },
    {
      title: "Aktif Fırsatlar",
      value: activeOpportunities,
      icon: TrendingUp,
      color: "yellow",
    },
    {
      title: "Son 30 Gün Yeni",
      value: data.new_customers_last_30_days,
      icon: UserPlus,
      color: "blue",
    },
  ];

  return (
    <>
      {/* Mobile: horizontal snap scroll */}
      <div className="sm:hidden -mx-4 px-4 flex gap-3 overflow-x-auto snap-x snap-mandatory pb-1">
        {cards.map((c) => (
          <div key={c.title} className="snap-start shrink-0 w-[80vw]">
            <KpiCard {...c} />
          </div>
        ))}
      </div>
      {/* sm+: grid */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => <KpiCard key={c.title} {...c} />)}
      </div>
    </>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/dashboard/summary/");
      setData(res.data);
    } catch (err) {
      setError(err.message || "Veri yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const activeOpportunities = data
    ? (data.opportunities_by_stage ?? [])
        .filter((s) => s.stage !== "WON" && s.stage !== "LOST")
        .reduce((sum, s) => sum + s.count, 0)
    : 0;

  const chartData = (data?.opportunities_by_stage ?? []).map((s) => ({
    ...s,
    label: STAGE_META[s.stage]?.label ?? s.stage,
    color: STAGE_META[s.stage]?.color ?? "#6B7280",
  }));

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-red-600 font-medium">{error}</p>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <RefreshCw size={15} />
          Tekrar Dene
        </button>
      </div>
    );
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Welcome banner skeleton */}
        <SkeletonBlock className="h-24 w-full rounded-2xl" />

        {/* KPI skeletons */}
        <div className="sm:hidden -mx-4 px-4 flex gap-3 overflow-x-auto pb-1">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="shrink-0 w-[80vw]"><SkeletonCard /></div>
          ))}
        </div>
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>

        {/* Chart + recent */}
        <div className="lg:grid lg:grid-cols-3 lg:gap-6 space-y-6 lg:space-y-0">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-100 shadow-sm p-6">
            <SkeletonBlock className="h-5 w-40 mb-6" />
            <SkeletonBlock className="h-64 w-full" />
          </div>
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5">
            <SkeletonBlock className="h-5 w-48 mb-4" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-3">
                <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
                <SkeletonBlock className="h-9 flex-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Content ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Welcome Banner */}
      <WelcomeBanner user={user} activeOpportunities={activeOpportunities} />

      {/* KPI Cards */}
      <KpiSection data={data} activeOpportunities={activeOpportunities} />

      {/* Chart + Recent — 2-col on lg+ */}
      <div className="lg:grid lg:grid-cols-3 lg:gap-6 space-y-6 lg:space-y-0">

        <ChartSection chartData={chartData} />

        {/* Recent Customers panel */}
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Son Eklenen Müşteriler</h2>
            <span className="text-xs text-gray-400">Son 5 kayıt</span>
          </div>
          <RecentCustomersTable customers={data.recent_customers ?? []} />
        </div>
      </div>
    </div>
  );
}
