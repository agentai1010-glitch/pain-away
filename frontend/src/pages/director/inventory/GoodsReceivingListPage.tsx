import { useState } from "react";
import { Link } from "react-router-dom";
import { usePurchaseOrders } from "@/services/purchase_order";
import { useGoodsReceipts } from "@/services/goods_receiving";
import { Search, PackageCheck, Loader2, ArrowRight } from "lucide-react";
import DirectorLayout from "../DirectorLayout";

export function GoodsReceivingListPage() {
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: pos, isLoading: isLoadingPOs } = usePurchaseOrders();
  const { data: receipts, isLoading: isLoadingReceipts } = useGoodsReceipts();

  const pendingPOs = pos?.filter(po => 
    (po.status === "SUBMITTED" || po.status === "PARTIALLY_RECEIVED") &&
    (po.po_number.toLowerCase().includes(searchTerm.toLowerCase()) || 
     po.supplier.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredReceipts = receipts?.filter(r => 
    r.receipt_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.purchase_order.po_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DirectorLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Goods Receiving</h1>
          <p className="text-slate-500 text-sm">Receive products against submitted purchase orders.</p>
        </div>

        <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-slate-50 flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex bg-slate-200 p-1 rounded-lg">
              <button 
                onClick={() => setActiveTab("pending")}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === "pending" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Pending POs
              </button>
              <button 
                onClick={() => setActiveTab("history")}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === "history" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Receipt History
              </button>
            </div>

            <div className="relative flex-1 w-full sm:max-w-xs">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-[#002b84] outline-none text-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            {activeTab === "pending" ? (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 border-b">
                  <tr>
                    <th className="px-6 py-3 font-medium">PO Number</th>
                    <th className="px-6 py-3 font-medium">Date</th>
                    <th className="px-6 py-3 font-medium">Supplier</th>
                    <th className="px-6 py-3 font-medium">Destination</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-700">
                  {isLoadingPOs ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <Loader2 className="w-6 h-6 animate-spin text-[#002b84] mx-auto" />
                      </td>
                    </tr>
                  ) : pendingPOs?.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        <PackageCheck className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        No pending purchase orders to receive.
                      </td>
                    </tr>
                  ) : (
                    pendingPOs?.map((po) => (
                      <tr key={po.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900">{po.po_number}</td>
                        <td className="px-6 py-4 text-slate-500">{po.order_date}</td>
                        <td className="px-6 py-4 font-medium">{po.supplier.name}</td>
                        <td className="px-6 py-4">{po.warehouse.name}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            po.status === "PARTIALLY_RECEIVED" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                          }`}>
                            {po.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link 
                            to={`/director/inventory/goods-receiving/new/${po.id}`}
                            className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-[#002b84] hover:bg-slate-100 rounded-lg transition-colors"
                            title="Receive Goods"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 border-b">
                  <tr>
                    <th className="px-6 py-3 font-medium">Receipt #</th>
                    <th className="px-6 py-3 font-medium">Date</th>
                    <th className="px-6 py-3 font-medium">PO Number</th>
                    <th className="px-6 py-3 font-medium">Supplier</th>
                    <th className="px-6 py-3 font-medium">Received By</th>
                    <th className="px-6 py-3 font-medium text-right">Items</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-700">
                  {isLoadingReceipts ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <Loader2 className="w-6 h-6 animate-spin text-[#002b84] mx-auto" />
                      </td>
                    </tr>
                  ) : filteredReceipts?.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        <PackageCheck className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        No goods receipts found.
                      </td>
                    </tr>
                  ) : (
                    filteredReceipts?.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900">{r.receipt_number}</td>
                        <td className="px-6 py-4 text-slate-500">{r.received_date}</td>
                        <td className="px-6 py-4 font-medium text-[#002b84]">{r.purchase_order.po_number}</td>
                        <td className="px-6 py-4">{r.supplier.name}</td>
                        <td className="px-6 py-4 text-slate-500">{r.created_by || 'System'}</td>
                        <td className="px-6 py-4 text-right font-medium">
                          {r.items.reduce((sum, item) => sum + item.accepted_quantity, 0)} units
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </DirectorLayout>
  );
}

export default GoodsReceivingListPage;
