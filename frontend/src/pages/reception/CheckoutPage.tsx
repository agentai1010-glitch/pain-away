import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useCheckoutSummary, useProcessCheckout } from "@/services/reception";
import { Loader2, Receipt, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { ReceptionLayout } from "./ReceptionLayout";

export function CheckoutPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { data: summary, isLoading: loadingSummary, error: summaryError } = useCheckoutSummary(appointmentId);
  const { mutate: processCheckout, isPending: processing, error: checkoutError, data: checkoutResult } = useProcessCheckout();
  
  const handleCheckout = () => {
    if (!appointmentId || !summary) return;
    
    processCheckout({
      appointment_id: appointmentId,
      payment_method: paymentMethod
    }, {
      onSuccess: () => {
        setIsSuccess(true);
      }
    });
  };

  if (loadingSummary) {
    return (
      <ReceptionLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </ReceptionLayout>
    );
  }

  if (summaryError) {
    return (
      <ReceptionLayout>
        <div className="p-8 max-w-2xl mx-auto">
          <div className="bg-destructive/10 text-destructive p-6 rounded-2xl flex items-start gap-4">
            <AlertCircle className="w-6 h-6 mt-1 flex-shrink-0" />
            <div>
              <h2 className="font-semibold text-lg">Unable to load checkout</h2>
              <p className="mt-1">{(summaryError as Error).message || "An error occurred while fetching the financial summary."}</p>
              <button onClick={() => navigate(-1)} className="mt-4 text-sm font-medium underline">Go Back</button>
            </div>
          </div>
        </div>
      </ReceptionLayout>
    );
  }

  if (isSuccess && checkoutResult) {
    const finalBill = checkoutResult.final_bill;
    return (
      <ReceptionLayout>
        <div className="max-w-xl mx-auto p-8 animate-fade-in">
          <div className="bg-white border rounded-3xl p-10 text-center shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-3 bg-green-500"></div>
            
            <div className="mx-auto w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-14 h-14" />
            </div>
            
            <h1 className="text-3xl font-bold tracking-tight mb-2">Checkout Complete</h1>
            <p className="text-muted-foreground mb-8">Final bill has been generated successfully.</p>
            
            <div className="bg-slate-50 rounded-2xl p-6 text-left space-y-4 border mb-8">
              <div className="flex justify-between items-center pb-4 border-b border-dashed">
                <span className="text-muted-foreground">Bill No.</span>
                <span className="font-mono font-semibold">{finalBill.bill_number}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Service</span>
                <span className="font-medium">{finalBill.catalog_item_name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total</span>
                <span className="font-medium">₹{finalBill.total_amount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Advance Paid</span>
                <span className="font-medium">₹{finalBill.advance_paid}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-dashed">
                <span className="font-semibold">Balance Collected</span>
                <span className="font-bold text-green-600 text-lg">₹{finalBill.balance_paid}</span>
              </div>
            </div>
            
            <Link to="/reception/dashboard" className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
              Return to Dashboard
            </Link>
          </div>
        </div>
      </ReceptionLayout>
    );
  }

  return (
    <ReceptionLayout>
      <div className="max-w-2xl mx-auto p-8 space-y-8 animate-fade-in">
        
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
            <p className="text-muted-foreground">Review financial summary and collect balance.</p>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-card border rounded-3xl p-8 shadow-sm">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" />
            Financial Summary
          </h2>
          
          <div className="space-y-4 text-lg">
            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-muted-foreground">Service / Package</span>
              <span className="font-medium">{summary?.catalog_item_name}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-muted-foreground">Total Amount</span>
              <span className="font-medium">₹{summary?.total_amount}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-muted-foreground">Advance Paid</span>
              <span className="font-medium">₹{summary?.advance_paid}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="font-semibold text-foreground">Remaining Balance</span>
              <span className="font-bold text-2xl text-primary">₹{summary?.remaining_amount}</span>
            </div>
          </div>
          
          <div className="mt-6 inline-flex px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
            Status: {summary?.payment_status}
          </div>
        </div>

        {/* Payment Collection */}
        <div className="bg-card border rounded-3xl p-8 shadow-sm space-y-6">
          <h2 className="text-xl font-semibold">Payment Collection</h2>
          
          <div className="space-y-3">
            <label className="text-sm font-medium text-muted-foreground">Payment Method</label>
            <div className="grid grid-cols-3 gap-4">
              {['Cash', 'Clinic QR / UPI', 'Online'].map(method => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`p-4 rounded-xl border text-sm font-medium transition-all ${
                    paymentMethod === method 
                      ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20" 
                      : "hover:border-primary/50"
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {checkoutError && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-xl text-sm font-medium">
              {(checkoutError as Error).message || "An error occurred during checkout."}
            </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={processing || (summary?.remaining_amount ?? 0) < 0}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary text-primary-foreground py-5 font-semibold text-lg shadow-md hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {processing ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              `Collect ₹${summary?.remaining_amount} & Complete Checkout`
            )}
          </button>
        </div>

      </div>
    </ReceptionLayout>
  );
}

export default CheckoutPage;
