const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export const authService = {
  sendOtp: async (mobileNumber: string) => {
    const res = await fetch(`${API_URL}/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile_number: mobileNumber })
    });
    if (!res.ok) {
      const error = await res.json();
      throw error;
    }
    return res.json();
  },

  verifyOtp: async (mobileNumber: string, otp: string) => {
    const res = await fetch(`${API_URL}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile_number: mobileNumber, otp })
    });
    if (!res.ok) {
      const error = await res.json();
      throw error;
    }
    return res.json();
  },

  getProfile: async () => {
    const token = localStorage.getItem("patient_token");
    if (!token) return null;
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      const error = await res.json();
      throw error;
    }
    return res.json();
  }
};
