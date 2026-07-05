import { useState } from "react";
import { useProcessAdvancePayment } from "@/services/billing";
import { Loader2, CheckCircle2, AlertCircle, CreditCard, Receipt } from "lucide-react";
import { AdvancePaymentRequest } from "@/types/billing";

// Hardcoded mock data for the sake of isolated UI testing as requested.
// In reality, this would come from a global state/context (Booking Workflow state).
const MOCK_BOOKING_STATE = {
  patient_id: "00000000-0000-0000-0000-000000000001", // Assuming a valid UUID format
  patient_name: "Amit Sharma",
  catalog_item_id: "00000000-0000-0000-0000-000000000002",
  catalog_item_name: "Back Pain Therapy",
  total_amount: 1000,
  advance_amount: 200, // 20% advance
};

export function PaymentSummaryPage() {
  const [transactionRef, setTransactionRef] = useState("TXN-" + Math.floor(Math.random() * 1000000));
  
  const { mutate: processPayment, isPending, isSuccess, data: paymentResponse, error } = useProcessAdvancePayment();

  const handlePayment = () => {
    const payload: AdvancePaymentRequest = {
      ...MOCK_BOOKING_STATE,
      transaction_reference: transactionRef,
      is_public_booking: true,
    };
    processPayment(payload);
  };

  if (isSuccess && paymentResponse?.receipt) {
    const receipt = paymentResponse.receipt;
    return (
      <div className="max-w-xl mx-auto animate-slide-up">
        <div className="bg-card border rounded-2xl p-8 shadow-sm text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Payment Successful</h2>
            <p className="text-muted-foreground mt-1">Advance payment recorded successfully.</p>
          </div>
          
          <div className="bg-muted/50 rounded-xl p-6 text-left space-y-4 border border-border/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Receipt className="w-32 h-32" />
            </div>
            
            <div className="relative z-10 space-y-4">
              <div className="border-b pb-4">
                <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Receipt Number</p>
                <p className="font-mono text-lg font-medium">{receipt.receipt_number}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Patient</p>
                  <p className="font-medium">{receipt.patient_name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Service</p>
                  <p className="font-medium">{receipt.catalog_item_name}</p>
                </div>
              </div>
              
              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Amount</span>
                  <span>₹{receipt.total_amount}</span>
                </div>
                <div className="flex justify-between text-sm font-medium text-green-600">
                  <span>Advance Paid</span>
                  <span>- ₹{receipt.advance_paid}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Remaining Due</span>
                  <span>₹{receipt.remaining_amount}</span>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground italic">
            Note: Your appointment is not yet confirmed until the final scheduling step is completed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Payment Summary</h1>
        <p className="text-muted-foreground">Review and complete your advance payment</p>
      </div>

      <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 bg-muted/30 border-b space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg">{MOCK_BOOKING_STATE.catalog_item_name}</h3>
              <p className="text-sm text-muted-foreground">Patient: {MOCK_BOOKING_STATE.patient_name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="font-semibold">₹{MOCK_BOOKING_STATE.total_amount}</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium">Advance Amount Required</span>
              <span className="text-xl font-bold text-primary">₹{MOCK_BOOKING_STATE.advance_amount}</span>
            </div>
            <div className="flex justify-between items-center py-2 text-muted-foreground text-sm">
              <span>To be paid at clinic</span>
              <span>₹{MOCK_BOOKING_STATE.total_amount - MOCK_BOOKING_STATE.advance_amount}</span>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-xl text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{error instanceof Error ? error.message : "Payment processing failed"}</p>
            </div>
          )}

          <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm border border-blue-100">
            <p className="font-medium mb-1">Non-refundable Payment</p>
            <p className="opacity-90">Advance payments are strictly non-refundable as per clinic policy.</p>
          </div>
          
          <button 
            onClick={handlePayment}
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-4 shadow-sm"
          >
            {isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Pay ₹{MOCK_BOOKING_STATE.advance_amount} Now
              </>
            )}
          </button>
          
          <div className="text-center">
            <button className="text-xs text-muted-foreground hover:underline" onClick={() => setTransactionRef("TXN-" + Math.floor(Math.random() * 1000000))}>
              Mock Txn Ref: {transactionRef} (Click to randomize)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentSummaryPage;
