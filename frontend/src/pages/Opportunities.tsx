import { useEffect, useState, useCallback } from "react";
import { useNavigate, NavigateFunction } from "react-router-dom";
import { RefreshCw, TrendingUp } from "lucide-react";
import api from "../services/api";
import type { Opportunity, OpportunityStage } from "../types/opportunity";

// ── Constants ─────────────────────────────────────────────────────────────────

const FILTERS = [
  { value: "",          label: "Tümü"       },
  { value: "NEW",       label: "Yeni"       },
  { value: "QUALIFIED", label: "Nitelikli"  },
  { value: "PROPOSAL",  label: "Teklif"     },
  { value: "WON",       label: "Kazanılan"  },
  { value: "LOST",      label: "Kaybedilen" },
];

const STAGE_META = {
  NEW:       { label: "Yeni",       cls: "bg-blue-100 text-blue-700"     },
  QUALIFIED: { label: "Nitelikli",  cls: "bg-yellow-100 text-yellow-700" },
  PROPOSAL:  { label: "Teklif",     cls: "bg-orange-100 text-orange-700" },
  WON:       { label: "Kazanıldı",  cls: "bg-green-100 text-green-700"   },
  LOST:      { label: "Kaybedildi", cls: "bg-red-100 text-red-700"       },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatCurrency = (val: number | string) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency", currency: "TRY", minimumFractionDigits: 0,
  }).format(Number(val) || 0);

const formatDate = (iso: string | null) =>
  iso
    ? new Intl.DateTimeFormat("tr-TR", {
        day: "numeric", month: "long", year: "numeric",
      }).format(new Date(iso))
    : "—";

// ── Sub-components ────────────────────────────────────────────────────────────

