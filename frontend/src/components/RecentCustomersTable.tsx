import { Link, useNavigate } from "react-router-dom";
import Avatar from "./ui/Avatar";
import type { CustomerListItem } from "../types/customer";

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "az önce";
  if (mins < 60) return `${mins} dakika önce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} saat önce`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} gün önce`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} ay önce`;
  return `${Math.floor(months / 12)} yıl önce`;
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-5 py-3 animate-pulse">
      <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 bg-gray-200 rounded w-1/3" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
      <div className="h-3 bg-gray-200 rounded w-14 shrink-0" />
    </div>
  );
}

interface RecentCustomersTableProps { customers?: CustomerListItem[]; loading?: boolean; }

export default function RecentCustomersTable({ customers = [], loading = false }: RecentCustomersTableProps) {
  const navigate = useNavigate();
  if (loading) return <div className="divide-y divide-gray-50">{[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}</div>;
  if (customers.length === 0) return <div className="py-10 text-center text-sm text-gray-400">Henüz müşteri eklenmemiş.</div>;

  return (
    <div className="divide-y divide-gray-50">
      {customers.map((c, index) => {
        const fullName = `${c.first_name} ${c.last_name}`;
        return (
          <div key={c.id} onClick={() => navigate(`/customers/${c.id}`)}
            className="flex items-center gap-3 px-5 py-3 hover:bg-neutral-50 cursor-pointer transition-colors group animate-fade-in"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <Avatar name={fullName} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-neutral-900 truncate group-hover:text-indigo-700 transition-colors">{fullName}</p>
              <p className="text-xs text-neutral-400 truncate">{c.email}</p>
            </div>
            <span className="text-xs text-neutral-400 shrink-0 tabular-nums">{relativeTime(c.created_at)}</span>
          </div>
        );
      })}
      <div className="px-5 py-3">
        <Link to="/customers" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">Tüm müşterileri gör →</Link>
      </div>
    </div>
  );
}
