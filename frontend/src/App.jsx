import React, { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CataloguePage from './pages/CataloguePage';
import TicketingPage from './pages/TicketingPage';
import MyBookingsPage from './pages/MyBookingsPage';
import AdminBookingReview from './pages/AdminBookingReview';
import VerifyQrPage from './pages/VerifyQrPage';
import Login from './pages/Login';
import FacilityDashboard from './pages/FacilityDashboard';
import UserManagement from './pages/UserManagement';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import { Sun, Moon } from 'lucide-react';
import RoleNav from './components/layout/RoleNav';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AdminUserRoles from "./pages/AdminUserRoles";
import { Toaster } from "react-hot-toast";

const AppLayout = () => {
  const { user, logout } = useAuthStore();
  const { darkMode, toggleDarkMode, initTheme } = useThemeStore();
  const navigate = useNavigate();

  useEffect(() => {
      initTheme();
  }, []);

  const handleLogout = () => {
      logout();
      navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
      {/* Floating Anthropic-Inspired Navbar */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-7xl z-50">
        <nav className="bg-white/90 backdrop-blur-xl border border-slate-200/50 shadow-[0_8px_32px_rgba(0,0,0,0.03)] rounded-2xl h-16 transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
            <div className="flex justify-between h-full">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center group cursor-pointer">
                  <div className="h-9 w-9 bg-gradient-to-tr from-[#0F172A] via-[#1E3A8A] to-[#FF6B00] rounded-xl flex items-center justify-center mr-3 hidden sm:flex shadow-sm shadow-orange-500/30 group-hover:scale-105 transition-transform duration-200">
                      <span className="text-white font-bold text-xl leading-none">S</span>
                  </div>
                  <span className="font-bold text-lg text-slate-900 tracking-tight group-hover:opacity-90 transition-opacity">Smart Campus</span>
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">Hub</span>
                </div>
                <RoleNav />
              </div>
              <div className="flex items-center space-x-4">
                  {/* Theme Toggle Button */}
                  <button
                      onClick={toggleDarkMode}
                      className="p-2 rounded-full text-slate-600 hover:text-slate-900 bg-slate-100/50 hover:bg-slate-100 border border-slate-200/30 transition-all duration-200 cursor-pointer shadow-sm flex items-center justify-center"
                      title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                  >
                      {darkMode ? <Sun className="w-4 h-4 text-orange-500" /> : <Moon className="w-4 h-4 text-slate-600" />}
                  </button>

                  <span className="text-sm font-medium text-slate-600 hidden md:inline-block">
                      {user?.name} <span className="text-slate-400 text-xs font-normal">({user?.role})</span>
                  </span>
                  <button 
                      onClick={handleLogout}
                      className="text-xs font-medium text-slate-600 hover:text-red-600 bg-slate-100/50 hover:bg-red-50 px-3 py-1.5 rounded-full transition-all duration-200 border border-slate-200/30 hover:border-red-100 cursor-pointer"
                  >
                      Logout
                  </button>
                  <div className="h-9 w-9 rounded-full bg-slate-100 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center font-bold text-slate-400">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Guest'}`} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
              </div>
            </div>
          </div>
        </nav>
      </div>

      <main className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <Routes>
           {/* Allow a default app landing, will typically redirect or just show catalogue */}
           <Route path="" element={<CataloguePage />} />
           
           <Route element={<ProtectedRoute allowedRoles={['USER', 'FACILITY_MANAGER', 'ADMIN']} />}>
               <Route path="catalogue" element={<CataloguePage />} />
           </Route>

           <Route element={<ProtectedRoute allowedRoles={['USER', 'ADMIN']} />}>
               <Route path="my-bookings" element={<MyBookingsPage />} />
           </Route>

           <Route element={<ProtectedRoute allowedRoles={['USER', 'TECHNICIAN', 'ADMIN']} />}>
               <Route path="tickets" element={<TicketingPage />} />
           </Route>

           <Route element={<ProtectedRoute allowedRoles={['FACILITY_MANAGER', 'ADMIN']} />}>
               <Route path="facility" element={<FacilityDashboard />} />
           </Route>

           <Route element={<ProtectedRoute allowedRoles={['BOOKING_OFFICER', 'ADMIN']} />}>
               <Route path="admin-review" element={<AdminBookingReview />} />
           </Route>

           <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
               <Route path="users" element={<UserManagement />} />
           </Route>
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <>
      {/*  TOASTER  */}
      <Toaster 
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          style: {
            background: "#111",
            color: "#fff",
            border: "1px solid #333",
          },
          success: {
            iconTheme: {
              primary: "green",
              secondary: "black",
            },
          },
          error: {
            iconTheme: {
              primary: "red",
              secondary: "black",
            },
          },
        }}
      />

    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify-qr/:token" element={<VerifyQrPage />} />
      
      <Route path="/app/*" element={
          <ProtectedRoute>
              <AppLayout />
          </ProtectedRoute>
      } />
    </Routes>
    </>
  );
}

export default App;
