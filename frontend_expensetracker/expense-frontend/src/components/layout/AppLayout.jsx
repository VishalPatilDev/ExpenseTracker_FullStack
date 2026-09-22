import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { useEffect } from "react";
import {
  LayoutDashboard,
  PlusCircle,
  List,
  Settings,
  LogOut,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/utils/cn";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/expense", label: "Add Expense", icon: PlusCircle },
  { to: "/list", label: "Transactions", icon: List },
  { to: "/net-worth", label: "Net Worth", icon: TrendingUp },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/assets", label: "Assets", icon: PlusCircle },
  { to: "/liabilities", label: "Liabilities", icon: PlusCircle }

];

export default function AppLayout({ children }) {
  const { logout } = useAuth();
  const { loaded, refresh } = useSettings();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loaded) refresh();
  }, [loaded, refresh]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-slate-800 flex flex-col py-6 px-4 gap-1 sticky top-0 h-screen">
        <span className="text-lg font-semibold text-white mb-6 px-2 tracking-tight">
          FinTrack
        </span>

        <nav className="flex flex-col gap-1 flex-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-indigo-600 text-white font-medium"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                )
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors mt-auto"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 p-6 overflow-auto">{children}</main>
    </div>
  );
}