import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  useCustomerOrder, 
  useConfirmCustomerOrder, 
  useCancelCustomerOrder, 
  useCompleteCustomerOrder 
} from '@/services/customer_order';
import { useInventory } from '@/services/inventory';
import { ArrowLeft, CheckCircle, XCircle, PackageCheck, Loader2, ShieldCheck, ShieldAlert } from 'lucide-react';
import DirectorLayout from '../DirectorLayout';

export const CustomerOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  const { data: order, isLoading } = useCustomerOrder(id || '');
  const { data: inventoryList = [], isLoading: isInvLoading } = useInventory();
  
  const confirmMutation = useConfirmCustomerOrder();
  const cancelMutation = useCancelCustomerOrder();
  const completeMutation = useCompleteCustomerOrder();
  
  const isProcessing = confirmMutation.isPending || cancelMutation.isPending || completeMutation.isPending;

  const handleStatusUpdate = async (action: 'confirm' | 'cancel' | 'complete') => {
    if (!order) return;
    
    const confirmMessage = {
      confirm: 'Confirming this order will permanently reserve the required stock. Proceed?',
      cancel: 'Cancelling this order will release any reserved stock. Proceed?',
      complete: 'Mark this order as completed?'
    };
    
    if (!window.confirm(confirmMessage[action])) return;
    
    try {
      if (action === 'confirm') await confirmMutation.mutateAsync(order.id);
      else if (action === 'cancel') await cancelMutation.mutateAsync(order.id);
      else if (action === 'complete') await completeMutation.mutateAsync(order.id);
    } catch (error: any) {
      console.error(`Failed to ${action} order`, error);
      alert(error?.response?.data?.detail || `Failed to ${action} order`);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      DRAFT: 'bg-slate-100 text-slate-600',
      CONFIRMED: 'bg-blue-100 text-blue-700',
      COMPLETED: 'bg-green-100 text-green-700',
      CANCELLED: 'bg-red-100 text-red-700'
    };
    return (
      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${styles[status] || styles.DRAFT}`}>
        {status}
      </span>
    );
  };

  if (isLoading || isInvLoading || !order) {
    return (
      <DirectorLayout>
        <div className="p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400 mx-auto" />
          <p className="mt-4 text-slate-500">Loading order details...</p>
        </div>
      </DirectorLayout>
    );
  }

  const orderData = (order as any).data || order;
  const isReserved = orderData.status === 'CONFIRMED' || orderData.status === 'COMPLETED';

  return (
    <DirectorLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              to="/director/inventory/customer-orders"
              className="p-2 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Order {orderData.order_number}
              </h1>
              <p className="text-slate-500 mt-1">
                Created on {new Date(orderData.created_at).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge(orderData.status)}
            
            {orderData.status === 'DRAFT' && (
              <>
                <button 
                  onClick={() => handleStatusUpdate('confirm')} 
                  disabled={isProcessing}
                  className="flex items-center gap-2 bg-[#002b84] text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-900 transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  Confirm & Reserve
                </button>
                <button 
                  onClick={() => handleStatusUpdate('cancel')} 
                  disabled={isProcessing}
                  className="flex items-center gap-2 bg-white text-red-600 border border-red-200 px-4 py-2 rounded-xl font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  Cancel
                </button>
              </>
            )}
            
            {orderData.status === 'CONFIRMED' && (
              <>
                <button 
                  onClick={() => handleStatusUpdate('complete')} 
                  disabled={isProcessing}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <PackageCheck className="w-4 h-4" />
                  Mark Completed
                </button>
                <button 
                  onClick={() => handleStatusUpdate('cancel')} 
                  disabled={isProcessing}
                  className="flex items-center gap-2 bg-white text-red-600 border border-red-200 px-4 py-2 rounded-xl font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  Cancel & Release
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-slate-900">Order Items & Reservation Summary</h3>
                  <p className="text-sm text-slate-500 mt-1">Immutable product snapshots and real-time inventory allocation</p>
                </div>
                {isReserved ? (
                  <div className="flex items-center gap-2 text-green-700 bg-green-50 px-3 py-1.5 rounded-lg text-sm font-medium border border-green-200">
                    <ShieldCheck className="w-4 h-4" /> Stock Reserved
                  </div>
                ) : orderData.status === 'CANCELLED' ? (
                  <div className="flex items-center gap-2 text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200">
                    <ShieldAlert className="w-4 h-4" /> Reservation Released
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg text-sm font-medium border border-amber-200">
                    <ShieldAlert className="w-4 h-4" /> Pending Reservation
                  </div>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-3">Product</th>
                      <th className="px-6 py-3 text-right">Price</th>
                      <th className="px-6 py-3 text-right">Order Qty</th>
                      <th className="px-6 py-3 text-right">Avail Qty</th>
                      <th className="px-6 py-3 text-center">Reservation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orderData.items.map((item: any) => {
                      const inv = inventoryList.find((i: any) => i.product_id === item.product_id);
                      const avail = inv ? inv.available_quantity : 0;
                      const canFulfill = isReserved || avail >= item.ordered_quantity;
                      
                      return (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4">
                            <div className="font-medium text-slate-900">{item.product_name}</div>
                            <div className="text-xs text-slate-500">{item.sku}</div>
                          </td>
                          <td className="px-6 py-4 text-right">₹{item.selling_price.toFixed(2)}</td>
                          <td className="px-6 py-4 text-right font-medium">{item.ordered_quantity}</td>
                          <td className="px-6 py-4 text-right font-medium">
                            <span className={canFulfill ? "text-slate-900" : "text-red-600"}>
                              {avail}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {isReserved ? (
                              <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">Active</span>
                            ) : orderData.status === 'CANCELLED' ? (
                              <span className="inline-block px-2 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded">Released</span>
                            ) : canFulfill ? (
                              <span className="inline-block px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded">Pending</span>
                            ) : (
                              <span className="inline-block px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded">Shortage</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-medium text-slate-900">Customer Details</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <div className="text-sm text-slate-500">Name</div>
                  <div className="font-medium text-slate-900">{orderData.customer_name}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">Phone</div>
                  <div className="font-medium text-slate-900">{orderData.customer_phone}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">Order Date</div>
                  <div className="font-medium text-slate-900">{orderData.order_date}</div>
                </div>
                {orderData.notes && (
                  <div>
                    <div className="text-sm text-slate-500">Notes</div>
                    <div className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg mt-1">{orderData.notes}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-medium text-slate-900">Order Summary</h3>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>₹{orderData.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600 pb-3 border-b border-slate-100">
                  <span>Tax Total</span>
                  <span>₹{orderData.tax_total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-slate-900 pt-1">
                  <span>Grand Total</span>
                  <span className="text-[#002b84]">₹{orderData.grand_total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DirectorLayout>
  );
};
