import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../services/api";
import { useAuthStore } from "../store/authStore";

export default function Login() {
  const { login } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // Sync user to backend using the new supabaseUid structure
  const syncUserToBackend = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) return;

      const response = await fetch("http://localhost:8080/api/auth/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          name: user.user_metadata?.full_name || "User",
          supabaseUid: user.id, // Corrected to match backend expected field
        }),
      });

      if (!response.ok) throw new Error("Sync failed");
      // User synced successfully

    } catch (err) {
      console.error("Sync error:", err);
    }
  };

  // Check session (Google redirect or session refresh)
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        const token = data.session.access_token;
        
        // Ensure backend is aware of this user
        await syncUserToBackend();

        try {
          // IMPORTANT: Set token in localStorage so authFetch can find it for the next call
          localStorage.setItem('token', token);
          
          // Fetch full user details including role from our DB
          const userObj = await getCurrentUser();
          
          // CRITICAL: Update global state and localStorage via store
          login(userObj, token);

          // Role-based redirect
          if (userObj.role === "ADMIN") {
            navigate("/app/dashboard");
          } else if (userObj.role === "TECHNICIAN") {
            navigate("/app/technician-dashboard");
          } else if (userObj.role === "FACILITY_MANAGER") {
            navigate("/app/facility");
          } else {
            navigate("/app/dashboard");
          }
        } catch (err) {
          console.error("Failed to fetch user role", err);
          navigate("/"); // fallback
        }
      }
    };

    checkSession();
  }, [navigate]);

  // Email login
  const handleLogin = async (e) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    const token = data.session.access_token;
    
    // Sync to ensure user exists in DB
    await syncUserToBackend();
    
    // Fetch full profile and role
    try {
      localStorage.setItem('token', token);
      const userObj = await getCurrentUser();
      login(userObj, token);
      
      // Redirect based on role
      if (userObj.role === "ADMIN") navigate("/app/dashboard");
      else if (userObj.role === "FACILITY_MANAGER") navigate("/app/facility");
      else navigate("/app/dashboard");
    } catch (err) {
      console.error("Login profile fetch failed", err);
    }
  };

  // Google login
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:5173/login",
        queryParams: {
          prompt: "select_account",
        },
      },
    });

    if (error) {
      console.error(error);
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen flex bg-black text-white font-outfit">
      {/* LEFT SIDE (Branding) */}
      <div className="hidden md:flex w-1/2 items-center justify-center bg-linear-to-br from-blue-900/40 to-black p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        <div className="max-w-md relative z-10">
          <h1 className="text-5xl font-black mb-4 leading-tight tracking-tighter">
            Welcome to <span className="text-blue-500">Smart Campus</span>
          </h1>
          <p className="text-gray-400 text-lg mb-6 leading-relaxed">
            Pro-grade operations. Seamless experiences. 
            Unprecedented control over every asset, room, and resource.
          </p>
          <div className="flex gap-2">
             <div className="h-1 w-12 bg-blue-500 rounded-full"></div>
             <div className="h-1 w-4 bg-gray-700 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE (Login Form) */}
      <div className="flex w-full md:w-1/2 items-center justify-center px-6 bg-black">
        <div className="w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl p-10">
          <h2 className="text-3xl font-black mb-2 tracking-tight">Sign in</h2>
          <p className="text-sm text-gray-500 mb-8 font-medium">Access your professional dashboard</p>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Email Address</label>
              <input
                type="email"
                placeholder="name@university.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-700"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-700"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all rounded-xl py-4 font-black text-sm shadow-xl shadow-blue-900/20 mt-2"
            >
              Sign In
            </button>
          </form>

          <div className="flex items-center gap-4 my-8">
            <div className="h-[1px] flex-1 bg-white/10"></div>
            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Enterprise Auth</span>
            <div className="h-[1px] flex-1 bg-white/10"></div>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white text-black rounded-xl py-3.5 font-bold text-sm hover:bg-gray-100 active:scale-[0.98] transition-all"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-5 h-5"
            />
            Continue with Google
          </button>
          
          <p className="text-center text-xs text-gray-500 mt-8">
            Don't have an account? <a href="/signup" className="text-blue-500 font-bold hover:underline">Create one</a>
          </p>
        </div>
      </div>
    </div>
  );
}