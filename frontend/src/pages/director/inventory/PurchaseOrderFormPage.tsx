import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  usePurchaseOrder, 
  useCreatePurchaseOrder, 
  useUpdatePurchaseOrder, 
  useSubmitPurchaseOrder,
  PurchaseOrderCreate, 
  PurchaseOrderItemCreate
} from "@/services/purchase_order";
import { useWarehouses } from "@/services/warehouse";
import { useSuppliers } from "@/services/supplier";
import { useProducts } from "@/services/product";
import { ArrowLeft, Save, Loader2, Send, Plus, Trash2 } from "lucide-react";
import DirectorLayout from "../DirectorLayout";

export function PurchaseOrderFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id && id !== "new");

  const { data: po, isLoading: isPoLoading } = usePurchaseOrder(isEdit ? id! : "");
  const { data: warehouses } = useWarehouses(true); // only active
  const { data: suppliers } = useSuppliers(true);
  const { data: products } = useProducts(true);

  const createMutation = useCreatePurchaseOrder();
  const updateMutation = useUpdatePurchaseOrder();
  const submitMutation = useSubmitPurchaseOrder();

  const [formData, setFormData] = useState<Partial<PurchaseOrderCreate>>({
    supplier_id: "",
    warehouse_id: "",
    order_date: new Date().toISOString().split('T')[0],
    expected_delivery_date: "",
    notes: "",
    items: [],
  });

  const [items, setItems] = useState<PurchaseOrderItemCreate[]>([]);

  useEffect(() => {
    if (isEdit && po) {
      setFormData({
        supplier_id: po.supplier_id,
        warehouse_id: po.warehouse_id,
        order_date: po.order_date,
        expected_delivery_date: po.expected_delivery_date || "",
        notes: po.notes || "",
      });
      setItems(po.items.map(item => ({
        product_id: item.product_id,
        ordered_quantity: item.ordered_quantity,
        unit_cost: item.unit_cost,
        tax_rate: item.tax_rate
      })));
    }
  }, [isEdit, po]);

  const isReadOnly = isEdit && po?.status !== "DRAFT";

  const handleAddItem = () => {
    if (isReadOnly) return;
    setItems([...items, { product_id: "", ordered_quantity: 1, unit_cost: 0, tax_rate: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (isReadOnly) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof PurchaseOrderItemCreate, value: any) => {
    if (isReadOnly) return;
    const newItems = [...items];
    
    // Auto-fill cost and tax if product changes
    if (field === "product_id" && products) {
      const selectedProduct = products.find(p => p.id === value);
      if (selectedProduct) {
        newItems[index] = {
          ...newItems[index],
          product_id: value as string,
          unit_cost: selectedProduct.cost_price,
          tax_rate: selectedProduct.tax_rate || 0,
          ordered_quantity: newItems[index]?.ordered_quantity || 1
        };
        setItems(newItems);
        return;
      }
    }

    newItems[index] = { ...newItems[index], [field]: value } as PurchaseOrderItemCreate;
    setItems(newItems);
  };

  const calculateTotals = () => {
    let sub = 0;
    let tax = 0;
    items.forEach(item => {
      const lineTotal = item.ordered_quantity * item.unit_cost;
      sub += lineTotal;
      tax += lineTotal * (item.tax_rate / 100);
    });
    return { sub, tax, grand: sub + tax };
  };

  const totals = calculateTotals();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;

    if (items.length === 0) {
      alert("Please add at least one item to the purchase order.");
      return;
    }

    if (items.some(i => !i.product_id || i.ordered_quantity <= 0)) {
      alert("Please ensure all items have a selected product and valid quantity.");
      return;
    }

    const payload: PurchaseOrderCreate = {
      supplier_id: formData.supplier_id!,
      warehouse_id: formData.warehouse_id!,
      order_date: formData.order_date!,
      expected_delivery_date: formData.expected_delivery_date || null,
      notes: formData.notes || null,
      items: items,
      created_by: "Director",
    };

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: id!, data: payload });
        navigate("/director/inventory/purchase-orders");
      } else {
        await createMutation.mutateAsync(payload);
        navigate("/director/inventory/purchase-orders");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while saving the purchase order.");
    }
  };

  const handleSubmitToSupplier = async () => {
    if (confirm("Are you sure you want to submit this purchase order? It will become read-only.")) {
      try {
        await submitMutation.mutateAsync(id!);
        // Refresh handled by react-query
      } catch (err) {
        console.error(err);
        alert("Failed to submit purchase order.");
      }
    }
  };

  if (isEdit && isPoLoading) {
    return (
      <DirectorLayout>
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#002b84]" /></div>
      </DirectorLayout>
    );
  }

  return (
    <DirectorLayout>
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/director/inventory/purchase-orders")}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {isEdit ? (isReadOnly ? `View Purchase Order: ${po?.po_number}` : `Edit Draft PO: ${po?.po_number}`) : "New Purchase Order"}
            </h1>
            {isEdit && (
              <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                po?.status === 'DRAFT' ? 'bg-slate-100 text-slate-700' : 
                po?.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'
              }`}>
                {po?.status}
              </span>
            )}
          </div>
          <div className="ml-auto flex gap-3">
            {isEdit && po?.status === "DRAFT" && (
              <button
                type="button"
                onClick={handleSubmitToSupplier}
                disabled={submitMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                {submitMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Submit Order
              </button>
            )}
            {!isReadOnly && (
              <button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-[#002b84] hover:bg-[#002b84]/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Draft
              </button>
            )}
          </div>
        </div>

        <form className="space-y-6">
          <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-slate-50">
              <h2 className="font-semibold text-slate-800">Order Details</h2>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Supplier *</label>
                <select
                  required
                  disabled={isReadOnly}
                  value={formData.supplier_id}
                  onChange={e => setFormData({...formData, supplier_id: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[#002b84] outline-none disabled:bg-slate-50 disabled:text-slate-500"
                >
                  <option value="">Select Supplier</option>
                  {suppliers?.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Destination Warehouse *</label>
                <select
                  required
                  disabled={isReadOnly}
                  value={formData.warehouse_id}
                  onChange={e => setFormData({...formData, warehouse_id: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[#002b84] outline-none disabled:bg-slate-50 disabled:text-slate-500"
                >
                  <option value="">Select Warehouse</option>
                  {warehouses?.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Order Date *</label>
                <input
                  type="date"
                  required
                  disabled={isReadOnly}
                  value={formData.order_date}
                  onChange={e => setFormData({...formData, order_date: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[#002b84] outline-none disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Expected Delivery Date</label>
                <input
                  type="date"
                  disabled={isReadOnly}
                  value={formData.expected_delivery_date || ""}
                  onChange={e => setFormData({...formData, expected_delivery_date: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[#002b84] outline-none disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-slate-700">Notes / Instructions</label>
                <textarea
                  disabled={isReadOnly}
                  value={formData.notes || ""}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[#002b84] outline-none min-h-[80px] disabled:bg-slate-50 disabled:text-slate-500"
                  placeholder="Optional order notes..."
                />
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
              <h2 className="font-semibold text-slate-800">Order Items</h2>
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="text-sm text-[#002b84] hover:text-[#002b84]/80 font-medium flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add Item
                </button>
              )}
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 border-b">
                  <tr>
                    <th className="px-4 py-3 font-medium">Product</th>
                    <th className="px-4 py-3 font-medium w-24">Qty</th>
                    <th className="px-4 py-3 font-medium w-32">Unit Cost (₹)</th>
                    <th className="px-4 py-3 font-medium w-24">Tax (%)</th>
                    <th className="px-4 py-3 font-medium w-32 text-right">Line Total (₹)</th>
                    {!isReadOnly && <th className="px-4 py-3 font-medium w-12 text-center"></th>}
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-700">
                  {items.map((item, index) => {
                    const lineTotal = item.ordered_quantity * item.unit_cost;
                    return (
                      <tr key={index} className="bg-white">
                        <td className="px-4 py-3">
                          {isReadOnly ? (
                            <div className="font-medium">{products?.find(p => p.id === item.product_id)?.name}</div>
                          ) : (
                            <select
                              value={item.product_id}
                              onChange={e => handleItemChange(index, "product_id", e.target.value)}
                              className="w-full px-2 py-1.5 rounded border focus:ring-2 focus:ring-[#002b84] outline-none text-sm"
                            >
                              <option value="">Select Product...</option>
                              {products?.map(p => (
                                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                              ))}
                            </select>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="1"
                            disabled={isReadOnly}
                            value={item.ordered_quantity}
                            onChange={e => handleItemChange(index, "ordered_quantity", parseInt(e.target.value) || 0)}
                            className="w-full px-2 py-1.5 rounded border focus:ring-2 focus:ring-[#002b84] outline-none text-sm disabled:bg-slate-50 disabled:border-transparent"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            disabled={isReadOnly}
                            value={item.unit_cost}
                            onChange={e => handleItemChange(index, "unit_cost", parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1.5 rounded border focus:ring-2 focus:ring-[#002b84] outline-none text-sm disabled:bg-slate-50 disabled:border-transparent"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0"
                            step="0.1"
                            disabled={isReadOnly}
                            value={item.tax_rate}
                            onChange={e => handleItemChange(index, "tax_rate", parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1.5 rounded border focus:ring-2 focus:ring-[#002b84] outline-none text-sm disabled:bg-slate-50 disabled:border-transparent"
                          />
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {lineTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </td>
                        {!isReadOnly && (
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={isReadOnly ? 5 : 6} className="px-4 py-8 text-center text-slate-500">
                        No items added yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="bg-slate-50 border-t p-6">
              <div className="w-full sm:w-1/2 md:w-1/3 ml-auto space-y-3">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Subtotal</span>
                  <span>₹{totals.sub.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Tax</span>
                  <span>₹{totals.tax.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="pt-3 border-t flex justify-between font-bold text-lg text-slate-900">
                  <span>Grand Total</span>
                  <span>₹{totals.grand.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

          </div>
        </form>
      </div>
    </DirectorLayout>
  );
}

export default PurchaseOrderFormPage;
