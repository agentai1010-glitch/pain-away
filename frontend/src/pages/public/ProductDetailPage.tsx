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
    <div className="w-full min-h-screen font-sans pb-24 pt-28 md:pt-36 px-4 md:px-12 lg:px-24 bg-cover bg-center bg-no-repeat bg-fixed relative" style={{ backgroundImage: "url('/images/products-bg.png')" }}>
      {/* Dark overlay to ensure readability while showing word cloud */}
      <div className="absolute inset-0 bg-blue-950/40 backdrop-blur-[2px] pointer-events-none" />

      <div className="relative z-10 max-w-[1200px] mx-auto">
        
        {/* Navigation */}
        <div className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-8 drop-shadow-md">
          <Link to="/" className="hover:text-blue-400 text-white transition-colors">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-blue-400 text-white transition-colors">Products</Link>
          <span>/</span>
          <span className="text-blue-200 font-bold truncate max-w-[200px] sm:max-w-md">{product.name}</span>
        </div>

        {/* Product Hero Section */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-xl shadow-black/30 overflow-hidden mb-12 text-white">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Image Section */}
            <div className="bg-white/95 p-12 flex items-center justify-center relative min-h-[400px] border-b md:border-b-0 md:border-r border-white/20">
              {product.image_url ? (
                <img 
                  src={product.image_url.startsWith('http') ? product.image_url : `${import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? "" : "http://localhost:8000")}${product.image_url}`} 
                  alt={product.name} 
                  className="w-full h-full object-contain mix-blend-multiply drop-shadow-xl" 
                />
              ) : (
                <ShoppingBag className="w-32 h-32 text-slate-300/50" />
              )}
              
              {isOutOfStock && (
                <div className="absolute top-6 left-6 bg-red-500/80 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-black uppercase tracking-wider border border-red-400/30 shadow-md">
                  Out of Stock
                </div>
              )}
              {isLimitedStock && (
                <div className="absolute top-6 left-6 bg-amber-500/80 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-black uppercase tracking-wider border border-amber-400/30 shadow-md">
                  Limited Stock
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="p-10 md:p-14 flex flex-col">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-sm font-bold uppercase tracking-wider text-blue-300">
                  {product.brand_name || "Unbranded"}
                </span>
                {product.category_name && (
                  <>
                    <span className="text-slate-400">•</span>
                    <span className="text-sm font-bold text-slate-300">{product.category_name}</span>
                  </>
                )}
              </div>
              
              <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4 drop-shadow-sm">{product.name}</h1>
              
              <div className="text-sm text-blue-200 mb-8 font-mono bg-white/10 backdrop-blur-md self-start px-3 py-1 rounded-lg border border-white/10">
                SKU: {product.sku}
              </div>

              <div className="mb-8">
                <p className="text-slate-200 leading-relaxed text-lg line-clamp-3">
                  {product.description || "Premium quality wellness product recommended by our expert physiotherapists."}
                </p>
              </div>

              <div className="mt-auto pt-8 border-t border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
                  <div>
                    <p className="text-sm text-slate-300 font-medium mb-1">Selling Price</p>
                    <p className="text-5xl font-black text-white drop-shadow-sm">₹{product.selling_price}</p>
                  </div>
                  
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-md border ${
                    isOutOfStock 
                      ? "bg-red-500/20 border-red-400/30 text-red-300" 
                      : isLimitedStock 
                        ? "bg-amber-500/20 border-amber-400/30 text-amber-300" 
                        : "bg-emerald-500/20 border-emerald-400/30 text-emerald-300"
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
                  className={`w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-lg ${
                    isOutOfStock 
                      ? "bg-white/5 text-slate-400 cursor-not-allowed border border-white/10" 
                      : "bg-blue-600/90 text-white hover:bg-blue-500 hover:shadow-blue-500/30 border border-blue-400/30 hover:-translate-y-0.5"
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
            <section className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-xl text-white">
              <h3 className="text-xl font-bold text-white mb-4">Complete Description</h3>
              <p className="text-slate-200 leading-relaxed">
                {product.description || "This product is part of our carefully curated selection of physiotherapy and wellness items. Designed to provide maximum comfort and support during your recovery journey."}
              </p>
            </section>
            
            <section className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-xl text-white">
              <h3 className="text-xl font-bold text-white mb-4">Key Benefits & Usage</h3>
              <ul className="space-y-3 text-slate-200">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <span>Provides excellent support and aids in faster recovery.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <span>Follow your physiotherapist's instructions for optimal usage duration.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <span>Store in a cool, dry place when not in use.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <span>Suitable for adults undergoing physical rehabilitation.</span>
                </li>
              </ul>
            </section>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-600/30 backdrop-blur-md rounded-3xl p-6 border border-blue-400/30 text-white shadow-xl">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
                Genuine Product
              </h3>
              <p className="text-sm text-blue-100">
                100% authentic product verified by Pain Away Clinic. Quality assured for your safety and recovery.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 shadow-xl text-white">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5 text-blue-400" />
                Clinic Contact
              </h3>
              <p className="text-sm text-slate-300 mb-2">Have questions about this product?</p>
              <p className="font-medium text-white">+91 90962 72792</p>
              <p className="text-sm text-slate-300">support@painaway.com</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 shadow-xl text-white">
              <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-400" />
                Support Information
              </h3>
              <p className="text-sm text-slate-300">
                Our physiotherapists can guide you on selecting the right product for your condition.
              </p>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 drop-shadow-md">Related Products</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((related: any) => (
                <Link 
                  key={related.id} 
                  to={`/products/${related.id}`}
                  className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl hover:bg-white/15 hover:border-white/30 hover:-translate-y-1 transition-all flex flex-col overflow-hidden group cursor-pointer text-white"
                >
                  <div className="h-44 bg-white/95 relative p-4 flex items-center justify-center border-b border-white/20">
                    {related.image_url ? (
                      <img 
                        src={related.image_url.startsWith('http') ? related.image_url : `${import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? "" : "http://localhost:8000")}${related.image_url}`} 
                        alt={related.name} 
                        className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105" 
                      />
                    ) : (
                      <ShoppingBag className="w-12 h-12 text-slate-300" />
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <p className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-1">{related.brand_name || "Brand"}</p>
                    <h3 className="font-bold text-white line-clamp-1 mb-2 drop-shadow-sm">{related.name}</h3>
                    <div className="mt-auto pt-2 border-t border-white/10 flex flex-col items-start gap-0.5">
                      <p className="text-xl font-black text-white drop-shadow-sm">₹{related.selling_price}</p>
                      <span className="text-xs font-semibold text-blue-300 group-hover:text-white transition-colors flex items-center gap-1 group-hover:underline">
                        View details →
                      </span>
                    </div>
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
