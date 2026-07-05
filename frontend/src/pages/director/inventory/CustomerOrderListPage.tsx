import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCustomerOrders } from '@/services/customer_order';
import { Plus, Receipt, Loader2 } from 'lucide-react';
import DirectorLayout from '../DirectorLayout';

export const CustomerOrderListPage: React.FC = () => {
  const { data: orders = [], isLoading } = useCustomerOrders();
  const navigate = useNavigate();

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      DRAFT: 'bg-slate-100 text-slate-600',
      CONFIRMED: 'bg-blue-100 text-blue-700',
      COMPLETED: 'bg-green-100 text-green-700',
      CANCELLED: 'bg-red-100 text-red-700'
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.DRAFT}`}>
        {status}
      </span>
    );
  };

  return (
    <DirectorLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Customer Orders</h1>
            <p className="text-slate-500 mt-1">Manage customer orders and sales transactions.</p>
          </div>
          <Link
            to="/director/inventory/customer-orders/new"
            className="flex items-center gap-2 bg-[#002b84] text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-900 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Order
          </Link>
        </div>

        <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-3">Order Number</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3 text-right">Total</th>
                  <th className="px-6 py-3 text-center">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <Loader2 className="w-6 h-6 animate-spin text-slate-400 mx-auto" />
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 font-medium">No customer orders found</p>
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{order.order_number}</td>
                      <td className="px-6 py-4 text-slate-500">{order.order_date}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{order.customer_name}</div>
                        <div className="text-xs text-slate-500">{order.customer_phone}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-right">₹{order.grand_total.toFixed(2)}</td>
                      <td className="px-6 py-4 text-center">{getStatusBadge(order.status)}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => navigate(`/director/inventory/customer-orders/${order.id}`)}
                          className="text-[#002b84] hover:underline font-medium"
                        >
                          View
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
};
