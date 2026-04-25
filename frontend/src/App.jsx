import React from 'react';
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
import RoleNav from './components/layout/RoleNav';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AdminUserRoles from "./pages/AdminUserRoles";
import { Toaster } from "react-hot-toast";
import Signup from "./pages/Signup";

const AppLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
      logout();
      navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3 hidden sm:flex">
                    <span className="text-white font-bold text-xl leading-none">S</span>
                </div>
                <span className="font-bold text-xl text-slate-900 tracking-tight">Smart Campus</span>
                <span className="ml-2 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">Hub</span>
              </div>
              <RoleNav />
            </div>
            <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-slate-600">
                    {user?.name} <span className="text-slate-400">({user?.role})</span>
                </span>
                <button 
                    onClick={handleLogout}
                    className="text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-1 rounded"
                >
                    Logout
                </button>
                <div className="h-8 w-8 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center font-bold text-slate-400">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Guest'}`} alt="Avatar" className="w-full h-full object-cover" />
                </div>
            </div>
          </div>
        </div>
      </nav>

      <main>
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
      <Route path="/signup" element={<Signup />} />
      
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
