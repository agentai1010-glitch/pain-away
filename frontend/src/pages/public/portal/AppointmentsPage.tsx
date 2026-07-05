import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { usePatientAppointments, PatientAppointmentResponse } from "@/services/patient-portal";

export default function AppointmentsPage() {
  const navigate = useNavigate();
  const { data: appointments = [], isLoading, error } = usePatientAppointments();
  
  const [activeTab, setActiveTab] = useState<"UPCOMING" | "COMPLETED" | "CANCELLED">("UPCOMING");
  const [selectedAppt, setSelectedAppt] = useState<PatientAppointmentResponse | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("patient_token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <p className="text-gray-500 font-medium">Loading Appointments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <p className="text-red-500 font-medium mb-4">Failed to load appointments.</p>
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

  const upcomingAppts = appointments.filter(a => a.status === "BOOKED");
  const completedAppts = appointments.filter(a => a.status === "COMPLETED");
  const cancelledAppts = appointments.filter(a => a.status === "CANCELLED" || a.status === "NO_SHOW");

  let displayAppts = upcomingAppts;
  if (activeTab === "COMPLETED") displayAppts = completedAppts;
  if (activeTab === "CANCELLED") displayAppts = cancelledAppts;

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="bg-[#1e3a8a] text-white py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">My Appointments</h1>
          <p className="text-blue-200">View and manage your appointment history.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-8">
        
        {/* Tabs */}
        <div className="flex space-x-2 mb-6 border-b border-gray-200">
          <button 
            className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors ${activeTab === 'UPCOMING' ? 'border-[#2563eb] text-[#2563eb]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab("UPCOMING")}
          >
            Upcoming ({upcomingAppts.length})
          </button>
          <button 
            className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors ${activeTab === 'COMPLETED' ? 'border-[#2563eb] text-[#2563eb]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab("COMPLETED")}
          >
            Completed ({completedAppts.length})
          </button>
          <button 
            className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors ${activeTab === 'CANCELLED' ? 'border-[#2563eb] text-[#2563eb]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab("CANCELLED")}
          >
            Cancelled ({cancelledAppts.length})
          </button>
        </div>

        {/* Content */}
        {displayAppts.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm text-center">
            <p className="text-gray-500 mb-4">You have no {activeTab.toLowerCase()} appointments.</p>
            {activeTab === "UPCOMING" && (
              <Link to="/catalog" className="text-[#2563eb] font-medium hover:underline">
                Book a new appointment
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {displayAppts.map(appt => (
              <div key={appt.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 transition hover:shadow-md">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{appt.service_name}</h3>
                    <p className="text-gray-600 mt-1">
                      {new Date(appt.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {appt.time.substring(0, 5)}
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${appt.status === 'BOOKED' ? 'bg-blue-100 text-blue-800' : appt.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {appt.status.replace("_", " ")}
                      </span>
                      <span className="text-xs text-gray-400">Booked on {new Date(appt.booking_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 md:mt-0 flex flex-col items-end gap-2">
                    <button 
                      onClick={() => setSelectedAppt(appt)}
                      className="text-sm font-medium text-[#2563eb] hover:underline"
                    >
                      View Details
                    </button>
                    {appt.status === "BOOKED" && appt.receipt_number && (
                      <span className="text-xs text-gray-500">Receipt: {appt.receipt_number}</span>
                    )}
                    {appt.status === "COMPLETED" && appt.final_bill_number && (
                      <span className="text-xs text-gray-500">Bill: {appt.final_bill_number}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Details Modal */}
      {selectedAppt && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">Appointment Details</h3>
              <button onClick={() => setSelectedAppt(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500">Service</p>
                <p className="font-semibold text-gray-900">{selectedAppt.service_name}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium text-gray-900">{selectedAppt.date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="font-medium text-gray-900">{selectedAppt.time.substring(0,5)}</p>
                </div>
              </div>
              
              <hr className="border-gray-100 my-2" />
              
              <div>
                <p className="text-sm text-gray-500">Financial Snapshot</p>
                <div className="bg-gray-50 p-4 rounded-lg mt-2">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Advance Paid:</span>
                    <span className="font-medium text-gray-900">₹ {selectedAppt.advance_paid}</span>
                  </div>
                  {selectedAppt.remaining_amount !== null && (
                    <div className="flex justify-between text-red-600 font-medium">
                      <span className="text-sm">Balance Due:</span>
                      <span>₹ {selectedAppt.remaining_amount}</span>
                    </div>
                  )}
                  {selectedAppt.receipt_number && (
                    <div className="flex justify-between mt-3 pt-3 border-t border-gray-200">
                      <span className="text-sm text-gray-600">Booking Receipt:</span>
                      <span className="text-sm font-medium">{selectedAppt.receipt_number}</span>
                    </div>
                  )}
                  {selectedAppt.final_bill_number && (
                    <div className="flex justify-between mt-1">
                      <span className="text-sm text-gray-600">Final Bill:</span>
                      <span className="text-sm font-medium">{selectedAppt.final_bill_number}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-4 bg-blue-50 text-blue-800 text-sm p-3 rounded flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                <p>To reschedule or cancel this appointment, please contact the clinic directly.</p>
              </div>
              
            </div>
            
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button 
                onClick={() => setSelectedAppt(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded hover:bg-gray-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
