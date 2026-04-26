import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Layers, Menu, Sun, Moon } from 'lucide-react';
import { supabase } from "../../supabaseClient";
import NotificationBell from "../NotificationBell";
import UserDropdown from "./UserDropdown";
import { useThemeStore } from "../../store/themeStore";

const Navbar = () => {

  const [user, setUser] = useState(null);
  const { darkMode, toggleDarkMode } = useThemeStore();

  //  Get user session
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    getUser();

    //  Listen for login/logout changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 inset-x-0 z-50 bg-surface/30 backdrop-blur-xl border-b border-subtle h-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full text-sm font-medium text-muted">

          {/* LEFT LOGO */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center space-x-3 text-primary hover:opacity-80 transition-all group">
              <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20 group-hover:rotate-12 transition-transform duration-300">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <span className="font-black text-lg tracking-tighter uppercase">Campus Hub</span>
            </Link>

            {/* CENTER LINKS (Hidden on small) */}
            <div className="hidden lg:flex items-center space-x-6">
              {['Platform', 'Solutions', 'Security', 'Pricing'].map((item) => (
                <a 
                  key={item}
                  href={`#${item.toLowerCase()}`} 
                  className="text-[11px] font-black uppercase tracking-[0.2em] text-muted hover:text-primary transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-muted hover:text-primary hover:bg-surface/30 transition-all cursor-pointer border-none bg-transparent"
              aria-label="Toggle Theme"
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-amber-400" strokeWidth={2} />
              ) : (
                <Moon className="w-4 h-4 text-accent" strokeWidth={2} />
              )}
            </button>

            {!user ? (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-muted hover:text-primary transition-colors font-bold text-xs uppercase tracking-widest">
                  Sign In
                </Link>

                <Link to="/signup" className="bg-accent text-white px-5 py-2 rounded-xl font-black text-[11px] uppercase tracking-wider hover:opacity-90 hover:scale-105 active:scale-95 transition-all">
                  Get Started
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-6">
                
                {/* Search Trigger (Icon only) */}
                <button className="hidden sm:flex p-2 text-gray-500 hover:text-white transition-colors">
                   <div className="w-px h-6 bg-white/10 mr-4"></div>
                </button>

                {/* Notifications */}
                <NotificationBell />

                {/* Vertical Divider */}
                <div className="w-px h-6 bg-white/10 hidden sm:block"></div>

                {/* Profile Dropdown */}
                <UserDropdown />
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors">
              <Menu className="w-6 h-6" />
            </button>

          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;