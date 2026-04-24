import React, { useState } from 'react';
import TicketBoard from '../components/ticketing/TicketBoard';
import IncidentReportForm from '../components/ticketing/IncidentReportForm';
import { Wrench, PlusCircle, LayoutDashboard } from 'lucide-react';

import { useAuthStore } from '../store/authStore';

const TicketingPage = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('board'); // 'board' or 'report'
  const isTechOrAdmin = ['TECHNICIAN', 'ADMIN'].includes(user?.role);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Wrench className="w-8 h-8 text-blue-600" />
            {isTechOrAdmin ? "Maintenance & Ticketing" : "My Support Tickets"}
          </h1>
          <p className="text-slate-500 mt-1 flex items-center gap-1">
            {isTechOrAdmin 
              ? "Manage incident reports, assign technicians, and track resolution." 
              : "Track your reported issues or submit a new incident."}
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('board')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${
              activeTab === 'board' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            {isTechOrAdmin ? "Ticket Board" : "My Tickets"}
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${
              activeTab === 'report' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            Report Issue
          </button>
        </div>
      </div>

      <div className="mt-4">
        {activeTab === 'board' ? <TicketBoard /> : <IncidentReportForm onReportComplete={() => setActiveTab('board')} />}
      </div>
    </div>
  );
};

export default TicketingPage;
