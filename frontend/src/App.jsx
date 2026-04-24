import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CataloguePage from './pages/CataloguePage';
import TicketingPage from './pages/TicketingPage';
import { useAuthStore } from './store/authStore';
import { NavLink } from 'react-router-dom';

const AppLayout = () => {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3 hidden sm:flex">
                    <span className="text-white font-bold text-xl leading-none">S</span>
                </div>
                <span className="font-bold text-xl text-slate-900 tracking-tight">Smart Campus</span>
                <span className="ml-2 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">Hub</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                 <NavLink 
                    to="/app/catalogue" 
                    className={({ isActive }) => `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${isActive ? 'border-blue-500 text-slate-900' : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'}`}
                 >
                    Catalogue
                 </NavLink>
                 <NavLink 
                    to="/app/tickets" 
                    className={({ isActive }) => `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${isActive ? 'border-blue-500 text-slate-900' : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'}`}
                 >
                    Ticketing
                 </NavLink>
              </div>
            </div>
            <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-slate-500">Role 1: {user?.name} ({user?.role})</span>
                <div className="h-8 w-8 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center font-bold text-slate-400">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Admin'}`} alt="Avatar" className="w-full h-full object-cover" />
                </div>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <Routes>
           <Route path="" element={<CataloguePage />} />
           <Route path="catalogue" element={<CataloguePage />} />
           <Route path="tickets" element={<TicketingPage />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/app/*" element={<AppLayout />} />
    </Routes>
  );
}

export default App;
