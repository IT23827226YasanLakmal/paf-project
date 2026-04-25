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
import { Search } from 'lucide-react';
import BookingOfficerOverview from './pages/BookingOfficerOverview';
import ReportsPage from './pages/ReportsPage';

const AppLayout = () => {
  const { user } = useAuthStore();
  const { initTheme } = useThemeStore();
  const [bookingTarget, setBookingTarget] = useState(null);

  useEffect(() => {
    initTheme();
  }, []);

  return (
    <div className="min-h-screen bg-canvas text-primary font-sans antialiased flex">
      {/* ── Left Sidebar (w-56 = 224px) ── */}
      <Sidebar />

      {/* ── Main content area offset by sidebar ── */}
      <div className="flex-1 ml-56 flex flex-col min-h-screen glossy-mesh">

        {/* ── Top Header ── */}
        <header
          className="sticky top-0 z-30 h-16 flex items-center px-6 gap-4 glass-card"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          {/* Search bar */}
          <div
            className="flex items-center gap-2.5 flex-1 max-w-md rounded-xl px-3.5 py-2 text-sm cursor-text transition-colors bg-raised"
            style={{ border: '1px solid var(--border-subtle)' }}
          >
            <Search className="w-4 h-4 text-muted" strokeWidth={1.8} />
            <span className="text-muted text-sm select-none">Search resources, bookings...</span>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-3 ml-auto">
            <NotificationBell />
            <div className="w-px h-6" style={{ backgroundColor: 'var(--border-subtle)' }} />
            <UserDropdown />
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="flex-1 px-6 py-7 max-w-[1400px] w-full mx-auto">
          <Routes>
            <Route
              path=""
              element={
                ['USER', 'ADMIN'].includes(user?.role)
                  ? <Navigate to="/app/dashboard" replace />
                  : user?.role === 'FACILITY_MANAGER'
                    ? <Navigate to="/app/facility" replace />
                    : user?.role === 'TECHNICIAN'
                      ? <Navigate to="/app/technician-dashboard" replace />
                      : <Navigate to="/app/admin-review" replace />
              }
            />

            <Route element={<ProtectedRoute allowedRoles={['USER', 'ADMIN', 'BOOKING_OFFICER', 'FACILITY_MANAGER', 'TECHNICIAN']} />}>
              <Route
                path="dashboard"
                element={
                  user?.role === 'USER'
                    ? <UserOverview />
                    : user?.role === 'ADMIN'
                      ? <AdminOverview />
                      : <DashboardPage onBookResource={(r) => setBookingTarget(r)} />
                }
              />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['FACILITY_MANAGER', 'ADMIN']} />}>
              <Route path="facilities" element={<FacilitiesPage />} />
              <Route path="assets" element={<AssetsPage />} />
            </Route>

            {/* Profile — accessible by all authenticated users */}
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />

            <Route element={<ProtectedRoute allowedRoles={['USER', 'ADMIN']} />}>
              <Route path="my-bookings" element={<MyBookingsPage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['USER', 'TECHNICIAN', 'ADMIN']} />}>
              <Route path="tickets" element={<TicketingPage />} />
              <Route path="technician-dashboard" element={<TechnicianOverview />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="maintenance" element={<MaintenancePage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['FACILITY_MANAGER', 'ADMIN']} />}>
              <Route path="facility" element={<FacilityDashboard />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['BOOKING_OFFICER', 'ADMIN']} />}>
              <Route path="admin-review" element={<AdminBookingReview />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['BOOKING_OFFICER', 'ADMIN']} />}>
              <Route path="bookings" element={<BookingOfficerOverview />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="users" element={<UserManagement />} />
            </Route>
            <Route element={<ProtectedRoute allowedRoles={['USER', 'TECHNICIAN', 'ADMIN', 'BOOKING_OFFICER', 'FACILITY_MANAGER']} />}>
              <Route path="reports" element={<ReportsPage />} />
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
