import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { RefreshCw, CalendarDays, DollarSign } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import type { Opportunity, OpportunityStage } from "../types/opportunity";

// ── Constants ─────────────────────────────────────────────────────────────────

const STAGES: {
  value: OpportunityStage;
  label: string;
  headerCls: string;
  dotCls: string;
  countCls: string;
  overCls: string;
}[] = [
  {
    value:     "NEW",
    label:     "Yeni",
    headerCls: "bg-blue-50   border-blue-200",
    dotCls:    "bg-blue-500",
    countCls:  "bg-blue-100  text-blue-700",
    overCls:   "bg-blue-50/60",
  },
  {
    value:     "QUALIFIED",
    label:     "Nitelikli",
    headerCls: "bg-yellow-50  border-yellow-200",
    dotCls:    "bg-yellow-400",
    countCls:  "bg-yellow-100 text-yellow-700",
    overCls:   "bg-yellow-50/60",
  },
  {
    value:     "PROPOSAL",
    label:     "Teklif",
    headerCls: "bg-orange-50  border-orange-200",
    dotCls:    "bg-orange-400",
    countCls:  "bg-orange-100 text-orange-700",
    overCls:   "bg-orange-50/60",
  },
  {
    value:     "WON",
    label:     "Kazanıldı",
    headerCls: "bg-green-50   border-green-200",
    dotCls:    "bg-green-500",
    countCls:  "bg-green-100  text-green-700",
    overCls:   "bg-green-50/60",
  },
  {
    value:     "LOST",
    label:     "Kaybedildi",
    headerCls: "bg-red-50     border-red-200",
    dotCls:    "bg-red-500",
    countCls:  "bg-red-100    text-red-700",
    overCls:   "bg-red-50/60",
  },
];

const INVALID_TRANSITIONS: Partial<Record<OpportunityStage, Set<OpportunityStage>>> = {
  LOST: new Set(["WON"]),
  WON:  new Set(["LOST"]),
};

type Grouped = Record<OpportunityStage, Opportunity[]>;

const emptyGrouped = (): Grouped => ({
  NEW: [], QUALIFIED: [], PROPOSAL: [], WON: [], LOST: [],
});

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatCurrency = (val: string | number) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency", currency: "TRY", minimumFractionDigits: 0,
  }).format(Number(val) || 0);

const formatDate = (iso: string | null) =>
  iso
    ? new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short" }).format(new Date(iso))
    : null;

// ── Card content (shared between draggable card and drag overlay) ─────────────

function CardContent({ opp }: { opp: Opportunity }) {
  const navigate = useNavigate();
  const closeDate = formatDate(opp.expected_close);

  return (
    <>
      <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-indigo-700 transition-colors">
        {opp.title}
      </p>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); navigate(`/customers/${opp.customer}`); }}
        className="mt-1.5 text-left text-xs text-gray-500 hover:text-indigo-600 hover:underline transition-colors truncate w-full"
      >
        {opp.customer_name}
      </button>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1 text-sm font-bold text-gray-800">
          <DollarSign size={12} className="text-gray-400 shrink-0" />
          {formatCurrency(opp.amount)}
        </span>
        {closeDate && (
          <span className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
            <CalendarDays size={11} />
            {closeDate}
          </span>
        )}
      </div>
    </>
  );
}

// ── Draggable card ─────────────────────────────────────────────────────────────

function KanbanCard({ opp, fromStage }: { opp: Opportunity; fromStage: OpportunityStage }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `card-${opp.id}`,
    data: { opp, fromStage },
  });

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={[
        "bg-white rounded-lg border border-gray-200 p-3.5 shadow-xs group",
        "cursor-grab active:cursor-grabbing transition-all duration-150",
        isDragging ? "opacity-0" : "hover:shadow-sm hover:border-indigo-200",
      ].join(" ")}
    >
      <CardContent opp={opp} />
    </div>
  );
}

// ── Drag overlay card (floating while dragging) ───────────────────────────────

function KanbanCardOverlay({ opp }: { opp: Opportunity }) {
  return (
    <div className="bg-white rounded-lg border border-indigo-300 p-3.5 shadow-xl w-[240px] rotate-2 opacity-95 cursor-grabbing">
      <CardContent opp={opp} />
    </div>
  );
}

// ── Column skeleton ────────────────────────────────────────────────────────────

