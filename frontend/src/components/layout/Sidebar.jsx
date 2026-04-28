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

const NavItem = ({ to, icon: Icon, label, end = false, isCollapsed }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      `group flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer w-full border
      ${isActive
        ? 'bg-accent/10 border-accent/20 text-accent shadow-sm'
        : 'border-transparent text-secondary hover:text-primary hover:bg-raised'
      }`
    }
  >
    {({ isActive }) => (
      <>
        <Icon
          className={`w-[18px] h-[18px] flex-shrink-0 transition-all duration-200 ${
            isActive ? 'text-accent scale-105' : 'text-muted group-hover:text-secondary group-hover:scale-105'
          }`}
          strokeWidth={isActive ? 2 : 1.5}
        />
        {!isCollapsed && <span className="transition-all duration-200 animate-in fade-in duration-300">{label}</span>}
      </>
    )}
  </NavLink>
);

const ROLE_NAV_CONFIG = {
  USER: [
    { to: "/app/user/overview", icon: LayoutDashboard, label: "Overview" },
    { to: "/app/user/bookings", icon: CalendarCheck, label: "Bookings" },
    { to: "/app/user/tickets", icon: Ticket, label: "Tickets" },
  ],
  ADMIN: [
    { to: "/app/admin/overview", icon: LayoutDashboard, label: "Overview" },
    { to: "/app/facility-manager/facilities", icon: Building2, label: "Facilities" },
    { to: "/app/facility-manager/assets", icon: Laptop, label: "Equipments" },
    { to: "/app/booking-officer/review", icon: CalendarCheck, label: "Bookings" },
    { to: "/app/technician/tickets", icon: Ticket, label: "Tickets" },
    { to: "/app/admin/users", icon: Users, label: "Users" },
    { to: "/app/reports", icon: BarChart3, label: "Reports" },
    { to: "/app/admin/maintenance", icon: Wrench, label: "Maintenance" },
  ],
  FACILITY_MANAGER: [
    { to: "/app/facility-manager/overview", icon: LayoutDashboard, label: "Overview" },
    { to: "/app/facility-manager/facilities", icon: Building2, label: "Facilities" },
    { to: "/app/facility-manager/assets", icon: Laptop, label: "Equipments" },
    { to: "/app/reports", icon: BarChart3, label: "Reports" },
  ],
  TECHNICIAN: [
    { to: "/app/technician/overview", icon: LayoutDashboard, label: "Overview" },
    { to: "/app/technician/tickets", icon: Ticket, label: "Tickets" },
    { to: "/app/reports", icon: BarChart3, label: "Reports" },
  ],
  BOOKING_OFFICER: [
    { to: "/app/booking-officer/overview", icon: LayoutDashboard, label: "Overview" },
    { to: "/app/booking-officer/review", icon: CalendarCheck, label: "Bookings" },
    { to: "/app/reports", icon: BarChart3, label: "Reports" },
  ],
};

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const { user } = useAuthStore();
  const { darkMode, toggleDarkMode } = useThemeStore();
  const { setActiveTab } = useTicketUiStore();
  const navigate = useNavigate();
  const role = user?.role;

  const handleHelpClick = () => {
    setActiveTab('report');
    if (role === 'USER') {
      navigate('/app/user/tickets');
    } else {
      navigate('/app/technician/tickets');
    }
  };

  const navLinks = ROLE_NAV_CONFIG[role] || [];

  return (
    <aside
      className={`fixed left-4 top-4 bottom-4 ${isCollapsed ? 'w-20' : 'w-64'} z-40 flex flex-col bg-transparent backdrop-blur-xl border border-subtle rounded-3xl transition-all duration-300 shadow-[4px_4px_24px_rgba(0,0,0,0.04)]`}
    >
      {/* ── Logo & Toggle ── */}
      <div
        className={`flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-between px-5'} h-16 flex-shrink-0 relative`}
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
            <LayoutGrid className="w-4 h-4 text-white" strokeWidth={2} />
          </div>
          {!isCollapsed && (
            <div className="animate-in fade-in duration-300">
              <p className="text-sm font-bold text-primary leading-tight">SmartCampus</p>
              <p className="text-[10px] text-muted font-medium tracking-wide">Hub</p>
            </div>
          )}
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`absolute -right-3 top-6 w-6 h-6 bg-surface border border-subtle rounded-full flex items-center justify-center cursor-pointer shadow-sm text-muted hover:text-primary transition-all duration-300 z-50`}
        >
          <span className="text-[10px] font-bold">{isCollapsed ? '→' : '←'}</span>
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">


        {navLinks.map((link, idx) => (
          <NavItem key={idx} to={link.to} icon={link.icon} label={link.label} isCollapsed={isCollapsed} />
        ))}

        {/* Spacer */}
        <div className="h-px my-3" style={{ backgroundColor: 'var(--border-subtle)' }} />

        {/* Settings */}
        <NavItem to="/app/settings" icon={Settings} label="Settings" isCollapsed={isCollapsed} />
      </nav>

      {/* ── Bottom ── */}
      <div className={`px-3 pb-4 space-y-2 flex-shrink-0 ${isCollapsed ? 'items-center' : ''}`}>

        {/* ── Profile & Notifications strip ── */}
        <div
          className={`flex items-center ${isCollapsed ? 'flex-col gap-2 justify-center px-1' : 'justify-between px-3'} py-2.5 rounded-xl`}
          style={{ borderBottom: '1px solid var(--border-subtle)', marginBottom: '6px', paddingBottom: '10px' }}
        >
          <div className={`${isCollapsed ? 'w-full flex justify-center' : 'flex-1'}`}>
            <UserDropdown direction="up" isCollapsed={isCollapsed} />
          </div>
          <NotificationBell direction="up" />
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleDarkMode}
          className={`flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} w-full py-2.5 rounded-xl text-sm font-medium text-secondary hover:text-primary hover:bg-raised transition-all cursor-pointer border-none bg-transparent`}
        >
          {darkMode
            ? <Sun className="w-[18px] h-[18px] text-amber-400 flex-shrink-0" strokeWidth={1.7} />
            : <Moon className="w-[18px] h-[18px] text-muted flex-shrink-0" strokeWidth={1.7} />
          }
          {!isCollapsed && <span className="animate-in fade-in duration-300">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        {/* Help card */}
        <button 
          onClick={handleHelpClick}
          className={`bg-accent/5 rounded-2xl ${isCollapsed ? 'p-2 justify-center flex' : 'p-3 w-full text-left'} cursor-pointer hover:bg-accent/10 transition-all border border-accent/10 hover:border-accent/20`}
        >
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5'}`}>
            <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
              <Headphones className="w-3.5 h-3.5 text-white animate-pulse" strokeWidth={2} />
            </div>
            {!isCollapsed && (
              <div className="animate-in fade-in duration-300">
                <p className="text-xs font-bold text-primary leading-tight">Need help?</p>
                <p className="text-[10px] text-muted mt-0.5">Contact support</p>
              </div>
            )}
          </div>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
