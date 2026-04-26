import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t border-subtle bg-canvas pt-16 pb-8 text-sm text-muted">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center space-x-2">
          <span className="text-primary font-bold">Campus Hub</span>
          <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
        </div>
        <div className="flex space-x-8 font-medium">
          <Link to="/" className="hover:text-primary transition-colors">Privacy Policy</Link>
          <Link to="/" className="hover:text-primary transition-colors">Terms of Service</Link>
          <Link to="/app" className="hover:text-accent transition-colors">Go to App</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
