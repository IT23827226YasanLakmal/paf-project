import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import {
  User, Settings, LogOut, Sun, Moon, ChevronDown, Shield,
} from 'lucide-react';

const UserDropdown = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { darkMode, toggleDarkMode } = useThemeStore();

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate('/login');
  };

  const go = (path) => { setOpen(false); navigate(path); };

  const menuItems = [
    {
      group: 'account',
      items: [
        { icon: User,     label: 'My Profile', action: () => go('/app/profile') },
        { icon: Settings, label: 'Settings',   action: () => go('/app/settings') },
        { icon: Shield,   label: 'Privacy',    action: () => go('/app/settings') },
      ],
    },
    {
      group: 'preferences',
      items: [
        {
          icon: darkMode ? Sun : Moon,
          label: darkMode ? 'Light Mode' : 'Dark Mode',
          action: toggleDarkMode,
          isToggle: true,
        },
      ],
    },
  ];

  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 cursor-pointer group px-2 py-1 rounded-xl transition-colors"
        style={{ ':hover': { backgroundColor: 'var(--bg-raised)' } }}
      >
        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-accent/20 shadow-sm flex-shrink-0">
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Guest'}`}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="hidden md:block leading-tight text-left">
          <p className="text-sm font-semibold text-primary">{user?.name}</p>
          <p className="text-[10px] text-muted">{user?.role}</p>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-muted hidden md:block transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          strokeWidth={2}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 mt-2.5 w-56 bg-overlay rounded-2xl shadow-2xl z-50 overflow-hidden"
            style={{ border: '1px solid var(--border-subtle)' }}
          >
            {/* User info header */}
            <div
              className="flex items-center gap-3 px-4 py-3.5 bg-raised"
              style={{ borderBottom: '1px solid var(--border-subtle)' }}
            >
              <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-accent/20 shadow-sm flex-shrink-0">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Guest'}`}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-primary truncate">{user?.name}</p>
                <p className="text-xs text-muted truncate">{user?.email || user?.role}</p>
              </div>
            </div>

            {/* Menu groups */}
            <div className="p-1.5 space-y-0.5">
              {menuItems.map((group) => (
                <div key={group.group}>
                  {group.items.map(({ icon: Icon, label, action, isToggle }) => (
                    <button
                      key={label}
                      onClick={action}
                      className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer text-left text-secondary hover:text-primary hover:bg-raised"
                    >
                      <Icon className="w-4 h-4 flex-shrink-0 text-muted" strokeWidth={1.8} />
                      {label}
                    </button>
                  ))}
                  <div className="h-px my-1" style={{ backgroundColor: 'var(--border-subtle)' }} />
                </div>
              ))}
            </div>

            {/* Logout */}
            <div className="p-1.5 pt-0">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 flex-shrink-0" strokeWidth={1.8} />
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserDropdown;
