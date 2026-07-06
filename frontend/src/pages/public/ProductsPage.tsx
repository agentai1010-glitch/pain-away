import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useStorefrontProducts, useStorefrontCategories, useStorefrontBrands } from "@/services/storefront";
import { Search, ShoppingBag, Filter, ArrowUpDown } from "lucide-react";
import { getImageUrl } from "@/lib/utils";

export default function ProductsPage() {
  const { data: products = [], isLoading: productsLoading } = useStorefrontProducts();
  const { data: categories = [], isLoading: categoriesLoading } = useStorefrontCategories();
  const { data: brands = [], isLoading: brandsLoading } = useStorefrontBrands();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "price_asc" | "price_desc" | "newest">("name");

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // Search
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(lowerQuery) ||
          (p.description && p.description.toLowerCase().includes(lowerQuery)) ||
          p.sku.toLowerCase().includes(lowerQuery)
      );
    }

    // Category
    if (selectedCategory) {
      result = result.filter((p) => p.category_id === selectedCategory);
    }

    // Brand
    if (selectedBrand) {
      result = result.filter((p) => p.brand_id === selectedBrand);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price_asc":
          return a.selling_price - b.selling_price;
        case "price_desc":
          return b.selling_price - a.selling_price;
        case "newest":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return result;
  }, [products, searchQuery, selectedCategory, selectedBrand, sortBy]);

  const isLoading = productsLoading || categoriesLoading || brandsLoading;

  return (
    <div className="w-full min-h-screen font-sans pb-24 pt-28 md:pt-36 bg-cover bg-center bg-no-repeat bg-fixed relative" style={{ backgroundImage: "url('/images/products-bg.png')" }}>
      {/* Dark overlay to ensure readability while showing word cloud */}
      <div className="absolute inset-0 bg-blue-950/40 backdrop-blur-[2px] pointer-events-none" />

      <div className="relative z-10">
        {/* Search Section */}
        <section className="px-6 md:px-12 lg:px-24 max-w-[1600px] mx-auto mb-8 mt-4 flex justify-center">
          <div className="relative group w-full max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-blue-400 transition-colors">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Search products by name, brand, or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-white/20 shadow-xl focus:ring-2 focus:ring-blue-400 focus:bg-white/15 focus:outline-none transition-all text-base md:text-lg bg-white/10 backdrop-blur-md text-white placeholder:text-slate-300"
            />
          </div>
        </section>

        <section className="px-6 md:px-12 lg:px-24 max-w-[1600px] mx-auto flex flex-col md:flex-row gap-8">
          
          {/* Sidebar Filters */}
          <aside className="w-full md:w-64 flex-shrink-0 space-y-8">
            <div>
              <h3 className="font-bold text-white mb-4 flex items-center gap-2 drop-shadow-md">
                <Filter className="w-4 h-4 text-blue-400" /> Categories
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`block w-full text-left px-3 py-2 rounded-xl transition-all text-sm font-medium ${
                    selectedCategory === null 
                      ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/40 border border-blue-400/30" 
                      : "text-slate-300 hover:bg-white/10 hover:text-white border border-transparent"
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat: any) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`block w-full text-left px-3 py-2 rounded-xl transition-all text-sm font-medium ${
                      selectedCategory === cat.id 
                        ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/40 border border-blue-400/30" 
                        : "text-slate-300 hover:bg-white/10 hover:text-white border border-transparent"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-white mb-4 flex items-center gap-2 drop-shadow-md">
                <Filter className="w-4 h-4 text-blue-400" /> Brands
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedBrand(null)}
                  className={`block w-full text-left px-3 py-2 rounded-xl transition-all text-sm font-medium ${
                    selectedBrand === null 
                      ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/40 border border-blue-400/30" 
                      : "text-slate-300 hover:bg-white/10 hover:text-white border border-transparent"
                  }`}
                >
                  All Brands
                </button>
                {brands.map((brand: any) => (
                  <button
                    key={brand.id}
                    onClick={() => setSelectedBrand(brand.id)}
                    className={`block w-full text-left px-3 py-2 rounded-xl transition-all text-sm font-medium ${
                      selectedBrand === brand.id 
                        ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/40 border border-blue-400/30" 
                        : "text-slate-300 hover:bg-white/10 hover:text-white border border-transparent"
                    }`}
                  >
                    {brand.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <p className="text-slate-200 font-medium drop-shadow-md">
                Showing <span className="font-bold text-white">{filteredAndSortedProducts.length}</span> products
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-300">Sort by:</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="appearance-none bg-slate-900/80 backdrop-blur-md border border-white/20 rounded-xl pl-3 pr-8 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer shadow-lg"
                  >
                    <option value="name">Name (A-Z)</option>
                    <option value="price_asc">Price (Low to High)</option>
                    <option value="price_desc">Price (High to Low)</option>
                  </select>
                  <ArrowUpDown className="w-4 h-4 text-slate-300 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/15 min-h-[20rem] h-auto animate-pulse flex flex-col">
                    <div className="w-full h-40 bg-white/10 rounded-2xl mb-4"></div>
                    <div className="h-5 bg-white/20 rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-white/10 rounded w-1/2 mb-4"></div>
                    <div className="mt-auto h-8 bg-white/20 rounded w-1/3"></div>
                  </div>
                ))}
              </div>
            ) : filteredAndSortedProducts.length === 0 ? (
              <div className="text-center p-16 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-xl flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No products found</h3>
                <p className="text-slate-300 max-w-sm">We couldn't find any products matching your current filters. Try adjusting your search criteria.</p>
                <button 
                  onClick={() => { setSearchQuery(""); setSelectedBrand(null); setSelectedCategory(null); }}
                  className="mt-6 px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 shadow-lg shadow-blue-500/30 transition-all"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {filteredAndSortedProducts.map((product) => (
                  <Link 
                    key={product.id} 
                    to={`/products/${product.id}`}
                    className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-xl shadow-black/20 overflow-hidden hover:bg-white/15 hover:border-white/30 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col group cursor-pointer"
                  >
                    <div className="h-52 bg-white/95 relative p-4 flex items-center justify-center border-b border-white/20">
                      {product.image_url ? (
                        <img 
                          src={getImageUrl(product.image_url)} 
                          alt={product.name} 
                          className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105" 
                        />
                      ) : (
                        <ShoppingBag className="w-16 h-16 text-slate-300" />
                      )}
                      
                      {product.available_quantity === 0 && (
                        <div className="absolute top-4 left-4 bg-red-500/90 text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-md">
                          Out of Stock
                        </div>
                      )}
                      {product.category_name && product.available_quantity > 0 && (
                        <div className="absolute top-4 left-4 bg-blue-900/80 backdrop-blur-md text-blue-100 px-3 py-1 rounded-full text-xs font-bold border border-blue-400/30 shadow-md">
                          {product.category_name}
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6 flex flex-col flex-grow">
                      <p className="text-xs font-bold uppercase tracking-wider text-blue-300 mb-1">{product.brand_name || "Unbranded"}</p>
                      <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 drop-shadow-sm">{product.name}</h3>
                      <p className="text-sm text-slate-300 line-clamp-2 mb-4 flex-grow">{product.description || "No description available."}</p>
                      
                      <div className="mt-auto pt-4 border-t border-white/10 flex flex-col items-start gap-1">
                        <p className="text-2xl font-extrabold text-white drop-shadow-sm">₹{product.selling_price}</p>
                        <span className="text-xs font-semibold text-blue-300 group-hover:text-white transition-colors flex items-center gap-1 group-hover:underline">
                          View details →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </main>
        </section>
      </div>
    </div>
  );
}
