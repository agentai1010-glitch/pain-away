import { useState } from "react";
import { useDirectorCatalog, useCreateCatalogItem, useUpdateCatalogItem } from "@/services/director";
import DirectorLayout from "./DirectorLayout";
import { Plus, Edit2, Loader2, Search, Power, PowerOff, Package, Stethoscope, IndianRupee } from "lucide-react";
import { CatalogItem } from "@/types/catalog";

export function ServiceManagementPage() {
  const { data: items, isLoading } = useDirectorCatalog();
  const createMutation = useCreateCatalogItem();
  const updateMutation = useUpdateCatalogItem();

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "SERVICE" | "PACKAGE">("ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    item_type: "SERVICE" as "SERVICE" | "PACKAGE",
    price: "",
    duration_minutes: "",
    session_count: ""
  });

  const filteredItems = items?.filter(item => {
    if (filterType !== "ALL" && item.item_type !== filterType) return false;
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }) || [];

  const handleOpenModal = (item?: CatalogItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description || "",
        item_type: item.item_type as "SERVICE" | "PACKAGE",
        price: item.price.toString(),
        duration_minutes: item.duration_minutes ? item.duration_minutes.toString() : "",
        session_count: item.session_count ? item.session_count.toString() : ""
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        description: "",
        item_type: "SERVICE",
        price: "",
        duration_minutes: "30",
        session_count: ""
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateMutation.mutate({
        id: editingItem.id,
        data: {
          name: formData.name,
          description: formData.description,
          price: parseInt(formData.price) || 0,
          duration_minutes: formData.item_type === "SERVICE" ? (parseInt(formData.duration_minutes) || 30) : undefined,
          session_count: formData.item_type === "PACKAGE" ? (parseInt(formData.session_count) || 1) : undefined
        }
      }, {
        onSuccess: () => setIsModalOpen(false)
      });
    } else {
      createMutation.mutate({
        name: formData.name,
        description: formData.description,
        item_type: formData.item_type,
        price: parseInt(formData.price) || 0,
        is_active: true,
        duration_minutes: formData.item_type === "SERVICE" ? (parseInt(formData.duration_minutes) || 30) : undefined,
        session_count: formData.item_type === "PACKAGE" ? (parseInt(formData.session_count) || 1) : undefined
      }, {
        onSuccess: () => setIsModalOpen(false)
      });
    }
  };

  const handleToggleStatus = (item: CatalogItem) => {
    if (confirm(`Are you sure you want to ${item.is_active ? 'deactivate' : 'activate'} ${item.name}?`)) {
      updateMutation.mutate({
        id: item.id,
        data: { is_active: !item.is_active }
      });
    }
  };

  return (
    <DirectorLayout>
      <div className="max-w-6xl mx-auto animate-fade-in pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Service & Package Config</h1>
            <p className="text-slate-500 mt-1">Manage future clinic offerings and pricing.</p>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold shadow-md hover:bg-primary/90 transition-all active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" /> Add New Item
          </button>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search items..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
            {["ALL", "SERVICE", "PACKAGE"].map(t => (
              <button 
                key={t}
                onClick={() => setFilterType(t as any)}
                className={`flex-1 sm:px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors ${filterType === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center bg-white border border-dashed border-slate-300 rounded-3xl p-16">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700">No items found</h3>
            <p className="text-slate-500 mt-1">Try adjusting your filters or create a new item.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => (
              <div key={item.id} className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all relative ${!item.is_active ? 'opacity-70 grayscale-[0.3]' : 'hover:shadow-md hover:border-primary/50'}`}>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide ${item.item_type === 'SERVICE' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                      {item.item_type === 'SERVICE' ? <Stethoscope className="w-3.5 h-3.5" /> : <Package className="w-3.5 h-3.5" />}
                      {item.item_type}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {item.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{item.name}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2 min-h-[40px] mb-4">{item.description || 'No description provided.'}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center font-bold text-lg text-slate-900">
                      <IndianRupee className="w-4 h-4 mr-0.5 text-slate-400" />
                      {item.price}
                    </div>
                    <div className="text-sm font-medium text-slate-500">
                      {item.item_type === 'SERVICE' ? `${item.duration_minutes || 0} mins` : `${item.session_count || 0} sessions`}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 px-5 py-3 border-t flex gap-3">
                  <button 
                    onClick={() => handleOpenModal(item)}
                    className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 py-2 rounded-xl text-sm font-semibold transition-colors"
                  >
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>
                  <button 
                    onClick={() => handleToggleStatus(item)}
                    disabled={updateMutation.isPending}
                    className={`flex-1 flex items-center justify-center gap-2 text-white py-2 rounded-xl text-sm font-semibold transition-colors ${item.is_active ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                  >
                    {item.is_active ? <><PowerOff className="w-4 h-4" /> Deactivate</> : <><Power className="w-4 h-4" /> Activate</>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-up">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-900">{editingItem ? 'Edit Item' : 'Create New Item'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {!editingItem && (
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setFormData({...formData, item_type: "SERVICE"})} className={`py-3 border-2 rounded-2xl font-bold transition-all ${formData.item_type === "SERVICE" ? "border-primary bg-primary/5 text-primary" : "border-slate-100 text-slate-400 hover:border-slate-200"}`}>Service</button>
                  <button type="button" onClick={() => setFormData({...formData, item_type: "PACKAGE"})} className={`py-3 border-2 rounded-2xl font-bold transition-all ${formData.item_type === "PACKAGE" ? "border-primary bg-primary/5 text-primary" : "border-slate-100 text-slate-400 hover:border-slate-200"}`}>Package</button>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Name</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium" />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
                  <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none font-medium" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Price (₹)</label>
                    <input required type="number" min="0" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium" />
                  </div>
                  
                  {formData.item_type === "SERVICE" ? (
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Duration (mins)</label>
                      <input required type="number" min="1" value={formData.duration_minutes} onChange={e => setFormData({...formData, duration_minutes: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium" />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Total Sessions</label>
                      <input required type="number" min="1" value={formData.session_count} onChange={e => setFormData({...formData, session_count: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium" />
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors">Cancel</button>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="flex-1 py-3.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-md disabled:opacity-50 flex justify-center items-center gap-2">
                  {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingItem ? 'Save Changes' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DirectorLayout>
  );
}

export default ServiceManagementPage;
