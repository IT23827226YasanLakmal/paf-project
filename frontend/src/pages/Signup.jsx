import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Password validation regex (Enterprise security standards)
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!passwordRegex.test(password)) {
      alert("Password must be at least 8 characters and include uppercase, lowercase, number, and special character.");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      // 1. Create user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
        },
      });

      if (error) throw error;

      if (data.user) {
        // 2. Synchronize with Backend Profile Table
        const response = await fetch("http://localhost:8080/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email,
            name: name,
            supabaseUid: data.user.id,
            role: "USER" // Default role
          }),
        });

        if (!response.ok) {
          console.error("Backend sync failed");
          // Note: We don't block the user here, but ideally we'd handle this retry.
        }

        alert("Signup successful! Please check your email for verification if required.");
        navigate("/login");
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:5173/login",
      },
    });
    if (error) alert(error.message);
  };

  return (
    <div className="bg-black min-h-screen flex items-center justify-center text-white px-4 font-outfit relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full"></div>

      <div className="w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl p-10 relative z-10">
        <h2 className="text-3xl font-black text-center mb-2 tracking-tight">Create Account</h2>
        <p className="text-center text-sm text-gray-500 mb-8 font-medium leading-relaxed">
          Join the professional campus operations network.
        </p>

        <form onSubmit={handleSignup} className="flex flex-col gap-5">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Full Name</label>
            <input
              type="text"
              placeholder="John Doe"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-700"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-gray-500 ml-1">University Email</label>
            <input
              type="email"
              placeholder="name@university.com"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-700"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-700 text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Confirm</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-700 text-sm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <p className="text-[10px] text-gray-500 leading-tight">
            Must include 8+ chars, uppercase, lowercase, number, and symbol.
          </p>

          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all rounded-xl py-4 font-black text-sm shadow-xl shadow-blue-900/20 disabled:opacity-50 mt-2"
          >
            {isLoading ? "Creating Account..." : "Create Free Account"}
          </button>
        </form>

        <div className="flex items-center gap-4 my-6">
          <div className="h-[1px] flex-1 bg-white/10"></div>
          <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">or continue with</span>
          <div className="h-[1px] flex-1 bg-white/10"></div>
        </div>

        <button
          onClick={handleGoogleSignup}
          className="w-full flex items-center justify-center gap-3 bg-white text-black rounded-xl py-3 font-bold text-sm hover:bg-gray-100 active:scale-[0.98] transition-all"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="w-5 h-5"
          />
          Google
        </button>

        <p className="text-center text-xs text-gray-500 mt-8">
          Already have an account? <a href="/login" className="text-blue-500 font-bold hover:underline">Sign In</a>
        </p>
      </div>
    </div>
  );
}