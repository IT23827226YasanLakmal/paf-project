import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

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

        //  SYNC USER
        await syncUserToBackend();

        navigate("/app/admin/users"); // Redirect to admin dashboard after google login
      }
    };

    checkSession();
  }, [navigate]);

  //  Email login
  const handleLogin = async (e) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      localStorage.setItem("token", data.session.access_token);

      //  SYNC USER
      await syncUserToBackend();

      navigate("/app");
    }
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
    <div className="bg-black min-h-screen flex items-center justify-center text-white px-4">

      <div className="w-full max-w-md bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-xl p-8">

        <h2 className="text-2xl font-semibold text-center mb-6">
          Smart Campus Login
        </h2>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">

          <input
            type="email"
            placeholder="Email"
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 transition rounded-lg py-2 font-medium"
          >
            Login
          </button>
        </form>

        <div className="text-center my-4 text-sm text-gray-400">OR</div>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2 bg-white text-black rounded-lg py-2 font-medium hover:bg-gray-200 transition"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="w-5 h-5"
          />
          Sign in with Google
        </button>

      </div>
    </div>
  );
}