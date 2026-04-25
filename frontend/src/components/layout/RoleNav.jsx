import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import NotificationBell from '../NotificationBell';
import { Search } from 'lucide-react';

const RoleNav = () => {
  const { user } = useAuthStore();
  const role = user?.role;

  const baseClass =
    'relative px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center justify-center cursor-pointer whitespace-nowrap';
  const activeClass = 'text-slate-900 font-semibold';
  const inactiveClass = 'text-slate-500 hover:text-slate-800';

  const renderNavLink = (to, label) => (
    <NavLink
      key={to}
      to={to}
      className={({ isActive }) =>
        `${baseClass} ${isActive ? activeClass : inactiveClass}`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.div
              layoutId="activeNavBackground"
              className="absolute inset-0 bg-white rounded-full -z-10 shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
          <span className="relative z-10">{label}</span>
        </>
      )}
    </NavLink>
  );

  return (
    <div className="w-full flex items-center justify-between sm:ml-4">
      {/* Centered pill tabs */}
      <div className="flex items-center gap-0.5 bg-slate-100/80 p-1 rounded-full border border-slate-200/60">
        {role === 'USER' && (
          <>
            {renderNavLink('/app/dashboard', 'Dashboard')}
            {renderNavLink('/app/catalogue', 'Catalogue')}
            {renderNavLink('/app/my-bookings', 'My Bookings')}
            {renderNavLink('/app/user/tickets', 'My Tickets')}
          </>
        )}
        {role === 'FACILITY_MANAGER' && (
          <>
            {renderNavLink('/app/facility', 'Facility Overview')}
            {renderNavLink('/app/catalogue', 'Manage Resources')}
          </>
        )}
        {role === 'BOOKING_OFFICER' && (
          <>{renderNavLink('/app/admin-review', 'Booking Requests')}</>
        )}
        {role === 'TECHNICIAN' && (
          <>{renderNavLink('/app/technician/tickets', 'Support Tickets')}</>
        )}
        {role === 'ADMIN' && (
          <>
            {renderNavLink('/app/dashboard', 'Dashboard')}
            {renderNavLink('/app/catalogue', 'Catalogue')}
            {renderNavLink('/app/facility', 'Facility')}
            {renderNavLink('/app/admin-review', 'Requests')}
            {renderNavLink('/app/technician/tickets', 'Tickets')}
            {renderNavLink('/app/users', 'Users')}
          </>
        )}
      </div>

      {/* Right side: search + notification */}
      <div className="flex items-center gap-3 ml-auto mr-2">
        <button className="p-2 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all duration-200 cursor-pointer">
          <Search className="w-4 h-4" />
        </button>
        <NotificationBell />
      </div>
    </div>
  );
};

export default RoleNav;
