import { useNavigate } from "react-router-dom";

function formatDate(iso) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit", month: "short", year: "numeric",
  }).format(new Date(iso));
}

export default function RecentCustomersTable({ customers = [] }) {
  const navigate = useNavigate();

  if (customers.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-gray-400">
        Henüz müşteri eklenmemiş.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Ad Soyad
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              E-posta
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">
              Şirket
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">
              Eklenme Tarihi
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {customers.map((c) => (
            <tr
              key={c.id}
              onClick={() => navigate(`/customers/${c.id}`)}
              className="hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <td className="px-4 py-3 font-medium text-gray-900">
                {c.first_name} {c.last_name}
              </td>
              <td className="px-4 py-3 text-gray-600 truncate max-w-[180px]">
                {c.email}
              </td>
              <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">
                {c.company || <span className="text-gray-300">—</span>}
              </td>
              <td className="px-4 py-3 text-gray-400 hidden md:table-cell">
                {formatDate(c.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
