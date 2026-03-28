import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-black pt-16 pb-8 text-sm text-gray-500">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center space-x-2">
          <span className="text-white font-semibold">Campus Hub</span>
          <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
        </div>
        <div className="flex space-x-8">
          <Link to="/" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link to="/" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link to="/app" className="hover:text-white transition-colors">Go to App</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
