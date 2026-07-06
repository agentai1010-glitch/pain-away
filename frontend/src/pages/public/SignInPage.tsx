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
    <div className="w-full min-h-screen font-sans pb-24 pt-28 md:pt-36 px-4 md:px-12 lg:px-24 bg-cover bg-center bg-no-repeat bg-fixed relative flex justify-center items-start" style={{ backgroundImage: "url('/images/products-bg.png')" }}>
      {/* Dark overlay to ensure readability while showing word cloud */}
      <div className="absolute inset-0 bg-blue-950/40 backdrop-blur-[2px] pointer-events-none" />

      <div className="relative z-10 max-w-md w-full bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20 text-white mt-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight text-center mb-2 drop-shadow-sm">Patient Portal</h1>
        <p className="text-slate-200 text-center mb-8">Access your appointment history and records.</p>
        
        {error && (
          <div className="mb-6 p-4 bg-red-500/80 backdrop-blur-md text-white rounded-xl text-sm border border-red-400/30 shadow-md">
            {error}
          </div>
        )}

        {step === "phone" ? (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">Mobile Number</label>
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full px-4 py-3.5 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/15 transition-all text-lg text-white placeholder:text-slate-300 shadow-inner"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600/90 hover:bg-blue-500 text-white rounded-xl font-bold text-lg transition-all shadow-xl shadow-blue-500/30 border border-blue-400/30 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full px-4 py-3.5 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/15 transition-all text-lg text-center tracking-[0.5em] font-mono text-white placeholder:text-slate-400 shadow-inner"
                autoFocus
                maxLength={6}
              />
              <p className="text-xs text-blue-300 mt-2 text-center">For testing, use 123456</p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600/90 hover:bg-blue-500 text-white rounded-xl font-bold text-lg transition-all shadow-xl shadow-blue-500/30 border border-blue-400/30 disabled:opacity-50"
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
              className="w-full py-4 bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white rounded-xl font-semibold transition-all border border-white/15 shadow-md"
            >
              Change Mobile Number
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
