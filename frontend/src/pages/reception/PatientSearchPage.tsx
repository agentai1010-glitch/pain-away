import { useState } from "react";
import { useSearchPatients } from "@/services/reception";
import { Loader2, Search, Phone, ArrowRight, AlertCircle, FileText } from "lucide-react";
import { ReceptionLayout } from "./ReceptionLayout";
import { useNavigate } from "react-router-dom";

export function PatientSearchPage() {
  const [query, setQuery] = useState("");
  const { data: patients, isLoading, error } = useSearchPatients(query);
  const navigate = useNavigate();

  return (
    <ReceptionLayout>
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Search className="w-6 h-6 text-primary" />
            Global Patient Search
          </h1>
          <p className="text-muted-foreground">Search patients by mobile number or name to access their workspace.</p>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-4 border border-slate-300 rounded-2xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-lg transition-shadow shadow-sm"
            placeholder="Enter mobile number or partial name (min 3 chars)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {isLoading && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <Loader2 className="h-5 w-5 text-primary animate-spin" />
            </div>
          )}
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-medium">Failed to search patients. Please try again.</p>
          </div>
        )}

        {query.length >= 3 && !isLoading && !error && (
          <div className="space-y-4">
            {(!patients || patients.length === 0) ? (
              <div className="bg-white border rounded-2xl p-12 text-center text-slate-500 shadow-sm">
                <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-lg font-medium text-slate-700">No patients found</p>
                <p>Try checking the spelling or the mobile number.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
                {patients.map((patient) => (
                  <div
                    key={patient.patient_id}
                    onClick={() => navigate(`/reception/patient/${patient.patient_id}`)}
                    className="bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold">
                            {patient.patient_name.charAt(0).toUpperCase()}
                          </div>
                          <h3 className="font-semibold text-lg text-slate-900 group-hover:text-primary transition-colors">
                            {patient.patient_name}
                          </h3>
                        </div>
                      </div>
                      
                      <div className="space-y-1.5 pl-1">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone className="w-4 h-4 text-slate-400" />
                          {patient.mobile_number}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <FileText className="w-4 h-4 text-slate-400" />
                          Status:{" "}
                          <span className={`font-medium ${patient.latest_appointment_status ? 'text-slate-900' : 'text-slate-400'}`}>
                            {patient.latest_appointment_status || "No past appointments"}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t flex items-center justify-end text-sm font-medium text-primary group-hover:text-primary/80">
                      Open Workspace <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </ReceptionLayout>
  );
}

export default PatientSearchPage;