function ColumnSkeleton() {
  return (
    <div className="flex flex-col min-w-[240px] animate-pulse">
      <div className="h-11 rounded-t-xl bg-gray-200" />
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

// ── Droppable column ──────────────────────────────────────────────────────────

function KanbanColumn({
  stage,
  opps,
}: {
  stage: typeof STAGES[number];
  opps: Opportunity[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `col-${stage.value}` });
  const total = opps.reduce((sum, o) => sum + Number(o.amount || 0), 0);

  return (
    <div className="flex flex-col min-w-[240px] max-w-[280px] flex-1">
      {/* Column header */}
      <div
        className={[
          "flex items-center justify-between px-3 py-2.5 rounded-t-xl border",
          stage.headerCls,
        ].join(" ")}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-2 h-2 rounded-full shrink-0 ${stage.dotCls}`} />
          <span className="text-sm font-semibold text-gray-800 truncate">{stage.label}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${stage.countCls}`}>
            {opps.length}
          </span>
        </div>
      </div>

      {/* Column total */}
      {total > 0 && (
        <div className={`px-3 py-1 text-xs text-gray-500 font-medium border-x ${stage.headerCls.split(" ")[1]}`}>
          {formatCurrency(total)}
        </div>
      )}

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={[
          "flex-1 rounded-b-xl border border-t-0 border-gray-200 p-2 space-y-2 overflow-y-auto",
          "transition-colors duration-150 min-h-[120px]",
          isOver ? stage.overCls : "bg-gray-50",
        ].join(" ")}
      >
        {opps.length === 0 ? (
          <div className={[
            "flex items-center justify-center h-20 rounded-lg border-2 border-dashed transition-colors",
            isOver ? "border-indigo-300 bg-indigo-50/50" : "border-gray-200",
          ].join(" ")}>
            <p className="text-xs text-gray-400">
              {isOver ? "Bırakın" : "Fırsat yok"}
            </p>
          </div>
        ) : (
          opps.map((opp) => (
            <KanbanCard key={opp.id} opp={opp} fromStage={stage.value} />
          ))
        )}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function KanbanBoard() {
  const [grouped, setGrouped]   = useState<Grouped>(emptyGrouped);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [activeOpp, setActiveOpp] = useState<Opportunity | null>(null);

  // Store snapshot before optimistic update so we can revert on API error
  const prevGrouped = useRef<Grouped | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<Opportunity[] | { results: Opportunity[] }>("/opportunities/");
      const list: Opportunity[] = Array.isArray(data) ? data : data.results ?? [];

      const next = emptyGrouped();
      list.forEach((opp) => {
        if (next[opp.stage]) next[opp.stage].push(opp);
      });
      setGrouped(next);
    } catch {
      setError("Fırsatlar yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Drag handlers ──────────────────────────────────────────────────────────
  const handleDragStart = ({ active }: DragStartEvent) => {
    const opp = active.data.current?.opp as Opportunity | undefined;
    setActiveOpp(opp ?? null);
  };

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    setActiveOpp(null);
    if (!over) return;

    const opp       = active.data.current?.opp as Opportunity;
    const fromStage = active.data.current?.fromStage as OpportunityStage;
    const toStage   = over.id.toString().replace("col-", "") as OpportunityStage;

    if (fromStage === toStage) return;

    // Guard: invalid transition
    if (INVALID_TRANSITIONS[fromStage]?.has(toStage)) {
      toast.error(
        `"${STAGES.find((s) => s.value === fromStage)?.label}" → ` +
        `"${STAGES.find((s) => s.value === toStage)?.label}" geçişi izin verilmemektedir.`,
        { duration: 4000 }
      );
      return;
    }

    // Optimistic update
    prevGrouped.current = grouped;
    setGrouped((prev) => {
      const next = { ...prev };
      next[fromStage] = next[fromStage].filter((o) => o.id !== opp.id);
      next[toStage]   = [{ ...opp, stage: toStage }, ...next[toStage]];
      return next;
    });

    // API call
    try {
      await api.patch(`/opportunities/${opp.id}/`, { stage: toStage });
      prevGrouped.current = null;
    } catch {
      // Revert on failure
      if (prevGrouped.current) {
        setGrouped(prevGrouped.current);
        prevGrouped.current = null;
      }
      toast.error("Aşama güncellenemedi. Lütfen tekrar deneyin.");
    }
  };

  const handleDragCancel = () => {
    setActiveOpp(null);
  };

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-red-600 font-medium">{error}</p>
        <button
          onClick={fetchAll}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <RefreshCw size={15} />
          Tekrar Dene
        </button>
      </div>
    );
  }

  // ── Board ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <h1 className="text-2xl font-bold text-gray-900">Kanban Board</h1>
        {!loading && (
          <button
            onClick={fetchAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={14} />
            Yenile
          </button>
        )}
      </div>

      {/* Board — horizontal scroll container */}
      <div className="flex-1 overflow-x-auto pb-4">
        {loading ? (
          <div className="flex gap-3 h-full min-w-max">
            {STAGES.map((s) => <ColumnSkeleton key={s.value} />)}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <div className="flex gap-3 h-full min-w-max lg:min-w-0 lg:grid lg:grid-cols-5">
              {STAGES.map((stage) => (
                <KanbanColumn
                  key={stage.value}
                  stage={stage}
                  opps={grouped[stage.value]}
                />
              ))}
            </div>

            <DragOverlay dropAnimation={{ duration: 200, easing: "ease" }}>
              {activeOpp && <KanbanCardOverlay opp={activeOpp} />}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </div>
  );
}
