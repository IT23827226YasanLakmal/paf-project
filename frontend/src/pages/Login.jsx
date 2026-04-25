import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../services/api";

export default function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  //  sync user to backend
  const syncUserToBackend = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) return;

      await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          name: user.user_metadata?.full_name || "User",
          oauthId: user.id,
        }),
      });

      console.log("User synced to backend");
    } catch (err) {
      console.error("Sync error:", err);
    }
  };

  //  Check session (Google redirect)
  useEffect(() => {
  const checkSession = async () => {
    const { data } = await supabase.auth.getSession();

    if (data.session) {
      const token = data.session.access_token;

      //  Save JWT
      localStorage.setItem("token", token);

      console.log("JWT saved:", token);

      //  Sync user to backend
      await syncUserToBackend();

      try {
        //  Get logged-in user details (with role)
        const user = await getCurrentUser();

        console.log("User role:", user.role);

        //  Role-based redirect
        if (user.role === "ADMIN") {
          navigate("/app/admin/users");
        } else if (user.role === "TECHNICIAN") {
          navigate("/app");
        } else {
          navigate("/"); // normal user
        }

      } catch (err) {
        console.error("Failed to fetch user role", err);
        navigate("/"); // fallback
      }
    }
  };

  checkSession();
}, []);

  //  Email login
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

  //  Save token
  localStorage.setItem("token", data.session.access_token);

  console.log("Login success");

  //  Let useEffect handle everything
  window.location.reload();
};

  //  Google login
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
  <div className="min-h-screen flex bg-black text-white">

    {/* LEFT SIDE (Branding) */}
    <div className="hidden md:flex w-1/2 items-center justify-center bg-linear-to-br from-blue-900/40 to-black p-12">
      <div className="max-w-md">

        <h1 className="text-4xl font-bold mb-4 leading-tight">
          Welcome to <span className="text-blue-500">Smart Campus</span>
        </h1>

        <p className="text-gray-300 text-lg mb-6">
          Pro-grade operations. Seamless experiences. 
          Unprecedented control over every asset, room, and resource.
        </p>

        <div className="text-sm text-gray-500">
          Manage everything. Effortlessly.
        </div>

      </div>
    </div>

    {/* RIGHT SIDE (Login Form) */}
    <div className="flex w-full md:w-1/2 items-center justify-center px-6">

      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8">

        <h2 className="text-2xl font-semibold mb-2">
          Sign in
        </h2>

        <p className="text-sm text-gray-400 mb-6">
          Access your dashboard and manage your system
        </p>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">

          <input
            type="email"
            placeholder="Email"
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 transition rounded-lg py-3 font-medium shadow-lg shadow-blue-900/30"
          >
            Login
          </button>
        </form>

        <div className="text-center my-5 text-sm text-gray-400">
          OR
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white text-black rounded-lg py-3 font-medium hover:bg-gray-200 transition"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="w-5 h-5"
          />
          Continue with Google
        </button>

      </div>
    </div>
  </div>
);
}