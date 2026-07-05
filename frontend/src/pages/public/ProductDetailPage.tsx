import { useParams, Link, useNavigate } from "react-router-dom";
import { useStorefrontProducts } from "@/services/storefront";
import { ShoppingBag, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Phone, HelpCircle } from "lucide-react";

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
  const isLimitedStock = product.available_quantity > 0 && product.available_quantity <= 5;

  const relatedProducts = products.filter((p: any) => p.category_id === product.category_id && p.id !== product.id).slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 pt-6 md:pt-12 px-4 md:px-12 lg:px-24">
      <div className="max-w-[1200px] mx-auto">
        
        {/* Navigation */}
        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-8">
          <Link to="/" className="hover:text-indigo-600 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-indigo-600 transition-colors">Products</Link>
          <span>/</span>
          <span className="text-slate-900 truncate max-w-[200px] sm:max-w-md">{product.name}</span>
        </div>

        {/* Product Hero Section */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden mb-12">
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
              {isLimitedStock && (
                <div className="absolute top-6 left-6 bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-black uppercase tracking-wider shadow-sm">
                  Limited Stock
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
                <p className="text-slate-600 leading-relaxed text-lg line-clamp-3">
                  {product.description || "Premium quality wellness product recommended by our expert physiotherapists."}
                </p>
              </div>

              <div className="mt-auto pt-8 border-t border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
                  <div>
                    <p className="text-sm text-slate-500 font-medium mb-1">Selling Price</p>
                    <p className="text-5xl font-black text-slate-900">₹ {product.selling_price}</p>
                  </div>
                  
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
                    isOutOfStock ? "bg-red-50 text-red-700" : isLimitedStock ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
                  }`}>
                    {isOutOfStock ? <XCircle className="w-5 h-5" /> : isLimitedStock ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                    <span className="font-bold text-sm">
                      {isOutOfStock ? "Out of Stock" : isLimitedStock ? "Limited Stock" : "In Stock"}
                    </span>
                  </div>
                </div>

                <button 
                  disabled={isOutOfStock}
                  onClick={() => navigate(`/products/${product.id}/checkout`)}
                  className={`w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                    isOutOfStock 
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                      : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/20 hover:-translate-y-0.5"
                  }`}
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Information Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="md:col-span-2 space-y-8">
            <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Complete Description</h3>
              <p className="text-slate-600 leading-relaxed">
                {product.description || "This product is part of our carefully curated selection of physiotherapy and wellness items. Designed to provide maximum comfort and support during your recovery journey."}
              </p>
            </section>
            
            <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Key Benefits & Usage</h3>
              <ul className="space-y-3 text-slate-600">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Provides excellent support and aids in faster recovery.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Follow your physiotherapist's instructions for optimal usage duration.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Store in a cool, dry place when not in use.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Suitable for adults undergoing physical rehabilitation.</span>
                </li>
              </ul>
            </section>
          </div>

          <div className="space-y-6">
            <div className="bg-indigo-50 rounded-3xl p-6 border border-indigo-100">
              <h3 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                Genuine Product
              </h3>
              <p className="text-sm text-indigo-700/80">
                100% authentic product verified by Pain Away Clinic. Quality assured for your safety and recovery.
              </p>
            </div>
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5 text-slate-400" />
                Clinic Contact
              </h3>
              <p className="text-sm text-slate-600 mb-2">Have questions about this product?</p>
              <p className="font-medium text-slate-900">+91 98765 43210</p>
              <p className="text-sm text-slate-500">support@painaway.com</p>
            </div>
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-slate-400" />
                Support Information
              </h3>
              <p className="text-sm text-slate-600">
                Our physiotherapists can guide you on selecting the right product for your condition.
              </p>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Related Products</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((related: any) => (
                <Link 
                  key={related.id} 
                  to={`/products/${related.id}`}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col overflow-hidden group cursor-pointer"
                >
                  <div className="h-40 bg-slate-50 relative p-4 flex items-center justify-center">
                    {related.image_url ? (
                      <img src={related.image_url} alt={related.name} className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <ShoppingBag className="w-12 h-12 text-slate-200" />
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">{related.brand_name || "Brand"}</p>
                    <h3 className="font-bold text-slate-900 line-clamp-1 mb-2">{related.name}</h3>
                    <p className="text-xl font-black text-slate-900 mt-auto">₹ {related.selling_price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
