import { useState } from "react";
import { Link } from "react-router-dom";
import { useWarehouses, useActivateWarehouse, useDeactivateWarehouse } from "@/services/warehouse";
import { Plus, Search, Building2, Loader2, Star } from "lucide-react";
import DirectorLayout from "../DirectorLayout";

export function WarehouseListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: warehouses, isLoading } = useWarehouses(true);
  const { mutate: activate } = useActivateWarehouse();
  const { mutate: deactivate } = useDeactivateWarehouse();

  const filteredWarehouses = warehouses?.filter(wh => 
    wh.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    wh.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DirectorLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Warehouses</h1>
            <p className="text-slate-500 text-sm">Manage physical storage locations for inventory.</p>
          </div>
          <Link
            to="/director/inventory/warehouses/new"
            className="flex items-center gap-2 bg-[#002b84] text-white px-4 py-2.5 rounded-xl font-medium hover:bg-blue-900 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Warehouse
          </Link>
        </div>

        <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-slate-50 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                placeholder="Search by name or code..."
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
                  <th className="px-6 py-3 font-medium">Warehouse</th>
                  <th className="px-6 py-3 font-medium">Code</th>
                  <th className="px-6 py-3 font-medium">Contact</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <Loader2 className="w-6 h-6 animate-spin text-[#002b84] mx-auto" />
                    </td>
                  </tr>
                ) : filteredWarehouses?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      <Building2 className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      No warehouses found.
                    </td>
                  </tr>
                ) : (
                  filteredWarehouses?.map((warehouse) => (
                    <tr key={warehouse.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900">{warehouse.name}</span>
                          {warehouse.is_default && (
                            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
                              <Star className="w-3 h-3 fill-amber-500" /> Default
                            </span>
                          )}
                        </div>
                        <div className="text-slate-500 text-xs truncate max-w-[250px]">{warehouse.address}</div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">{warehouse.code}</td>
                      <td className="px-6 py-4">
                        {warehouse.contact_person ? (
                          <>
                            <div className="font-medium">{warehouse.contact_person}</div>
                            <div className="text-slate-500 text-xs">{warehouse.phone_number}</div>
                          </>
                        ) : (
                          <span className="text-slate-400 italic">None</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                          warehouse.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {warehouse.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-3">
                        <Link 
                          to={`/director/inventory/warehouses/${warehouse.id}/edit`}
                          className="font-medium text-[#002b84] hover:text-blue-900"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => warehouse.is_active ? deactivate(warehouse.id) : activate(warehouse.id)}
                          className={`font-medium ${warehouse.is_active ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}`}
                        >
                          {warehouse.is_active ? "Deactivate" : "Activate"}
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
}

export default WarehouseListPage;
