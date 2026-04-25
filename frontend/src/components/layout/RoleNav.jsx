import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import NotificationBell from "../NotificationBell";

const RoleNav = () => {
    const { user } = useAuthStore();
    const role = user?.role;

    const baseClass = "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors";
    const activeClass = "border-blue-500 text-slate-900";
    const inactiveClass = "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700";

    const renderNavLink = (to, label) => (
        <NavLink
            to={to}
            className={({ isActive }) => `${baseClass} ${isActive ? activeClass : inactiveClass}`}
        >
            {label}
        </NavLink>
    );

    return (
    <div className="w-full flex items-center justify-between sm:ml-6">

        {/* LEFT SIDE NAV LINKS */}
        <div className="flex space-x-8">
            {(role === 'USER') && (
                <>
                    {renderNavLink("/app/catalogue", "Catalogue")}
                    {renderNavLink("/app/my-bookings", "My Bookings")}
                    {renderNavLink("/app/tickets", "My Tickets")}
                </>
            )}

            {(role === 'FACILITY_MANAGER') && (
                <>
                    {renderNavLink("/app/facility", "Facility Overview")}
                    {renderNavLink("/app/catalogue", "Manage Resources")}
                </>
            )}

            {(role === 'BOOKING_OFFICER') && (
                <>
                    {renderNavLink("/app/admin-review", "Booking Requests")}
                </>
            )}

            {(role === 'TECHNICIAN') && (
                <>
                    {renderNavLink("/app/tickets", "Support Tickets")}
                </>
            )}

            {role === 'ADMIN' && (
                <>
                    {renderNavLink("/app/catalogue", "Catalogue")}
                    {renderNavLink("/app/facility", "Facility Overview")}
                    {renderNavLink("/app/admin-review", "Booking Requests")}
                    {renderNavLink("/app/tickets", "Support Tickets")}
                    {renderNavLink("/app/users", "Users")}
                </>
            )}
        </div>

        {/* RIGHT SIDE ICONS (NOTIFICATION + DP) */}
        <div className="flex items-center space-x-4">
            <NotificationBell />
        </div>

    </div>
);
};

export default RoleNav;
