import { useParams, useNavigate } from "react-router-dom";
import { usePatientWorkspace } from "@/services/reception";
import DirectorLayout from "./DirectorLayout";
import { User, Phone, MapPin, Loader2, AlertCircle, ArrowLeft, FileText } from "lucide-react";

export function DirectorPatientWorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = usePatientWorkspace(id || "");

  if (isLoading) {
    return (
      <DirectorLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DirectorLayout>
    );
  }

  if (error || !data) {
    return (
      <DirectorLayout>
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-6 rounded-2xl flex flex-col items-center justify-center text-center">
          <AlertCircle className="w-8 h-8 mb-2" />
          <h2 className="font-semibold text-lg">Workspace not found</h2>
          <p className="text-sm">Unable to load patient data.</p>
          <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-white text-slate-700 rounded-lg shadow-sm border hover:bg-slate-50 transition">
            Go Back
          </button>
        </div>
      </DirectorLayout>
    );
  }

  return (
    <DirectorLayout>
      <div className="space-y-6 animate-fade-in pb-10">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition font-medium">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Details */}
          <div className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col h-full lg:col-span-1">
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

          {/* Appointment History */}
          <div className="lg:col-span-2 flex flex-col gap-6">
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
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DirectorLayout>
  );
}

export default DirectorPatientWorkspacePage;
