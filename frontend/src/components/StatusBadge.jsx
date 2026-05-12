const colors = {
  lead: "bg-yellow-100 text-yellow-800",
  prospect: "bg-blue-100 text-blue-800",
  customer: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-600",
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
        colors[status] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}
