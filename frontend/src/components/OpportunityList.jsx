import { useState } from "react";
import { Briefcase } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";

const STAGE_META = {
  NEW:       { label: "Yeni",       class: "bg-blue-100 text-blue-700"   },
  QUALIFIED: { label: "Nitelikli",  class: "bg-yellow-100 text-yellow-700" },
  PROPOSAL:  { label: "Teklif",     class: "bg-orange-100 text-orange-700" },
  WON:       { label: "Kazanıldı",  class: "bg-green-100 text-green-700"  },
  LOST:      { label: "Kaybedildi", class: "bg-red-100 text-red-700"     },
};

const STAGES = Object.keys(STAGE_META);

const formatDate = (iso) =>
  iso
    ? new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso))
    : "—";

const formatCurrency = (val) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: 0 }).format(Number(val) || 0);

function StageBadge({ stage }) {
  const meta = STAGE_META[stage] ?? { label: stage, class: "bg-gray-100 text-gray-600" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${meta.class}`}>
      {meta.label}
    </span>
  );
}

function StageSelect({ opportunityId, currentStage, onUpdate }) {
  const [value, setValue]     = useState(currentStage);
  const [loading, setLoading] = useState(false);

  const handleChange = async (e) => {
    const newStage = e.target.value;
    const prev = value;
    setValue(newStage);
    setLoading(true);
    try {
      await api.patch(`/opportunities/${opportunityId}/`, { stage: newStage });
      toast.success("Aşama güncellendi.");
      onUpdate(opportunityId, newStage);
    } catch (err) {
      setValue(prev);
      const msg =
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.stage?.[0] ||
        err.response?.data?.detail ||
        "Geçersiz aşama geçişi.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <select
      value={value}
      onChange={handleChange}
      disabled={loading}
      className="text-xs border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer bg-white"
    >
      {STAGES.map((s) => (
        <option key={s} value={s}>{STAGE_META[s].label}</option>
      ))}
    </select>
  );
}

export default function OpportunityList({ opportunities: initial, customerId }) {
  const [opportunities, setOpportunities] = useState(initial);

  const handleUpdate = (id, newStage) => {
    setOpportunities((prev) =>
      prev.map((o) => (o.id === id ? { ...o, stage: newStage } : o))
    );
  };

  if (opportunities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 gap-3 text-gray-400">
        <Briefcase size={32} strokeWidth={1.5} />
        <p className="text-sm">Henüz fırsat eklenmemiş.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {["Başlık", "Tutar", "Aşama", "Kapanış", "Durum"].map((h) => (
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {opportunities.map((opp) => (
            <tr key={opp.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-900">{opp.title}</td>
              <td className="px-4 py-3 text-gray-700 font-medium">{formatCurrency(opp.amount)}</td>
              <td className="px-4 py-3">
                <StageBadge stage={opp.stage} />
              </td>
              <td className="px-4 py-3 text-gray-500">{formatDate(opp.expected_close)}</td>
              <td className="px-4 py-3">
                <StageSelect
                  opportunityId={opp.id}
                  currentStage={opp.stage}
                  onUpdate={handleUpdate}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
