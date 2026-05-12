import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, RefreshCw, UserX } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import useDebounce from "../hooks/useDebounce";
import CustomerTable from "../components/CustomerTable";
import Pagination from "../components/Pagination";
import ConfirmModal from "../components/ConfirmModal";

const PAGE_SIZE = 10;

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [count, setCount]         = useState(0);
  const [page, setPage]           = useState(1);
  const [search, setSearch]       = useState("");
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, page_size: PAGE_SIZE };
      if (debouncedSearch) params.search = debouncedSearch;
      const { data } = await api.get("/customers/", { params });
      setCustomers(data.results);
      setCount(data.count);
    } catch (err) {
      setError(err.message || "Müşteriler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  // Arama değişince sayfayı sıfırla
  useEffect(() => { setPage(1); }, [debouncedSearch]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`/customers/${deleteTarget.id}/`);
      toast.success(`${deleteTarget.first_name} ${deleteTarget.last_name} silindi.`);
      setDeleteTarget(null);
      // Sayfada kayıt kalmadıysa bir önceki sayfaya dön
      if (customers.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        fetchCustomers();
      }
    } catch {
      toast.error("Silme işlemi başarısız.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Empty state ────────────────────────────────────────────────────────────
  const isEmpty = !loading && !error && customers.length === 0;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Müşteriler</h1>
        <Link
          to="/customers/new"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors shrink-0"
        >
          <Plus size={16} />
          Yeni Müşteri
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="search"
          placeholder="İsim, e-posta veya şirket ara…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-5 py-4">
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={fetchCustomers}
            className="flex items-center gap-1.5 text-sm font-medium text-red-700 hover:text-red-900 transition-colors"
          >
            <RefreshCw size={14} />
            Tekrar Dene
          </button>
        </div>
      )}

      {/* Table card */}
      {!error && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <CustomerTable
            customers={customers}
            loading={loading}
            onDeleteClick={setDeleteTarget}
          />

          {/* Empty state */}
          {isEmpty && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gray-100">
                <UserX size={24} className="text-gray-400" />
              </div>
              <div className="text-center">
                <p className="text-base font-medium text-gray-700">
                  {debouncedSearch
                    ? `"${debouncedSearch}" için sonuç bulunamadı.`
                    : "Henüz müşteri bulunmuyor."}
                </p>
                {!debouncedSearch && (
                  <p className="text-sm text-gray-400 mt-1">
                    İlk müşterinizi ekleyin.
                  </p>
                )}
              </div>
              {!debouncedSearch && (
                <Link
                  to="/customers/new"
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  <Plus size={15} />
                  Müşteri Oluştur
                </Link>
              )}
            </div>
          )}

          {/* Pagination */}
          {!loading && !isEmpty && count > PAGE_SIZE && (
            <div className="border-t border-gray-100 px-4">
              <Pagination
                count={count}
                page={page}
                pageSize={PAGE_SIZE}
                onPage={setPage}
              />
            </div>
          )}
        </div>
      )}

      {/* Delete modal */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
        customer={deleteTarget}
      />
    </div>
  );
}
