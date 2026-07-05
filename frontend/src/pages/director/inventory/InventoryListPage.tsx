import { useState } from "react";
import { useInventory } from "@/services/inventory";
import { useWarehouses } from "@/services/warehouse";
import { Search, Layers, Loader2, AlertTriangle, AlertCircle } from "lucide-react";
import DirectorLayout from "../DirectorLayout";

export function InventoryListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("");

  const { data: warehouses } = useWarehouses(false);
  const { data: inventory, isLoading } = useInventory(selectedWarehouse || undefined);

  const filteredInventory = inventory?.filter(inv => 
    inv.product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    inv.product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DirectorLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Current Inventory</h1>
            <p className="text-slate-500 text-sm">View real-time stock levels across all warehouses.</p>
          </div>
        </div>

        <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-slate-50 flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full md:max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                placeholder="Search products by name or SKU..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-[#002b84] outline-none text-sm"
              />
            </div>
            
            <div className="w-full md:w-64">
              <select 
                className="w-full py-2 px-3 rounded-lg border focus:ring-2 focus:ring-[#002b84] outline-none text-sm bg-white"
                value={selectedWarehouse}
                onChange={e => setSelectedWarehouse(e.target.value)}
              >
                <option value="">All Warehouses</option>
                {warehouses?.map(wh => (
                  <option key={wh.id} value={wh.id}>{wh.name} {wh.is_default ? '(Default)' : ''}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b">
                <tr>
                  <th className="px-6 py-3 font-medium">Product Details</th>
                  <th className="px-6 py-3 font-medium">Warehouse</th>
                  <th className="px-6 py-3 font-medium text-right">Current Qty</th>
                  <th className="px-6 py-3 font-medium text-right">Reserved Qty</th>
                  <th className="px-6 py-3 font-medium text-right">Available Qty</th>
                  <th className="px-6 py-3 font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <Loader2 className="w-6 h-6 animate-spin text-[#002b84] mx-auto" />
                    </td>
                  </tr>
                ) : filteredInventory?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      <Layers className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      No inventory records found.
                    </td>
                  </tr>
                ) : (
                  filteredInventory?.map((item) => {
                    const isOutOfStock = item.available_quantity === 0;
                    const isLowStock = !isOutOfStock && item.available_quantity <= item.reorder_level;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900">{item.product.name}</div>
                          <div className="text-slate-500 text-xs mt-0.5">SKU: {item.product.sku}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium">{item.warehouse.name}</div>
                          <div className="text-slate-500 text-xs font-mono mt-0.5">{item.warehouse.code}</div>
                        </td>
                        <td className="px-6 py-4 text-right font-medium">{item.current_quantity}</td>
                        <td className="px-6 py-4 text-right text-slate-500">{item.reserved_quantity}</td>
                        <td className="px-6 py-4 text-right font-bold text-slate-900">{item.available_quantity}</td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            {isOutOfStock ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                <AlertCircle className="w-3.5 h-3.5" /> Out of Stock
                              </span>
                            ) : isLowStock ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                                <AlertTriangle className="w-3.5 h-3.5" /> Low Stock
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                In Stock
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DirectorLayout>
  );
}

export default InventoryListPage;
