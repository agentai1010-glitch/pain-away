import { useState } from "react";
import { Link } from "react-router-dom";
import { usePurchaseOrders, PurchaseOrderStatus } from "@/services/purchase_order";
import { Search, ShoppingCart, Plus, Loader2, ArrowRight } from "lucide-react";
import DirectorLayout from "../DirectorLayout";

export function PurchaseOrderListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: pos, isLoading } = usePurchaseOrders();

  const filteredPOs = pos?.filter(po => 
    po.po_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    po.supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: PurchaseOrderStatus) => {
    switch (status) {
      case "DRAFT": return "bg-slate-100 text-slate-700";
      case "SUBMITTED": return "bg-blue-100 text-blue-700";
      case "PARTIALLY_RECEIVED": return "bg-amber-100 text-amber-700";
      case "FULLY_RECEIVED": return "bg-green-100 text-green-700";
      case "CANCELLED": return "bg-red-100 text-red-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <DirectorLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Purchase Orders</h1>
            <p className="text-slate-500 text-sm">Manage procurement requests to suppliers.</p>
          </div>
          <Link 
            to="/director/inventory/purchase-orders/new" 
            className="bg-[#002b84] hover:bg-[#002b84]/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Purchase Order
          </Link>
        </div>

        <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-slate-50 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                placeholder="Search by PO number or supplier..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-[#002b84] outline-none text-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b">
                <tr>
                  <th className="px-6 py-3 font-medium">PO Number</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Supplier</th>
                  <th className="px-6 py-3 font-medium">Warehouse</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Total</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <Loader2 className="w-6 h-6 animate-spin text-[#002b84] mx-auto" />
                    </td>
                  </tr>
                ) : filteredPOs?.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      <ShoppingCart className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      No purchase orders found.
                    </td>
                  </tr>
                ) : (
                  filteredPOs?.map((po) => (
                    <tr key={po.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{po.po_number}</div>
                        <div className="text-slate-500 text-[10px]">
                          Created by: {po.created_by || 'System'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{po.order_date}</div>
                        <div className="text-xs text-slate-500">Exp: {po.expected_delivery_date || 'TBD'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{po.supplier.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-700">{po.warehouse.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(po.status)}`}>
                          {po.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold">
                        ₹{po.grand_total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link 
                          to={`/director/inventory/purchase-orders/${po.id}/edit`}
                          className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-[#002b84] hover:bg-slate-100 rounded-lg transition-colors"
                          title="View / Edit"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </Link>
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

export default PurchaseOrderListPage;
