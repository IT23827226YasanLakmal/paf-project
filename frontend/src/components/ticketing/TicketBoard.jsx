import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTickets, updateTicketStatus, deleteTicket } from '../../services/ticketApi';
import { 
  Search, SlidersHorizontal, ArrowUpDown, Download, Plus,
  MoreHorizontal, Clock, AlertCircle, CheckCircle2, Wrench,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from 'lucide-react';
import TicketDetailsModal from './TicketDetailsModal';
import { useAuthStore } from '../../store/authStore';
import { useTicketUiStore } from '../../store/ticketUiStore';
import toast from 'react-hot-toast';

const shortenId = id => (id && String(id).length > 8) ? `${String(id).slice(0, 4)}...${String(id).slice(-4)}` : id;

/* ── Priority Config ── */
const PRIORITY_CONFIG = {
  URGENT: { label: 'High',   dot: 'bg-red-500',    badge: 'bg-red-500/10 text-red-500 border-red-500/20' },
  HIGH:   { label: 'High',   dot: 'bg-red-500',    badge: 'bg-red-500/10 text-red-500 border-red-500/20' },
  MEDIUM: { label: 'Medium', dot: 'bg-amber-500',  badge: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  LOW:    { label: 'Low',    dot: 'bg-green-500',  badge: 'bg-green-500/10 text-green-500 border-green-500/20' },
};

/* ── Status Config ── */
const STATUS_CONFIG = {
  OPEN:        { label: 'Open',        badge: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: Clock },
  IN_PROGRESS: { label: 'In Progress', badge: 'bg-blue-500/10 text-blue-500 border-blue-500/20',   icon: Wrench },
  RESOLVED:    { label: 'Resolved',    badge: 'bg-green-500/10 text-green-500 border-green-500/20', icon: CheckCircle2 },
};

const ITEMS_PER_PAGE_OPTIONS = [10, 15, 20, 30];

const TicketBoard = () => {
  const { user } = useAuthStore();
  const canManage = ['TECHNICIAN', 'ADMIN'].includes(user?.role);
  const queryClient = useQueryClient();
  const { selectedTicket, setSelectedTicket, clearSelectedTicket } = useTicketUiStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [actionMenuId, setActionMenuId] = useState(null);
  const [ticketToDelete, setTicketToDelete] = useState(null);

  const { data: tickets = [], isLoading, isError } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => getTickets()
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => updateTicketStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Status updated');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteTicket(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Ticket deleted');
      setActionMenuId(null);
      setTicketToDelete(null);
    }
  });

  /* ── Filter + Sort ── */
  const filtered = useMemo(() => {
    let result = tickets.filter(t => {
      const matchSearch = search === '' ||
        t.description?.toLowerCase().includes(search.toLowerCase()) ||
        String(t.id).includes(search) ||
        t.category?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === '' || t.status === statusFilter;
      const matchPriority = priorityFilter === '' || t.priority === priorityFilter;
      return matchSearch && matchStatus && matchPriority;
    });

    result = [...result].sort((a, b) => {
      let aVal = a[sortField] ?? '';
      let bVal = b[sortField] ?? '';
      if (sortField === 'createdAt') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [tickets, search, statusFilter, priorityFilter, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  /* ── Sort toggle ── */
  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
    setCurrentPage(1);
  };


  /* ── Page reset on filter ── */
  const handleSearch = (v) => { setSearch(v); setCurrentPage(1); };
  const handleStatus = (v) => { setStatusFilter(v); setCurrentPage(1); };
  const handlePriority = (v) => { setPriorityFilter(v); setCurrentPage(1); };

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-8 h-8 rounded-full border-4 border-accent border-t-transparent animate-spin" />
    </div>
  );

  if (isError) return (
    <div className="p-8 text-center text-red-500 font-medium bg-red-500/10 rounded-2xl border border-red-500/20">
      <AlertCircle className="w-8 h-8 mx-auto mb-2" />
      Error loading tickets. Please check backend connection.
    </div>
  );

  return (
    <>
      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5 items-start sm:items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={search}
            onChange={e => handleSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-surface border border-subtle rounded-xl text-sm text-primary placeholder:text-muted font-medium focus:outline-none focus:ring-2 focus:ring-accent shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={e => handleStatus(e.target.value)}
            className="px-3 py-2.5 bg-surface border border-subtle text-primary text-sm font-bold rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent shadow-sm"
          >
            <option value="" className="bg-surface">All Statuses</option>
            <option value="OPEN" className="bg-surface">Open</option>
            <option value="IN_PROGRESS" className="bg-surface">In Progress</option>
            <option value="RESOLVED" className="bg-surface">Resolved</option>
          </select>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={e => handlePriority(e.target.value)}
            className="px-3 py-2.5 bg-surface border border-subtle text-primary text-sm font-bold rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent shadow-sm"
          >
            <option value="" className="bg-surface">All Priorities</option>
            <option value="URGENT" className="bg-surface">High / Urgent</option>
            <option value="MEDIUM" className="bg-surface">Medium</option>
            <option value="LOW" className="bg-surface">Low</option>
          </select>

          {/* Sort btn */}
          <button
            onClick={() => toggleSort('createdAt')}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-surface border border-subtle text-secondary text-xs font-bold rounded-xl hover:text-primary hover:border-accent/40 transition-all cursor-pointer shadow-sm"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            Sort
          </button>

          {/* Export */}
          <button className="flex items-center gap-1.5 px-3 py-2.5 bg-surface border border-subtle text-secondary text-xs font-bold rounded-xl hover:text-primary hover:border-accent/40 transition-all cursor-pointer shadow-sm">
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-surface rounded-3xl border border-subtle shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-raised text-[10px] font-black text-muted uppercase tracking-widest border-b border-subtle">
                <th className="px-6 py-4 cursor-pointer hover:text-primary transition-colors whitespace-nowrap" onClick={() => toggleSort('id')}>
                  <span className="flex items-center gap-1">Ticket ID <ArrowUpDown className="w-3 h-3" /></span>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-primary transition-colors" onClick={() => toggleSort('description')}>
                  <span className="flex items-center gap-1">Subject <ArrowUpDown className="w-3 h-3" /></span>
                </th>
                <th className="px-6 py-4 whitespace-nowrap">Reported By</th>
                <th className="px-6 py-4 cursor-pointer hover:text-primary transition-colors" onClick={() => toggleSort('category')}>
                  <span className="flex items-center gap-1">Category <ArrowUpDown className="w-3 h-3" /></span>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-primary transition-colors" onClick={() => toggleSort('priority')}>
                  <span className="flex items-center gap-1">Priority <ArrowUpDown className="w-3 h-3" /></span>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-primary transition-colors" onClick={() => toggleSort('status')}>
                  <span className="flex items-center gap-1">Status <ArrowUpDown className="w-3 h-3" /></span>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-primary transition-colors whitespace-nowrap" onClick={() => toggleSort('createdAt')}>
                  <span className="flex items-center gap-1">Date <ArrowUpDown className="w-3 h-3" /></span>
                </th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-16 text-muted italic text-sm">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No tickets match your filters.
                  </td>
                </tr>
              ) : paginated.map(ticket => {
                const priority = PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.LOW;
                const status   = STATUS_CONFIG[ticket.status]     || STATUS_CONFIG.OPEN;
                const StatusIcon = status.icon;

                return (
                  <tr
                    key={ticket.id}
                    className="border-b border-subtle hover:bg-raised/50 transition-colors group"
                  >
                    {/* Ticket ID */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs font-black text-accent">#{shortenId(String(ticket.id).padStart(3, '0'))}</span>
                    </td>

                    {/* Subject */}
                    <td className="px-6 py-4 max-w-[260px]">
                      <button
                        onClick={() => setSelectedTicket(ticket)}
                        className="text-sm font-bold text-primary hover:text-accent transition-colors text-left truncate block max-w-full cursor-pointer"
                        title={ticket.description}
                      >
                        {ticket.description?.length > 52
                          ? ticket.description.slice(0, 52) + '...'
                          : ticket.description}
                      </button>
                      {ticket.imageUrl && (
                        <span className="inline-flex items-center gap-1 mt-1 text-[9px] font-black text-accent bg-accent/10 border border-accent/20 px-1.5 py-0.5 rounded-md">
                          📎 Image attached
                        </span>
                      )}
                    </td>

                    {/* Reported by */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center" title={`User #${ticket.userId}`}>
                        <img
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${ticket.userId || ticket.id}`}
                          className="w-8 h-8 rounded-full bg-raised flex-shrink-0 border border-subtle"
                          alt="user"
                        />
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide border border-subtle bg-raised text-secondary">
                        {ticket.category || 'General'}
                      </span>
                    </td>

                    {/* Priority */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wide border ${priority.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
                        {priority.label}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {canManage ? (
                        <select
                          value={ticket.status}
                          onChange={e => updateStatusMutation.mutate({ id: ticket.id, status: e.target.value })}
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wide border cursor-pointer focus:outline-none focus:ring-1 focus:ring-accent ${status.badge} bg-transparent`}
                        >
                          <option value="OPEN">Open</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="RESOLVED">Resolved</option>
                        </select>
                      ) : (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wide border ${status.badge}`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-xs font-bold text-primary">
                        {ticket.createdAt 
                          ? new Date(ticket.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })
                          : 'N/A'}
                      </p>
                      <p className="text-[10px] text-muted">
                        {ticket.createdAt 
                          ? new Date(ticket.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                          : ''}
                      </p>
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4 text-right relative">
                      <button
                        onClick={() => setActionMenuId(actionMenuId === ticket.id ? null : ticket.id)}
                        className="p-1.5 text-muted hover:text-primary hover:bg-raised rounded-lg transition-all cursor-pointer bg-transparent border-none"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {/* Dropdown */}
                      {actionMenuId === ticket.id && (
                        <div className={`absolute right-4 z-50 bg-overlay border border-subtle rounded-2xl shadow-2xl w-40 py-1 animate-in fade-in slide-in-from-top-2 duration-150 ${
                          paginated.indexOf(ticket) >= paginated.length - 2 && paginated.length > 3
                            ? 'bottom-12 origin-bottom' 
                            : 'top-12 origin-top'
                        }`}>
                          <button
                            onClick={() => { setSelectedTicket(ticket); setActionMenuId(null); }}
                            className="w-full text-left px-4 py-2.5 text-xs font-bold text-primary hover:bg-raised transition-colors cursor-pointer border-none bg-transparent"
                          >
                            View Details
                          </button>
                          
                          {(canManage || ticket.userId === user?.id) && (
                            <button
                              onClick={() => { setTicketToDelete(ticket); setActionMenuId(null); }}
                              className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-raised transition-colors cursor-pointer"
                            >
                              Delete
                            </button>
                          )}

                          {canManage && (
                            <>
                              <div className="border-t border-subtle my-1" />
                              <button
                                onClick={() => { updateStatusMutation.mutate({ id: ticket.id, status: 'IN_PROGRESS' }); setActionMenuId(null); }}
                                className="w-full text-left px-4 py-2.5 text-xs font-bold text-blue-500 hover:bg-raised transition-colors cursor-pointer"
                              >
                                Mark In Progress
                              </button>
                              <button
                                onClick={() => { updateStatusMutation.mutate({ id: ticket.id, status: 'RESOLVED' }); setActionMenuId(null); }}
                                className="w-full text-left px-4 py-2.5 text-xs font-bold text-green-500 hover:bg-raised transition-colors cursor-pointer"
                              >
                                Mark Resolved
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── Pagination Footer ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-subtle bg-raised">
          {/* Items per page */}
          <div className="flex items-center gap-2 text-xs font-bold text-muted">
            <span>Show per page</span>
            <select
              value={itemsPerPage}
              onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="bg-surface border border-subtle text-primary text-xs font-black px-2 py-1.5 rounded-xl cursor-pointer focus:outline-none focus:ring-1 focus:ring-accent"
            >
              {ITEMS_PER_PAGE_OPTIONS.map(n => (
                <option key={n} value={n} className="bg-surface">{n}</option>
              ))}
            </select>
          </div>

          {/* Page controls */}
          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
              className="p-1.5 text-muted hover:text-primary disabled:opacity-30 transition-colors cursor-pointer bg-transparent border-none"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="p-1.5 text-muted hover:text-primary disabled:opacity-30 transition-colors cursor-pointer bg-transparent border-none"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page numbers */}
            <div className="flex items-center gap-1 mx-1">
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let page;
                if (totalPages <= 7) { page = i + 1; }
                else if (currentPage <= 4) { page = i + 1; }
                else if (currentPage >= totalPages - 3) { page = totalPages - 6 + i; }
                else { page = currentPage - 3 + i; }
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 text-xs font-black rounded-xl transition-all cursor-pointer border-none ${
                      currentPage === page
                        ? 'bg-accent text-white shadow-sm'
                        : 'text-secondary hover:bg-surface hover:text-primary'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              {totalPages > 7 && currentPage < totalPages - 3 && (
                <>
                  <span className="text-muted text-xs px-1">...</span>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className="w-8 h-8 text-xs font-black rounded-xl text-secondary hover:bg-surface hover:text-primary transition-all cursor-pointer border-none"
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>

            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(p => p + 1)}
              className="p-1.5 text-muted hover:text-primary disabled:opacity-30 transition-colors cursor-pointer bg-transparent border-none"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(totalPages)}
              className="p-1.5 text-muted hover:text-primary disabled:opacity-30 transition-colors cursor-pointer bg-transparent border-none"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>

          {/* Count */}
          <span className="text-xs font-bold text-muted">
            {filtered.length.toLocaleString()} items total
          </span>
        </div>
      </div>

      {/* ── Ticket Detail Modal ── */}
      {selectedTicket && (
        <TicketDetailsModal
          ticket={selectedTicket}
          onClose={clearSelectedTicket}
        />
      )}

      {ticketToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-overlay rounded-2xl shadow-2xl overflow-hidden p-6 border border-subtle">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-primary">Delete Ticket</h3>
                <p className="text-xs text-muted mt-0.5">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-secondary mb-6">
              Are you sure you want to delete ticket <span className="font-bold text-accent">#{shortenId(ticketToDelete.id)}</span>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setTicketToDelete(null)}
                className="flex-1 px-4 py-2.5 bg-surface hover:bg-muted-fill text-secondary hover:text-primary text-sm font-bold rounded-xl border border-subtle transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(ticketToDelete.id)}
                disabled={deleteMutation.isPending}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-xl disabled:opacity-50 transition-colors flex items-center justify-center gap-2 cursor-pointer border-none"
              >
                {deleteMutation.isPending ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Close action menu on outside click ── */}
      {actionMenuId && (
        <div className="fixed inset-0 z-40" onClick={() => setActionMenuId(null)} />
      )}
    </>
  );
};

export default TicketBoard;
