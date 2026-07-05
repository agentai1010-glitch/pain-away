import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/auth";

export default function SignInPage() {
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  // Using a simple localStorage for now instead of full auth store to simplify
  // Later we can move to full zustand store if needed. Let's just use localStorage and dispatch event.

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (mobileNumber.length < 10) {
      setError("Please enter a valid mobile number.");
      return;
    }

    setLoading(true);
    try {
      await authService.sendOtp(mobileNumber);
      setStep("otp");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!otp) {
      setError("Please enter the OTP.");
      return;
    }

    setLoading(true);
    try {
      const data = await authService.verifyOtp(mobileNumber, otp);
      localStorage.setItem("patient_token", data.access_token);
      localStorage.setItem("patient_id", data.patient_id || "");
      // Dispatch a custom event so the layout can update
      window.dispatchEvent(new Event("patient_auth_changed"));
      navigate("/portal/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-20 flex justify-center items-center px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight text-center mb-2">Patient Portal</h1>
        <p className="text-slate-500 text-center mb-8">Access your appointment history and records.</p>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">
            {error}
          </div>
        )}

        {step === "phone" ? (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Mobile Number</label>
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-lg"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-lg text-center tracking-[0.5em] font-mono"
                autoFocus
                maxLength={6}
              />
              <p className="text-xs text-slate-400 mt-2 text-center">For testing, use 123456</p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify & Sign In"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setOtp("");
                setError(null);
              }}
              className="w-full py-4 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl font-semibold transition-all"
            >
              Change Mobile Number
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
