import { useState } from "react";
import { useCheckPatientStatus } from "@/services/orchestration";
import { useReceptionBooking } from "@/services/reception";
import { usePublicCatalog } from "@/services/catalog";
import { useAvailableSlots } from "@/services/scheduling";
import { 
  Loader2, 
  CheckCircle2, 
  User, 
  Phone, 
  MapPin, 
  CreditCard,
  CalendarDays,
  Clock,
  ChevronRight,
  Receipt
} from "lucide-react";
import { PatientBookingStatusResponse, BookingConfirmation } from "@/types/orchestration";
import { CatalogItem } from "@/types/catalog";
import { ReceptionLayout } from "./ReceptionLayout";

export function NewAppointmentPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasCheckedPatient, setHasCheckedPatient] = useState(false);
  
  // Form State
  const [patientData, setPatientData] = useState({
    first_name: "",
    last_name: "",
    mobile_number: "",
    basic_address: "",
    gender: "Male" as "Male" | "Female",
  });
  
  const [catalogItem, setCatalogItem] = useState<CatalogItem | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [transactionRef] = useState("TXN-" + Math.floor(Math.random() * 1000000));

  // Responses
  const [statusResponse, setStatusResponse] = useState<PatientBookingStatusResponse | null>(null);
  const [successResponse, setSuccessResponse] = useState<BookingConfirmation | null>(null);
  
  // Payment Options
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [collectAdvance, setCollectAdvance] = useState(false);

  // Queries & Mutations
  const { mutate: checkStatus, isPending: checkingStatus, error: statusError } = useCheckPatientStatus();
  const { data: catalogItems, isLoading: loadingCatalog } = usePublicCatalog();
  const { data: availableDates, isLoading: loadingSlots } = useAvailableSlots();
  const { mutate: confirmBooking, isPending: confirmingBooking, error: confirmError } = useReceptionBooking();

  const handlePatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientData.mobile_number || !patientData.first_name || !patientData.last_name || !patientData.basic_address) return;
    
    checkStatus(
      { mobile_number: patientData.mobile_number },
      {
        onSuccess: (res) => {
          setStatusResponse(res);
          if (res.patient?.gender) {
            setPatientData(prev => ({ ...prev, gender: (res.patient?.gender as "Male" | "Female") || "Male" }));
          }
          setHasCheckedPatient(true);
        }
      }
    );
  };

  const handlePayment = () => {
    if (!catalogItem || !selectedDate || !selectedTime) return;
    
    const advanceAmount = collectAdvance ? (Math.floor(catalogItem.price * 0.2) || 200) : 0;

    confirmBooking(
      {
        catalog_item_id: catalogItem.id,
        date: selectedDate,
        start_time: selectedTime,
        patient_data: patientData,
        advance_amount: advanceAmount,
        transaction_reference: transactionRef,
        payment_method: paymentMethod
      },
      {
        onSuccess: (res) => {
          setSuccessResponse(res);
          setIsSuccess(true);
        }
      }
    );
  };

  if (isSuccess && successResponse) {
    return (
      <ReceptionLayout>
        <div className="max-w-2xl mx-auto space-y-8 animate-fade-in pb-20 pt-8">
          <div className="bg-white border rounded-2xl p-10 text-center shadow-sm relative overflow-hidden animate-slide-up">
            <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
            
            <div className="mx-auto w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            
            <h1 className="text-3xl font-bold tracking-tight mb-2">Booking Confirmed!</h1>
            <p className="text-muted-foreground mb-8">Appointment successfully scheduled by Reception.</p>
            
            <div className="bg-slate-50 rounded-xl p-6 text-left space-y-6 border">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-muted-foreground mb-1"><User className="w-4 h-4 mr-2" /> Patient</div>
                  <p className="font-medium">{successResponse.patient_name}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-muted-foreground mb-1"><Receipt className="w-4 h-4 mr-2" /> Service</div>
                  <p className="font-medium">{successResponse.catalog_item_name}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-muted-foreground mb-1"><CalendarDays className="w-4 h-4 mr-2" /> Date</div>
                  <p className="font-medium">{successResponse.date}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-muted-foreground mb-1"><Clock className="w-4 h-4 mr-2" /> Time</div>
                  <p className="font-medium">{successResponse.start_time}</p>
                </div>
              </div>
              
              <div className="pt-6 border-t flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Receipt Ref</p>
                  <p className="font-mono font-medium">{successResponse.receipt_number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground text-right">Status</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                    {successResponse.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ReceptionLayout>
    );
  }

  if (hasCheckedPatient && statusResponse?.has_active_booking && statusResponse.active_booking) {
    return (
      <ReceptionLayout>
        <div className="max-w-2xl mx-auto space-y-8 animate-fade-in pb-20 pt-8">
          <div className="bg-white border rounded-2xl p-8 text-center shadow-sm animate-fade-in">
            <div className="mx-auto w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Patient Has Active Appointment</h2>
            <p className="text-muted-foreground mb-6">{statusResponse.patient?.first_name} already has a booking.</p>
            
            <div className="bg-slate-50 rounded-xl p-6 text-left border">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Service</p>
                  <p className="font-medium">{statusResponse.active_booking.catalog_item_name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Date & Time</p>
                  <p className="font-medium">{statusResponse.active_booking.date} at {statusResponse.active_booking.start_time}</p>
                </div>
                <div className="col-span-2 pt-2 border-t">
                  <p className="text-xs text-muted-foreground">Receipt Ref</p>
                  <p className="font-mono text-sm">{statusResponse.active_booking.receipt_number}</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-6 italic">Cannot double book. Please cancel the existing appointment first if needed.</p>
          </div>
        </div>
      </ReceptionLayout>
    );
  }

  return (
    <ReceptionLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8 animate-fade-in pb-24 pt-4 sm:pt-6">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">New Appointment</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Reception manual booking workflow.</p>
        </div>

      {/* Patient Details Step */}
      <div className={`bg-card border rounded-2xl p-5 sm:p-7 shadow-sm transition-all duration-300 ${hasCheckedPatient ? "opacity-75 pointer-events-none border-primary/50" : "border-border"}`}>
        <h2 className="text-lg sm:text-xl font-semibold mb-5 flex items-center gap-2.5">
          <span className="bg-primary text-primary-foreground w-7 h-7 rounded-full inline-flex items-center justify-center text-sm font-bold">1</span> 
          Patient Details
        </h2>
        
        <form onSubmit={handlePatientSubmit} className="space-y-4 sm:space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">First Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                <input required className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm sm:text-base pl-10 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="John" value={patientData.first_name} onChange={e => setPatientData({...patientData, first_name: e.target.value})} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Last Name</label>
              <input required className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm sm:text-base focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="Doe" value={patientData.last_name} onChange={e => setPatientData({...patientData, last_name: e.target.value})} />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                <input required type="tel" className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm sm:text-base pl-10 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="9876543210" value={patientData.mobile_number} onChange={e => setPatientData({...patientData, mobile_number: e.target.value})} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Gender (Required for Slot)</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPatientData({...patientData, gender: "Male"})}
                  className={`flex items-center justify-center gap-2 h-11 rounded-xl border font-semibold text-sm sm:text-base transition-all active:scale-[0.98] ${patientData.gender === "Male" ? "bg-primary/10 border-primary text-primary shadow-sm ring-2 ring-primary/20" : "bg-background border-input text-foreground hover:bg-muted/50"}`}
                >
                  <span>👨 Male</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPatientData({...patientData, gender: "Female"})}
                  className={`flex items-center justify-center gap-2 h-11 rounded-xl border font-semibold text-sm sm:text-base transition-all active:scale-[0.98] ${patientData.gender === "Female" ? "bg-primary/10 border-primary text-primary shadow-sm ring-2 ring-primary/20" : "bg-background border-input text-foreground hover:bg-muted/50"}`}
                >
                  <span>👩 Female</span>
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Address</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
              <input required className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm sm:text-base pl-10 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="Pune, India" value={patientData.basic_address} onChange={e => setPatientData({...patientData, basic_address: e.target.value})} />
            </div>
          </div>

          {statusError && <div className="text-sm text-destructive mt-2">Error checking status. Please try again.</div>}

          {!hasCheckedPatient && (
            <button disabled={checkingStatus} type="submit" className="w-full flex items-center justify-center gap-2 rounded-xl text-base font-semibold transition-all bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-4 mt-6 shadow-md active:scale-[0.98]">
              {checkingStatus ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Continue <ChevronRight className="w-5 h-5" /></>}
            </button>
          )}
        </form>
      </div>

      {/* Main Booking Flow (Visible only after patient check) */}
      {hasCheckedPatient && !statusResponse?.has_active_booking && (
        <div className="space-y-8 animate-slide-up">
          
          {/* Catalog Step */}
          <div className="bg-card border rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full inline-flex items-center justify-center text-sm">2</span> 
              Select Service
            </h2>
            
            <div className="space-y-4">
              {loadingCatalog ? (
                <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {catalogItems?.map((item: CatalogItem) => (
                    <div 
                      key={item.id} 
                      onClick={() => setCatalogItem(item)}
                      className={`border rounded-xl p-4 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md ${catalogItem?.id === item.id ? "border-primary bg-primary/5 shadow-sm ring-2 ring-primary/20" : "hover:border-primary/50"}`}
                    >
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
                      <div className="text-lg font-bold text-primary">₹{item.price}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Slots Step */}
          <div className="bg-card border rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full inline-flex items-center justify-center text-sm">3</span> 
              Select Time Slot
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Showing gender-specific capacity for <strong className="text-foreground">{patientData.gender}</strong> patients. You can only select slots with available capacity for this gender.
            </p>
            
            <div className="space-y-6">
              {loadingSlots ? (
                <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
              ) : (
                availableDates?.map(day => (
                  <div key={strDate(day.date)} className="space-y-3">
                    <h3 className="font-semibold text-sm text-foreground flex items-center gap-2 pb-1 border-b">
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
                        const isUserGenderMale = patientData.gender === "Male";
                        const userGenderCap = isUserGenderMale ? (slot.male_capacity ?? 3) : (slot.female_capacity ?? 3);
                        const isSelectable = slot.is_available && !slot.is_disabled && userGenderCap > 0;
                        
                        return (
                          <button
                            key={idx}
                            disabled={!isSelectable}
                            onClick={() => { setSelectedDate(strDate(day.date)); setSelectedTime(sTime); }}
                            className={`p-3.5 rounded-xl text-left transition-all border flex flex-col justify-between gap-3 ${
                              !isSelectable
                                ? "bg-muted/40 border-border/50 text-muted-foreground/60 cursor-not-allowed opacity-75"
                                : isSelected
                                  ? "bg-primary/10 border-primary shadow-sm ring-2 ring-primary/20 scale-[1.01]"
                                  : "bg-card border-border hover:border-primary/50 hover:shadow-sm"
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className={`font-bold text-sm sm:text-base ${isSelected ? "text-primary" : "text-foreground"}`}>
                                {hourBlock}
                              </span>
                              {slot.is_disabled ? (
                                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-700">Closed</span>
                              ) : !isSelectable ? (
                                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600">Full ({patientData.gender})</span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-800">Available</span>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-2 w-full pt-2 border-t border-dashed border-border/60">
                              <div className={`flex items-center justify-between p-1.5 rounded-lg text-xs font-medium ${
                                isUserGenderMale
                                  ? ((slot.male_capacity ?? 3) > 0 ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-red-50 text-red-700 border border-red-200 opacity-60")
                                  : "bg-slate-50 text-slate-500 border border-slate-200 opacity-60"
                              }`}>
                                <span>👨 Male</span>
                                <span className="font-bold">{slot.male_capacity ?? 3}/3</span>
                              </div>

                              <div className={`flex items-center justify-between p-1.5 rounded-lg text-xs font-medium ${
                                !isUserGenderMale
                                  ? ((slot.female_capacity ?? 3) > 0 ? "bg-purple-50 text-purple-700 border border-purple-200" : "bg-red-50 text-red-700 border border-red-200 opacity-60")
                                  : "bg-slate-50 text-slate-500 border border-slate-200 opacity-60"
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

          {/* Payment Step */}
          <div className={`bg-card border rounded-2xl p-6 shadow-sm transition-all duration-300 ${(catalogItem && selectedDate && selectedTime) ? "border-primary/30 shadow-md" : "opacity-60 pointer-events-none"}`}>
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full inline-flex items-center justify-center text-sm">4</span> 
              Payment Details
            </h2>
            
            <div className="space-y-6">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Payment Method</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="Cash">Cash</option>
                    <option value="Clinic QR / UPI">Clinic QR / UPI</option>
                    <option value="Online">Online</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Collect Advance?</label>
                  <div className="flex h-10 items-center gap-4">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="radio" checked={collectAdvance} onChange={() => setCollectAdvance(true)} className="text-primary focus:ring-primary" /> Yes
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="radio" checked={!collectAdvance} onChange={() => setCollectAdvance(false)} className="text-primary focus:ring-primary" /> No
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-muted/40 border rounded-xl p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{catalogItem?.name || "Select a service"}</h3>
                    <p className="text-sm text-muted-foreground mt-1">Patient: {patientData.first_name} {patientData.last_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-1">Total</p>
                    <p className="font-bold text-lg">₹{catalogItem?.price || 0}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 px-2">
                <div className="flex justify-between items-center py-2 border-b border-dashed">
                  <span className="font-medium text-muted-foreground">Advance Collected</span>
                  <span className="text-2xl font-bold text-primary">₹{collectAdvance ? (Math.floor((catalogItem?.price || 0) * 0.2) || 200) : 0}</span>
                </div>
                <div className="flex justify-between items-center py-2 text-muted-foreground text-sm">
                  <span>To be paid at clinic</span>
                  <span className="font-medium text-foreground">₹{catalogItem ? catalogItem.price - (collectAdvance ? (Math.floor(catalogItem.price * 0.2) || 200) : 0) : 0}</span>
                </div>
              </div>
              
              {confirmError && (
                <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl text-sm font-medium">
                  {confirmError instanceof Error ? confirmError.message : "Booking failed"}
                </div>
              )}

              <button 
                onClick={handlePayment}
                disabled={confirmingBooking || !catalogItem || !selectedDate || !selectedTime}
                className="w-full flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-4 shadow-md active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 disabled:shadow-none"
              >
                {confirmingBooking ? <Loader2 className="w-6 h-6 animate-spin" /> : <><CreditCard className="w-5 h-5" /> Confirm Appointment</>}
              </button>
            </div>
          </div>

        </div>
      )}
      </div>
    </ReceptionLayout>
  );
}

// Helper for date since API might return date string
function strDate(date: string | Date): string {
  if (typeof date === 'string') return date;
  return date.toISOString().slice(0, 10);
}

export default NewAppointmentPage;
