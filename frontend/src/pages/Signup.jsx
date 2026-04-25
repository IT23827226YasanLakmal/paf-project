import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  //  Password validation regex
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  const handleSignup = async (e) => {
    e.preventDefault();

    //  Validate password
    if (!passwordRegex.test(password)) {
      alert(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character (@,$,!,%,*,?,&)"
      );
      return;
    }

    //  Confirm password
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Signup successful!");
      navigate("/login");
    }
  };

  //  Google signup
  const handleGoogleSignup = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:5173/login",
      },
    });

    if (error) {
      alert(error.message);
    }
  };

  return (
    <div className="bg-black min-h-screen flex items-center justify-center text-white px-4">

      <div className="w-full max-w-md bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-xl p-8">

        {/* Title */}
        <h2 className="text-2xl font-semibold text-center mb-2">
          Create your account
        </h2>

        {/* Subtitle */}
        <p className="text-center text-sm text-gray-400 mb-6">
          Pro-grade operations. Seamless experiences. <br />
          Unprecedented control over every asset, room, and resource.
        </p>

        {/* Form */}
        <form onSubmit={handleSignup} className="flex flex-col gap-4">

          <input
            type="text"
            placeholder="Full Name"
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

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

          <input
            type="password"
            placeholder="Confirm Password"
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {/* Password hint */}
          <p className="text-xs text-gray-400">
            Password must contain at least 8 characters, including uppercase,
            lowercase, number, and special character (@, $, !, %, *, ?, &)
          </p>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 transition rounded-lg py-2 font-medium"
          >
            Sign Up
          </button>
        </form>

        {/* Divider */}
        <div className="text-center my-4 text-sm text-gray-400">OR</div>

        {/* Google */}
        <button
          onClick={handleGoogleSignup}
          className="w-full flex items-center justify-center gap-2 bg-white text-black rounded-lg py-2 font-medium hover:bg-gray-200 transition"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="w-5 h-5"
          />
          Continue with Google
        </button>

        {/* Redirect */}
        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-blue-400 hover:underline">
            Login
          </a>
        </p>

      </div>
    </div>
  );
}