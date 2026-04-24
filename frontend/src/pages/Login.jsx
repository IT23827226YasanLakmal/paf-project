import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "../services/api";
import { useAuthStore } from "../store/authStore";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("USER");
  const [error, setError] = useState("");
  
  const navigate = useNavigate();
  const authLogin = useAuthStore(state => state.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isLogin) {
        const response = await login({ email, password });
        authLogin(
          { id: response.id, name: response.name, email: response.email, role: response.role },
          response.token
        );
      } else {
        const response = await register({ name, email, password, role });
        authLogin(
          { id: response.id, name: response.name, email: response.email, role: response.role },
          response.token
        );
      }
      navigate("/app");
    } catch (err) {
      setError(err.message || "Authentication failed");
    }
  };

  return (
    <div className="bg-black min-h-screen flex items-center justify-center text-white px-4">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-semibold text-center mb-6">
          {isLogin ? "Smart Campus Login" : "Register Account"}
        </h2>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <>
              <input
                type="text"
                placeholder="Full Name"
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                required
              >
                <option value="USER" className="text-black">Standard User</option>
                <option value="FACILITY_MANAGER" className="text-black">Facility Manager</option>
                <option value="BOOKING_OFFICER" className="text-black">Booking Officer</option>
                <option value="TECHNICIAN" className="text-black">Technician</option>
                <option value="SYSTEM_ADMIN" className="text-black">System Admin</option>
              </select>
            </>
          )}

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
            className="bg-blue-600 hover:bg-blue-700 transition rounded-lg py-2 font-medium mt-2"
          >
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        <div className="text-center mt-6 text-sm text-gray-400">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="ml-2 text-blue-400 hover:text-blue-300 font-medium transition"
          >
            {isLogin ? "Register here" : "Login here"}
          </button>
        </div>
      </div>
    </div>
  );
}