import { useState } from "react";
import { Link } from "react-router-dom";
import { useProducts, useActivateProduct, useDeactivateProduct } from "@/services/product";
import { Plus, Search, Package, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import DirectorLayout from "../DirectorLayout";

export function ProductListPage() {
  const [query, setQuery] = useState("");
  const { data: products, isLoading } = useProducts(true);
  const { mutate: activate } = useActivateProduct();
  const { mutate: deactivate } = useDeactivateProduct();

  const filteredProducts = products?.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) || 
    p.sku.toLowerCase().includes(query.toLowerCase())
  ) || [];

  return (
    <DirectorLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Products</h1>
            <p className="text-slate-500 mt-1">Manage physical inventory catalog and pricing.</p>
          </div>
          <Link
            to="/director/inventory/products/new"
            className="flex items-center gap-2 bg-[#002b84] text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-900 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
        </div>

        <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or SKU..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-[#002b84] outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">SKU</th>
                  <th className="px-6 py-3 text-right">Selling Price</th>
                  <th className="px-6 py-3 text-center">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <Loader2 className="w-6 h-6 animate-spin text-slate-400 mx-auto" />
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <Package className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 font-medium">No products found</p>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map(product => (
                    <tr key={product.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900">{product.name}</td>
                      <td className="px-6 py-4 text-slate-500">{product.sku}</td>
                      <td className="px-6 py-4 text-right">₹{product.selling_price.toFixed(2)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {product.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-3">
                        <Link 
                          to={`/director/inventory/products/${product.id}/edit`}
                          className="text-[#002b84] hover:underline font-medium"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => product.is_active ? deactivate(product.id) : activate(product.id)}
                          className={`font-medium ${product.is_active ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}`}
                        >
                          {product.is_active ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DirectorLayout>
  );
}

export default ProductListPage;
