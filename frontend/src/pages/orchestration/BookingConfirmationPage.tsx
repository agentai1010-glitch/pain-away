import { useConfirmBooking, PublicBookingRequest } from "@/services/orchestration";
import { Loader2, CheckCircle, CalendarDays, Clock, User, FileText, CheckCircle2 } from "lucide-react";

// Hardcoded mock data to simulate an orchestrator test
const MOCK_ORCHESTRATION_PAYLOAD: PublicBookingRequest = {
  catalog_item_id: "2c7d9b4b-4b17-4581-80bb-64f59c8d3db0", // Needs to be a valid UUID in the DB ideally, but we test isolated
  date: new Date().toISOString().slice(0, 10), // Today
  start_time: "15:00",
  patient_data: {
    first_name: "Rahul",
    last_name: "Patil",
    mobile_number: "9876543210",
    basic_address: "Pune",
  },
  advance_amount: 500,
  transaction_reference: "TXN-ORCH-TEST"
};

export function BookingConfirmationPage() {
  const { mutate: confirmBooking, isPending, isSuccess, data: confirmationData, error } = useConfirmBooking();

  const handleConfirm = () => {
    confirmBooking(MOCK_ORCHESTRATION_PAYLOAD);
  };

  if (isSuccess && confirmationData) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="bg-card border rounded-2xl p-10 text-center shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
          
          <div className="mx-auto w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          
          <h1 className="text-3xl font-bold tracking-tight mb-2">Booking Confirmed!</h1>
          <p className="text-muted-foreground mb-8">Your appointment has been successfully scheduled.</p>
          
          <div className="bg-muted/30 rounded-xl p-6 text-left space-y-6 border">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <div className="flex items-center text-sm text-muted-foreground mb-1">
                  <User className="w-4 h-4 mr-2" /> Patient
                </div>
                <p className="font-medium text-lg">{confirmationData.patient_name}</p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center text-sm text-muted-foreground mb-1">
                  <FileText className="w-4 h-4 mr-2" /> Service
                </div>
                <p className="font-medium text-lg">{confirmationData.catalog_item_name}</p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center text-sm text-muted-foreground mb-1">
                  <CalendarDays className="w-4 h-4 mr-2" /> Date
                </div>
                <p className="font-medium text-lg">{confirmationData.date}</p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center text-sm text-muted-foreground mb-1">
                  <Clock className="w-4 h-4 mr-2" /> Time
                </div>
                <p className="font-medium text-lg">{confirmationData.start_time}</p>
              </div>
            </div>
            
            <div className="pt-6 border-t flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Receipt Ref</p>
                <p className="font-mono font-medium">{confirmationData.receipt_number}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground text-right">Status</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                  {confirmationData.status}
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-sm text-muted-foreground italic">
            Thank you for choosing Pain Away.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8 animate-fade-in pb-24 pt-4 sm:pt-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Finalize Booking</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Confirm your appointment details below.</p>
      </div>

      <div className="bg-card border rounded-3xl overflow-hidden shadow-sm p-6 sm:p-8 text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
          <CalendarDays className="w-8 h-8" />
        </div>
        
        <div>
          <h2 className="text-lg sm:text-xl font-semibold mb-2">Ready to Book</h2>
          <p className="text-sm text-muted-foreground mb-6">
            You are about to simulate the final orchestration step which will create the appointment and occupy the slot.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-destructive/10 text-destructive rounded-xl text-sm mb-6 text-left">
            <span className="font-semibold block mb-1">Failed to confirm booking:</span>
            {error instanceof Error ? error.message : "An error occurred during orchestration."}
          </div>
        )}

        <button 
          onClick={handleConfirm}
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 rounded-2xl text-base font-bold transition-all bg-primary text-primary-foreground hover:bg-primary/90 h-14 sm:h-16 px-4 shadow-md active:scale-[0.98]"
        >
          {isPending ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              Confirm Appointment
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default BookingConfirmationPage;
