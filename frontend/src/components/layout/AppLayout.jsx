import { useState, useEffect, useRef } from "react";
import { useLocation, NavLink } from "react-router-dom";
import { Menu, LayoutDashboard, Users, TrendingUp, Columns3 } from "lucide-react";
import Sidebar from "./Sidebar";
import BackToTop from "../BackToTop";

const BOTTOM_NAV = [
  { to: "/",              icon: LayoutDashboard, label: "Anasayfa", end: true },
  { to: "/customers",     icon: Users,           label: "Müşteriler"          },
  { to: "/opportunities", icon: TrendingUp,      label: "Fırsatlar"           },
  { to: "/kanban",        icon: Columns3,        label: "Kanban"              },
];

const SIDEBAR_W = 256; // px — must match w-64

export default function AppLayout({ children }) {
  const [mobileOpen, setMobileOpen]       = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const location    = useLocation();
  const mainRef     = useRef(null);
  const lastScrollY = useRef(0);

  // Close mobile sidebar on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Prevent body scroll when overlay is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // Hide/show mobile header on scroll
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const onScroll = () => {
      const y = el.scrollTop;
      const delta = y - lastScrollY.current;
      if (Math.abs(delta) > 8) {
        setHeaderVisible(delta < 0 || y < 60);
        lastScrollY.current = y;
      }
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="flex h-screen bg-neutral-50 overflow-hidden">

      {/* ── Desktop sidebar ───────────────────────────────────────── */}
      <aside
        style={{ width: SIDEBAR_W }}
        className="hidden lg:flex lg:flex-col shrink-0"
      >
        <Sidebar />
      </aside>

      {/* ── Mobile overlay sidebar ────────────────────────────────── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <div
            style={{ width: SIDEBAR_W }}
            className="relative z-50 flex flex-col animate-[slide-in_200ms_ease-out]"
          >
            <Sidebar onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* ── Main column ───────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Mobile top bar — hides on scroll down */}
        <header
          className={[
            "lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-neutral-200 shrink-0",
            "transition-transform duration-200",
            headerVisible ? "translate-y-0" : "-translate-y-full",
          ].join(" ")}
        >
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 transition-colors"
            aria-label="Menüyü aç"
          >
            <Menu size={20} />
          </button>
          <span className="text-base font-bold text-neutral-900">Mini CRM</span>
        </header>

        {/* Scrollable content — extra bottom padding on mobile for bottom nav */}
        <main ref={mainRef} className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 sm:pb-8">
            {children}
          </div>
        </main>
      </div>

      {/* ── Mobile bottom navigation bar ─────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-neutral-200 flex">
        {BOTTOM_NAV.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                "flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] text-[10px] font-medium transition-colors",
                isActive ? "text-indigo-600" : "text-neutral-500",
              ].join(" ")
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} className={isActive ? "text-indigo-600" : "text-neutral-400"} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <BackToTop scrollContainer={mainRef} />
    </div>
  );
}
