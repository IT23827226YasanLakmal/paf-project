import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTickets, updateTicketStatus } from '../../services/ticketApi';
import { Clock, Hammer, CheckCircle, Package, MoreVertical, Search, Image as ImageIcon } from 'lucide-react';
import TicketDetailsModal from './TicketDetailsModal';
import { useAuthStore } from '../../store/authStore';
import { useTicketUiStore } from '../../store/ticketUiStore';
const COLUMNS = [
  { id: 'OPEN', label: 'Open Issues', icon: <Package className="w-5 h-5 text-amber-500" />, bgColor: 'bg-amber-50', borderColor: 'border-amber-200' },
  { id: 'IN_PROGRESS', label: 'In Progress', icon: <Hammer className="w-5 h-5 text-blue-500" />, bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
  { id: 'RESOLVED', label: 'Resolved', icon: <CheckCircle className="w-5 h-5 text-emerald-500" />, bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' }
];

const TicketBoard = () => {
  const { user } = useAuthStore();
  const canManageTickets = ['TECHNICIAN', 'ADMIN'].includes(user?.role);
  const queryClient = useQueryClient();
  const { selectedTicket, setSelectedTicket, clearSelectedTicket } = useTicketUiStore();
  const [draggedTicket, setDraggedTicket] = useState(null);

  const { data: tickets = [], isLoading, isError } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => getTickets()
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => updateTicketStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    }
  });

  const onDragStart = (ticket) => setDraggedTicket(ticket);

  const onDragOver = (e) => e.preventDefault();

  const onDrop = (status, e) => {
    e.preventDefault();
    if (draggedTicket && draggedTicket.status !== status) {
      updateStatusMutation.mutate({ id: draggedTicket.id, status });
    }
    setDraggedTicket(null);
  };

  if (isLoading) return <div className="flex justify-center p-12"><div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div></div>;
  if (isError) return <div className="p-8 text-center text-red-500 font-medium bg-red-50 rounded-xl">Error loading tickets. Make sure backend is running.</div>;

  return (
    <>
      <div className="flex gap-6 overflow-x-auto pb-8 min-h-[60vh]">
        {COLUMNS.map(column => {
          const columnTickets = tickets.filter(t => t.status === column.id);

          return (
            <div 
              key={column.id} 
              className={`flex-1 min-w-[320px] rounded-2xl border bg-slate-50 flex flex-col ${column.borderColor}`}
              onDragOver={canManageTickets ? onDragOver : undefined}
              onDrop={(e) => canManageTickets && onDrop(column.id, e)}
            >
              <div className={`p-4 border-b ${column.borderColor} flex items-center justify-between ${column.bgColor} rounded-t-2xl`}>
                <div className="flex items-center gap-2">
                  {column.icon}
                  <h3 className="font-semibold text-slate-800">{column.label}</h3>
                </div>
                <span className="bg-white rounded-full px-2.5 py-0.5 text-xs font-bold text-slate-600 shadow-sm border border-slate-100">
                  {columnTickets.length}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col gap-3 overflow-y-auto">
                {columnTickets.map(ticket => (
                  <div
                    key={ticket.id}
                    draggable={canManageTickets}
                    onDragStart={() => canManageTickets && onDragStart(ticket)}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`bg-white p-4 rounded-xl shadow-sm border border-slate-200 transition-all group relative ${canManageTickets ? 'cursor-grab active:cursor-grabbing hover:-translate-y-1 hover:shadow-md' : 'cursor-pointer hover:shadow-md'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold px-2 py-1 rounded bg-slate-100 text-slate-600">
                        #{ticket.id}
                      </span>
                      <div className="flex gap-2">
                        {ticket.priority === 'URGENT' && <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 animate-pulse"></span>}
                        {ticket.imageUrl && <ImageIcon className="w-4 h-4 text-slate-400" />}
                      </div>
                    </div>

                    <p className="font-medium text-slate-800 text-sm mb-3 line-clamp-2 leading-relaxed">
                      {ticket.description}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                      <div className="flex items-center bg-slate-50 px-2 py-1 rounded border border-slate-100">
                         {ticket.category}
                      </div>
                      <span className="flex items-center gap-1.5 ml-auto">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <button className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {columnTickets.length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl p-6 bg-slate-50/50">
                    <Package className="w-8 h-8 mb-2 opacity-50 text-slate-300" />
                    <p className="text-sm font-medium">No tickets here</p>
                    {canManageTickets && <p className="text-xs mt-1">Drag tickets to change status</p>}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedTicket && (
        <TicketDetailsModal 
          ticket={selectedTicket} 
          onClose={clearSelectedTicket} 
        />
      )}
    </>
  );
};

export default TicketBoard;
