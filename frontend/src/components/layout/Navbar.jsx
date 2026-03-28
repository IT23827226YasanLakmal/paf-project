import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Layers } from 'lucide-react';

const Navbar = () => {
  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 inset-x-0 z-50 glass-dark h-14"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full text-sm font-medium text-gray-300">
          <Link to="/" className="flex items-center space-x-2 text-white hover:opacity-80 transition-opacity">
            <Layers className="w-5 h-5" />
            <span className="font-semibold tracking-wide">Campus Hub</span>
          </Link>
          
          <div className="hidden md:flex space-x-8">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#integration" className="hover:text-white transition-colors">Integration</a>
            <a href="#security" className="hover:text-white transition-colors">Security</a>
          </div>

          <div className="flex items-center space-x-5">
            <Link to="/app" className="text-white hover:text-gray-300 transition-colors">Sign In</Link>
            <Link to="/app" className="bg-white text-black px-4 py-1.5 rounded-full hover:scale-105 active:scale-95 transition-transform duration-200">
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