function StageBadge({ stage }: { stage: OpportunityStage }) {
  const m = STAGE_META[stage] ?? { label: stage, cls: "bg-gray-100 text-gray-600" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${m.cls}`}>
      {m.label}
    </span>
  );
}

// Desktop: pill button group
function DesktopFilters({ active, onChange }: { active: string; onChange: (v: string) => void }) {
  return (
    <div className="hidden sm:flex flex-wrap gap-2">
      {FILTERS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={[
            "px-4 py-2 min-h-[40px] rounded-full text-sm font-medium transition-colors border",
            active === value
              ? "bg-indigo-600 text-white border-indigo-600"
              : "bg-white text-gray-600 border-gray-300 hover:border-indigo-400 hover:text-indigo-600",
          ].join(" ")}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// Mobile: horizontal scroll chips
function MobileFilters({ active, onChange }: { active: string; onChange: (v: string) => void }) {
  return (
    <div className="sm:hidden -mx-4 px-4 flex gap-2 overflow-x-auto snap-x pb-1">
      {FILTERS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={[
            "snap-start shrink-0 px-4 py-2 min-h-[44px] rounded-full text-sm font-medium border transition-colors",
            active === value
              ? "bg-indigo-600 text-white border-indigo-600"
              : "bg-white text-gray-600 border-gray-300",
          ].join(" ")}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <tbody className="divide-y divide-gray-100">
      {[...Array(6)].map((_, i) => (
        <tr key={i} className="animate-pulse">
          {[...Array(5)].map((_, j) => (
            <td key={j} className="px-4 py-3.5">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

function CardSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-3 bg-gray-200 rounded w-1/3" />
          <div className="h-3 bg-gray-200 rounded w-1/4" />
        </div>
      ))}
    </div>
  );
}

// ── Desktop table ─────────────────────────────────────────────────────────────

function DesktopTable({ opportunities, loading, navigate }: { opportunities: Opportunity[]; loading: boolean; navigate: NavigateFunction }) {
  return (
    <div className="hidden sm:block overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {["Başlık", "Müşteri", "Tutar", "Aşama", "Tahmini Kapanış"].map((h) => (
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        {loading ? (
          <TableSkeleton />
        ) : (
          <tbody className="divide-y divide-gray-100">
            {opportunities.map((opp, index) => (
              <tr
                key={opp.id}
                className="hover:bg-gray-50 transition-colors animate-fade-in"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <td className="px-4 py-3.5 font-medium text-gray-900">{opp.title}</td>
                <td className="px-4 py-3.5">
                  <button
                    onClick={() => navigate(`/customers/${opp.customer}`)}
                    className="text-indigo-600 hover:text-indigo-800 hover:underline transition-colors font-medium"
                  >
                    {opp.customer_name}
                  </button>
                </td>
                <td className="px-4 py-3.5 text-gray-700 font-medium">
                  {formatCurrency(opp.amount)}
                </td>
                <td className="px-4 py-3.5">
                  <StageBadge stage={opp.stage} />
                </td>
                <td className="px-4 py-3.5 text-gray-500">
                  {formatDate(opp.expected_close)}
                </td>
              </tr>
            ))}
          </tbody>
        )}
      </table>
    </div>
  );
}

// ── Mobile cards ──────────────────────────────────────────────────────────────

function MobileCards({ opportunities, loading, navigate }: { opportunities: Opportunity[]; loading: boolean; navigate: NavigateFunction }) {
  if (loading) return <div className="sm:hidden"><CardSkeleton /></div>;

  return (
    <div className="sm:hidden space-y-3">
      {opportunities.map((opp, index) => (
        <div
          key={opp.id}
          className="bg-white rounded-xl border border-gray-200 p-4 space-y-3 animate-fade-in"
          style={{ animationDelay: `${index * 40}ms` }}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-gray-900 leading-snug">{opp.title}</p>
            <StageBadge stage={opp.stage} />
          </div>
          <div className="flex items-center justify-between text-sm">
            <button
              onClick={() => navigate(`/customers/${opp.customer}`)}
              className="text-indigo-600 hover:underline font-medium min-h-[44px] flex items-center"
            >
              {opp.customer_name}
            </button>
            <span className="font-semibold text-gray-800">{formatCurrency(opp.amount)}</span>
          </div>
          {opp.expected_close && (
            <p className="text-xs text-gray-400">
              Tahmini kapanış: {formatDate(opp.expected_close)}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function Opportunities() {
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState([]);
  const [activeStage, setActiveStage]     = useState("");
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);

  const fetchOpportunities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = activeStage ? { stage: activeStage } : {};
      const { data } = await api.get("/opportunities/", { params });
      setOpportunities(Array.isArray(data) ? data : data.results ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fırsatlar yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [activeStage]);

  useEffect(() => { fetchOpportunities(); }, [fetchOpportunities]);

  const isEmpty = !loading && !error && opportunities.length === 0;
  const activeLabel = FILTERS.find((f) => f.value === activeStage)?.label ?? "Tümü";

  return (
    <div className="space-y-5">
      {/* Header */}
      <h1 className="text-2xl font-bold text-gray-900">Fırsatlar</h1>

      {/* Stage filters */}
      <DesktopFilters active={activeStage} onChange={setActiveStage} />
      <MobileFilters  active={activeStage} onChange={setActiveStage} />

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-5 py-4">
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={fetchOpportunities}
            className="flex items-center gap-1.5 text-sm font-medium text-red-700 hover:text-red-900 transition-colors"
          >
            <RefreshCw size={14} />
            Tekrar Dene
          </button>
        </div>
      )}

      {/* Table / Cards */}
      {!error && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <DesktopTable opportunities={opportunities} loading={loading} navigate={navigate} />
          <MobileCards  opportunities={opportunities} loading={loading} navigate={navigate} />

          {isEmpty && (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
              <TrendingUp size={36} strokeWidth={1.5} />
              <p className="text-sm font-medium text-gray-600">
                {activeStage
                  ? `"${activeLabel}" aşamasında fırsat bulunmuyor.`
                  : "Henüz fırsat eklenmemiş."}
              </p>
              {activeStage && (
                <button
                  onClick={() => setActiveStage("")}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                >
                  Tüm fırsatları göster
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
