import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCreateProduct, useUpdateProduct, useProduct, useUploadProductImage } from "@/services/product";
import { useCategories } from "@/services/category";
import { useBrands } from "@/services/brand";
import { ArrowLeft, Loader2, Save, Upload, Image as ImageIcon, X } from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import DirectorLayout from "../DirectorLayout";
import { Link } from "react-router-dom";

export function ProductFormPage() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const { data: existingProduct, isLoading: isLoadingProduct } = useProduct(id || "");
  const { data: categories } = useCategories(true);
  const { data: brands } = useBrands(true);

  const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();
  const { mutate: uploadImage, isPending: isUploadingImage } = useUploadProductImage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPending = isCreating || isUpdating || isUploadingImage;

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    barcode: "",
    description: "",
    selling_price: "0",
    cost_price: "0",
    tax_rate: "0",
    image_url: "",
    category_id: "",
    brand_id: ""
  });

  useEffect(() => {
    if (existingProduct) {
      setFormData({
        name: existingProduct.name,
        sku: existingProduct.sku,
        barcode: existingProduct.barcode || "",
        description: existingProduct.description || "",
        selling_price: existingProduct.selling_price.toString(),
        cost_price: existingProduct.cost_price.toString(),
        tax_rate: existingProduct.tax_rate.toString(),
        image_url: existingProduct.image_url || "",
        category_id: existingProduct.category_id || "",
        brand_id: existingProduct.brand_id || ""
      });
    }
  }, [existingProduct]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      selling_price: parseFloat(formData.selling_price) || 0,
      cost_price: parseFloat(formData.cost_price) || 0,
      tax_rate: parseFloat(formData.tax_rate) || 0,
      image_url: formData.image_url || undefined,
      category_id: formData.category_id || null,
      brand_id: formData.brand_id || null
    };

    if (isEditing && id) {
      updateProduct({ id, data: payload }, {
        onSuccess: () => navigate("/director/inventory/products")
      });
    } else {
      createProduct(payload, {
        onSuccess: () => navigate("/director/inventory/products")
      });
    }
  };

  if (isEditing && isLoadingProduct) {
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
          <Link to="/director/inventory/products" className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{isEditing ? "Edit Product" : "New Product"}</h1>
            <p className="text-slate-500 text-sm">Define identity and pricing for this item.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border rounded-2xl p-6 shadow-sm space-y-6">
          <div className="space-y-4 pb-6 border-b">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-slate-400" />
              Product Image
            </h3>
            <div className="flex items-start gap-6">
              {formData.image_url ? (
                <div className="relative w-32 h-32 rounded-xl border bg-slate-50 overflow-hidden shrink-0 group">
                  <img 
                    src={getImageUrl(formData.image_url)} 
                    alt="Product preview" 
                    className="w-full h-full object-cover mix-blend-multiply" 
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, image_url: "" }))}
                    className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-red-600 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="w-32 h-32 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                  <ImageIcon className="w-8 h-8 text-slate-300" />
                </div>
              )}
              <div className="flex-1 space-y-2">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      uploadImage(file, {
                        onSuccess: (res) => {
                          setFormData(p => ({ ...p, image_url: res.image_url }));
                        }
                      });
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition text-sm flex items-center gap-2"
                >
                  {isUploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {isUploadingImage ? "Uploading..." : "Upload Image"}
                </button>
                <p className="text-xs text-slate-500">Recommended size: 500x500px or larger. PNG or JPG format.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Product Name *</label>
              <input 
                required
                className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-[#002b84] outline-none"
                value={formData.name}
                onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g., Knee Brace Pro"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">SKU (Stock Keeping Unit) *</label>
              <input 
                required
                className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-[#002b84] outline-none"
                value={formData.sku}
                onChange={e => setFormData(p => ({ ...p, sku: e.target.value }))}
                placeholder="e.g., KNB-PRO-01"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Description</label>
              <textarea 
                className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-[#002b84] outline-none h-24"
                value={formData.description}
                onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Barcode</label>
              <input 
                className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-[#002b84] outline-none"
                value={formData.barcode}
                onChange={e => setFormData(p => ({ ...p, barcode: e.target.value }))}
              />
            </div>
            
            {/* Pricing Section */}
            <div className="md:col-span-2 border-t pt-4 mt-2">
              <h3 className="font-medium text-slate-900 mb-4">Pricing & Financials</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Selling Price (₹)</label>
                  <input 
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-[#002b84] outline-none"
                    value={formData.selling_price}
                    onChange={e => setFormData(p => ({ ...p, selling_price: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Cost Price (₹)</label>
                  <input 
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-[#002b84] outline-none"
                    value={formData.cost_price}
                    onChange={e => setFormData(p => ({ ...p, cost_price: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Tax Rate (%)</label>
                  <input 
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    required
                    className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-[#002b84] outline-none"
                    value={formData.tax_rate}
                    onChange={e => setFormData(p => ({ ...p, tax_rate: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            
            <div className="md:col-span-2 border-t pt-4 mt-2">
              <h3 className="font-medium text-slate-900 mb-4">Classification</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Category (Optional)</label>
                  <select 
                    className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-[#002b84] outline-none bg-white"
                    value={formData.category_id}
                    onChange={e => setFormData(p => ({ ...p, category_id: e.target.value }))}
                  >
                    <option value="">-- None --</option>
                    {categories?.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Brand (Optional)</label>
                  <select 
                    className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-[#002b84] outline-none bg-white"
                    value={formData.brand_id}
                    onChange={e => setFormData(p => ({ ...p, brand_id: e.target.value }))}
                  >
                    <option value="">-- None --</option>
                    {brands?.map(brand => (
                      <option key={brand.id} value={brand.id}>{brand.name}</option>
                    ))}
                  </select>
                </div>
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
              {isEditing ? "Save Changes" : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </DirectorLayout>
  );
}

export default ProductFormPage;
