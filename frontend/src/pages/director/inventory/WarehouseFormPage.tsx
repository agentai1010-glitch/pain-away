import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useCreateWarehouse, useUpdateWarehouse, useWarehouse } from "@/services/warehouse";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import DirectorLayout from "../DirectorLayout";

export function WarehouseFormPage() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const { data: existingWarehouse, isLoading: isLoadingWarehouse } = useWarehouse(id || "");
  
  const { mutate: createWarehouse, isPending: isCreating } = useCreateWarehouse();
  const { mutate: updateWarehouse, isPending: isUpdating } = useUpdateWarehouse();

  const isPending = isCreating || isUpdating;

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    address: "",
    contact_person: "",
    phone_number: "",
    is_default: false
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existingWarehouse) {
      setFormData({
        name: existingWarehouse.name,
        code: existingWarehouse.code,
        description: existingWarehouse.description || "",
        address: existingWarehouse.address,
        contact_person: existingWarehouse.contact_person || "",
        phone_number: existingWarehouse.phone_number || "",
        is_default: existingWarehouse.is_default
      });
    }
  }, [existingWarehouse]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const payload = {
      ...formData,
      description: formData.description || null,
      contact_person: formData.contact_person || null,
      phone_number: formData.phone_number || null,
    };

    if (isEditing && id) {
      updateWarehouse({ id, data: payload }, {
        onSuccess: () => navigate("/director/inventory/warehouses"),
        onError: (err: any) => setError(err?.body?.detail || "Failed to update warehouse")
      });
    } else {
      createWarehouse(payload as any, {
        onSuccess: () => navigate("/director/inventory/warehouses"),
        onError: (err: any) => setError(err?.body?.detail || "Failed to create warehouse")
      });
    }
  };

  if (isEditing && isLoadingWarehouse) {
    return (
      <DirectorLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      </DirectorLayout>
    );
  }

  return (
    <DirectorLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/director/inventory/warehouses" className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{isEditing ? "Edit Warehouse" : "New Warehouse"}</h1>
            <p className="text-slate-500 text-sm">Define a physical location for storing inventory.</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white border rounded-2xl p-6 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Warehouse Name *</label>
              <input 
                required
                className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-[#002b84] outline-none"
                value={formData.name}
                onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g., Central Hub"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Warehouse Code *</label>
              <input 
                required
                className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-[#002b84] outline-none uppercase font-mono"
                value={formData.code}
                onChange={e => setFormData(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                placeholder="e.g., WH-MAIN-01"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Description (Optional)</label>
              <textarea 
                className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-[#002b84] outline-none h-20"
                value={formData.description}
                onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Physical Address *</label>
              <textarea 
                required
                className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-[#002b84] outline-none h-24"
                value={formData.address}
                onChange={e => setFormData(p => ({ ...p, address: e.target.value }))}
                placeholder="Enter complete physical address..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Contact Person (Optional)</label>
              <input 
                className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-[#002b84] outline-none"
                value={formData.contact_person}
                onChange={e => setFormData(p => ({ ...p, contact_person: e.target.value }))}
                placeholder="e.g., John Smith"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Phone Number (Optional)</label>
              <input 
                className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-[#002b84] outline-none"
                value={formData.phone_number}
                onChange={e => setFormData(p => ({ ...p, phone_number: e.target.value }))}
                placeholder="e.g., +91 9876543210"
              />
            </div>
            
            <div className="md:col-span-2 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 w-4 h-4 text-[#002b84] rounded focus:ring-[#002b84]"
                  checked={formData.is_default}
                  onChange={e => setFormData(p => ({ ...p, is_default: e.target.checked }))}
                />
                <div>
                  <div className="font-medium text-amber-900">Set as Default Warehouse</div>
                  <div className="text-amber-700 text-sm mt-0.5">
                    Only one warehouse can be default at a time. Checking this will unset any existing default warehouse.
                  </div>
                </div>
              </label>
            </div>

          </div>

          <div className="flex justify-end pt-4 border-t">
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 bg-[#002b84] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-900 transition-colors disabled:opacity-50"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isEditing ? "Save Changes" : "Create Warehouse"}
            </button>
          </div>
        </form>
      </div>
    </DirectorLayout>
  );
}

export default WarehouseFormPage;
