import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePatientWorkspace, useCancelAppointment } from "@/services/reception";
import { ReceptionLayout } from "./ReceptionLayout";
import { User, Phone, MapPin, Calendar, Clock, Loader2, AlertCircle, ArrowLeft, Activity, FileText } from "lucide-react";

export function PatientWorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = usePatientWorkspace(id || "");
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [rebookingLink, setRebookingLink] = useState<string | null>(null);
  const { mutate: cancelAppointment, isPending: isCancelling } = useCancelAppointment();

  // Debug: log the workspace data to verify document IDs
  if (data) {
    console.log("PatientWorkspace data:", JSON.stringify(data, null, 2));
  }

  if (isLoading) {
    return (
      <ReceptionLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </ReceptionLayout>
    );
  }

  if (error || !data) {
    return (
      <ReceptionLayout>
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-6 rounded-2xl flex flex-col items-center justify-center text-center">
          <AlertCircle className="w-8 h-8 mb-2" />
          <h2 className="font-semibold text-lg">Workspace not found</h2>
          <p className="text-sm">Unable to load patient data.</p>
          <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-white text-slate-700 rounded-lg shadow-sm border hover:bg-slate-50 transition">
            Go Back
          </button>
        </div>
      </ReceptionLayout>
    );
  }

  return (
    <ReceptionLayout>
      <div className="space-y-6 animate-fade-in pb-10">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition font-medium">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Details */}
          <div className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col h-full">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-2xl">
                {data.patient_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">{data.patient_name}</h1>
                <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                  <User className="w-3.5 h-3.5" /> ID: {data.patient_id.substring(0,8)}...
                </p>
              </div>
            </div>
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3 text-slate-700">
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center shrink-0 text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-slate-900 capitalize">{data.gender || "Not Specified"}</p>
                  <p className="text-slate-500 text-xs">Gender</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center shrink-0 text-slate-500">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-slate-900">{data.mobile_number}</p>
                  <p className="text-slate-500 text-xs">Mobile Number</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center shrink-0 text-slate-500">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-slate-900">{data.basic_address}</p>
                  <p className="text-slate-500 text-xs">Address</p>
                </div>
              </div>
            </div>
          </div>

          {/* Active Appointment & History */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Active Appointment */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold tracking-tight text-primary mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Active Appointment
              </h2>
              
              {data.active_appointment ? (
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900 text-lg">{data.active_appointment.service_name}</p>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {data.active_appointment.date}</span>
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {data.active_appointment.slot_time}</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-4 sm:mt-0">
                    <span className="inline-flex w-fit items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 uppercase tracking-wider">
                      {data.active_appointment.status}
                    </span>
                    {data.active_appointment.receipt_document_id && (
                      <a
                        href={`http://localhost:8000/api/v1/billing/documents/${data.active_appointment.receipt_document_id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold rounded-lg transition"
                      >
                        Booking Receipt
                      </a>
                    )}
                    {data.active_appointment.status === "BOOKED" && (
                      <button
                        onClick={() => setIsCancelConfirmOpen(true)}
                        className="px-4 py-1.5 bg-red-100 text-red-700 text-sm font-semibold rounded-lg hover:bg-red-200 transition shadow-sm"
                      >
                        Cancel
                      </button>
                    )}
                    {data.active_appointment.status !== "COMPLETED" && (
                      <button
                        onClick={() => navigate(`/reception/checkout/${data.active_appointment?.appointment_id}`)}
                        className="px-4 py-1.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition shadow-sm"
                      >
                        Checkout
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white text-center text-slate-500">
                  No active appointments found.
                </div>
              )}
            </div>

            {/* Cancellation Confirmation Modal */}
            {isCancelConfirmOpen && (
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white border rounded-2xl max-w-md w-full p-6 shadow-xl space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-destructive/10 text-destructive rounded-full flex items-center justify-center shrink-0">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-slate-900">Cancel Appointment</h3>
                      <p className="text-sm text-slate-500">
                        Are you sure you want to cancel this appointment? This action will:
                      </p>
                      <ul className="list-disc list-inside text-xs text-slate-500 space-y-1 pt-2">
                        <li>Immediately release the booked time slot.</li>
                        <li>Keep the advance payment unchanged (no refund).</li>
                        <li>Preserve the booking receipt for your records.</li>
                        <li>Create a rebooking eligibility for the patient.</li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      disabled={isCancelling}
                      onClick={() => setIsCancelConfirmOpen(false)}
                      className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-200 transition"
                    >
                      Go Back
                    </button>
                    <button
                      disabled={isCancelling}
                      onClick={() => {
                        if (data.active_appointment?.appointment_id) {
                          cancelAppointment(data.active_appointment.appointment_id, {
                            onSuccess: (res) => {
                              setIsCancelConfirmOpen(false);
                              if (res.eligibility_id) {
                                const baseUrl = import.meta.env.VITE_PUBLIC_WEBSITE_URL || window.location.origin;
                                setRebookingLink(`${baseUrl}/rebook/${res.eligibility_id}`);
                              }
                            }
                          });
                        }
                      }}
                      className="px-4 py-2 bg-destructive text-white text-sm font-semibold rounded-lg hover:bg-destructive/90 transition shadow-sm flex items-center gap-1.5"
                    >
                      {isCancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Cancel"}
                    </button>
                  </div>
                </div>
              </div>
            )}


            {/* Rebooking Link Modal */}
            {rebookingLink && (
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white border rounded-2xl max-w-md w-full p-6 shadow-xl space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-green-100 text-green-700 rounded-full flex items-center justify-center shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="space-y-1 w-full">
                      <h3 className="text-lg font-bold text-slate-900">Appointment Cancelled</h3>
                      <p className="text-sm text-slate-500">
                        The appointment has been cancelled. Copy the rebooking link below and send it to the patient via WhatsApp or SMS.
                      </p>
                      <div className="mt-4 p-3 bg-slate-50 border rounded-xl overflow-hidden text-xs text-slate-600 break-all font-mono">
                        {rebookingLink}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={() => setRebookingLink(null)}
                      className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-200 transition"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(rebookingLink);
                        alert("Link copied to clipboard!");
                      }}
                      className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition shadow-sm"
                    >
                      Copy Link
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Appointment History */}
            <div className="bg-white border rounded-2xl p-6 shadow-sm flex-1">
              <h2 className="text-lg font-bold tracking-tight mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-400" />
                Appointment History
              </h2>
              
              {data.appointment_history.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-sm">
                  No history available.
                </div>
              ) : (
                <div className="space-y-3">
                  {data.appointment_history.map(apt => (
                    <div key={apt.appointment_id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition gap-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 text-sm">{apt.service_name}</span>
                        <span className="text-xs text-slate-500">{apt.date} at {apt.slot_time}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {apt.receipt_document_id ? (
                          <a
                            href={`http://localhost:8000/api/v1/billing/documents/${apt.receipt_document_id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-semibold rounded-lg transition"
                          >
                            <FileText className="w-3 h-3" />
                            Receipt
                          </a>
                        ) : null}
                        {apt.final_bill_document_id ? (
                          <a
                            href={`http://localhost:8000/api/v1/billing/documents/${apt.final_bill_document_id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold rounded-lg transition"
                          >
                            <FileText className="w-3 h-3" />
                            Final Bill
                          </a>
                        ) : null}
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          apt.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                          apt.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {apt.status}
                        </span>
                        {apt.status === 'CANCELLED' && apt.eligibility_id && (
                          <button
                            onClick={() => {
                              const baseUrl = import.meta.env.VITE_PUBLIC_WEBSITE_URL || window.location.origin;
                              setRebookingLink(`${baseUrl}/rebook/${apt.eligibility_id}`);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 text-xs font-semibold rounded-lg transition ml-1"
                          >
                            Get Link
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </ReceptionLayout>
  );
}

export default PatientWorkspacePage;
