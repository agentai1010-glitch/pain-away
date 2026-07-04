import { ReactNode, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { LayoutDashboard, Users, CalendarPlus, LogOut } from "lucide-react";

export function ReceptionLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("reception_token");
    if (!token && location.pathname !== "/reception/login") {
      navigate("/reception/login");
    }
  }, [location.pathname, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("reception_token");
    navigate("/reception/login");
  };

  const navItems = [
    { label: "Dashboard", href: "/reception/dashboard", icon: LayoutDashboard },
    { label: "New Appointment", href: "/reception/new-appointment", icon: CalendarPlus },
    { label: "Today's Queue", href: "/reception/queue", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r hidden md:flex flex-col">
        <div className="p-6 border-b">
          <h2 className="font-bold text-xl text-primary">Pain Away</h2>
          <p className="text-xs text-slate-500 font-medium">Reception Operations</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item, idx) => (
            <Link key={idx} to={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${location.pathname === item.href && idx === 0 ? "bg-primary/10 text-primary" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}>
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full transition-colors">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b flex items-center px-6 justify-between md:justify-end">
          <h2 className="font-bold text-lg text-primary md:hidden">Pain Away Reception</h2>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-slate-600" />
            </div>
            <span className="text-sm font-medium hidden sm:block">Receptionist</span>
          </div>
        </header>
        <div className="flex-1 p-6 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

// Ensure User icon is available in layout
import { User } from "lucide-react";
