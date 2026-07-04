import { useState, useEffect } from "react";
import { useHolidays, useCreateHoliday, useUpdateHoliday, useValidateHoliday } from "@/services/holidays";
import DirectorLayout from "./DirectorLayout";
import { Plus, Loader2, Power, PowerOff, CalendarX, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Holiday } from "@/types/scheduling";

export function HolidayManagementPage() {
  const { data: holidays, isLoading } = useHolidays();
  const createMutation = useCreateHoliday();
  const updateMutation = useUpdateHoliday();
  const validateMutation = useValidateHoliday();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    reason: ""
  });
  
  const [validationPreview, setValidationPreview] = useState<{is_valid: boolean; message: string | null} | null>(null);

  // Re-validate when date changes
  useEffect(() => {
    if (formData.date) {
      setValidationPreview(null);
      validateMutation.mutate(formData.date, {
        onSuccess: (res) => {
          setValidationPreview(res);
        }
      });
    }
  }, [formData.date]);

  const handleOpenModal = () => {
    setFormData({
      date: "",
      reason: ""
    });
    setValidationPreview(null);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validationPreview?.is_valid) return;
    
    createMutation.mutate({
      date: formData.date,
      reason: formData.reason
    }, {
      onSuccess: () => setIsModalOpen(false)
    });
  };

  const handleToggleStatus = (item: Holiday) => {
    if (confirm(`Are you sure you want to ${item.is_active ? 'deactivate' : 'activate'} this holiday?`)) {
      updateMutation.mutate({
        id: item.id,
        is_active: !item.is_active
      });
    }
  };

  return (
    <DirectorLayout>
      <div className="max-w-4xl mx-auto animate-fade-in pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Holiday Management</h1>
            <p className="text-slate-500 mt-1">Configure future clinic closure dates.</p>
          </div>
          <button 
            onClick={handleOpenModal}
            className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold shadow-md hover:bg-primary/90 transition-all active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" /> Add Holiday
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !holidays || holidays.length === 0 ? (
          <div className="text-center bg-white border border-dashed border-slate-300 rounded-3xl p-16 shadow-sm">
            <CalendarX className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700">No holidays configured</h3>
            <p className="text-slate-500 mt-1">The clinic operates on all non-Wednesday dates.</p>
          </div>
        ) : (
          <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {holidays.map(holiday => (
                  <tr key={holiday.id} className={`transition-colors ${!holiday.is_active ? 'bg-slate-50 opacity-60' : 'hover:bg-slate-50/50'}`}>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-900">
                      {new Date(holiday.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {holiday.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${holiday.is_active ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-600'}`}>
                        {holiday.is_active ? 'Closed (Active)' : 'Open (Inactive)'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button 
                        onClick={() => handleToggleStatus(holiday)}
                        disabled={updateMutation.isPending}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${holiday.is_active ? 'text-slate-600 hover:bg-slate-100' : 'text-red-600 hover:bg-red-50'}`}
                      >
                        {holiday.is_active ? <><PowerOff className="w-4 h-4" /> Deactivate</> : <><Power className="w-4 h-4" /> Activate</>}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-up">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-900">Configure Holiday</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Date</label>
                <input 
                  required 
                  type="date" 
                  value={formData.date} 
                  onChange={e => setFormData({...formData, date: e.target.value})} 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium text-slate-900" 
                />
              </div>
              
              {/* Validation Preview Area */}
              {formData.date && (
                <div className={`p-4 rounded-xl border flex items-start gap-3 ${validateMutation.isPending ? 'bg-slate-50 border-slate-200' : validationPreview?.is_valid ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                  {validateMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin text-slate-400 shrink-0" />
                  ) : validationPreview?.is_valid ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                  )}
                  <div className="text-sm font-medium">
                    {validateMutation.isPending ? 'Validating scheduling rules...' : validationPreview?.is_valid ? 'This date can be configured as a holiday.' : validationPreview?.message}
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Reason / Description</label>
                <input 
                  required 
                  type="text" 
                  placeholder="e.g. Diwali, Clinic Renovation"
                  value={formData.reason} 
                  onChange={e => setFormData({...formData, reason: e.target.value})} 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium" 
                />
              </div>

              <div className="pt-4 border-t flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors">Cancel</button>
                <button 
                  type="submit" 
                  disabled={createMutation.isPending || !validationPreview?.is_valid} 
                  className="flex-1 py-3.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-md disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Confirm Holiday
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DirectorLayout>
  );
}

export default HolidayManagementPage;
