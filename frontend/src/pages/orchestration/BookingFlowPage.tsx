import { useState } from "react";
import { 
  useCheckPatientStatus, 
  useConfirmBooking 
} from "@/services/orchestration";
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

export function BookingFlowPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasCheckedPatient, setHasCheckedPatient] = useState(false);
  
  // Form State
  const [patientData, setPatientData] = useState({
    first_name: "",
    last_name: "",
    mobile_number: "",
    basic_address: "",
  });
  
  const [catalogItem, setCatalogItem] = useState<CatalogItem | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [transactionRef] = useState("TXN-" + Math.floor(Math.random() * 1000000));

  // Responses
  const [statusResponse, setStatusResponse] = useState<PatientBookingStatusResponse | null>(null);
  const [successResponse, setSuccessResponse] = useState<BookingConfirmation | null>(null);
  
  // Queries & Mutations
  const { mutate: checkStatus, isPending: checkingStatus, error: statusError } = useCheckPatientStatus();
  const { data: catalogItems, isLoading: loadingCatalog } = usePublicCatalog();
  const { data: availableDates, isLoading: loadingSlots } = useAvailableSlots();
  const { mutate: confirmBooking, isPending: confirmingBooking, error: confirmError } = useConfirmBooking();

  const handlePatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientData.mobile_number || !patientData.first_name || !patientData.last_name || !patientData.basic_address) return;
    
    checkStatus(
      { mobile_number: patientData.mobile_number },
      {
        onSuccess: (res) => {
          setStatusResponse(res);
          setHasCheckedPatient(true);
        }
      }
    );
  };

  const handlePayment = () => {
    if (!catalogItem || !selectedDate || !selectedTime) return;
    
    const advanceAmount = Math.floor(catalogItem.price * 0.2) || 200; // Mock calculation or set fixed

    confirmBooking(
      {
        catalog_item_id: catalogItem.id,
        date: selectedDate,
        start_time: selectedTime,
        patient_data: patientData,
        advance_amount: advanceAmount,
        transaction_reference: transactionRef
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
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-in pb-20 pt-8">
        <div className="bg-card border rounded-2xl p-10 text-center shadow-lg relative overflow-hidden animate-slide-up">
          <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
          
          <div className="mx-auto w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          
          <h1 className="text-3xl font-bold tracking-tight mb-2">Booking Confirmed!</h1>
          <p className="text-muted-foreground mb-8">Your appointment has been successfully scheduled.</p>
          
          <div className="bg-muted/30 rounded-xl p-6 text-left space-y-6 border">
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
    );
  }

  if (hasCheckedPatient && statusResponse?.has_active_booking && statusResponse.active_booking) {
    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-in pb-20 pt-8">
        <div className="bg-card border rounded-2xl p-8 text-center shadow-sm animate-fade-in">
          <div className="mx-auto w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Welcome Back, {statusResponse.patient?.first_name}!</h2>
          <p className="text-muted-foreground mb-6">You already have an active appointment with us.</p>
          
          <div className="bg-muted/50 rounded-xl p-6 text-left border">
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
          <p className="text-sm text-muted-foreground mt-6 italic">Only one active appointment is permitted at a time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in pb-20">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Book an Appointment</h1>
        <p className="text-muted-foreground">Complete your public booking in a few simple steps.</p>
      </div>

      {/* Patient Details Step */}
      <div className={`bg-card border rounded-2xl p-6 shadow-sm transition-all duration-300 ${hasCheckedPatient ? "opacity-75 pointer-events-none border-primary/50" : "border-border"}`}>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full inline-flex items-center justify-center text-sm">1</span> 
          Patient Details
        </h2>
        
        <form onSubmit={handlePatientSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">First Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm pl-9 focus:ring-2 focus:ring-primary/20" placeholder="John" value={patientData.first_name} onChange={e => setPatientData({...patientData, first_name: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Last Name</label>
              <input required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20" placeholder="Doe" value={patientData.last_name} onChange={e => setPatientData({...patientData, last_name: e.target.value})} />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Mobile Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input required type="tel" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm pl-9 focus:ring-2 focus:ring-primary/20" placeholder="9876543210" value={patientData.mobile_number} onChange={e => setPatientData({...patientData, mobile_number: e.target.value})} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm pl-9 focus:ring-2 focus:ring-primary/20" placeholder="Pune, India" value={patientData.basic_address} onChange={e => setPatientData({...patientData, basic_address: e.target.value})} />
            </div>
          </div>

          {statusError && <div className="text-sm text-destructive mt-2">Error checking status. Please try again.</div>}

          {!hasCheckedPatient && (
            <button disabled={checkingStatus} type="submit" className="w-full flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 mt-4 shadow-sm active:scale-[0.98]">
              {checkingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Continue <ChevronRight className="w-4 h-4" /></>}
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
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full inline-flex items-center justify-center text-sm">3</span> 
              Select Time Slot
            </h2>
            
            <div className="space-y-6">
              {loadingSlots ? (
                <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
              ) : (
                availableDates?.map(day => (
                  <div key={strDate(day.date)} className="space-y-3">
                    <h3 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                      <CalendarDays className="w-4 h-4" />
                      {strDate(day.date)}
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      {day.slots.map((slot, idx) => {
                        const sTime = slot.start_time.slice(0, 5);
                        const isSelected = selectedDate === strDate(day.date) && selectedTime === sTime;
                        
                        return (
                          <button
                            key={idx}
                            disabled={!slot.is_available}
                            onClick={() => { setSelectedDate(strDate(day.date)); setSelectedTime(sTime); }}
                            className={`p-2 rounded-lg text-sm font-medium transition-all ${
                              !slot.is_available 
                                ? "bg-muted text-muted-foreground/40 cursor-not-allowed border border-transparent" 
                                : isSelected
                                  ? "bg-primary text-primary-foreground shadow-md scale-[1.02]"
                                  : "bg-card border hover:border-primary/50 hover:bg-primary/5"
                            }`}
                          >
                            {sTime}
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
              Payment Summary
            </h2>
            
            <div className="space-y-6">
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
                
                <div className="pt-4 border-t text-sm flex items-center gap-6 text-muted-foreground">
                  <span className="flex items-center gap-2 font-medium"><CalendarDays className="w-4 h-4 text-primary/70" /> {selectedDate || "--"}</span>
                  <span className="flex items-center gap-2 font-medium"><Clock className="w-4 h-4 text-primary/70" /> {selectedTime || "--"}</span>
                </div>
              </div>

              <div className="space-y-3 px-2">
                <div className="flex justify-between items-center py-2 border-b border-dashed">
                  <span className="font-medium text-muted-foreground">Advance Amount Required</span>
                  <span className="text-2xl font-bold text-primary">₹{catalogItem ? Math.floor(catalogItem.price * 0.2) || 200 : 0}</span>
                </div>
                <div className="flex justify-between items-center py-2 text-muted-foreground text-sm">
                  <span>To be paid at clinic</span>
                  <span className="font-medium text-foreground">₹{catalogItem ? catalogItem.price - (Math.floor(catalogItem.price * 0.2) || 200) : 0}</span>
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
                {confirmingBooking ? <Loader2 className="w-6 h-6 animate-spin" /> : <><CreditCard className="w-5 h-5" /> Pay Now to Confirm</>}
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

// Helper for date since API might return date string
function strDate(date: string | Date): string {
  if (typeof date === 'string') return date;
  return date.toISOString().slice(0, 10);
}

export default BookingFlowPage;
