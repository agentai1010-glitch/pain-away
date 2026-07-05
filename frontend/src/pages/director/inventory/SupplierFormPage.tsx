import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useCreateSupplier, useUpdateSupplier, useSupplier } from "@/services/supplier";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import DirectorLayout from "../DirectorLayout";

export function SupplierFormPage() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const { data: existingSupplier, isLoading: isLoadingSupplier } = useSupplier(id || "");
  
  const { mutate: createSupplier, isPending: isCreating } = useCreateSupplier();
  const { mutate: updateSupplier, isPending: isUpdating } = useUpdateSupplier();

  const isPending = isCreating || isUpdating;

  const [formData, setFormData] = useState({
    name: "",
    contact_person: "",
    phone_number: "",
    email: "",
    gst_number: "",
    address: "",
    payment_terms: "",
    notes: ""
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existingSupplier) {
      setFormData({
        name: existingSupplier.name,
        contact_person: existingSupplier.contact_person,
        phone_number: existingSupplier.phone_number,
        email: existingSupplier.email || "",
        gst_number: existingSupplier.gst_number,
        address: existingSupplier.address,
        payment_terms: existingSupplier.payment_terms,
        notes: existingSupplier.notes || ""
      });
    }
  }, [existingSupplier]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const payload = {
      ...formData,
      email: formData.email || null,
      notes: formData.notes || null,
    };

    if (isEditing && id) {
      updateSupplier({ id, data: payload }, {
        onSuccess: () => navigate("/director/inventory/suppliers"),
        onError: (err: any) => setError(err?.body?.detail || "Failed to update supplier")
      });
    } else {
      createSupplier(payload as any, {
        onSuccess: () => navigate("/director/inventory/suppliers"),
        onError: (err: any) => setError(err?.body?.detail || "Failed to create supplier")
      });
    }
  };

  if (isEditing && isLoadingSupplier) {
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
          <Link to="/director/inventory/suppliers" className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{isEditing ? "Edit Supplier" : "New Supplier"}</h1>
            <p className="text-slate-500 text-sm">Add a new business partner for procurement.</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white border rounded-2xl p-6 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Business Name *</label>
              <input 
                required
                className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-[#002b84] outline-none"
                value={formData.name}
                onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g., Pharma Corp Ltd"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Contact Person *</label>
              <input 
                required
                className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-[#002b84] outline-none"
                value={formData.contact_person}
                onChange={e => setFormData(p => ({ ...p, contact_person: e.target.value }))}
                placeholder="e.g., Jane Doe"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Phone Number *</label>
              <input 
                required
                className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-[#002b84] outline-none"
                value={formData.phone_number}
                onChange={e => setFormData(p => ({ ...p, phone_number: e.target.value }))}
                placeholder="e.g., +91 9876543210"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email Address (Optional)</label>
              <input 
                type="email"
                className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-[#002b84] outline-none"
                value={formData.email}
                onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                placeholder="e.g., contact@pharmacorp.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">GST / Tax ID *</label>
              <input 
                required
                className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-[#002b84] outline-none"
                value={formData.gst_number}
                onChange={e => setFormData(p => ({ ...p, gst_number: e.target.value }))}
                placeholder="e.g., 22AAAAA0000A1Z5"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Business Address *</label>
              <textarea 
                required
                className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-[#002b84] outline-none h-24"
                value={formData.address}
                onChange={e => setFormData(p => ({ ...p, address: e.target.value }))}
                placeholder="Enter complete physical address..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Payment Terms *</label>
              <input 
                required
                className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-[#002b84] outline-none"
                value={formData.payment_terms}
                onChange={e => setFormData(p => ({ ...p, payment_terms: e.target.value }))}
                placeholder="e.g., Net 30, Payment on Delivery"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Internal Notes (Optional)</label>
              <textarea 
                className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-[#002b84] outline-none h-20"
                value={formData.notes}
                onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
                placeholder="Any specific instructions or agreements..."
              />
            </div>

          </div>

          <div className="flex justify-end pt-4 border-t">
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 bg-[#002b84] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-900 transition-colors disabled:opacity-50"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isEditing ? "Save Changes" : "Create Supplier"}
            </button>
          </div>
        </form>
      </div>
    </DirectorLayout>
  );
}

export default SupplierFormPage;
