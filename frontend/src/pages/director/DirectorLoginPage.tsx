import { useState } from "react";
import { useDirectorLogin } from "@/services/director";
import { Loader2, Lock, User, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function DirectorLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { mutate: login, isPending, error } = useDirectorLogin();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(
      { username, password },
      {
        onSuccess: (data) => {
          localStorage.setItem("director_token", data.access_token);
          navigate("/director/dashboard");
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-lg border p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-[#002b84]/10 text-[#002b84] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Director Portal</h1>
          <p className="text-sm text-slate-500">Sign in to manage clinic configuration</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input 
                required 
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm pl-9 focus:border-[#002b84] focus:ring-1 focus:ring-[#002b84] outline-none" 
                placeholder="director" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input 
                required 
                type="password" 
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm pl-9 focus:border-[#002b84] focus:ring-1 focus:ring-[#002b84] outline-none" 
                placeholder="••••••••" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-500 font-medium">
              {error instanceof Error ? error.message : "Invalid credentials or network error."}
            </div>
          )}

          <button 
            disabled={isPending} 
            type="submit" 
            className="w-full flex items-center justify-center gap-2 rounded-xl text-sm font-semibold bg-[#002b84] text-white hover:bg-blue-900 h-10 px-4 transition-colors"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default DirectorLoginPage;
