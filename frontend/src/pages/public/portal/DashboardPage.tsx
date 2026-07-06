import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { usePatientDashboard } from "@/services/patient-portal";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: dashboard, isLoading, error } = usePatientDashboard();

  useEffect(() => {
    const token = localStorage.getItem("patient_token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="w-full min-h-screen font-sans pb-24 pt-28 md:pt-36 bg-cover bg-center bg-no-repeat bg-fixed relative flex items-center justify-center" style={{ backgroundImage: "url('/images/products-bg.png')" }}>
        <div className="absolute inset-0 bg-blue-950/40 backdrop-blur-[2px] pointer-events-none" />
        <div className="relative z-10 text-center">
          <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-200 font-medium text-lg">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="w-full min-h-screen font-sans pb-24 pt-28 md:pt-36 bg-cover bg-center bg-no-repeat bg-fixed relative flex items-center justify-center" style={{ backgroundImage: "url('/images/products-bg.png')" }}>
        <div className="absolute inset-0 bg-blue-950/40 backdrop-blur-[2px] pointer-events-none" />
        <div className="relative z-10 text-center bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 shadow-2xl max-w-md w-full mx-4">
          <p className="text-red-300 font-medium mb-4 text-lg">Failed to load dashboard.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition font-semibold shadow-lg border border-blue-400/30"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen font-sans pb-24 pt-28 md:pt-36 px-4 md:px-12 lg:px-24 bg-cover bg-center bg-no-repeat bg-fixed relative" style={{ backgroundImage: "url('/images/products-bg.png')" }}>
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-blue-950/40 backdrop-blur-[2px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 text-white mt-4">
        {/* Welcome Section Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-8 md:p-12 mb-8 shadow-2xl flex justify-between items-center flex-wrap gap-6">
          <div>
            <span className="px-3.5 py-1 bg-blue-500/30 border border-blue-300/30 rounded-full text-xs font-semibold text-blue-200 uppercase tracking-wider mb-3 inline-block">
              Patient Portal
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-sm mb-2">
              Welcome back, {dashboard.patient_name}
            </h1>
            <p className="text-slate-200 text-lg flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              {dashboard.mobile_number}
            </p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("patient_token");
              localStorage.removeItem("patient_id");
              window.dispatchEvent(new Event("patient_auth_changed"));
              navigate("/");
            }}
            className="bg-red-500/80 hover:bg-red-500 text-white px-6 py-3 rounded-xl transition-all font-semibold border border-red-400/30 shadow-lg backdrop-blur-md"
          >
            Sign Out
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4 mb-10">
          <Link to="/catalog" className="bg-blue-600/90 hover:bg-blue-500 text-white font-bold py-3.5 px-8 rounded-2xl shadow-xl border border-blue-400/30 transition-all flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>
            Book Appointment
          </Link>
          <Link to="/services" className="bg-white/15 hover:bg-white/25 text-white font-semibold py-3.5 px-8 rounded-2xl shadow-lg border border-white/20 backdrop-blur-md transition-all flex items-center gap-2">
            Browse Services
          </Link>
          <Link to="/products" className="bg-white/15 hover:bg-white/25 text-white font-semibold py-3.5 px-8 rounded-2xl shadow-lg border border-white/20 backdrop-blur-md transition-all flex items-center gap-2">
            Browse Products
          </Link>
        </div>

        {/* Quick Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          
          <div className="bg-white/10 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-white/20 shadow-xl flex flex-col justify-between hover:bg-white/15 transition-all">
            <div>
              <span className="text-xs font-bold text-blue-300 uppercase tracking-wider block mb-2">Next Visit</span>
              <h3 className="text-slate-300 text-sm font-medium mb-1">Upcoming Appointment</h3>
              {dashboard.upcoming_appointment_date ? (
                <div className="mt-2">
                  <p className="text-2xl font-extrabold text-white">{dashboard.upcoming_appointment_date}</p>
                  <p className="text-blue-200 text-sm mt-1 flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    {dashboard.upcoming_appointment_time}
                  </p>
                </div>
              ) : (
                <p className="text-slate-300 font-medium mt-3">None scheduled</p>
              )}
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-white/20 shadow-xl flex flex-col justify-between hover:bg-white/15 transition-all">
            <div>
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider block mb-2">History</span>
              <h3 className="text-slate-300 text-sm font-medium mb-1">Total Appointments</h3>
              <p className="text-4xl font-extrabold text-white mt-2">{dashboard.total_appointments}</p>
            </div>
            <Link to="/portal/appointments" className="text-blue-300 hover:text-white text-sm font-semibold mt-6 flex items-center gap-1 transition-colors">View History →</Link>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-white/20 shadow-xl flex flex-col justify-between hover:bg-white/15 transition-all">
            <div>
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block mb-2">Products</span>
              <h3 className="text-slate-300 text-sm font-medium mb-1">Total Orders</h3>
              <p className="text-4xl font-extrabold text-white mt-2">{dashboard.total_orders}</p>
            </div>
            <Link to="/portal/orders" className="text-blue-300 hover:text-white text-sm font-semibold mt-6 flex items-center gap-1 transition-colors">View Orders →</Link>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-white/20 shadow-xl flex flex-col justify-between hover:bg-white/15 transition-all">
            <div>
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block mb-2">Finance</span>
              <h3 className="text-slate-300 text-sm font-medium mb-1">Billing Documents</h3>
              <p className="text-4xl font-extrabold text-white mt-2">{dashboard.available_bills + dashboard.available_receipts}</p>
            </div>
            <Link to="/portal/documents" className="text-blue-300 hover:text-white text-sm font-semibold mt-6 flex items-center gap-1 transition-colors">View Receipts & Bills →</Link>
          </div>
          
        </div>

        {/* Recent Activity */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-8 tracking-tight drop-shadow-sm">Recent Activity</h2>
          
          {dashboard.recent_activity.length === 0 ? (
            <div className="bg-white/5 rounded-2xl p-8 text-center border border-white/10">
              <p className="text-slate-300 mb-4 text-lg">No recent activity to show.</p>
              <Link to="/catalog" className="text-blue-300 font-bold hover:underline">Book your first appointment →</Link>
            </div>
          ) : (
            <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
              <ul className="divide-y divide-white/10">
                {dashboard.recent_activity.map((activity, index) => {
                  let dotColor = "bg-slate-400";
                  if (activity.activity_type === "APPOINTMENT") dotColor = "bg-blue-400 shadow-lg shadow-blue-400/50";
                  if (activity.activity_type === "ORDER") dotColor = "bg-emerald-400 shadow-lg shadow-emerald-400/50";
                  if (activity.activity_type === "RECEIPT" || activity.activity_type === "BILL") dotColor = "bg-purple-400 shadow-lg shadow-purple-400/50";
                  
                  return (
                    <li key={index} className="p-6 flex items-start hover:bg-white/5 transition-colors">
                      <div className={`w-3.5 h-3.5 rounded-full mt-1.5 mr-4 flex-shrink-0 ${dotColor}`}></div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-white">{activity.title}</h4>
                        <p className="text-slate-200 mt-1">{activity.description}</p>
                        <p className="text-slate-400 text-xs mt-2 font-mono">
                          {activity.timestamp ? new Date(activity.timestamp).toLocaleString() : ""}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
