import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useRebookingSummary, useRebookAppointment } from "@/services/orchestration";
import { useAvailableSlots } from "@/services/scheduling";
import { 
  Loader2, 
  CheckCircle2, 
  User, 
  CalendarDays,
  AlertCircle,
  Receipt
} from "lucide-react";

export function RebookPage() {
  const { eligibilityId } = useParams<{ eligibilityId: string }>();
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  
  // Responses
  const [successResponse, setSuccessResponse] = useState<any>(null);
  
  // Queries & Mutations
  const { data: summary, isLoading: loadingSummary, error: summaryError } = useRebookingSummary(eligibilityId || "");
  const { data: availableDates, isLoading: loadingSlots } = useAvailableSlots();
  const { mutate: rebookAppointment, isPending: rebooking, error: rebookError } = useRebookAppointment();

  const handleRebook = () => {
    if (!eligibilityId || !selectedDate || !selectedTime) return;

    rebookAppointment(
      {
        eligibilityId,
        date: selectedDate,
        start_time: selectedTime
      },
      {
        onSuccess: (res) => {
          setSuccessResponse(res);
          setIsSuccess(true);
        }
      }
    );
  };

  if (loadingSummary) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-slate-600 font-medium">Loading rebooking details...</p>
        </div>
      </div>
    );
  }

  if (summaryError || !summary) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-red-100 rounded-3xl p-8 text-center shadow-lg space-y-6">
          <div className="mx-auto w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Link Invalid or Expired</h2>
            <p className="text-slate-500 text-sm">
              This rebooking link is invalid, has already been consumed, or the eligibility has expired.
            </p>
          </div>
          <Link to="/" className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  if (isSuccess && successResponse) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-6 flex items-center justify-center">
        <div className="max-w-xl w-full bg-white border rounded-3xl p-10 text-center shadow-xl relative overflow-hidden animate-slide-up">
          <div className="absolute top-0 left-0 w-full h-3 bg-green-500"></div>
          
          <div className="mx-auto w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 animate-scale-up">
            <CheckCircle2 className="w-14 h-14" />
          </div>
          
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-slate-900">Rebooking Confirmed!</h1>
          <p className="text-muted-foreground mb-8">Your appointment has been successfully rescheduled.</p>
          
          <div className="bg-slate-50 rounded-2xl p-6 text-left space-y-4 border mb-8 text-slate-700">
            <div className="flex justify-between items-center pb-4 border-b border-dashed">
              <span className="text-slate-500 font-medium">Patient</span>
              <span className="font-semibold text-slate-950">{successResponse.patient_name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Service</span>
              <span className="font-semibold text-slate-950">{successResponse.catalog_item_name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">New Date</span>
              <span className="font-semibold text-slate-950">{successResponse.date}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Time Slot</span>
              <span className="font-semibold text-slate-950">{successResponse.start_time}</span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-dashed">
              <span className="text-slate-500 font-medium">New Receipt No.</span>
              <span className="font-mono font-bold text-slate-950">{successResponse.receipt_number}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Status</span>
              <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                {successResponse.status}
              </span>
            </div>
          </div>
          
          <p className="text-xs text-slate-400 mb-8 italic">
            Your original advance payment has been fully transferred to this booking. No further payment is needed.
          </p>

          <Link to="/" className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-4 text-sm font-semibold text-white hover:bg-slate-800 transition-colors shadow-md">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-12 px-4 sm:px-6 flex justify-center items-start">
      <div className="max-w-2xl w-full space-y-6 sm:space-y-8 animate-fade-in">
        <div className="space-y-2 text-center md:text-left">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">Rebook Appointment</h1>
          <p className="text-sm sm:text-base text-slate-500">Reschedule your cancelled appointment using your existing advance payment.</p>
        </div>

        {/* Original Appointment Summary */}
        <div className="bg-white border rounded-3xl p-5 sm:p-8 shadow-md space-y-6">
          <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2 text-slate-900">
            <Receipt className="w-5 h-5 text-primary" />
            Original Booking Details
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-2">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Patient Name</span>
              <div className="flex items-center gap-2 text-slate-900 font-semibold">
                <User className="w-4 h-4 text-slate-400" />
                {summary.patient_name}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Service / Package</span>
              <div className="text-slate-900 font-semibold">{summary.service_name}</div>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Price</span>
              <div className="text-slate-900 font-semibold">₹{summary.price}</div>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Advance Transferred</span>
              <div className="text-green-600 font-bold">Full Value Reuse (₹0 Additional Payment Required)</div>
            </div>
          </div>
        </div>

        {/* Time Slot Selection */}
        <div className="bg-white border rounded-3xl p-8 shadow-md">
          <h2 className="text-xl font-bold mb-2 flex items-center gap-2 text-slate-900">
            <CalendarDays className="w-5 h-5 text-primary" />
            Select New Slot
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            Showing available capacity for each hour block.
          </p>
          
          <div className="space-y-6">
            {loadingSlots ? (
              <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
            ) : (
              availableDates?.map(day => (
                <div key={strDate(day.date)} className="space-y-3">
                  <h3 className="font-semibold text-sm text-slate-700 flex items-center gap-2 border-b pb-2">
                    <CalendarDays className="w-4 h-4 text-primary" />
                    {strDate(day.date)}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {day.slots.map((slot, idx) => {
                      const sTime = slot.start_time.slice(0, 5);
                      const hour = parseInt(sTime.split(':')[0] || "0");
                      const ampm1 = hour >= 12 ? 'PM' : 'AM';
                      const h1 = hour % 12 || 12;
                      const h2 = (hour + 1) % 12 || 12;
                      const ampm2 = (hour + 1) >= 12 ? 'PM' : 'AM';
                      const hourBlock = `${h1}:00 ${ampm1} – ${h2}:00 ${ampm2}`;

                      const isSelected = selectedDate === strDate(day.date) && selectedTime === sTime;
                      const isSelectable = slot.is_available && !slot.is_disabled && ((slot.male_capacity ?? 3) > 0 || (slot.female_capacity ?? 3) > 0);
                      
                      return (
                        <button
                          key={idx}
                          disabled={!isSelectable}
                          onClick={() => { setSelectedDate(strDate(day.date)); setSelectedTime(sTime); }}
                          className={`p-3.5 rounded-xl text-left transition-all border flex flex-col justify-between gap-3 ${
                            !isSelectable
                              ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-75"
                              : isSelected
                                ? "bg-primary/10 border-primary shadow-sm ring-2 ring-primary/20 scale-[1.01]"
                                : "bg-white border-slate-200 hover:border-primary/50 hover:shadow-sm"
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className={`font-bold text-sm sm:text-base ${isSelected ? "text-primary" : "text-slate-900"}`}>
                              {hourBlock}
                            </span>
                            {slot.is_disabled ? (
                              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-700">Closed</span>
                            ) : !isSelectable ? (
                              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-200 text-slate-600">Full</span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-800">Available</span>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-2 w-full pt-2 border-t border-dashed border-slate-200">
                            <div className={`flex items-center justify-between p-1.5 rounded-lg text-xs font-medium ${
                              ((slot.male_capacity ?? 3) > 0) ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-red-50 text-red-700 border border-red-200 opacity-60"
                            }`}>
                              <span>👨 Male</span>
                              <span className="font-bold">{slot.male_capacity ?? 3}/3</span>
                            </div>

                            <div className={`flex items-center justify-between p-1.5 rounded-lg text-xs font-medium ${
                              ((slot.female_capacity ?? 3) > 0) ? "bg-purple-50 text-purple-700 border border-purple-200" : "bg-red-50 text-red-700 border border-red-200 opacity-60"
                            }`}>
                              <span>👩 Female</span>
                              <span className="font-bold">{slot.female_capacity ?? 3}/3</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="space-y-4">
          {rebookError && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl text-sm font-medium flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {(rebookError as any).message || "Rebooking failed. Please check slot availability."}
            </div>
          )}

          <button 
            onClick={handleRebook}
            disabled={rebooking || !selectedDate || !selectedTime}
            className="w-full flex items-center justify-center gap-2 rounded-2xl text-lg font-bold transition-all bg-primary text-primary-foreground hover:bg-primary/90 h-16 px-4 shadow-lg disabled:opacity-50 active:scale-[0.98]"
          >
            {rebooking ? <Loader2 className="w-6 h-6 animate-spin" /> : "Confirm Rebooking"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper for date since API might return date string
function strDate(date: string | Date): string {
  if (typeof date === 'string') return date;
  return date.toISOString().slice(0, 10);
}

export default RebookPage;
