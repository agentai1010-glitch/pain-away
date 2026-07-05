import { useParams, Link, useNavigate } from "react-router-dom";
import { useStorefrontProducts } from "@/services/storefront";
import { ArrowLeft, ShoppingBag, CheckCircle2, XCircle } from "lucide-react";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: products = [], isLoading } = useStorefrontProducts();

  const product = products.find((p: any) => p.id === id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center pb-24 pt-20">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-medium">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center pb-24 pt-20 px-4">
        <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-sm max-w-md w-full text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-8 h-8 text-slate-300" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Product Not Found</h2>
          <p className="text-slate-500 mb-8">The product you're looking for doesn't exist or is no longer available.</p>
          <button onClick={() => navigate('/products')} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors">
            Return to Products
          </button>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.available_quantity === 0;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 pt-6 md:pt-12 px-4 md:px-12 lg:px-24">
      <div className="max-w-6xl mx-auto">
        
        {/* Back Button */}
        <Link to="/products" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            
            {/* Image Section */}
            <div className="bg-slate-50 p-12 flex items-center justify-center relative min-h-[400px]">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" />
              ) : (
                <ShoppingBag className="w-32 h-32 text-slate-200" />
              )}
              
              {isOutOfStock && (
                <div className="absolute top-6 left-6 bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-black uppercase tracking-wider shadow-sm">
                  Out of Stock
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="p-10 md:p-14 flex flex-col">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-sm font-bold uppercase tracking-wider text-indigo-600">
                  {product.brand_name || "Unbranded"}
                </span>
                {product.category_name && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="text-sm font-bold text-slate-500">{product.category_name}</span>
                  </>
                )}
              </div>
              
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">{product.name}</h1>
              
              <div className="text-sm text-slate-500 mb-8 font-mono bg-slate-50 self-start px-3 py-1 rounded-lg border border-slate-100">
                SKU: {product.sku}
              </div>

              <div className="mb-8">
                <h3 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide">Description</h3>
                <p className="text-slate-600 leading-relaxed text-lg">
                  {product.description || "No description provided for this product."}
                </p>
              </div>

              <div className="mt-auto pt-8 border-t border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
                  <div>
                    <p className="text-sm text-slate-500 font-medium mb-1">Selling Price</p>
                    <p className="text-5xl font-black text-slate-900">₹{product.selling_price}</p>
                  </div>
                  
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
                    isOutOfStock ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
                  }`}>
                    {isOutOfStock ? <XCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                    <span className="font-bold text-sm">
                      {isOutOfStock ? "Currently Unavailable" : "In Stock & Available"}
                    </span>
                  </div>
                </div>

                <button 
                  disabled={isOutOfStock}
                  className={`w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                    isOutOfStock 
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                      : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/20 hover:-translate-y-0.5"
                  }`}
                >
                  {isOutOfStock ? "Out of Stock" : "Available in Clinic"}
                </button>
                {!isOutOfStock && (
                  <p className="text-center text-sm text-slate-500 mt-4">
                    Purchase directly at the clinic reception.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
