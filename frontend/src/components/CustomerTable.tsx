import { useNavigate } from "react-router-dom";
import { Eye, Trash2, ChevronRight, Building2, Mail, Calendar } from "lucide-react";
import type { CustomerListItem } from "../types/customer";

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {[...Array(5)].map((_, i) => <td key={i} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-3/4" /></td>)}
    </tr>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse p-4 border-b border-gray-100 last:border-0">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-gray-200 rounded w-2/5" />
          <div className="h-3 bg-gray-200 rounded w-3/5" />
          <div className="h-3 bg-gray-200 rounded w-1/3" />
        </div>
        <div className="w-8 h-8 bg-gray-200 rounded-lg shrink-0" />
      </div>
    </div>
  );
}

function CustomerCard({ customer, onDeleteClick, index }: { customer: CustomerListItem; onDeleteClick: (c: CustomerListItem) => void; index: number }) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-3 p-4 border-b border-gray-100 last:border-0 active:bg-gray-50 transition-colors animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/customers/${customer.id}`)}>
        <p className="font-semibold text-gray-900 text-sm truncate">{customer.first_name} {customer.last_name}</p>
        <p className="flex items-center gap-1 text-xs text-gray-500 mt-0.5 truncate"><Mail size={11} className="shrink-0" />{customer.email}</p>
        {customer.company && <p className="flex items-center gap-1 text-xs text-gray-400 mt-0.5 truncate"><Building2 size={11} className="shrink-0" />{customer.company}</p>}
        <p className="flex items-center gap-1 text-xs text-gray-300 mt-0.5"><Calendar size={11} className="shrink-0" />{formatDate(customer.created_at)}</p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={() => onDeleteClick(customer)} className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" aria-label="Sil"><Trash2 size={16} /></button>
        <button onClick={() => navigate(`/customers/${customer.id}`)} className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" aria-label="Detay"><ChevronRight size={16} /></button>
      </div>
    </div>
  );
}

interface CustomerTableProps { customers: CustomerListItem[]; loading: boolean; onDeleteClick: (c: CustomerListItem) => void; }

export default function CustomerTable({ customers, loading, onDeleteClick }: CustomerTableProps) {
  const navigate = useNavigate();
  return (
    <>
      <div className="md:hidden">
        {loading ? [...Array(6)].map((_, i) => <SkeletonCard key={i} />) : customers.map((c, i) => <CustomerCard key={c.id} customer={c} onDeleteClick={onDeleteClick} index={i} />)}
      </div>
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {["Ad Soyad","E-posta",null,null,"İşlemler"].map((h, i) => (
                <th key={i} className={["text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide", i===2?"hidden lg:table-cell":"", i===3?"hidden xl:table-cell":""].join(" ")}>
                  {h ?? (i===2?"Şirket":"Kayıt Tarihi")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? [...Array(8)].map((_, i) => <SkeletonRow key={i} />) : customers.map((c, index) => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors group animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                <td className="px-4 py-3 font-medium text-gray-900">{c.first_name} {c.last_name}</td>
                <td className="px-4 py-3 text-gray-600 truncate max-w-[200px]">{c.email}</td>
                <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{c.company || <span className="text-gray-300">—</span>}</td>
                <td className="px-4 py-3 text-gray-400 hidden xl:table-cell">{formatDate(c.created_at)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => navigate(`/customers/${c.id}`)} title="Detay" className="p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Eye size={16} /></button>
                    <button onClick={() => onDeleteClick(c)} title="Sil" className="p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
