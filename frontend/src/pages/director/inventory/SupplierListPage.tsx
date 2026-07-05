import { useState } from "react";
import { Link } from "react-router-dom";
import { useSuppliers, useActivateSupplier, useDeactivateSupplier } from "@/services/supplier";
import { Plus, Search, Truck, Loader2 } from "lucide-react";
import DirectorLayout from "../DirectorLayout";

export function SupplierListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: suppliers, isLoading } = useSuppliers(true);
  const { mutate: activate } = useActivateSupplier();
  const { mutate: deactivate } = useDeactivateSupplier();

  const filteredSuppliers = suppliers?.filter(sup => 
    sup.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    sup.contact_person.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DirectorLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Suppliers</h1>
            <p className="text-slate-500 text-sm">Manage businesses from whom the clinic procures products.</p>
          </div>
          <Link
            to="/director/inventory/suppliers/new"
            className="flex items-center gap-2 bg-[#002b84] text-white px-4 py-2.5 rounded-xl font-medium hover:bg-blue-900 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Supplier
          </Link>
        </div>

        <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-slate-50 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                placeholder="Search by name or contact person..."
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
                  <th className="px-6 py-3 font-medium">Supplier</th>
                  <th className="px-6 py-3 font-medium">Contact</th>
                  <th className="px-6 py-3 font-medium">GST / Tax ID</th>
                  <th className="px-6 py-3 font-medium">Payment Terms</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <Loader2 className="w-6 h-6 animate-spin text-[#002b84] mx-auto" />
                    </td>
                  </tr>
                ) : filteredSuppliers?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      <Truck className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      No suppliers found.
                    </td>
                  </tr>
                ) : (
                  filteredSuppliers?.map((supplier) => (
                    <tr key={supplier.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{supplier.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{supplier.contact_person}</div>
                        <div className="text-slate-500 text-xs">{supplier.phone_number}</div>
                        {supplier.email && <div className="text-slate-500 text-xs">{supplier.email}</div>}
                      </td>
                      <td className="px-6 py-4">{supplier.gst_number}</td>
                      <td className="px-6 py-4">{supplier.payment_terms}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                          supplier.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {supplier.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-3">
                        <Link 
                          to={`/director/inventory/suppliers/${supplier.id}/edit`}
                          className="font-medium text-[#002b84] hover:text-blue-900"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => supplier.is_active ? deactivate(supplier.id) : activate(supplier.id)}
                          className={`font-medium ${supplier.is_active ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}`}
                        >
                          {supplier.is_active ? "Deactivate" : "Activate"}
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

export default SupplierListPage;
