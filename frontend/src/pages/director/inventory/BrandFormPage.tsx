import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useCreateBrand, useUpdateBrand, useBrand } from "@/services/brand";
import { ArrowLeft, Loader2, Save, Upload } from "lucide-react";
import DirectorLayout from "../DirectorLayout";

export function BrandFormPage() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const { data: existingBrand, isLoading: isLoadingBrand } = useBrand(id || "");
  
  const { mutate: createBrand, isPending: isCreating } = useCreateBrand();
  const { mutate: updateBrand, isPending: isUpdating } = useUpdateBrand();

  const isPending = isCreating || isUpdating;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    website: "",
    logo_url: "",
    display_order: "0"
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existingBrand) {
      setFormData({
        name: existingBrand.name,
        description: existingBrand.description || "",
        website: existingBrand.website || "",
        logo_url: existingBrand.logo_url || "",
        display_order: existingBrand.display_order.toString()
      });
    }
  }, [existingBrand]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Website validation if provided
    if (formData.website && !formData.website.startsWith('http://') && !formData.website.startsWith('https://')) {
      setError("Website URL must start with http:// or https://");
      return;
    }

    const payload = {
      name: formData.name,
      description: formData.description || null,
      website: formData.website || null,
      logo_url: formData.logo_url || null,
      display_order: parseInt(formData.display_order) || 0
    };

    if (isEditing && id) {
      updateBrand({ id, data: payload }, {
        onSuccess: () => navigate("/director/inventory/brands"),
        onError: (err: any) => setError(err?.body?.detail || "Failed to update brand")
      });
    } else {
      createBrand(payload, {
        onSuccess: () => navigate("/director/inventory/brands"),
        onError: (err: any) => setError(err?.body?.detail || "Failed to create brand")
      });
    }
  };

  if (isEditing && isLoadingBrand) {
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
          <Link to="/director/inventory/brands" className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{isEditing ? "Edit Brand" : "New Brand"}</h1>
            <p className="text-slate-500 text-sm">Add a new manufacturer or private label.</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white border rounded-2xl p-6 shadow-sm space-y-6">
          <div className="grid grid-cols-1 gap-6">
            
            <div className="flex gap-6 items-start">
              {/* Logo Preview (Mock) */}
              <div className="shrink-0 space-y-2 flex flex-col items-center">
                <div className="w-24 h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-slate-400 bg-slate-50 overflow-hidden relative">
                  {formData.logo_url ? (
                    <img src={formData.logo_url} alt="Logo preview" className="w-full h-full object-cover" />
                  ) : (
                    <Upload className="w-6 h-6 mb-1" />
                  )}
                </div>
                <label className="text-xs font-medium text-slate-500 cursor-pointer hover:text-[#002b84]">
                  Logo URL
                </label>
              </div>

              <div className="flex-1 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Brand Name *</label>
                  <input 
                    required
                    className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-[#002b84] outline-none"
                    value={formData.name}
                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g., MediPro"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Logo Image URL</label>
                  <input 
                    className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-[#002b84] outline-none"
                    value={formData.logo_url}
                    onChange={e => setFormData(p => ({ ...p, logo_url: e.target.value }))}
                    placeholder="https://example.com/logo.png"
                  />
                  <p className="text-xs text-slate-500">Provide a direct URL to the brand's logo image.</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Description</label>
              <textarea 
                className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-[#002b84] outline-none h-24"
                value={formData.description}
                onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                placeholder="Brief description about the brand and its products..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Website URL</label>
                <input 
                  type="url"
                  className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-[#002b84] outline-none"
                  value={formData.website}
                  onChange={e => setFormData(p => ({ ...p, website: e.target.value }))}
                  placeholder="https://www.example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Display Order</label>
                <input 
                  type="number"
                  min="0"
                  required
                  className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-[#002b84] outline-none"
                  value={formData.display_order}
                  onChange={e => setFormData(p => ({ ...p, display_order: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 bg-[#002b84] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-900 transition-colors disabled:opacity-50"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isEditing ? "Save Changes" : "Create Brand"}
            </button>
          </div>
        </form>
      </div>
    </DirectorLayout>
  );
}

export default BrandFormPage;
