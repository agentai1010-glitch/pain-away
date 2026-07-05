import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePurchaseOrder } from "@/services/purchase_order";
import { 
  useCreateGoodsReceipt, 
  useGoodsReceipts,
  GoodsReceiptCreate, 
  GoodsReceiptItemCreate 
} from "@/services/goods_receiving";
import { ArrowLeft, Check, Loader2, Info } from "lucide-react";
import DirectorLayout from "../DirectorLayout";

export function ReceiveGoodsFormPage() {
  const { poId } = useParams();
  const navigate = useNavigate();
  
  const { data: po, isLoading: isPoLoading } = usePurchaseOrder(poId || "");
  const { data: receipts } = useGoodsReceipts();
  const createMutation = useCreateGoodsReceipt();

  const [receivedDate, setReceivedDate] = useState((() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })());
  const [notes, setNotes] = useState("");
  
  // item id -> receiving quantity
  const [receivedQuantities, setReceivedQuantities] = useState<Record<string, number>>({});
  // item id -> accepted quantity
  const [acceptedQuantities, setAcceptedQuantities] = useState<Record<string, number>>({});

  // Calculate previously received for each item
  const getPreviouslyReceived = (poItemId: string) => {
    if (!receipts) return 0;
    const itemReceipts = receipts.flatMap(r => r.items).filter(i => i.po_item_id === poItemId);
    return itemReceipts.reduce((sum, item) => sum + item.accepted_quantity, 0);
  };

  useEffect(() => {
    if (po && receipts) {
      const initialReceived: Record<string, number> = {};
      const initialAccepted: Record<string, number> = {};
      
      po.items.forEach(item => {
        const prev = getPreviouslyReceived(item.id);
        const remaining = Math.max(0, item.ordered_quantity - prev);
        
        // Default to receiving all remaining
        initialReceived[item.id] = remaining;
        initialAccepted[item.id] = remaining;
      });
      
      setReceivedQuantities(initialReceived);
      setAcceptedQuantities(initialAccepted);
    }
  }, [po, receipts]);

  const handleReceivedChange = (itemId: string, value: number) => {
    const val = Math.max(0, value);
    setReceivedQuantities(prev => ({ ...prev, [itemId]: val }));
    // Auto-update accepted if it hasn't been manually lowered
    setAcceptedQuantities(prev => ({ ...prev, [itemId]: val }));
  };

  const handleAcceptedChange = (itemId: string, value: number) => {
    const received = receivedQuantities[itemId] || 0;
    // Accepted cannot exceed received
    const val = Math.min(Math.max(0, value), received);
    setAcceptedQuantities(prev => ({ ...prev, [itemId]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!po) return;

    // Check if anything is actually being received
    const totalAccepted = Object.values(acceptedQuantities).reduce((a, b) => a + b, 0);
    if (totalAccepted === 0) {
      alert("Please enter a quantity to receive. At least one item must have accepted quantity > 0.");
      return;
    }

    const itemsToReceive: GoodsReceiptItemCreate[] = [];
    
    for (const item of po.items) {
      const prev = getPreviouslyReceived(item.id);
      const remaining = item.ordered_quantity - prev;
      const accepted = acceptedQuantities[item.id] || 0;
      const received = receivedQuantities[item.id] || 0;
      
      if (accepted > remaining) {
        alert(`Cannot accept ${accepted} for ${item.product.name}. Only ${remaining} remaining.`);
        return;
      }
      
      if (received > 0 || accepted > 0) {
        itemsToReceive.push({
          po_item_id: item.id,
          product_id: item.product_id,
          ordered_quantity: item.ordered_quantity,
          received_quantity: received,
          accepted_quantity: accepted
        });
      }
    }

    const payload = {
      po_id: po.id,
      supplier_id: po.supplier_id,
      warehouse_id: po.warehouse_id,
      received_date: receivedDate || (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })(),
      notes: notes || null,
      items: itemsToReceive,
      created_by: "Director"
    } as GoodsReceiptCreate;

    try {
      await createMutation.mutateAsync(payload);
      navigate("/director/inventory/goods-receiving");
    } catch (err) {
      console.error(err);
      alert("Failed to receive goods.");
    }
  };

  if (isPoLoading) {
    return (
      <DirectorLayout>
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#002b84]" /></div>
      </DirectorLayout>
    );
  }

  if (!po) return null;

  const allItemsComplete = po.items.every(item => getPreviouslyReceived(item.id) >= item.ordered_quantity);

  return (
    <DirectorLayout>
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/director/inventory/goods-receiving")}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Receive Goods: {po.po_number}</h1>
            <p className="text-slate-500 text-sm mt-1">Supplier: {po.supplier.name} | Destination: {po.warehouse.name}</p>
          </div>
          <div className="ml-auto">
            {!allItemsComplete && (
              <button
                onClick={handleSubmit}
                disabled={createMutation.isPending}
                className="bg-[#002b84] hover:bg-[#002b84]/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Confirm Receipt
              </button>
            )}
          </div>
        </div>

        {allItemsComplete ? (
          <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl flex items-start gap-3">
            <Check className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h3 className="font-medium">Purchase Order Fully Received</h3>
              <p className="text-sm mt-1 text-green-700">All items on this purchase order have been completely received. No further action is required.</p>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium">Inventory Update Notice</h3>
              <p className="text-sm mt-1 text-blue-700">The "Accepted Qty" you enter below will automatically create a Stock Movement and increase your physical inventory levels at {po.warehouse.name}.</p>
            </div>
          </div>
        )}

        <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-slate-50 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Received Date</label>
              <input
                type="date"
                disabled={allItemsComplete}
                value={receivedDate}
                onChange={e => setReceivedDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded border focus:ring-2 focus:ring-[#002b84] outline-none text-sm disabled:bg-slate-50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Receipt Notes</label>
              <input
                type="text"
                disabled={allItemsComplete}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Optional carrier info, condition notes, etc."
                className="w-full px-3 py-1.5 rounded border focus:ring-2 focus:ring-[#002b84] outline-none text-sm disabled:bg-slate-50"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b">
                <tr>
                  <th className="px-6 py-3 font-medium">Product</th>
                  <th className="px-6 py-3 font-medium text-center">Ordered</th>
                  <th className="px-6 py-3 font-medium text-center">Previously Recv'd</th>
                  <th className="px-6 py-3 font-medium text-center">Remaining</th>
                  <th className="px-6 py-3 font-medium w-32">Arrived Qty</th>
                  <th className="px-6 py-3 font-medium w-32">Accepted Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-700">
                {po.items.map(item => {
                  const prev = getPreviouslyReceived(item.id);
                  const remaining = Math.max(0, item.ordered_quantity - prev);
                  const isComplete = remaining === 0;

                  return (
                    <tr key={item.id} className={isComplete ? "bg-slate-50" : "bg-white"}>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{item.product.name}</div>
                        <div className="text-slate-500 text-xs">SKU: {item.product.sku}</div>
                      </td>
                      <td className="px-6 py-4 text-center font-medium">{item.ordered_quantity}</td>
                      <td className="px-6 py-4 text-center text-slate-500">{prev}</td>
                      <td className="px-6 py-4 text-center font-bold text-[#002b84]">{remaining}</td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          min="0"
                          disabled={isComplete || allItemsComplete}
                          value={receivedQuantities[item.id] ?? 0}
                          onChange={e => handleReceivedChange(item.id, parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 rounded border focus:ring-2 focus:ring-[#002b84] outline-none text-sm text-center disabled:bg-transparent disabled:border-transparent font-medium"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          min="0"
                          max={receivedQuantities[item.id] ?? 0}
                          disabled={isComplete || allItemsComplete}
                          value={acceptedQuantities[item.id] ?? 0}
                          onChange={e => handleAcceptedChange(item.id, parseInt(e.target.value) || 0)}
                          className={`w-full px-2 py-1.5 rounded border focus:ring-2 focus:ring-[#002b84] outline-none text-sm text-center disabled:bg-transparent disabled:border-transparent font-bold ${
                            (acceptedQuantities[item.id] || 0) > remaining ? 'text-red-600 border-red-300 bg-red-50' : 'text-green-700'
                          }`}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DirectorLayout>
  );
}

export default ReceiveGoodsFormPage;
