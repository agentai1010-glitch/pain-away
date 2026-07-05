import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/auth";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await authService.getProfile();
        if (!data) {
          navigate("/login");
          return;
        }
        setProfile(data);
      } catch (err) {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleLogout = async () => {
    await authService.logout();
    window.dispatchEvent(new Event("patient_auth_changed"));
    navigate("/");
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <p className="text-slate-500">Loading Profile...</p>
      </div>
    );
  }

  return (
    <div className="py-20 flex justify-center px-4">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-slate-100">
        <div className="flex justify-between items-center mb-12 border-b border-slate-100 pb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Patient Profile</h1>
            <p className="text-slate-500 mt-2">Manage your account and appointments.</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-xl transition-colors"
          >
            Logout
          </button>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 mb-1">Mobile Number</p>
              <p className="text-xl font-bold text-slate-900">{profile.mobile_number}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </div>
          </div>
          
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-sm font-semibold text-slate-500 mb-1">Linked Patient ID</p>
            <p className="text-lg font-bold text-slate-900">{profile.patient_id || "No Patient Record Linked Yet"}</p>
            {!profile.patient_id && (
              <p className="text-sm text-slate-500 mt-2">Your profile will be automatically linked after your first appointment.</p>
            )}
          </div>
        </div>

        <div className="mt-12 p-8 border-2 border-dashed border-blue-200 bg-blue-50/50 rounded-2xl text-center">
          <svg className="w-12 h-12 text-blue-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Patient Portal coming in the next phase</h3>
          <p className="text-slate-600">You will be able to view your complete appointment history, prescriptions, bills, and purchase receipts here.</p>
        </div>
      </div>
    </div>
  );
}
