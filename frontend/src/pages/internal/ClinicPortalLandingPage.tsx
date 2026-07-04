import { useNavigate } from "react-router-dom";
import { Users, Building2, ChevronRight } from "lucide-react";

export default function ClinicPortalLandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#002b84] tracking-tight mb-4">
            PAIN AWAY
          </h1>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Clinic Portal</h2>
          <p className="text-lg text-slate-500 font-medium">Internal Operations System</p>
        </div>

        {/* Portal Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Reception Portal Card */}
          <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 overflow-hidden flex flex-col">
            <div className="p-10 flex-1 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                <Users className="w-10 h-10 text-[#002b84]" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Reception Portal</h3>
              <p className="text-slate-500 mb-8 max-w-xs mx-auto">
                Manage appointments, patient operations and checkout.
              </p>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100">
              <button
                onClick={() => navigate("/reception")}
                className="w-full flex items-center justify-center gap-2 bg-[#002b84] text-white py-4 px-6 rounded-xl font-bold text-lg hover:bg-blue-900 transition-colors"
              >
                Reception Login <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Director Portal Card */}
          <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 overflow-hidden flex flex-col">
            <div className="p-10 flex-1 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                <Building2 className="w-10 h-10 text-[#002b84]" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Director Portal</h3>
              <p className="text-slate-500 mb-8 max-w-xs mx-auto">
                Manage services, holidays and business configuration.
              </p>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100">
              <button
                onClick={() => navigate("/director")}
                className="w-full flex items-center justify-center gap-2 bg-white text-[#002b84] border-2 border-[#002b84] py-4 px-6 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors"
              >
                Director Login <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-12 text-slate-400 text-sm">
          Secure Internal Network &copy; {new Date().getFullYear()} Pain Away Clinic
        </div>
      </div>
    </div>
  );
}
