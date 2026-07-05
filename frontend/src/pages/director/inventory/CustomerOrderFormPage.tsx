import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCreateCustomerOrder, CustomerOrderCreate, CustomerOrderItemCreate } from '@/services/customer_order';
import { useProducts } from '@/services/product';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import DirectorLayout from '../DirectorLayout';

export const CustomerOrderFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: products = [] } = useProducts(false); // Only active products
  const createOrderMutation = useCreateCustomerOrder();
  
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    order_date: (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })() as string,
    notes: ''
  });

  const [items, setItems] = useState<{product_id: string, ordered_quantity: number}[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const addItem = () => {
    setItems([...items, { product_id: '', ordered_quantity: 1 }]);
  };
  
  const updateItem = (index: number, field: 'product_id' | 'ordered_quantity', value: any) => {
    const newItems = [...items];
    if (newItems[index]) {
      if (field === 'product_id') {
        newItems[index]!.product_id = value;
      } else {
        newItems[index]!.ordered_quantity = value;
      }
    }
    setItems(newItems);
  };
  
  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };
  
  const calculateTotal = () => {
    return items.reduce((total, item) => {
      const product = products.find((p: any) => p.id === item.product_id);
      if (product) {
        const lineTotal = product.selling_price * item.ordered_quantity;
        const tax = lineTotal * (product.tax_rate / 100);
        return total + lineTotal + tax;
      }
      return total;
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0 || items.some(item => !item.product_id || item.ordered_quantity <= 0)) {
      alert("Please add at least one valid product with quantity > 0");
      return;
    }
    
    try {
      const data: CustomerOrderCreate = {
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        order_date: formData.order_date,
        notes: formData.notes,
        items: items as CustomerOrderItemCreate[],
        created_by: 'Director'
      };
      
      const response = await createOrderMutation.mutateAsync(data);
      const orderId = (response as any).data?.id || (response as any).id;
      if (orderId) {
        navigate(`/director/inventory/customer-orders/${orderId}`);
      } else {
        navigate('/director/inventory/customer-orders');
      }
    } catch (error) {
      console.error('Failed to create customer order', error);
      alert('Failed to create customer order. Please check the form.');
    }
  };

  return (
    <DirectorLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link 
            to="/director/inventory/customer-orders"
            className="p-2 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Create Customer Order</h1>
            <p className="text-slate-500 mt-1">Draft a new sales transaction.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-slate-900 border-b pb-2">Customer Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700">Customer Name *</label>
                  <input
                    type="text"
                    name="customer_name"
                    required
                    value={formData.customer_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-[#002b84] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700">Customer Phone *</label>
                  <input
                    type="text"
                    name="customer_phone"
                    required
                    value={formData.customer_phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-[#002b84] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700">Order Date *</label>
                  <input
                    type="date"
                    name="order_date"
                    required
                    value={formData.order_date}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-[#002b84] outline-none"
                  />
                </div>
              </div>
              
              <div className="space-y-1 mt-4">
                <label className="block text-sm font-medium text-slate-700">Notes</label>
                <textarea
                  name="notes"
                  rows={2}
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-[#002b84] outline-none"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="text-lg font-medium text-slate-900">Products</h3>
                <button 
                  type="button" 
                  onClick={addItem}
                  className="flex items-center gap-1 text-sm font-medium text-[#002b84] hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Product
                </button>
              </div>
              
              {items.length === 0 ? (
                <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  No products added yet. Click 'Add Product' to begin.
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item, index) => {
                    const product = products.find((p: any) => p.id === item.product_id);
                    const price = product ? product.selling_price : 0;
                    const tax = product ? product.tax_rate : 0;
                    const lineTotal = price * item.ordered_quantity;
                    const totalWithTax = lineTotal + (lineTotal * (tax / 100));
                    
                    return (
                      <div key={index} className="flex flex-wrap items-end gap-4 p-4 border border-slate-200 rounded-xl bg-slate-50">
                        <div className="flex-grow space-y-1 min-w-[200px]">
                          <label className="block text-xs font-medium text-slate-700">Product</label>
                          <select
                            required
                            value={item.product_id}
                            onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                            className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-[#002b84] outline-none bg-white"
                          >
                            <option value="">Select a product...</option>
                            {products.map((p: any) => (
                              <option key={p.id} value={p.id}>{p.name} - {p.sku}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="space-y-1 w-24">
                          <label className="block text-xs font-medium text-slate-700">Quantity</label>
                          <input
                            type="number"
                            required
                            min="1"
                            value={item.ordered_quantity}
                            onChange={(e) => updateItem(index, 'ordered_quantity', parseInt(e.target.value) || 1)}
                            className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-[#002b84] outline-none bg-white"
                          />
                        </div>
                        
                        <div className="space-y-1 w-32 px-2 py-2">
                          <div className="text-xs text-slate-500">Price: ₹{price.toFixed(2)}</div>
                          <div className="text-xs text-slate-500">Tax: {tax}%</div>
                          <div className="text-sm font-medium text-slate-900 border-t mt-1 pt-1">
                            Total: ₹{totalWithTax.toFixed(2)}
                          </div>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg mb-1"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              
              <div className="flex justify-end pt-4 border-t">
                <div className="text-xl">
                  <span className="text-slate-600 mr-4">Estimated Grand Total:</span>
                  <span className="font-bold text-slate-900">₹{calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-6 border-t">
              <Link 
                to="/director/inventory/customer-orders"
                className="px-4 py-2 border rounded-xl font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </Link>
              <button 
                type="submit" 
                disabled={createOrderMutation.isPending || items.length === 0}
                className="bg-[#002b84] text-white px-6 py-2 rounded-xl font-medium hover:bg-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createOrderMutation.isPending ? 'Creating...' : 'Create Draft Order'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DirectorLayout>
  );
};
