import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Settings, User, CalendarX, CalendarClock, Package, Folder, Tags } from "lucide-react";

export function DirectorLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", href: "/director/dashboard", icon: LayoutDashboard },
    { name: "Today's Queue", href: "/director/queue", icon: CalendarClock },
    { name: "Business Config", href: "/director/services", icon: Settings },
    { name: "Holidays", href: "/director/holidays", icon: CalendarX },
    { name: "Products", href: "/director/inventory/products", icon: Package },
    { name: "Categories", href: "/director/inventory/categories", icon: Folder },
    { name: "Brands", href: "/director/inventory/brands", icon: Tags },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <span className="text-xl font-bold text-white tracking-tight">Director Portal</span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6">
          <nav className="px-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href || (item.href !== "/director" && location.pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-slate-400" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">Clinic Director</p>
              <Link to="/" className="text-xs text-slate-500 hover:text-slate-300 truncate">Back to Home</Link>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

export default DirectorLayout;
