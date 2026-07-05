import { useParams, Link } from "react-router-dom";
import { useCustomerOrder } from "@/services/customer-order";
import { CheckCircle2, ShoppingBag, ArrowRight } from "lucide-react";

export default function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useCustomerOrder(id || "");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center pb-24 pt-20">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-medium">Retrieving order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center pb-24 pt-20 px-4">
        <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-sm max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Order Not Found</h2>
          <p className="text-slate-500 mb-8">We couldn't find the details for this order.</p>
          <Link to="/products" className="block w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors">
            Return to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 pt-12 md:pt-20 px-4">
      <div className="max-w-2xl mx-auto">
        
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 p-8 md:p-12 text-center relative overflow-hidden">
          
          <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-emerald-400 to-indigo-500"></div>

          <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">Order Confirmed!</h1>
          <p className="text-lg text-slate-500 mb-8">Thank you, {order.customer_name}. Your products have been reserved.</p>

          <div className="bg-slate-50 rounded-2xl p-6 mb-8 text-left border border-slate-100">
            <div className="flex justify-between items-center mb-6 pb-6 border-b border-slate-200">
              <div>
                <p className="text-sm text-slate-500 font-medium mb-1">Order Number</p>
                <p className="text-xl font-mono font-bold text-slate-900">{order.order_number}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500 font-medium mb-1">Date</p>
                <p className="font-bold text-slate-900">{order.order_date}</p>
              </div>
            </div>

            <h3 className="font-bold text-slate-900 mb-4">Product Summary</h3>
            <div className="space-y-4 mb-6">
              {order.items.map(item => (
                <div key={item.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-800">{item.product_name}</p>
                    <p className="text-sm text-slate-500">Qty: {item.ordered_quantity}</p>
                  </div>
                  <p className="font-bold text-slate-900">₹{item.line_total.toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-slate-200">
              <p className="font-bold text-slate-900">Total Amount to Pay</p>
              <p className="text-2xl font-black text-indigo-700">₹{order.grand_total.toFixed(2)}</p>
            </div>
          </div>

          <div className="bg-indigo-50 rounded-2xl p-6 text-left mb-8 flex gap-4">
            <div className="flex-shrink-0 mt-1">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-indigo-600" />
              </div>
            </div>
            <div>
              <h4 className="font-bold text-indigo-900 mb-1">Pickup Instructions</h4>
              <p className="text-sm text-indigo-700 leading-relaxed">
                Your order is now reserved and ready for pickup. Please visit the Pain Away clinic reception and present your Order Number to complete the payment and collect your items.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products" className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
              Continue Shopping <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/" className="px-8 py-3 bg-white text-slate-600 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-colors">
              Return to Home
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
