import React, { useState } from 'react';
import { 
  useDashboardSummary, 
  useInventoryReport, 
  useProcurementReport, 
  useCommerceReport, 
  useStockMovementReport 
} from '@/services/reporting';
import { useWarehouses } from '@/services/warehouse';
import { useCategories } from '@/services/category';
import { useProducts } from '@/services/product';
import DirectorLayout from '../DirectorLayout';
import { 
  BarChart3, 
  Package, 
  Building2, 
  Truck, 
  DollarSign, 
  AlertTriangle, 
  XCircle, 
  Download, 
  FileText, 
  Search, 
  Layers, 
  ShoppingCart, 
  Receipt, 
  Activity, 
  Loader2 
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'procurement' | 'commerce' | 'movements'>('dashboard');
  
  // Filters for inventory report
  const [invSearch, setInvSearch] = useState('');
  const [invWarehouse, setInvWarehouse] = useState('');
  const [invCategory, setInvCategory] = useState('');
  const [invLowStock, setInvLowStock] = useState(false);

  // Filters for stock movement report
  const [smProduct, setSmProduct] = useState('');
  const [smWarehouse, setSmWarehouse] = useState('');
  const [smType, setSmType] = useState('');
  const [smStartDate, setSmStartDate] = useState('');
  const [smEndDate, setSmEndDate] = useState('');

  // Queries
  const { data: dashboard, isLoading: isDashLoading } = useDashboardSummary();
  const { data: inventory = [], isLoading: isInvLoading } = useInventoryReport({
    search: invSearch || undefined,
    warehouse_id: invWarehouse || undefined,
    category_id: invCategory || undefined,
    low_stock_only: invLowStock
  });
  const { data: procurement, isLoading: isProcLoading } = useProcurementReport();
  const { data: commerce, isLoading: isComLoading } = useCommerceReport();
  const { data: movements = [], isLoading: isSmLoading } = useStockMovementReport({
    product_id: smProduct || undefined,
    warehouse_id: smWarehouse || undefined,
    movement_type: smType || undefined,
    start_date: smStartDate || undefined,
    end_date: smEndDate || undefined
  });

  const { data: warehouses = [] } = useWarehouses();
  const { data: categories = [] } = useCategories();
  const { data: products = [] } = useProducts();

  // Export helper
  const handleExportCSV = (filename: string, rows: any[]) => {
    if (!rows.length) {
      alert("No data to export");
      return;
    }
    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.join(','),
      ...rows.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    window.print();
  };

  const dashData = (dashboard as any)?.data || dashboard;
  const procData = (procurement as any)?.data || procurement;
  const comData = (commerce as any)?.data || commerce;
  const invData = Array.isArray((inventory as any)?.data) ? (inventory as any).data : (Array.isArray(inventory) ? inventory : []);
  const smData = Array.isArray((movements as any)?.data) ? (movements as any).data : (Array.isArray(movements) ? movements : []);

  return (
    <DirectorLayout>
      <div className="max-w-7xl mx-auto space-y-6 print:space-y-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-[#002b84]" />
              Business Intelligence & Reports
            </h1>
            <p className="text-slate-500 mt-1">
              Real-time projections and immutable audit insights across inventory and commerce domains
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (activeTab === 'inventory') handleExportCSV('inventory_report', invData);
                else if (activeTab === 'movements') handleExportCSV('stock_movements_report', smData);
                else if (activeTab === 'procurement' && procData?.supplier_summaries) handleExportCSV('supplier_summary', procData.supplier_summaries);
                else alert("CSV export is best used on tabular reports (Inventory or Stock Movements)");
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4 text-slate-500" />
              Export CSV
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-[#002b84] text-white rounded-xl font-medium hover:bg-blue-900 transition-colors shadow-sm"
            >
              <FileText className="w-4 h-4" />
              Export PDF
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 overflow-x-auto print:hidden">
          {[
            { id: 'dashboard', label: 'Dashboard Summary', icon: BarChart3 },
            { id: 'inventory', label: 'Inventory Report', icon: Layers },
            { id: 'procurement', label: 'Procurement Report', icon: ShoppingCart },
            { id: 'commerce', label: 'Commerce Report', icon: Receipt },
            { id: 'movements', label: 'Stock Movement History', icon: Activity },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-[#002b84] text-[#002b84]'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Dashboard Summary */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {isDashLoading ? (
              <div className="p-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400 mx-auto" />
              </div>
            ) : dashData ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="text-sm font-medium">Total Products</span>
                      <Package className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="mt-2 text-3xl font-extrabold text-slate-900">{dashData.total_products}</div>
                    <div className="mt-1 text-xs text-green-600 font-medium">{dashData.active_products} active in catalog</div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="text-sm font-medium">Total Warehouses</span>
                      <Building2 className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div className="mt-2 text-3xl font-extrabold text-slate-900">{dashData.total_warehouses}</div>
                    <div className="mt-1 text-xs text-slate-500">Active storage locations</div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="text-sm font-medium">Total Suppliers</span>
                      <Truck className="w-5 h-5 text-purple-500" />
                    </div>
                    <div className="mt-2 text-3xl font-extrabold text-slate-900">{dashData.total_suppliers}</div>
                    <div className="mt-1 text-xs text-slate-500">Registered vendors</div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="text-sm font-medium">Inventory Value</span>
                      <DollarSign className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="mt-2 text-3xl font-extrabold text-[#002b84]">₹{dashData.current_inventory_value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                    <div className="mt-1 text-xs text-slate-500">Based on cost price valuation</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-amber-800">Low Stock Products</div>
                      <div className="text-3xl font-extrabold text-amber-900 mt-1">{dashData.low_stock_products}</div>
                      <p className="text-xs text-amber-700 mt-1">Products at or below their configured reorder level</p>
                    </div>
                    <AlertTriangle className="w-12 h-12 text-amber-500 opacity-80" />
                  </div>

                  <div className="bg-red-50 p-6 rounded-2xl border border-red-200 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-red-800">Out of Stock Products</div>
                      <div className="text-3xl font-extrabold text-red-900 mt-1">{dashData.out_of_stock_products}</div>
                      <p className="text-xs text-red-700 mt-1">Products with zero physical inventory balance</p>
                    </div>
                    <XCircle className="w-12 h-12 text-red-500 opacity-80" />
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* Tab 2: Inventory Report */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4 print:hidden">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search product name or SKU..."
                  value={invSearch}
                  onChange={(e) => setInvSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#002b84]"
                />
              </div>

              <select
                value={invWarehouse}
                onChange={(e) => setInvWarehouse(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#002b84]"
              >
                <option value="">All Warehouses</option>
                {warehouses.map((w: any) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>

              <select
                value={invCategory}
                onChange={(e) => setInvCategory(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#002b84]"
              >
                <option value="">All Categories</option>
                {categories.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={invLowStock}
                  onChange={(e) => setInvLowStock(e.target.checked)}
                  className="rounded text-[#002b84] focus:ring-[#002b84]"
                />
                Low Stock Only
              </label>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-lg font-medium text-slate-900">Inventory Projections</h3>
                <span className="text-sm text-slate-500">{invData.length} items found</span>
              </div>
              
              {isInvLoading ? (
                <div className="p-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-slate-400 mx-auto" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-3">Product</th>
                        <th className="px-6 py-3">Category</th>
                        <th className="px-6 py-3">Warehouse</th>
                        <th className="px-6 py-3 text-right">Current Qty</th>
                        <th className="px-6 py-3 text-right">Reserved Qty</th>
                        <th className="px-6 py-3 text-right">Available Qty</th>
                        <th className="px-6 py-3 text-right">Unit Cost</th>
                        <th className="px-6 py-3 text-right">Total Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {invData.map((row: any) => (
                        <tr key={`${row.product_id}-${row.warehouse_id}`} className="hover:bg-slate-50">
                          <td className="px-6 py-4">
                            <div className="font-medium text-slate-900">{row.product_name}</div>
                            <div className="text-xs text-slate-500">{row.sku}</div>
                            {row.is_low_stock && (
                              <span className="inline-block mt-1 px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded">
                                Low Stock
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-slate-600">{row.category_name}</td>
                          <td className="px-6 py-4 text-slate-600">{row.warehouse_name}</td>
                          <td className="px-6 py-4 text-right font-medium">{row.current_quantity}</td>
                          <td className="px-6 py-4 text-right text-amber-600">{row.reserved_quantity}</td>
                          <td className="px-6 py-4 text-right font-bold text-slate-900">{row.available_quantity}</td>
                          <td className="px-6 py-4 text-right text-slate-600">₹{row.unit_cost.toFixed(2)}</td>
                          <td className="px-6 py-4 text-right font-bold text-[#002b84]">₹{row.inventory_value.toFixed(2)}</td>
                        </tr>
                      ))}
                      {invData.length === 0 && (
                        <tr>
                          <td colSpan={8} className="px-6 py-12 text-center text-slate-500">No inventory records match your criteria</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Procurement Report */}
        {activeTab === 'procurement' && (
          <div className="space-y-6">
            {isProcLoading ? (
              <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin text-slate-400 mx-auto" /></div>
            ) : procData ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="text-sm font-medium text-slate-500">Total Purchase Orders</div>
                    <div className="mt-2 text-3xl font-extrabold text-slate-900">{procData.total_purchase_orders}</div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="text-sm font-medium text-slate-500">Total Goods Receipts</div>
                    <div className="mt-2 text-3xl font-extrabold text-slate-900">{procData.total_goods_receipts}</div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="text-sm font-medium text-slate-500">Pending POs</div>
                    <div className="mt-2 text-3xl font-extrabold text-amber-600">{procData.pending_purchase_orders}</div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="text-sm font-medium text-slate-500">Fully Received POs</div>
                    <div className="mt-2 text-3xl font-extrabold text-green-600">{procData.fully_received_purchase_orders}</div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-6 border-b border-slate-100">
                    <h3 className="text-lg font-medium text-slate-900">Supplier Summary</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                        <tr>
                          <th className="px-6 py-3">Supplier</th>
                          <th className="px-6 py-3 text-right">Total Orders</th>
                          <th className="px-6 py-3 text-right">Pending Orders</th>
                          <th className="px-6 py-3 text-right">Fully Received</th>
                          <th className="px-6 py-3 text-right">Total Spent</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {procData.supplier_summaries.map((sup: any) => (
                          <tr key={sup.supplier_id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 font-medium text-slate-900">{sup.supplier_name}</td>
                            <td className="px-6 py-4 text-right">{sup.total_orders}</td>
                            <td className="px-6 py-4 text-right text-amber-600 font-medium">{sup.pending_orders}</td>
                            <td className="px-6 py-4 text-right text-green-600 font-medium">{sup.fully_received_orders}</td>
                            <td className="px-6 py-4 text-right font-bold text-[#002b84]">₹{sup.total_spent.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* Tab 4: Commerce Report */}
        {activeTab === 'commerce' && (
          <div className="space-y-6">
            {isComLoading ? (
              <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin text-slate-400 mx-auto" /></div>
            ) : comData ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="text-sm font-medium text-slate-500">Total Customer Orders</div>
                  <div className="mt-2 text-3xl font-extrabold text-slate-900">{comData.total_customer_orders}</div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="text-sm font-medium text-slate-500">Draft Orders</div>
                  <div className="mt-2 text-3xl font-extrabold text-slate-600">{comData.draft_orders}</div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="text-sm font-medium text-slate-500">Confirmed Orders</div>
                  <div className="mt-2 text-3xl font-extrabold text-blue-600">{comData.confirmed_orders}</div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="text-sm font-medium text-slate-500">Completed Orders</div>
                  <div className="mt-2 text-3xl font-extrabold text-green-600">{comData.completed_orders}</div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="text-sm font-medium text-slate-500">Cancelled Orders</div>
                  <div className="mt-2 text-3xl font-extrabold text-red-600">{comData.cancelled_orders}</div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="text-sm font-medium text-slate-500">Reserved Inventory Units</div>
                  <div className="mt-2 text-3xl font-extrabold text-amber-600">{comData.total_reserved_inventory}</div>
                </div>

                <div className="sm:col-span-2 lg:col-span-3 bg-gradient-to-r from-[#002b84] to-blue-900 p-8 rounded-2xl text-white shadow-md flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-blue-200 uppercase tracking-wider">Total Completed Revenue</div>
                    <div className="mt-2 text-4xl font-extrabold">₹{comData.total_revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                    <p className="text-xs text-blue-100 mt-1">Based on grand total of all COMPLETED customer orders</p>
                  </div>
                  <DollarSign className="w-16 h-16 text-white opacity-20" />
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Tab 5: Stock Movement Report */}
        {activeTab === 'movements' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4 print:hidden">
              <select
                value={smProduct}
                onChange={(e) => setSmProduct(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#002b84]"
              >
                <option value="">All Products</option>
                {products.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>

              <select
                value={smWarehouse}
                onChange={(e) => setSmWarehouse(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#002b84]"
              >
                <option value="">All Warehouses</option>
                {warehouses.map((w: any) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>

              <select
                value={smType}
                onChange={(e) => setSmType(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#002b84]"
              >
                <option value="">All Movement Types</option>
                <option value="OPENING_STOCK">OPENING_STOCK</option>
                <option value="GOODS_RECEIVED">GOODS_RECEIVED</option>
                <option value="RESERVATION">RESERVATION</option>
                <option value="RESERVATION_RELEASED">RESERVATION_RELEASED</option>
                <option value="SALE">SALE</option>
                <option value="ADJUSTMENT">ADJUSTMENT</option>
                <option value="RETURN">RETURN</option>
              </select>

              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={smStartDate}
                  onChange={(e) => setSmStartDate(e.target.value)}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#002b84]"
                />
                <span className="text-slate-400">to</span>
                <input
                  type="date"
                  value={smEndDate}
                  onChange={(e) => setSmEndDate(e.target.value)}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#002b84]"
                />
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-lg font-medium text-slate-900">Chronological Movement History</h3>
                <span className="text-sm text-slate-500">{smData.length} records found</span>
              </div>

              {isSmLoading ? (
                <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin text-slate-400 mx-auto" /></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-3">Timestamp</th>
                        <th className="px-6 py-3">Ref #</th>
                        <th className="px-6 py-3">Product</th>
                        <th className="px-6 py-3">Warehouse</th>
                        <th className="px-6 py-3">Type</th>
                        <th className="px-6 py-3 text-right">Qty Change</th>
                        <th className="px-6 py-3 text-right">Before</th>
                        <th className="px-6 py-3 text-right">After</th>
                        <th className="px-6 py-3">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {smData.map((row: any) => (
                        <tr key={row.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                            {new Date(row.created_at).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 font-mono text-xs text-slate-500">{row.reference_number}</td>
                          <td className="px-6 py-4 font-medium text-slate-900">{row.product_name}</td>
                          <td className="px-6 py-4 text-slate-600">{row.warehouse_name}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-slate-100 text-slate-700 font-semibold text-xs rounded">
                              {row.movement_type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-[#002b84]">
                            {row.quantity_changed > 0 ? `+${row.quantity_changed}` : row.quantity_changed}
                          </td>
                          <td className="px-6 py-4 text-right text-slate-500">{row.balance_before}</td>
                          <td className="px-6 py-4 text-right font-medium text-slate-900">{row.balance_after}</td>
                          <td className="px-6 py-4 text-slate-500 max-w-xs truncate">{row.notes || '-'}</td>
                        </tr>
                      ))}
                      {smData.length === 0 && (
                        <tr>
                          <td colSpan={9} className="px-6 py-12 text-center text-slate-500">No stock movements found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DirectorLayout>
  );
};
