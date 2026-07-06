import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useStorefrontProducts } from "@/services/storefront";
import { useCreateCustomerOrder, useConfirmCustomerOrder } from "@/services/customer-order";
import { authService } from "@/services/auth";
import { ArrowLeft, ShoppingBag, ShieldCheck, Loader2, AlertTriangle, Minus, Plus } from "lucide-react";

export default function CheckoutPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: products = [], isLoading: isLoadingProduct } = useStorefrontProducts();
  const product = products.find((p: any) => p.id === id);

  const { mutateAsync: createOrder } = useCreateCustomerOrder();
  const { mutateAsync: confirmOrder } = useConfirmCustomerOrder();

  const [quantity, setQuantity] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    notes: ""
  });
  
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await authService.getProfile();
        if (profile) {
          setFormData(prev => ({
            ...prev,
            name: profile.name || "",
            phone: profile.mobile_number || ""
          }));
        }
      } catch (e) {
        // Not authenticated or error
      } finally {
        setIsAuthLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (isLoadingProduct || isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center pb-24 pt-20">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-medium">Loading secure checkout...</p>
        </div>
      </div>
    );
  }

  if (!product || product.available_quantity === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center pb-24 pt-20 px-4">
        <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-sm max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Product Unavailable</h2>
          <p className="text-slate-500 mb-8">This product is currently out of stock or does not exist.</p>
          <button onClick={() => navigate('/products')} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors">
            Return to Products
          </button>
        </div>
      </div>
    );
  }

  const availableQuantity = product.available_quantity;
  const unitPrice = product.selling_price;
  const subtotal = unitPrice * quantity;
  // Note: For public checkout, we're simplifying tax display. In a real system we'd calculate from product.tax_rate.
  // Here we just use the selling price as final for presentation.

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= availableQuantity) {
      setQuantity(newQuantity);
      setError(null);
    } else if (newQuantity > availableQuantity) {
      setError(`Only ${availableQuantity} units available in stock.`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (quantity > availableQuantity) {
        throw new Error("Insufficient stock available.");
      }

      // Create Customer Order
      const today = new Date().toISOString().split('T')[0] || "";
      const createdOrder = await createOrder({
        customer_name: formData.name,
        customer_phone: formData.phone,
        order_date: today,
        notes: formData.notes,
        created_by: "Online Storefront",
        items: [
          {
            product_id: product.id,
            ordered_quantity: quantity
          }
        ]
      });

      // Confirm Order to trigger inventory reservation
      await confirmOrder(createdOrder.id);

      navigate(`/checkout/success/${createdOrder.id}`);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to process the order. Please try again or contact the clinic.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 pt-6 md:pt-12 px-4 md:px-12 lg:px-24">
      <div className="max-w-[1200px] mx-auto">
        
        <Link to={`/products/${product.id}`} className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Product
        </Link>

        <div className="mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-indigo-700" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Secure Checkout</h1>
            <p className="text-slate-500 font-medium">Order online and pick up at the clinic.</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Form Section */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Patient Information</h2>
              
              <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Full Name *</label>
                  <input 
                    required
                    type="text"
                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-[#002b84] outline-none"
                    value={formData.name}
                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Mobile Number *</label>
                  <input 
                    required
                    type="tel"
                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-[#002b84] outline-none"
                    value={formData.phone}
                    onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                    placeholder="e.g. 9876543210"
                  />
                  <p className="text-xs text-slate-500">We will use this to link the order to your existing clinic profile if you have one.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Order Notes (Optional)</label>
                  <textarea 
                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-[#002b84] outline-none h-24"
                    value={formData.notes}
                    onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
                    placeholder="Any special instructions for the reception?"
                  />
                </div>
              </form>
            </div>
          </div>

          {/* Order Summary Section */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm sticky top-24">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h2>
              
              <div className="flex gap-4 mb-6 pb-6 border-b border-slate-100">
                <div className="w-20 h-20 bg-white rounded-xl border flex items-center justify-center shrink-0">
                  {product.image_url ? (
                    <img 
                      src={product.image_url.startsWith('http') ? product.image_url : `${import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? "" : "http://localhost:8000")}${product.image_url}`} 
                      alt={product.name} 
                      className="w-16 h-16 object-contain mix-blend-multiply" 
                    />
                  ) : (
                    <ShoppingBag className="w-8 h-8 text-slate-300" />
                  )}
                </div>
                <div className="flex-grow">
                  <h3 className="font-bold text-slate-900 line-clamp-2 leading-tight mb-1">{product.name}</h3>
                  <p className="text-sm text-slate-500 mb-2">SKU: {product.sku}</p>
                  <p className="font-bold text-indigo-700">₹{unitPrice}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-8">
                <span className="font-medium text-slate-700">Quantity</span>
                <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-1 border border-slate-200">
                  <button type="button" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm disabled:opacity-50 transition-all">
                    <Minus className="w-4 h-4 text-slate-600" />
                  </button>
                  <span className="w-6 text-center font-bold text-slate-900">{quantity}</span>
                  <button type="button" onClick={() => handleQuantityChange(1)} disabled={quantity >= availableQuantity} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm disabled:opacity-50 transition-all">
                    <Plus className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal ({quantity} item{quantity > 1 ? 's' : ''})</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-xl text-slate-900 pt-4 border-t border-slate-100">
                  <span>Total Amount</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button 
                type="submit"
                form="checkout-form"
                disabled={isSubmitting || quantity > availableQuantity}
                className="w-full py-4 bg-[#002b84] text-white font-bold rounded-2xl hover:bg-blue-900 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-[#002b84]/20"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Processing Order...</>
                ) : (
                  <>Confirm Order</>
                )}
              </button>
              
              <p className="text-center text-xs text-slate-500 mt-4 px-4 leading-relaxed">
                By confirming, you agree to reserve this product for pickup at our clinic. Payment will be collected at reception.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
