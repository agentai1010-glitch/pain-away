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
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <p className="text-gray-500 font-medium">Loading Dashboard...</p>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <p className="text-red-500 font-medium mb-4">Failed to load dashboard.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-[#2563eb] text-white rounded hover:bg-blue-600 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Welcome Section */}
      <div className="bg-[#1e3a8a] text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Welcome back, {dashboard.patient_name}
          </h1>
          <p className="text-blue-200">
            {dashboard.mobile_number}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-10">
        
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Link to="/catalog" className="bg-white text-[#2563eb] font-semibold py-3 px-6 rounded-lg shadow hover:shadow-md transition">
            Book Appointment
          </Link>
          <Link to="/services" className="bg-white text-gray-700 font-semibold py-3 px-6 rounded-lg shadow hover:shadow-md transition">
            Browse Services
          </Link>
          <Link to="/products" className="bg-white text-gray-700 font-semibold py-3 px-6 rounded-lg shadow hover:shadow-md transition">
            Browse Products
          </Link>
        </div>

        {/* Quick Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Upcoming Appointment</h3>
              {dashboard.upcoming_appointment_date ? (
                <>
                  <p className="text-xl font-bold text-gray-900">{dashboard.upcoming_appointment_date}</p>
                  <p className="text-gray-600 text-sm">{dashboard.upcoming_appointment_time}</p>
                </>
              ) : (
                <p className="text-gray-900 font-medium">None scheduled</p>
              )}
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Total Appointments</h3>
              <p className="text-3xl font-bold text-gray-900">{dashboard.total_appointments}</p>
            </div>
            <Link to="#" className="text-[#2563eb] text-sm font-medium mt-4 hover:underline">View History →</Link>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Total Orders</h3>
              <p className="text-3xl font-bold text-gray-900">{dashboard.total_orders}</p>
            </div>
            <Link to="#" className="text-[#2563eb] text-sm font-medium mt-4 hover:underline">View Orders →</Link>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Billing Documents</h3>
              <p className="text-3xl font-bold text-gray-900">{dashboard.available_bills + dashboard.available_receipts}</p>
            </div>
            <Link to="#" className="text-[#2563eb] text-sm font-medium mt-4 hover:underline">View Receipts & Bills →</Link>
          </div>
          
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
          
          {dashboard.recent_activity.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
              <p className="text-gray-500 mb-4">No recent activity to show.</p>
              <Link to="/catalog" className="text-[#2563eb] font-medium hover:underline">Book your first appointment</Link>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <ul className="divide-y divide-gray-100">
                {dashboard.recent_activity.map((activity, index) => {
                  
                  // Simple icon coloring based on activity type
                  let dotColor = "bg-gray-400";
                  if (activity.activity_type === "APPOINTMENT") dotColor = "bg-blue-500";
                  if (activity.activity_type === "ORDER") dotColor = "bg-green-500";
                  if (activity.activity_type === "RECEIPT" || activity.activity_type === "BILL") dotColor = "bg-purple-500";
                  
                  return (
                    <li key={index} className="p-6 flex items-start">
                      <div className={`w-3 h-3 rounded-full mt-2 mr-4 flex-shrink-0 ${dotColor}`}></div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{activity.title}</h4>
                        <p className="text-gray-600 mt-1">{activity.description}</p>
                        <p className="text-gray-400 text-sm mt-2">
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
