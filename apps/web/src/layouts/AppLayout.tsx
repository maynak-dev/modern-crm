import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth";
import {
  LayoutDashboard, Users, Building2, Briefcase, CheckSquare, Activity, Settings, LogOut, Sparkles,
} from "lucide-react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/contacts", label: "Contacts", icon: Users },
  { to: "/companies", label: "Companies", icon: Building2 },
  { to: "/deals", label: "Deals", icon: Briefcase },
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/activity", label: "Activity", icon: Activity },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const nav2 = useNavigate();

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 shrink-0 border-r border-bg-border bg-bg-soft/60 backdrop-blur-sm p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-7 px-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand to-brand-glow flex items-center justify-center shadow-glow">
            <Sparkles size={16} className="text-white" />
          </div>
          <div className="font-display font-semibold tracking-tight">Pulse CRM</div>
        </div>

        <nav className="space-y-1 flex-1">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ${
                  isActive
                    ? "bg-brand/15 text-white border border-brand/30 shadow-glow"
                    : "text-ink-muted hover:text-ink hover:bg-bg-panel border border-transparent"
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto pt-4 border-t border-bg-border">
          <div className="flex items-center gap-2 px-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-soft to-brand-glow text-white flex items-center justify-center text-xs font-semibold">
              {user?.name?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{user?.name}</div>
              <div className="text-[11px] text-ink-faint truncate">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={() => { logout(); nav2("/login"); }}
            className="btn-ghost w-full justify-start text-ink-muted"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 p-8">
        <Outlet />
      </main>
    </div>
  );
}
