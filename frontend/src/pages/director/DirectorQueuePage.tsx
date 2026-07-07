import { useState } from "react";
import { useSchedule } from "@/services/reception";
import { Loader2, CalendarClock, Clock, User, FileText, AlertCircle, Calendar as CalendarIcon, ArrowRight } from "lucide-react";
import DirectorLayout from "./DirectorLayout";
import { useNavigate } from "react-router-dom";

export function DirectorQueuePage() {
  const [offset, setOffset] = useState<0 | 1 | 2>(0); // 0=Today, 1=Tomorrow, 2=Day After

  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + offset);
  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const day = String(targetDate.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;

  const { data, isLoading, error } = useSchedule(dateStr);
  const navigate = useNavigate();

  const filterOptions = [
    { label: "Today", value: 0 },
    { label: "Tomorrow", value: 1 },
    { label: "Day After", value: 2 },
  ];

  return (
    <DirectorLayout>
      <div className="space-y-6 animate-fade-in pb-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <CalendarClock className="w-6 h-6 text-primary" />
              Appointment Schedule
            </h1>
            <p className="text-muted-foreground">Manage operational appointment schedules by date.</p>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
            {filterOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setOffset(opt.value as 0 | 1 | 2)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  offset === opt.value ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-[40vh] items-center justify-center bg-white border rounded-2xl shadow-sm">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive p-6 rounded-2xl flex flex-col items-center justify-center text-center">
            <AlertCircle className="w-8 h-8 mb-2" />
            <h2 className="font-semibold text-lg">Error loading schedule</h2>
            <p className="text-sm">Please try again later.</p>
          </div>
        ) : (
          <>
            {!data?.appointments || data.appointments.length === 0 ? (
              <div className="bg-white border rounded-2xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
                <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
                  <CalendarIcon className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-semibold mb-1">Schedule is Empty</h2>
                <p className="text-slate-500">There are no confirmed appointments for {filterOptions.find(o => o.value === offset)?.label.toLowerCase()}.</p>
              </div>
            ) : (
              <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold border-b">
                      <tr>
                        <th className="px-6 py-4">Slot Time</th>
                        <th className="px-6 py-4">Patient Name</th>
                        <th className="px-6 py-4">Gender</th>
                        <th className="px-6 py-4">Service</th>
                        <th className="px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {data.appointments.map((apt) => (
                        <tr 
                          key={apt.appointment_id} 
                          onClick={() => navigate(`/director/patient/${apt.patient_id}`)}
                          className="hover:bg-slate-50 transition-colors cursor-pointer group"
                        >
                          <td className="px-6 py-4 font-medium text-slate-900">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-primary" />
                              {apt.slot_time}
                            </div>
                          </td>
                          <td className="px-6 py-4 font-medium">
                            <div className="flex items-center gap-2 group-hover:text-primary transition-colors">
                              <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                                <User className="w-4 h-4" />
                              </div>
                              {apt.patient_name}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {apt.gender ? (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                apt.gender.toLowerCase() === 'male' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                apt.gender.toLowerCase() === 'female' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                                'bg-slate-100 text-slate-700'
                              }`}>
                                {apt.gender.toLowerCase() === 'male' ? '👨 Male' : apt.gender.toLowerCase() === 'female' ? '👩 Female' : apt.gender}
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-slate-400" />
                              {apt.service_name}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-between">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                {apt.status}
                              </span>
                              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DirectorLayout>
  );
}

export default DirectorQueuePage;
