import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import NotificationBell from "../NotificationBell";

const RoleNav = () => {
    const { user } = useAuthStore();
    const role = user?.role;

    const baseClass = "relative px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center justify-center cursor-pointer";
    const activeClass = "text-slate-900 font-semibold";
    const inactiveClass = "text-slate-500 hover:text-slate-800";

    const renderNavLink = (to, label) => (
        <NavLink
            to={to}
            className={({ isActive }) => `${baseClass} ${isActive ? activeClass : inactiveClass}`}
        >
            {({ isActive }) => (
                <>
                    {isActive && (
                        <motion.div
                            layoutId="activeNavBackground"
                            className="absolute inset-0 bg-slate-100 rounded-full -z-10 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                    )}
                    <span className="relative z-10">{label}</span>
                </>
            )}
        </NavLink>
    );

    return (
    <div className="w-full flex items-center justify-between sm:ml-6">

        {/* LEFT SIDE NAV LINKS */}
        <div className="flex items-center space-x-1 bg-slate-50/80 p-1 rounded-full border border-slate-200/30">
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

        {/* RIGHT SIDE (NOTIFICATION) */}
        <div className="flex items-center space-x-4 ml-auto mr-4">
            <div className="relative group">
                <NotificationBell />
            </div>
        </div>

    </div>
);
};

export default RoleNav;
