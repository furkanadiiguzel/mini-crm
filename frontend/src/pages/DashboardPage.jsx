import { useEffect, useState } from "react";
import { Users, UserCheck, TrendingUp, UserX } from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { customerService } from "../services/api";

const STATUS_COLORS = {
  lead: "#f59e0b",
  prospect: "#3b82f6",
  customer: "#10b981",
  inactive: "#9ca3af",
};

const STAT_CARDS = [
  { key: "total", label: "Total Customers", icon: Users, color: "text-blue-600 bg-blue-50" },
  { key: "customer", label: "Active Customers", icon: UserCheck, color: "text-green-600 bg-green-50" },
  { key: "prospect", label: "Prospects", icon: TrendingUp, color: "text-yellow-600 bg-yellow-50" },
  { key: "inactive", label: "Inactive", icon: UserX, color: "text-gray-500 bg-gray-100" },
];

export default function DashboardPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    customerService.stats().then(({ data }) => setStats(data));
  }, []);

  const pieData = stats
    ? Object.entries(stats.by_status).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Dashboard</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ key, label, icon: Icon, color }) => (
          <div key={key} className="card flex items-center gap-4">
            <div className={`p-3 rounded-lg ${color}`}>
              <Icon size={22} />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {stats ? (key === "total" ? stats.total : stats.by_status[key] ?? 0) : "—"}
              </p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {pieData.length > 0 && (
        <div className="card">
          <h3 className="text-base font-semibold mb-4">Customers by Status</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {pieData.map(({ name }) => (
                  <Cell key={name} fill={STATUS_COLORS[name] ?? "#6b7280"} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
