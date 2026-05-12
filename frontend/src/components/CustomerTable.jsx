import { useNavigate } from "react-router-dom";
import { Eye, Trash2 } from "lucide-react";

const formatDate = (iso) =>
  new Intl.DateTimeFormat("tr-TR", {
    day: "numeric", month: "long", year: "numeric",
  }).format(new Date(iso));

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {[...Array(5)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </td>
      ))}
    </tr>
  );
}

export default function CustomerTable({ customers, loading, onDeleteClick }) {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide rounded-tl-xl">
              Ad Soyad
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              E-posta
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">
              Şirket
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">
              Kayıt Tarihi
            </th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide rounded-tr-xl">
              İşlemler
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {loading ? (
            [...Array(8)].map((_, i) => <SkeletonRow key={i} />)
          ) : customers.length === 0 ? null : (
            customers.map((c) => (
              <tr
                key={c.id}
                className="hover:bg-gray-50 transition-colors group"
              >
                <td className="px-4 py-3 font-medium text-gray-900">
                  {c.first_name} {c.last_name}
                </td>
                <td className="px-4 py-3 text-gray-600 truncate max-w-[200px]">
                  {c.email}
                </td>
                <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">
                  {c.company || <span className="text-gray-300">—</span>}
                </td>
                <td className="px-4 py-3 text-gray-400 hidden md:table-cell">
                  {formatDate(c.created_at)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => navigate(`/customers/${c.id}`)}
                      title="Detay"
                      className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => onDeleteClick(c)}
                      title="Sil"
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
