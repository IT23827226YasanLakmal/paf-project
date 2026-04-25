import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import {
  User, LogOut, ChevronDown,
} from 'lucide-react';
import { supabase } from '../../supabaseClient';

const UserDropdown = ({ direction = 'down' }) => {
  // Main dropdown state
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    setOpen(false);
    await supabase.auth.signOut();
    logout();
    navigate('/login');
  };

  const isUp = direction === 'up';

  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 cursor-pointer group p-1 pr-2 rounded-full transition-all duration-200 hover:bg-white/10 active:scale-95"
      >
        <div className="w-7 h-7 rounded-full overflow-hidden border border-white/20 shadow-sm group-hover:border-blue-500/50">
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'Guest'}`}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-[11px] font-bold text-gray-300 group-hover:text-white transition-colors uppercase tracking-tight">
            {user?.name?.split(' ')[0] || 'User'}
          </p>
        </div>
        <ChevronDown
          className={`w-3 h-3 text-gray-500 transition-transform duration-300 ${open ? 'rotate-180 text-blue-500' : 'group-hover:text-white'}`}
        />
      </button>

      {/* Dropdown Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: isUp ? -8 : 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: isUp ? -8 : 8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{ originX: isUp ? 0 : 1, originY: isUp ? 1 : 0 }}
            className={`absolute ${isUp ? 'inset-x-0 bottom-full mb-3 w-48' : 'right-0 top-full mt-2 w-48'} bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-[999] overflow-hidden p-1`}
          >
            <button
              onClick={() => { setOpen(false); navigate('/app/profile'); }}
              className="flex items-center gap-2.5 w-full p-2 rounded-xl transition-all hover:bg-white/5 text-left group/item"
            >
              <User className="w-3.5 h-3.5 text-gray-400 group-hover/item:text-blue-400" />
              <span className="text-xs font-bold text-gray-300 group-hover/item:text-white">My Profile</span>
            </button>

            <div className="h-px bg-white/5 my-1" />

            <button
              onClick={handleLogout}
              className="flex items-center gap-2.5 w-full p-2 rounded-xl transition-all hover:bg-red-500/10 text-left group/logout"
            >
              <LogOut className="w-3.5 h-3.5 text-red-900/60 group-hover/logout:text-red-500" />
              <span className="text-xs font-bold text-red-900/60 group-hover/logout:text-red-500">Sign Out</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserDropdown;
