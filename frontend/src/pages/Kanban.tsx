import { useEffect, useState, useCallback } from "react";
import { useNavigate, NavigateFunction } from "react-router-dom";
import { RefreshCw, ChevronDown } from "lucide-react";
import api from "../services/api";
import type { Opportunity, OpportunityStage } from "../types/opportunity";

// ── Constants ─────────────────────────────────────────────────────────────────

const STAGES: { value: OpportunityStage; label: string; color: string }[] = [
  { value: "NEW",       label: "Yeni",       color: "blue"   },
  { value: "QUALIFIED", label: "Nitelikli",  color: "yellow" },
  { value: "PROPOSAL",  label: "Teklif",     color: "orange" },
  { value: "WON",       label: "Kazanıldı",  color: "green"  },
  { value: "LOST",      label: "Kaybedildi", color: "red"    },
];

const STAGE_STYLES = {
  blue:   { header: "bg-blue-50 border-blue-200",   dot: "bg-blue-500",   count: "bg-blue-100 text-blue-700"   },
  yellow: { header: "bg-yellow-50 border-yellow-200", dot: "bg-yellow-400", count: "bg-yellow-100 text-yellow-700" },
  orange: { header: "bg-orange-50 border-orange-200", dot: "bg-orange-400", count: "bg-orange-100 text-orange-700" },
  green:  { header: "bg-green-50 border-green-200",  dot: "bg-green-500",  count: "bg-green-100 text-green-700"  },
  red:    { header: "bg-red-50 border-red-200",      dot: "bg-red-500",    count: "bg-red-100 text-red-700"      },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatCurrency = (val: number | string) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency", currency: "TRY", minimumFractionDigits: 0,
  }).format(Number(val) || 0);

const formatDate = (iso: string | null) =>
  iso
    ? new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short" }).format(new Date(iso))
    : null;

// ── Card ──────────────────────────────────────────────────────────────────────

function KanbanCard({ opp, navigate, index }: { opp: Opportunity; navigate: NavigateFunction; index: number }) {
  return (
    <div
      className="bg-white rounded-lg border border-gray-200 p-3.5 shadow-xs hover:shadow-sm transition-all duration-150 cursor-pointer group animate-fade-in"
      style={{ animationDelay: `${index * 40}ms` }}
      onClick={() => navigate(`/customers/${opp.customer}`)}
    >
      <p className="text-sm font-semibold text-gray-900 leading-snug group-hover:text-indigo-700 transition-colors line-clamp-2">
        {opp.title}
      </p>
      <p className="mt-1.5 text-xs text-gray-500 truncate">{opp.customer_name}</p>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-sm font-bold text-gray-800">{formatCurrency(opp.amount)}</span>
        {opp.expected_close && (
          <span className="text-xs text-gray-400">{formatDate(opp.expected_close)}</span>
        )}
      </div>
    </div>
  );
}

// ── Column ────────────────────────────────────────────────────────────────────

type StageObj = typeof STAGES[number];

function KanbanColumn({ stage, opps, navigate }: { stage: StageObj; opps: Opportunity[]; navigate: NavigateFunction }) {
  const s = STAGE_STYLES[stage.color as keyof typeof STAGE_STYLES];
  const total = opps.reduce((sum: number, o: Opportunity) => sum + Number(o.amount || 0), 0);

  return (
    <div className="flex flex-col min-h-0">
      {/* Column header */}
      <div className={`flex items-center justify-between px-3 py-2.5 rounded-t-xl border ${s.header}`}>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${s.dot}`} />
          <span className="text-sm font-semibold text-gray-800">{stage.label}</span>
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.count}`}>
          {opps.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 rounded-b-xl bg-gray-50 border border-t-0 border-gray-200 p-2 space-y-2 overflow-y-auto">
        {opps.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-6">Fırsat yok</p>
        ) : (
          opps.map((opp, i) => (
            <KanbanCard key={opp.id} opp={opp} navigate={navigate} index={i} />
          ))
        )}
        {opps.length > 0 && (
          <p className="text-xs text-gray-400 text-center pt-1 pb-0.5">
            {formatCurrency(total)}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function ColumnSkeleton() {
  return (
    <div className="flex flex-col animate-pulse">
      <div className="h-10 rounded-t-xl bg-gray-200" />
      <div className="flex-1 rounded-b-xl bg-gray-100 border border-t-0 border-gray-200 p-2 space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-3.5 space-y-2 border border-gray-100">
            <div className="h-3 bg-gray-200 rounded w-4/5" />
            <div className="h-3 bg-gray-200 rounded w-2/5" />
            <div className="h-4 bg-gray-200 rounded w-1/3 mt-2" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function Kanban() {
  const navigate = useNavigate();
  const [all, setAll]         = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [activeStage, setActiveStage] = useState<OpportunityStage>("NEW");

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/opportunities/");
      setAll(Array.isArray(data) ? data : data.results ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fırsatlar yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const grouped = STAGES.reduce<Record<OpportunityStage, Opportunity[]>>((acc, s) => {
    acc[s.value] = all.filter((o) => o.stage === s.value);
    return acc;
  }, {} as Record<OpportunityStage, Opportunity[]>);

  const activeStageObj = STAGES.find((s) => s.value === activeStage) ?? STAGES[0];

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-red-600 font-medium">{error}</p>
        <button
          onClick={fetch}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <RefreshCw size={15} />
          Tekrar Dene
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-5">
      <h1 className="text-2xl font-bold text-gray-900 shrink-0">Kanban Board</h1>

      {/* ── Mobile: stage dropdown + single column ───────────────────── */}
      <div className="sm:hidden flex flex-col gap-4 min-h-0">
        {/* Dropdown */}
        <div className="relative">
          <select
            value={activeStage}
            onChange={(e) => setActiveStage(e.target.value as OpportunityStage)}
            className="w-full appearance-none pl-4 pr-10 py-3 min-h-[44px] bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {STAGES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label} ({grouped[s.value]?.length ?? 0})
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>

        {/* Single active column */}
        {loading ? (
          <ColumnSkeleton />
        ) : (
          <KanbanColumn
            stage={activeStageObj}
            opps={grouped[activeStage] ?? []}
            navigate={navigate}
          />
        )}
      </div>

      {/* ── Tablet (md): 3 columns + horizontal scroll ──────────────── */}
      {/* ── Desktop (lg+): 5 columns ────────────────────────────────── */}
      <div className="hidden sm:block overflow-x-auto pb-4">
        <div className="grid grid-cols-3 lg:grid-cols-5 gap-4 min-w-[720px] lg:min-w-0 h-[calc(100vh-220px)]">
          {loading
            ? STAGES.slice(0, 5).map((_, i) => <ColumnSkeleton key={i} />)
            : STAGES.map((stage) => (
                <KanbanColumn
                  key={stage.value}
                  stage={stage}
                  opps={grouped[stage.value] ?? []}
                  navigate={navigate}
                />
              ))}
        </div>
      </div>
    </div>
  );
}
