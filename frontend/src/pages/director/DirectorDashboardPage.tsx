import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Settings, BarChart3, Users, CalendarX, Search, Calendar, Loader2, Phone, ArrowRight, AlertCircle, CalendarClock } from "lucide-react";
import DirectorLayout from "./DirectorLayout";
import { useSearchAppointments } from "@/services/reception";

export function DirectorDashboardPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  
  const { data: appointments, isLoading: searchLoading, error: searchError } = useSearchAppointments(query, dateFilter);
  const actions = [
    { title: "Service & Package Config", description: "Manage clinic offerings and pricing.", icon: Settings, color: "bg-blue-100 text-blue-600", to: "/director/services" },
    { title: "Today's Appointments", description: "View and manage today's appointment schedule.", icon: CalendarClock, color: "bg-amber-100 text-amber-600", to: "/director/queue" },
    { title: "Holiday Management", description: "Configure future clinic closure dates.", icon: CalendarX, color: "bg-red-100 text-red-600", to: "/director/holidays" },
    { title: "Financial Reports", description: "View revenue and billing snapshots.", icon: BarChart3, color: "bg-green-100 text-green-600", to: "/director" },
  ];

  return (
    <DirectorLayout>
      <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Director Dashboard</h1>
          <p className="text-slate-500 mt-2">Welcome to the central command for clinic operations.</p>
        </div>

        <div className="space-y-8 animate-fade-in pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {actions.map((action, idx) => (
            <Link key={idx} to={action.to} className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer group block outline-none focus:ring-2 focus:ring-primary/20">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${action.color}`}>
                <action.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">{action.title}</h3>
              <p className="text-sm text-slate-500">{action.description}</p>
            </Link>
          ))}
        </div>

        <div className="pt-8 border-t border-slate-200">
          <h2 className="text-2xl font-bold tracking-tight mb-2 text-slate-900">Today's Appointments</h2>
          <p className="text-slate-500 mb-6">Search and manage clinic appointments</p>
          
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-4 border border-slate-300 rounded-2xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-lg transition-shadow shadow-sm"
              placeholder="Search by mobile number or partial name (min 3 chars)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {searchLoading && (
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <Loader2 className="h-5 w-5 text-primary animate-spin" />
              </div>
            )}
          </div>

          {searchError && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl flex items-center gap-3 mb-6">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm font-medium">Failed to search appointments. Please try again.</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 mb-4 items-center justify-between">
            <h3 className="font-semibold text-lg text-slate-800">Appointments List</h3>
            <div className="flex items-center gap-2">
              <label htmlFor="dateFilter" className="text-sm font-medium text-slate-500">Filter by Date:</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="date"
                  id="dateFilter"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-shadow"
                />
              </div>
              {dateFilter && (
                <button
                  onClick={() => setDateFilter("")}
                  className="text-xs text-slate-500 hover:text-slate-800 underline ml-2"
                >
                  Clear Date
                </button>
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Date & Time</th>
                    <th className="px-6 py-4">Patient Name</th>
                    <th className="px-6 py-4">Mobile Number</th>
                    <th className="px-6 py-4">Service</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {searchLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                        <span className="text-slate-500">Loading appointments...</span>
                      </td>
                    </tr>
                  ) : !appointments || appointments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <Search className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                        <p className="text-base font-medium text-slate-700">No appointments found</p>
                        <p className="text-slate-500 text-sm mt-1">
                          {query || dateFilter 
                            ? "Try adjusting your search query or date filter." 
                            : "There are currently no appointments to display."}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    appointments.map((apt) => (
                      <tr 
                        key={apt.appointment_id} 
                        className="hover:bg-slate-50 transition-colors group cursor-pointer"
                        onClick={() => navigate(`/director/patient/${apt.patient_id}`)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-slate-900">{apt.date}</div>
                          <div className="text-slate-500 text-xs mt-0.5">{apt.slot_time}</div>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-900">
                          {apt.patient_name}
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5" />
                            {apt.mobile_number}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                            {apt.service_name}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                            apt.status === 'BOOKED' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            apt.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-200' :
                            apt.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {apt.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            className="text-primary font-medium text-sm inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/director/patient/${apt.patient_id}`);
                            }}
                          >
                            Workspace <ArrowRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      </div>
    </DirectorLayout>
  );
}

export default DirectorDashboardPage;
