import { useEffect, useState, useCallback } from "react";
import { Users, TrendingUp, DollarSign, UserPlus, RefreshCw } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LabelList,
} from "recharts";
import api from "../services/api";
import KpiCard from "../components/KpiCard";
import RecentCustomersTable from "../components/RecentCustomersTable";

// ── Helpers ──────────────────────────────────────────────────────────────────

const currency = (val) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(val) || 0);

const STAGE_META = {
  NEW:       { label: "Yeni",      color: "#6366F1" },
  QUALIFIED: { label: "Nitelikli", color: "#F59E0B" },
  PROPOSAL:  { label: "Teklif",    color: "#F97316" },
  WON:       { label: "Kazanılan", color: "#10B981" },
  LOST:      { label: "Kaybedilen",color: "#EF4444" },
};

// ── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex overflow-hidden animate-pulse">
      <div className="w-1.5 bg-gray-200 shrink-0" />
      <div className="flex items-center gap-4 px-5 py-5 flex-1">
        <div className="w-11 h-11 rounded-xl bg-gray-200 shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-3 bg-gray-200 rounded w-1/2" />
          <div className="h-6 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
    </div>
  );
}

function SkeletonBlock({ className = "" }) {
  return (
    <div className={`bg-gray-200 rounded-lg animate-pulse ${className}`} />
  );
}

// ── Custom Tooltip ────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-gray-900 mb-1">
        Stage: {STAGE_META[d.stage]?.label ?? d.stage}
      </p>
      <p className="text-gray-600">Fırsat Sayısı: <span className="font-medium">{d.count}</span></p>
      <p className="text-gray-600">Toplam Tutar: <span className="font-medium">{currency(d.total_amount)}</span></p>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function Dashboard() {
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

  // ── Derived values ──────────────────────────────────────────────────────
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

  // ── Error state ─────────────────────────────────────────────────────────
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

  // ── Loading state ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <SkeletonBlock className="h-5 w-40 mb-6" />
          <SkeletonBlock className="h-64 w-full" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <SkeletonBlock className="h-5 w-48 mb-4" />
          {[...Array(5)].map((_, i) => (
            <SkeletonBlock key={i} className="h-10 w-full mb-2" />
          ))}
        </div>
      </div>
    );
  }

  // ── Content ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="Toplam Müşteri"
          value={data.total_customers}
          icon={Users}
          color="indigo"
        />
        <KpiCard
          title="Bu Ay Kazanılan"
          value={currency(data.won_revenue_this_month)}
          icon={DollarSign}
          color="green"
          subtitle="Kapanan fırsatlar"
        />
        <KpiCard
          title="Aktif Fırsatlar"
          value={activeOpportunities}
          icon={TrendingUp}
          color="yellow"
          subtitle="WON ve LOST hariç"
        />
        <KpiCard
          title="Son 30 Gün Yeni Müşteri"
          value={data.new_customers_last_30_days}
          icon={UserPlus}
          color="blue"
        />
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-6">
          Fırsat Dağılımı
        </h2>
        {chartData.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-16">
            Henüz fırsat verisi bulunmuyor.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 20, right: 16, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: "#6B7280" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) =>
                  new Intl.NumberFormat("tr-TR", {
                    notation: "compact", compactDisplay: "short",
                  }).format(v)
                }
                tick={{ fontSize: 12, fill: "#6B7280" }}
                axisLine={false}
                tickLine={false}
                width={60}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "#F9FAFB" }} />
              <Bar dataKey="total_amount" radius={[6, 6, 0, 0]} maxBarSize={64}>
                {chartData.map((entry) => (
                  <Cell key={entry.stage} fill={entry.color} />
                ))}
                <LabelList
                  dataKey="count"
                  position="top"
                  formatter={(v) => `${v} fırsat`}
                  style={{ fontSize: 11, fill: "#6B7280" }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Recent Customers */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">
            Son Eklenen Müşteriler
          </h2>
          <span className="text-xs text-gray-400">Son 5 kayıt</span>
        </div>
        <RecentCustomersTable customers={data.recent_customers ?? []} />
      </div>
    </div>
  );
}
