import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  count:    number;
  page:     number;
  pageSize?: number;
  onPage:   (page: number) => void;
}

export default function Pagination({ count, page, pageSize = 10, onPage }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(count / pageSize));
  return (
    <div className="flex items-center justify-between px-1 py-3 text-sm text-gray-600">
      <span>
        Sayfa <span className="font-medium">{page}</span> /{" "}
        <span className="font-medium">{totalPages}</span>{" "}
        <span className="text-gray-400">({count} kayıt)</span>
      </span>
      <div className="flex items-center gap-2">
        <button
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={15} />Önceki
        </button>
        <button
          disabled={page >= totalPages}
          onClick={() => onPage(page + 1)}
          className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Sonraki<ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
