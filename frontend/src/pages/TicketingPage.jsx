import React, { useEffect } from 'react';
import TicketBoard from '../components/ticketing/TicketBoard';
import IncidentReportForm from '../components/ticketing/IncidentReportForm';
import { Wrench, PlusCircle, LayoutDashboard } from 'lucide-react';

import { useAuthStore } from '../store/authStore';
import { useTicketUiStore } from '../store/ticketUiStore';

const TicketingPage = () => {
  const { user } = useAuthStore();
  const { activeTab, setActiveTab } = useTicketUiStore();
  const isTechnician = user?.role === 'TECHNICIAN';
  const isTechOrAdmin = ['TECHNICIAN', 'ADMIN'].includes(user?.role);

  useEffect(() => {
    if (isTechnician && activeTab === 'report') {
      setActiveTab('board');
    }
  }, [isTechnician, activeTab, setActiveTab]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-primary tracking-tight flex items-center gap-2">
            <Wrench className="w-8 h-8 text-accent" />
            {isTechOrAdmin ? "Maintenance & Ticketing" : "My Support Tickets"}
          </h1>
          <p className="text-secondary mt-2 flex items-center gap-1">
            {isTechOrAdmin 
              ? "Manage incident reports, assign technicians, and track resolution." 
              : "Track your reported issues or submit a new incident."}
          </p>
        </div>

        <div className="flex bg-muted-fill p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('board')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'board' 
                ? 'bg-surface text-accent shadow-sm' 
                : 'text-secondary hover:text-primary'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            {isTechOrAdmin ? "Ticket Board" : "My Tickets"}
          </button>
          {!isTechnician && (
            <button
              onClick={() => setActiveTab('report')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'report' 
                  ? 'bg-surface text-accent shadow-sm' 
                  : 'text-secondary hover:text-primary'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              Report Issue
            </button>
          )}
        </div>
      </div>

      <div className="mt-4">
        {activeTab === 'board' ? <TicketBoard /> : <IncidentReportForm onReportComplete={() => setActiveTab('board')} />}
      </div>
    </div>
  );
};

export default TicketingPage;
