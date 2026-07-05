import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { usePatientOrders, PatientOrderResponse } from "@/services/patient-portal";

export default function OrdersPage() {
  const navigate = useNavigate();
  const { data: orders = [], isLoading, error } = usePatientOrders();
  
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "COMPLETED" | "CANCELLED">("ACTIVE");
  const [selectedOrder, setSelectedOrder] = useState<PatientOrderResponse | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("patient_token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <p className="text-gray-500 font-medium">Loading Orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <p className="text-red-500 font-medium mb-4">Failed to load orders.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-[#2563eb] text-white rounded hover:bg-blue-600 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const activeOrders = orders.filter(o => o.status === "DRAFT" || o.status === "CONFIRMED");
  const completedOrders = orders.filter(o => o.status === "COMPLETED");
  const cancelledOrders = orders.filter(o => o.status === "CANCELLED");

  let displayOrders = activeOrders;
  if (activeTab === "COMPLETED") displayOrders = completedOrders;
  if (activeTab === "CANCELLED") displayOrders = cancelledOrders;

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="bg-[#1e3a8a] text-white py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">My Orders</h1>
          <p className="text-blue-200">View and manage your product order history.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-8">
        
        {/* Tabs */}
        <div className="flex space-x-2 mb-6 border-b border-gray-200">
          <button 
            className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors ${activeTab === 'ACTIVE' ? 'border-[#2563eb] text-[#2563eb]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab("ACTIVE")}
          >
            Active ({activeOrders.length})
          </button>
          <button 
            className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors ${activeTab === 'COMPLETED' ? 'border-[#2563eb] text-[#2563eb]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab("COMPLETED")}
          >
            Completed ({completedOrders.length})
          </button>
          <button 
            className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors ${activeTab === 'CANCELLED' ? 'border-[#2563eb] text-[#2563eb]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab("CANCELLED")}
          >
            Cancelled ({cancelledOrders.length})
          </button>
        </div>

        {/* Content */}
        {displayOrders.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm text-center">
            <p className="text-gray-500 mb-4">You have no {activeTab.toLowerCase()} orders.</p>
            {activeTab === "ACTIVE" && (
              <Link to="/products" className="text-[#2563eb] font-medium hover:underline">
                Browse products
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {displayOrders.map(order => {
              const totalItems = order.items.reduce((sum, item) => sum + item.ordered_quantity, 0);
              
              return (
                <div key={order.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 transition hover:shadow-md">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Order #{order.order_number}</h3>
                      <p className="text-gray-600 mt-1">
                        Placed on {new Date(order.order_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                      <div className="flex items-center gap-3 mt-3">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${order.status === 'CONFIRMED' || order.status === 'DRAFT' ? 'bg-blue-100 text-blue-800' : order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {order.status}
                        </span>
                        <span className="text-sm font-medium text-gray-900">₹{order.grand_total}</span>
                        <span className="text-xs text-gray-400">({totalItems} items)</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0 flex flex-col items-end gap-2">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="text-sm font-medium text-[#2563eb] hover:underline"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </div>

      {/* Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 flex-shrink-0">
              <h3 className="text-lg font-bold text-gray-900">Order #{selectedOrder.order_number}</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-sm text-gray-500">Date Placed</p>
                  <p className="font-medium text-gray-900">{selectedOrder.order_date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 text-right">Status</p>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full inline-block mt-1 ${selectedOrder.status === 'CONFIRMED' || selectedOrder.status === 'DRAFT' ? 'bg-blue-100 text-blue-800' : selectedOrder.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {selectedOrder.status}
                  </span>
                </div>
              </div>
              
              <h4 className="text-md font-bold text-gray-900 mb-3">Items</h4>
              <ul className="divide-y divide-gray-100 mb-6">
                {selectedOrder.items.map(item => (
                  <li key={item.id} className="py-4 flex gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {item.product_image ? (
                        <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-gray-400 text-xs">No img</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{item.product_name}</p>
                      <div className="flex justify-between mt-1 text-sm text-gray-600">
                        <span>₹{item.selling_price} &times; {item.ordered_quantity}</span>
                        <span className="font-medium text-gray-900">₹{item.line_total}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              
              <div className="border-t border-gray-100 pt-4 flex justify-between items-center text-lg font-bold">
                <span>Grand Total</span>
                <span>₹{selectedOrder.grand_total}</span>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end flex-shrink-0">
              <button 
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded hover:bg-gray-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
