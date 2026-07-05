import { useState } from "react";
import { useStockMovements, MovementType } from "@/services/stock_movement";
import { useWarehouses } from "@/services/warehouse";
import { useProducts } from "@/services/product";
import { Activity, Loader2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import DirectorLayout from "../DirectorLayout";

export function StockMovementListPage() {
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [selectedType, setSelectedType] = useState<MovementType | "">("");

  const { data: warehouses } = useWarehouses(false);
  const { data: products } = useProducts(false);
  const { data: movements, isLoading } = useStockMovements(
    selectedWarehouse || undefined, 
    selectedProduct || undefined, 
    (selectedType as MovementType) || undefined
  );

  const MOVEMENT_TYPES = [
    "OPENING_STOCK", 
    "GOODS_RECEIVED", 
    "RESERVATION", 
    "RESERVATION_RELEASED", 
    "SALE", 
    "ADJUSTMENT", 
    "RETURN"
  ];

  const renderMovementTypeBadge = (type: MovementType, qty: number) => {
    let colorClass = "bg-slate-100 text-slate-700";
    let icon = null;

    if (qty > 0 && type !== 'RESERVATION') {
      colorClass = "bg-green-100 text-green-700";
      icon = <ArrowUpRight className="w-3.5 h-3.5" />;
    } else if (qty < 0 || type === 'RESERVATION') {
      colorClass = "bg-amber-100 text-amber-700";
      icon = <ArrowDownRight className="w-3.5 h-3.5" />;
    }

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium uppercase tracking-wider ${colorClass}`}>
        {icon}
        {type.replace("_", " ")}
      </span>
    );
  };

  return (
    <DirectorLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Stock Movements</h1>
            <p className="text-slate-500 text-sm">Immutable audit log of all inventory changes.</p>
          </div>
        </div>

        <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-slate-50 grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500">Filter by Product</label>
              <select 
                className="w-full py-2 px-3 rounded-lg border focus:ring-2 focus:ring-[#002b84] outline-none text-sm bg-white"
                value={selectedProduct}
                onChange={e => setSelectedProduct(e.target.value)}
              >
                <option value="">All Products</option>
                {products?.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500">Filter by Warehouse</label>
              <select 
                className="w-full py-2 px-3 rounded-lg border focus:ring-2 focus:ring-[#002b84] outline-none text-sm bg-white"
                value={selectedWarehouse}
                onChange={e => setSelectedWarehouse(e.target.value)}
              >
                <option value="">All Warehouses</option>
                {warehouses?.map(wh => (
                  <option key={wh.id} value={wh.id}>{wh.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500">Movement Type</label>
              <select 
                className="w-full py-2 px-3 rounded-lg border focus:ring-2 focus:ring-[#002b84] outline-none text-sm bg-white"
                value={selectedType}
                onChange={e => setSelectedType(e.target.value as any)}
              >
                <option value="">All Types</option>
                {MOVEMENT_TYPES.map(type => (
                  <option key={type} value={type}>{type.replace("_", " ")}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b">
                <tr>
                  <th className="px-6 py-3 font-medium">Date & Ref</th>
                  <th className="px-6 py-3 font-medium">Product</th>
                  <th className="px-6 py-3 font-medium">Warehouse</th>
                  <th className="px-6 py-3 font-medium">Type</th>
                  <th className="px-6 py-3 font-medium text-right">Qty Chg</th>
                  <th className="px-6 py-3 font-medium text-right">Balance</th>
                  <th className="px-6 py-3 font-medium">Source / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <Loader2 className="w-6 h-6 animate-spin text-[#002b84] mx-auto" />
                    </td>
                  </tr>
                ) : movements?.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      <Activity className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      No stock movements found.
                    </td>
                  </tr>
                ) : (
                  movements?.map((movement) => (
                    <tr key={movement.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">
                          {new Date(movement.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })}
                        </div>
                        <div className="text-slate-500 text-xs font-mono mt-0.5">{movement.reference_number}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{movement.product.name}</div>
                        <div className="text-slate-500 text-xs">SKU: {movement.product.sku}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{movement.warehouse.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        {renderMovementTypeBadge(movement.movement_type, movement.quantity_changed)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`font-bold ${
                          movement.quantity_changed > 0 && movement.movement_type !== 'RESERVATION' ? 'text-green-600' :
                          movement.quantity_changed < 0 || movement.movement_type === 'RESERVATION' ? 'text-amber-600' : 
                          'text-slate-600'
                        }`}>
                          {movement.quantity_changed > 0 ? '+' : ''}{movement.quantity_changed}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="font-medium text-slate-900">{movement.balance_after}</div>
                        <div className="text-slate-400 text-[10px]">was {movement.balance_before}</div>
                      </td>
                      <td className="px-6 py-4 max-w-[200px]">
                        {movement.reference_source && (
                          <div className="text-xs font-medium text-slate-700 bg-slate-100 inline-block px-1.5 py-0.5 rounded mb-1">
                            Ref: {movement.reference_source}
                          </div>
                        )}
                        {movement.notes && (
                          <div className="text-xs text-slate-500 truncate" title={movement.notes}>
                            {movement.notes}
                          </div>
                        )}
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

export default StockMovementListPage;
