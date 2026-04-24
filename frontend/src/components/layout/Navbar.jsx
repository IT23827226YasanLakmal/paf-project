import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Layers } from 'lucide-react';
import { supabase } from "../../supabaseClient";
import NotificationBell from "../NotificationBell";

const Navbar = () => {

  const [user, setUser] = useState(null);

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

  //  Logout function
  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("token");
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 inset-x-0 z-50 glass-dark h-14"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full text-sm font-medium text-gray-300">

          {/* LEFT LOGO */}
          <Link to="/" className="flex items-center space-x-2 text-white hover:opacity-80 transition-opacity">
            <Layers className="w-5 h-5" />
            <span className="font-semibold tracking-wide">Campus Hub</span>
          </Link>
          
          {/* CENTER LINKS */}
          <div className="hidden md:flex space-x-8">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#integration" className="hover:text-white transition-colors">Integration</a>
            <a href="#security" className="hover:text-white transition-colors">Security</a>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center space-x-5">

            {/* Show only if logged in */}
            {user && <NotificationBell />}

            {!user ? (
              <>
                <Link to="/login" className="text-white hover:text-gray-300 transition-colors">
                  Sign In
                </Link>

                <Link to="/signup" className="bg-white text-black px-4 py-1.5 rounded-full hover:scale-105 active:scale-95 transition-transform duration-200">
                  Get Started
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-3">

                {/*  Avatar */}
                <img
                  src={
                    user.user_metadata?.avatar_url ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`
                  }
                  alt="avatar"
                  className="w-8 h-8 rounded-full border border-white/20"
                />

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="bg-white/10 border border-white/20 px-3 py-1 rounded-lg hover:bg-red-500 hover:border-red-500 transition"
                >
                  Logout
                </button>

              </div>
            )}

          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;