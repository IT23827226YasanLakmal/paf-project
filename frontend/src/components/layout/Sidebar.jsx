import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { useTicketUiStore } from '../../store/ticketUiStore';
import NotificationBell from '../NotificationBell';
import UserDropdown from './UserDropdown';
import {
  LayoutGrid, LayoutDashboard, BookOpen, CalendarCheck,
  Ticket, Users, Settings, Sun, Moon, Headphones, Bell, BarChart3,
  Building2, Laptop, Wrench
} from 'lucide-react';

const NavItem = ({ to, icon: Icon, label, end = false }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer w-full
      ${isActive
        ? 'bg-accent-subtle text-accent font-semibold'
        : 'text-secondary hover:text-primary hover:bg-raised'
      }`
    }
  >
    {({ isActive }) => (
      <>
        <Icon
          className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${
            isActive ? 'text-accent' : 'text-muted group-hover:text-secondary'
          }`}
          strokeWidth={isActive ? 2 : 1.7}
        />
        <span className={isActive ? 'text-accent' : ''}>{label}</span>
      </>
    )}
  </NavLink>
);

const ROLE_NAV_CONFIG = {
  USER: [
    { to: "/app/user/overview", icon: LayoutDashboard, label: "Overview" },
    { to: "/app/user/bookings", icon: CalendarCheck, label: "Bookings" },
    { to: "/app/tickets", icon: Ticket, label: "Tickets" },
  ],
  ADMIN: [
    { to: "/app/admin/overview", icon: LayoutDashboard, label: "Overview" },
    { to: "/app/facility-manager/facilities", icon: Building2, label: "Facilities" },
    { to: "/app/facility-manager/assets", icon: Laptop, label: "Equipments" },
    { to: "/app/user/bookings", icon: CalendarCheck, label: "Bookings" },
    { to: "/app/tickets", icon: Ticket, label: "Tickets" },
    { to: "/app/booking-officer/review", icon: CalendarCheck, label: "Bookings" },
    { to: "/app/facility-manager/overview", icon: LayoutDashboard, label: "Facility Admin" },
    { to: "/app/admin/users", icon: Users, label: "Users" },
    { to: "/app/reports", icon: BarChart3, label: "Reports" },
    { to: "/app/admin/maintenance", icon: Wrench, label: "Maintenance" },
  ],
  FACILITY_MANAGER: [
    { to: "/app/facility-manager/overview", icon: LayoutDashboard, label: "Overview" },
    { to: "/app/facility-manager/facilities", icon: Building2, label: "Facilities" },
    { to: "/app/facility-manager/assets", icon: Laptop, label: "Equipments" },
  ],
  TECHNICIAN: [
    { to: "/app/technician/overview", icon: LayoutDashboard, label: "Overview" },
    { to: "/app/tickets", icon: Ticket, label: "Tickets" },
    { to: "/app/reports", icon: BarChart3, label: "Reports" },
  ],
  BOOKING_OFFICER: [
    { to: "/app/booking-officer/overview", icon: LayoutDashboard, label: "Overview" },
    { to: "/app/booking-officer/review", icon: CalendarCheck, label: "Bookings" },
    { to: "/app/reports", icon: BarChart3, label: "Reports" },
  ],
};

const Sidebar = () => {
  const { user } = useAuthStore();
  const { darkMode, toggleDarkMode } = useThemeStore();
  const { setActiveTab } = useTicketUiStore();
  const navigate = useNavigate();
  const role = user?.role;

  const handleHelpClick = () => {
    setActiveTab('report');
    navigate('/app/tickets');
  };

  const navLinks = ROLE_NAV_CONFIG[role] || [];

  return (
    <aside
      className="fixed left-0 top-0 h-full w-56 z-40 flex flex-col glass-card border-r border-sidebar transition-colors duration-200"
      style={{ boxShadow: '1px 0 0 0 var(--sidebar-border)' }}
    >
      {/* ── Logo ── */}
      <div
        className="flex items-center gap-3 px-5 h-16 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
          <LayoutGrid className="w-4 h-4 text-white" strokeWidth={2} />
        </div>
        <div>
          <p className="text-sm font-bold text-primary leading-tight">SmartCampus</p>
          <p className="text-[10px] text-muted font-medium tracking-wide">Hub</p>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">


        {navLinks.map((link, idx) => (
          <NavItem key={idx} to={link.to} icon={link.icon} label={link.label} />
        ))}

        {/* Spacer */}
        <div className="h-px my-3" style={{ backgroundColor: 'var(--border-subtle)' }} />

        {/* Settings */}
        <NavItem to="/app/settings" icon={Settings} label="Settings" />
      </nav>

      {/* ── Bottom ── */}
      <div className="px-3 pb-4 space-y-2 flex-shrink-0">

        {/* ── Profile & Notifications strip ── */}
        <div
          className="flex items-center justify-between px-3 py-2.5 rounded-xl"
          style={{ borderBottom: '1px solid var(--border-subtle)', marginBottom: '6px', paddingBottom: '10px' }}
        >
          <div className="flex-1">
            <UserDropdown direction="up" />
          </div>
          <NotificationBell direction="up" />
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleDarkMode}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-secondary hover:text-primary hover:bg-raised transition-all cursor-pointer border-none bg-transparent"
        >
          {darkMode
            ? <Sun className="w-[18px] h-[18px] text-amber-400 flex-shrink-0" strokeWidth={1.7} />
            : <Moon className="w-[18px] h-[18px] text-muted flex-shrink-0" strokeWidth={1.7} />
          }
          <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        {/* Help card */}
        <button 
          onClick={handleHelpClick}
          className="bg-accent-subtle rounded-2xl p-3 w-full text-left cursor-pointer hover:bg-accent/10 transition-all border-none"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
              <Headphones className="w-3.5 h-3.5 text-white" strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs font-bold text-primary leading-tight">Need help?</p>
              <p className="text-[10px] text-muted mt-0.5">Contact support</p>
            </div>
          </div>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
