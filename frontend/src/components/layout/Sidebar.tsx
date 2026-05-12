import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, TrendingUp, Columns3, LogOut, Briefcase } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../ui/Avatar";

const NAV_LINKS = [
  { to: "/",              icon: LayoutDashboard, label: "Dashboard",  end: true  },
  { to: "/customers",     icon: Users,           label: "Müşteriler", end: false },
  { to: "/opportunities", icon: TrendingUp,      label: "Fırsatlar",  end: false },
  { to: "/kanban",        icon: Columns3,        label: "Kanban",     end: false },
] as const;

interface NavItemProps { to: string; icon: typeof LayoutDashboard; label: string; end?: boolean; onClick?: () => void; }
function NavItem({ to, icon: Icon, label, end = false, onClick }: NavItemProps) {
  return (
    <NavLink to={to} end={end} onClick={onClick} className={({ isActive }) => ["flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors", isActive ? "bg-indigo-50 text-indigo-700" : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"].join(" ")}>
      <Icon size={18} className="shrink-0" />{label}
    </NavLink>
  );
}

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate("/login"); };
  const displayName = user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : user?.username ?? "";

  return (
    <div className="flex flex-col h-full bg-white border-r border-neutral-200">
      <div className="flex items-center gap-2.5 px-5 py-5 shrink-0">
        <div className="flex items-center justify-center w-8 h-8 bg-indigo-600 rounded-lg shrink-0"><Briefcase size={16} className="text-white" /></div>
        <span className="text-base font-bold text-neutral-900 leading-none">Mini CRM</span>
      </div>
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {NAV_LINKS.map((link) => <NavItem key={link.to} {...link} onClick={onClose} />)}
      </nav>
      <div className="shrink-0 border-t border-neutral-200 px-3 py-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
          <Avatar name={displayName} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-neutral-900 truncate">{displayName}</p>
            {user?.email && <p className="text-xs text-neutral-400 truncate">{user.email}</p>}
          </div>
        </div>
        <button onClick={handleLogout} className="mt-1 flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium text-neutral-600 hover:bg-red-50 hover:text-red-600 transition-colors">
          <LogOut size={16} />Çıkış Yap
        </button>
      </div>
    </div>
  );
}
