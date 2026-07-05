import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useStorefrontProducts, useStorefrontCategories, useStorefrontBrands } from "@/services/storefront";
import { Search, ShoppingBag, Filter, ArrowUpDown } from "lucide-react";

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
    <div className="min-h-screen bg-slate-50 font-sans pb-24 pt-12 md:pt-20">
      
      {/* Search Section */}
      <section className="px-6 md:px-12 lg:px-24 max-w-[1600px] mx-auto mb-8 mt-4">
        <div className="relative group w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Search products by name, brand, or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl border-none ring-1 ring-slate-200 shadow-sm focus:ring-2 focus:ring-indigo-600 focus:outline-none transition-all text-lg bg-white placeholder:text-slate-400"
          />
        </div>
      </section>

      <section className="px-6 md:px-12 lg:px-24 max-w-[1600px] mx-auto flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-8">
          <div>
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Filter className="w-4 h-4" /> Categories
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`block w-full text-left px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                  selectedCategory === null ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                All Categories
              </button>
              {categories.map((cat: any) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`block w-full text-left px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                    selectedCategory === cat.id ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Filter className="w-4 h-4" /> Brands
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedBrand(null)}
                className={`block w-full text-left px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                  selectedBrand === null ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                All Brands
              </button>
              {brands.map((brand: any) => (
                <button
                  key={brand.id}
                  onClick={() => setSelectedBrand(brand.id)}
                  className={`block w-full text-left px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                    selectedBrand === brand.id ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100"
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
            <p className="text-slate-600 font-medium">
              Showing <span className="font-bold text-slate-900">{filteredAndSortedProducts.length}</span> products
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-500">Sort by:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="appearance-none bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer"
                >
                  <option value="name">Name (A-Z)</option>
                  <option value="price_asc">Price (Low to High)</option>
                  <option value="price_desc">Price (High to Low)</option>
                </select>
                <ArrowUpDown className="w-4 h-4 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-white rounded-3xl p-6 border border-slate-100 h-80 animate-pulse flex flex-col">
                  <div className="w-full h-40 bg-slate-100 rounded-2xl mb-4"></div>
                  <div className="h-5 bg-slate-200 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
                  <div className="mt-auto h-8 bg-slate-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : filteredAndSortedProducts.length === 0 ? (
            <div className="text-center p-16 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No products found</h3>
              <p className="text-slate-500 max-w-sm">We couldn't find any products matching your current filters. Try adjusting your search criteria.</p>
              <button 
                onClick={() => { setSearchQuery(""); setSelectedBrand(null); setSelectedCategory(null); }}
                className="mt-6 px-6 py-2 bg-indigo-50 text-indigo-700 font-bold rounded-lg hover:bg-indigo-100 transition-colors"
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
                  className="bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/30 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group cursor-pointer"
                >
                  <div className="h-48 bg-slate-50 relative p-6 flex items-center justify-center">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <ShoppingBag className="w-16 h-16 text-slate-200" />
                    )}
                    
                    {product.available_quantity === 0 && (
                      <div className="absolute top-4 left-4 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                        Out of Stock
                      </div>
                    )}
                    {product.category_name && product.available_quantity > 0 && (
                      <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm text-slate-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                        {product.category_name}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6 flex flex-col flex-grow">
                    <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">{product.brand_name || "Unbranded"}</p>
                    <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">{product.name}</h3>
                    <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-grow">{product.description || "No description available."}</p>
                    
                    <div className="flex items-end justify-between mt-auto pt-4 border-t border-slate-50">
                      <div>
                        <p className="text-2xl font-extrabold text-slate-900">₹{product.selling_price}</p>
                      </div>
                      <div className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                        product.available_quantity > 0 
                          ? "bg-slate-100 text-slate-900 group-hover:bg-indigo-600 group-hover:text-white" 
                          : "bg-slate-50 text-slate-400 cursor-not-allowed"
                      }`}>
                        View Details
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </section>
    </div>
  );
}
