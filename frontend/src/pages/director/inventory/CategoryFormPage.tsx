import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useCreateCategory, useUpdateCategory, useCategory, useCategories } from "@/services/category";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import DirectorLayout from "../DirectorLayout";

export function CategoryFormPage() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const { data: existingCategory, isLoading: isLoadingCategory } = useCategory(id || "");
  const { data: allCategories } = useCategories(true);
  
  const { mutate: createCategory, isPending: isCreating } = useCreateCategory();
  const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategory();

  const isPending = isCreating || isUpdating;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parent_id: "",
    display_order: "0"
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existingCategory) {
      setFormData({
        name: existingCategory.name,
        description: existingCategory.description || "",
        parent_id: existingCategory.parent_id || "",
        display_order: existingCategory.display_order.toString()
      });
    }
  }, [existingCategory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const payload = {
      name: formData.name,
      description: formData.description || null,
      parent_id: formData.parent_id || null,
      display_order: parseInt(formData.display_order) || 0
    };

    if (isEditing && id) {
      if (payload.parent_id === id) {
        setError("A category cannot be its own parent.");
        return;
      }
      updateCategory({ id, data: payload }, {
        onSuccess: () => navigate("/director/inventory/categories"),
        onError: (err: any) => setError(err?.body?.detail || "Failed to update category")
      });
    } else {
      createCategory(payload, {
        onSuccess: () => navigate("/director/inventory/categories"),
        onError: (err: any) => setError(err?.body?.detail || "Failed to create category")
      });
    }
  };

  if (isEditing && isLoadingCategory) {
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
          <Link to="/director/inventory/categories" className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{isEditing ? "Edit Category" : "New Category"}</h1>
            <p className="text-slate-500 text-sm">Create a logical grouping for products.</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white border rounded-2xl p-6 shadow-sm space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Category Name *</label>
              <input 
                required
                className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-[#002b84] outline-none"
                value={formData.name}
                onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g., Support Braces"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Description</label>
              <textarea 
                className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-[#002b84] outline-none h-24"
                value={formData.description}
                onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Parent Category (Optional)</label>
                <select
                  className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-[#002b84] outline-none bg-white"
                  value={formData.parent_id}
                  onChange={e => setFormData(p => ({ ...p, parent_id: e.target.value }))}
                >
                  <option value="">-- None --</option>
                  {allCategories?.filter(c => c.id !== id).map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
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
              {isEditing ? "Save Changes" : "Create Category"}
            </button>
          </div>
        </form>
      </div>
    </DirectorLayout>
  );
}

export default CategoryFormPage;
