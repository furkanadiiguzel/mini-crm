function Table({ children, className = "" }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={`w-full text-sm ${className}`}>
        {children}
      </table>
    </div>
  );
}

function Head({ children }) {
  return (
    <thead className="bg-neutral-50 border-b border-neutral-200">
      {children}
    </thead>
  );
}

function HeadCell({ children, className = "", ...props }) {
  return (
    <th
      className={`px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider ${className}`}
      {...props}
    >
      {children}
    </th>
  );
}

function Body({ children }) {
  return (
    <tbody className="bg-white divide-y divide-neutral-100">
      {children}
    </tbody>
  );
}

function Row({ children, onClick, className = "" }) {
  return (
    <tr
      onClick={onClick}
      className={[
        "border-b border-neutral-100 transition-colors",
        onClick ? "hover:bg-neutral-50 cursor-pointer" : "hover:bg-neutral-50",
        className,
      ].join(" ")}
    >
      {children}
    </tr>
  );
}

function Cell({ children, className = "", ...props }) {
  return (
    <td className={`px-6 py-4 text-neutral-700 ${className}`} {...props}>
      {children}
    </td>
  );
}

Table.Head     = Head;
Table.HeadCell = HeadCell;
Table.Body     = Body;
Table.Row      = Row;
Table.Cell     = Cell;

export default Table;
