import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Pencil, X, Check, Loader2, UserX } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import NoteList from "../components/NoteList";
import OpportunityList from "../components/OpportunityList";

// ── Helpers ──────────────────────────────────────────────────────────────────

const TABS = [
  { key: "notes",         label: "Notlar"    },
  { key: "opportunities", label: "Fırsatlar" },
];

// ── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-6 w-32 bg-gray-200 rounded" />
      <div className="lg:grid lg:grid-cols-5 lg:gap-6 space-y-4 lg:space-y-0">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="h-7 w-48 bg-gray-200 rounded" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 w-16 bg-gray-200 rounded" />
              <div className="h-5 w-36 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 p-6">
          <div className="h-60 bg-gray-100 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// ── Info Field (view / edit) ──────────────────────────────────────────────────

function InfoField({ label, value, editMode, name, type = "text", editValues, onChange }) {
  if (!editMode) {
    return (
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">{label}</p>
        <p className="mt-1 text-sm text-gray-900">{value || <span className="text-gray-300">—</span>}</p>
      </div>
    );
  }
  return (
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">{label}</p>
      <input
        type={type}
        name={name}
        value={editValues[name] ?? ""}
        onChange={onChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
      />
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function CustomerDetail() {
  const { id } = useParams();

  const [customer, setCustomer]       = useState(null);
  const [loading, setLoading]         = useState(true);
  const [notFound, setNotFound]       = useState(false);
  const [editMode, setEditMode]       = useState(false);
  const [editValues, setEditValues]   = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [activeTab, setActiveTab]     = useState("notes");

  const fetchCustomer = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/customers/${id}/`);
      setCustomer(data);
      setNotFound(false);
    } catch (err) {
      if (err.response?.status === 404) setNotFound(true);
      else toast.error("Müşteri yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchCustomer(); }, [fetchCustomer]);

  const startEdit = () => {
    setEditValues({
      first_name: customer.first_name,
      last_name:  customer.last_name,
      email:      customer.email,
      phone:      customer.phone ?? "",
      company:    customer.company ?? "",
    });
    setEditMode(true);
  };

  const cancelEdit = () => setEditMode(false);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditValues((v) => ({ ...v, [name]: value }));
  };

  const handleSave = async () => {
    setEditLoading(true);
    try {
      const { data } = await api.patch(`/customers/${id}/`, editValues);
      setCustomer((prev) => ({ ...prev, ...data }));
      setEditMode(false);
      toast.success("Müşteri güncellendi.");
    } catch (err) {
      const data = err.response?.data;
      const first = data && Object.values(data).flat()[0];
      toast.error(first || "Güncelleme başarısız.");
    } finally {
      setEditLoading(false);
    }
  };

  // ── States ────────────────────────────────────────────────────────────────
  if (loading) return <Skeleton />;

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-500">
        <UserX size={40} strokeWidth={1.5} />
        <p className="text-base font-medium text-gray-700">Müşteri bulunamadı.</p>
        <Link
          to="/customers"
          className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 transition-colors font-medium"
        >
          <ArrowLeft size={15} />
          Listeye Dön
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Back */}
      <Link
        to="/customers"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft size={16} />
        Müşterilere Dön
      </Link>

      {/* Desktop 2-col / Mobile stacked */}
      <div className="lg:grid lg:grid-cols-5 lg:gap-6 space-y-4 lg:space-y-0 items-start">

        {/* ── Left: Info Card ─────────────────────────────────────────── */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {customer.first_name} {customer.last_name}
              </h1>
              {customer.company && (
                <p className="text-sm text-gray-500 mt-0.5">{customer.company}</p>
              )}
            </div>

            {!editMode ? (
              <button
                onClick={startEdit}
                className="flex items-center gap-1.5 px-3 py-1.5 min-h-[44px] text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shrink-0"
              >
                <Pencil size={14} />
                Düzenle
              </button>
            ) : (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={cancelEdit}
                  disabled={editLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 min-h-[44px] text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <X size={14} />
                  İptal
                </button>
                <button
                  onClick={handleSave}
                  disabled={editLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 min-h-[44px] text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60"
                >
                  {editLoading
                    ? <Loader2 size={14} className="animate-spin" />
                    : <Check size={14} />}
                  Kaydet
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <InfoField label="Ad"      name="first_name" value={customer.first_name} editMode={editMode} editValues={editValues} onChange={handleEditChange} />
            <InfoField label="Soyad"   name="last_name"  value={customer.last_name}  editMode={editMode} editValues={editValues} onChange={handleEditChange} />
            <InfoField label="E-posta" name="email"      value={customer.email}      editMode={editMode} editValues={editValues} onChange={handleEditChange} type="email" />
            <InfoField label="Telefon" name="phone"      value={customer.phone}      editMode={editMode} editValues={editValues} onChange={handleEditChange} type="tel" />
            <InfoField label="Şirket"  name="company"    value={customer.company}    editMode={editMode} editValues={editValues} onChange={handleEditChange} />
          </div>
        </div>

        {/* ── Right: Tabs ─────────────────────────────────────────────── */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-gray-200 px-4">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={[
                  "px-4 py-3.5 min-h-[48px] text-sm font-medium transition-colors border-b-2 -mb-px",
                  activeTab === tab.key
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
                ].join(" ")}
              >
                {tab.label}
                {tab.key === "notes" && customer.notes?.length > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                    {customer.notes.length}
                  </span>
                )}
                {tab.key === "opportunities" && customer.opportunities?.length > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                    {customer.opportunities.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-6">
            {activeTab === "notes" && (
              <NoteList
                notes={customer.notes ?? []}
                customerId={id}
                onRefresh={fetchCustomer}
              />
            )}
            {activeTab === "opportunities" && (
              <OpportunityList
                opportunities={customer.opportunities ?? []}
                customerId={id}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
