import type { HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from "react";

function Table({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={`w-full text-sm ${className}`}>{children}</table>
    </div>
  );
}
function Head({ children }: { children?: ReactNode }) {
  return <thead className="bg-neutral-50 border-b border-neutral-200">{children}</thead>;
}
function HeadCell({ children, className = "", ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={`px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider ${className}`} {...props}>
      {children}
    </th>
  );
}
function Body({ children }: { children?: ReactNode }) {
  return <tbody className="bg-white divide-y divide-neutral-100">{children}</tbody>;
}
interface RowProps extends HTMLAttributes<HTMLTableRowElement> { children?: ReactNode; }
function Row({ children, onClick, className = "", ...props }: RowProps) {
  return (
    <tr
      onClick={onClick}
      className={["border-b border-neutral-100 transition-colors hover:bg-neutral-50", onClick ? "cursor-pointer" : "", className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </tr>
  );
}
function Cell({ children, className = "", ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={`px-6 py-4 text-neutral-700 ${className}`} {...props}>{children}</td>;
}

Table.Head = Head; Table.HeadCell = HeadCell; Table.Body = Body; Table.Row = Row; Table.Cell = Cell;
export default Table;
