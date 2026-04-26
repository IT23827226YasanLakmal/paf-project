import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import FacilitiesPage from './pages/FacilitiesPage';
import AssetsPage from './pages/AssetsPage';
import TicketingPage from './pages/TicketingPage';
import MyBookingsPage from './pages/MyBookingsPage';
import AdminBookingReview from './pages/AdminBookingReview';
import VerifyQrPage from './pages/VerifyQrPage';
import Login from './pages/Login';
import FacilityDashboard from './pages/FacilityDashboard';
import UserManagement from './pages/UserManagement';
import DashboardPage from './pages/DashboardPage';
import TechnicianOverview from './pages/TechnicianOverview';
import UserOverview from './pages/UserOverview';
import AdminOverview from './pages/AdminOverview';
import MaintenancePage from './pages/MaintenancePage';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import Sidebar from './components/layout/Sidebar';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AdminUserRoles from './pages/AdminUserRoles';
import { Toaster } from 'react-hot-toast';
import Signup from './pages/Signup';
import BookingForm from './components/BookingForm';
import NotificationBell from './components/NotificationBell';
import UserDropdown from './components/layout/UserDropdown';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import ReportsPage from './pages/ReportsPage';
import BookingOfficerOverview from './pages/BookingOfficerOverview';


const AppLayout = () => {
  const { user } = useAuthStore();
  const { initTheme } = useThemeStore();
  const [bookingTarget, setBookingTarget] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    initTheme();
  }, []);

  return (
    <div className="min-h-screen bg-canvas text-primary font-sans antialiased flex glossy-mesh">
      {/* ── Left Sidebar (w-56 = 224px) ── */}
      <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

      {/* ── Main content area offset by sidebar ── */}
      <div className={`flex-1 ${isSidebarCollapsed ? 'ml-28' : 'ml-72'} flex flex-col min-h-screen transition-all duration-300`}>

        {/* ── Page content ── */}
        <main className="flex-1 px-6 py-5 max-w-[1400px] w-full mx-auto">
          <Routes>
            <Route
              path=""
              element={
                user?.role === 'USER'
                  ? <Navigate to="/app/user/overview" replace />
                  : user?.role === 'ADMIN'
                    ? <Navigate to="/app/admin/overview" replace />
                    : user?.role === 'FACILITY_MANAGER'
                      ? <Navigate to="/app/facility-manager/overview" replace />
                      : user?.role === 'TECHNICIAN'
                        ? <Navigate to="/app/technician/overview" replace />
                        : user?.role === 'BOOKING_OFFICER'
                          ? <Navigate to="/app/booking-officer/overview" replace />
                          : <Navigate to="/login" replace />
              }
            />

            {/* Shared Routes */}
            <Route element={<ProtectedRoute allowedRoles={['USER', 'ADMIN', 'BOOKING_OFFICER', 'FACILITY_MANAGER', 'TECHNICIAN']} />}>
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="technician/tickets" element={<TicketingPage />} />
              <Route path="user/tickets" element={<TicketingPage />} />
              <Route path="dashboard" element={<DashboardPage onBookResource={(r) => setBookingTarget(r)} />} />
            </Route>

            {/* User Domain */}
            <Route element={<ProtectedRoute allowedRoles={['USER', 'ADMIN']} />}>
              <Route path="user/overview" element={<UserOverview />} />
              <Route path="user/bookings" element={<MyBookingsPage />} />
            </Route>

            {/* Admin Domain */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="admin/overview" element={<AdminOverview />} />
              <Route path="admin/users" element={<UserManagement />} />
              <Route path="admin/maintenance" element={<MaintenancePage />} />
            </Route>

            {/* Booking Officer Domain */}
            <Route element={<ProtectedRoute allowedRoles={['BOOKING_OFFICER', 'ADMIN']} />}>
              <Route path="booking-officer/overview" element={<BookingOfficerOverview />} />
              <Route path="booking-officer/review" element={<AdminBookingReview />} />
            </Route>

            {/* Technician Domain */}
            <Route element={<ProtectedRoute allowedRoles={['TECHNICIAN', 'ADMIN']} />}>
              <Route path="technician/overview" element={<TechnicianOverview />} />
            </Route>

            {/* Facility Manager Domain */}
            <Route element={<ProtectedRoute allowedRoles={['FACILITY_MANAGER', 'ADMIN']} />}>
              <Route path="facility-manager/overview" element={<FacilityDashboard />} />
              <Route path="facility-manager/facilities" element={<FacilitiesPage />} />
              <Route path="facility-manager/assets" element={<AssetsPage />} />
            </Route>
          </Routes>
        </main>
      </div>

      {bookingTarget && (
        <BookingForm
          resource={bookingTarget}
          onClose={() => setBookingTarget(null)}
          onSuccess={() => setBookingTarget(null)}
        />
      )}
    </div>
  );
};

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          style: { background: '#111', color: '#fff', border: '1px solid #333' },
          success: { iconTheme: { primary: 'green', secondary: 'black' } },
          error: { iconTheme: { primary: 'red', secondary: 'black' } },
        }}
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-qr/:token" element={<VerifyQrPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/app/*"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
