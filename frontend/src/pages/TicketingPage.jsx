import React, { useEffect } from 'react';
import TicketBoard from '../components/ticketing/TicketBoard';
import IncidentReportForm from '../components/ticketing/IncidentReportForm';
import { Ticket, PlusCircle, Download, ShieldCheck } from 'lucide-react';

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

      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary flex items-center gap-2.5">
            <Ticket className="w-8 h-8 text-accent animate-pulse" />
            Tickets & Incidents
          </h1>
          <p className="text-sm text-muted mt-1 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-accent" /> Role perspective: <span className="font-bold text-accent uppercase">{user?.role}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Tab toggle */}
          <div className="flex bg-raised border border-subtle p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('board')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border-none ${
                activeTab === 'board'
                  ? 'bg-surface text-accent shadow-sm'
                  : 'text-muted hover:text-primary bg-transparent'
              }`}
            >
              All Tickets
            </button>
            {!isTechnician && (
              <button
                onClick={() => setActiveTab('report')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border-none ${
                  activeTab === 'report'
                    ? 'bg-surface text-accent shadow-sm'
                    : 'text-muted hover:text-primary bg-transparent'
                }`}
              >
                Report Issue
              </button>
            )}
          </div>

          {/* New Ticket CTA */}
          {!isTechnician && (
            <button
              onClick={() => setActiveTab('report')}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white font-black text-xs rounded-xl transition-all shadow-sm border-none cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              New Ticket
            </button>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div>
        {activeTab === 'board'
          ? <TicketBoard />
          : <IncidentReportForm onReportComplete={() => setActiveTab('board')} />
        }
      </div>
    </div>
  );
};

export default TicketingPage;
