import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBookings, updateBookingStatus, deleteBooking } from '../services/api';
import BookingDetailModal from '../components/BookingDetailModal';
import BookingEditForm from '../components/BookingEditForm';
import {
  Search, Eye, Pencil, Trash2, RefreshCw, ChevronRight,
  Loader2, CheckCircle, XCircle, Clock3, Ban, AlertCircle,
} from 'lucide-react';

// Helpers 
const fmtBid  = id  => `B${String(id).padStart(4, '0')}`;
const fmtDate = iso => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const fmtTime = iso => new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

const STATUS_CFG = {
  PENDING:   { label: 'Pending',   bg: 'bg-amber-500/10',  text: 'text-amber-500',  dot: 'bg-amber-400',  border: 'border-amber-500/20' },
  APPROVED:  { label: 'Approved',  bg: 'bg-green-500/10',  text: 'text-green-500',  dot: 'bg-green-400',  border: 'border-green-500/20' },
  REJECTED:  { label: 'Rejected',  bg: 'bg-red-500/10',    text: 'text-red-500',    dot: 'bg-red-400',    border: 'border-red-500/20' },
  CANCELLED: { label: 'Cancelled', bg: 'bg-slate-500/10', text: 'text-slate-400',  dot: 'bg-slate-300',  border: 'border-slate-500/20' },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_CFG[status];
  if (!s) return null;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${s.bg} ${s.text} ${s.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{s.label}
    </span>
  );
};

// Reject modal
const RejectModal = ({ onConfirm, onClose, isPending }) => {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-overlay rounded-xl border border-subtle p-6 max-w-sm w-full text-primary shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center flex-shrink-0">
            <XCircle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="font-bold text-primary">Reject Booking</h3>
            <p className="text-muted text-xs mt-0.5">A reason is required and shown to the user.</p>
          </div>
        </div>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Rejection reason (required)..."
          rows={3}
          className="w-full border border-subtle bg-surface rounded-lg px-3 py-2 text-sm text-primary placeholder:text-muted outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 resize-none mb-4"
        />
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 border border-subtle text-secondary text-sm font-medium rounded-lg hover:bg-raised transition-colors">
            Back
          </button>
          <button onClick={() => onConfirm(reason)}
            disabled={!reason.trim() || isPending}
            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

// Cancel modal — APPROVED bookings only, reason required 
const CancelModal = ({ booking, onConfirm, onClose, isPending }) => {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-overlay rounded-xl border border-subtle p-6 max-w-sm w-full text-primary shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-500/10 rounded-full flex items-center justify-center flex-shrink-0">
            <Ban className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h3 className="font-bold text-primary">Cancel Approved Booking</h3>
            <p className="text-muted text-xs mt-0.5">A reason is required and shown to the user.</p>
          </div>
        </div>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Reason for cancellation (required)..."
          rows={3}
          className="w-full border border-subtle bg-surface rounded-lg px-3 py-2 text-sm text-primary placeholder:text-muted outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 resize-none mb-4"
        />
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 border border-subtle text-secondary text-sm font-medium rounded-lg hover:bg-raised transition-colors">
            Back
          </button>
          <button onClick={() => onConfirm(reason)}
            disabled={!reason.trim() || isPending}
            className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Delete confirm 
const DeleteModal = ({ booking, onConfirm, onClose, isPending }) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
    <div className="bg-overlay rounded-xl border border-subtle p-6 max-w-sm w-full text-primary shadow-xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center flex-shrink-0">
          <Trash2 className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <h3 className="font-bold text-primary">Delete {fmtBid(booking?.id)}</h3>
          <p className="text-muted text-xs mt-0.5">This action cannot be undone.</p>
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={onClose}
          className="flex-1 py-2.5 border border-subtle text-secondary text-sm font-medium rounded-lg hover:bg-raised transition-colors">
          Cancel
        </button>
        <button onClick={onConfirm} disabled={isPending}
          className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          Delete
        </button>
      </div>
    </div>
  </div>
);

// Skeleton 
const SkeletonRow = () => (
  <tr className="animate-pulse border-b border-slate-50">
    {[...Array(7)].map((_, i) => (
      <td key={i} className="px-4 py-4">
        <div className="h-4 bg-slate-100 rounded-md" style={{ width: `${50 + (i * 13) % 40}%` }} />
      </td>
    ))}
  </tr>
);


// AdminBookingReview
const AdminBookingReview = () => {
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch]             = useState('');
  const [viewTarget, setViewTarget]     = useState(null);
  const [editTarget, setEditTarget]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);

  const { data: bookings = [], isLoading, refetch } = useQuery({
    queryKey: ['bookings', 'admin', statusFilter],
    queryFn:  () => fetchBookings({ status: statusFilter || undefined }),
    refetchInterval: 30_000,
  });

  const statusMutation = useMutation({
    mutationFn: updateBookingStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      setRejectTarget(null);
      setCancelTarget(null);
    },
    onError: err => alert(err.message || 'Action failed.'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBooking,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['bookings'] }); setDeleteTarget(null); },
    onError: err => { alert(err.message); setDeleteTarget(null); },
  });

  // Actions
  const approve = id =>
    statusMutation.mutate({ id, status: 'APPROVED' });

  const reject = reason =>
    statusMutation.mutate({ id: rejectTarget.id, status: 'REJECTED', rejectionReason: reason });

  // Admin cancels APPROVED booking only — reason stored in adminNote
  const cancel = reason =>
    statusMutation.mutate({ id: cancelTarget.id, status: 'CANCELLED', adminNote: reason });

  // Button enable/disable rules 
  const editDisabled    = b => b.status !== 'PENDING';
  const approveDisabled = b => b.status !== 'PENDING';
  const rejectDisabled  = b => b.status !== 'PENDING';
  // FIXED: cancel is for APPROVED only — PENDING should use approve/reject
  const cancelDisabled  = b => b.status !== 'APPROVED';
  const deleteDisabled  = b => {
    if (b.status === 'REJECTED' || b.status === 'CANCELLED') return false;
    if (b.status === 'APPROVED' && new Date(b.endTime) < new Date()) return false;
    return true;
  };

  const counts = useMemo(() => ({
    '': bookings.length,
    PENDING:   bookings.filter(b => b.status === 'PENDING').length,
    APPROVED:  bookings.filter(b => b.status === 'APPROVED').length,
    REJECTED:  bookings.filter(b => b.status === 'REJECTED').length,
    CANCELLED: bookings.filter(b => b.status === 'CANCELLED').length,
  }), [bookings]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return bookings;
    return bookings.filter(b =>
      fmtBid(b.id).toLowerCase().includes(q) ||
      String(b.id).includes(q) || String(b.userId).includes(q) ||
      b.purpose?.toLowerCase().includes(q) ||
      (b.resourceName || '').toLowerCase().includes(q)
    );
  }, [bookings, search]);

  const TABS = [
    { key: '', label: 'All' }, { key: 'PENDING', label: 'Pending' },
    { key: 'APPROVED', label: 'Approved' }, { key: 'REJECTED', label: 'Rejected' },
    { key: 'CANCELLED', label: 'Cancelled' },
  ];

  return (
    <div className="min-h-screen bg-canvas text-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-sm text-muted mb-3">
          <span>Admin</span><ChevronRight className="w-4 h-4" />
          <span className="text-secondary font-medium">Booking Management</span>
        </div>

        {/* Header */}
        <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-primary">Booking Management</h1>
            <p className="text-muted text-sm mt-1">Review, approve, and manage all booking requests.</p>
          </div>
            <button onClick={async () => {
              // Manual refresh triggered

          
              await queryClient.removeQueries({ queryKey: ['bookings'], exact: false });
              await refetch();
              }}
              className="flex items-center gap-2 px-3 py-2 bg-surface border border-subtle rounded-xl text-sm text-secondary hover:bg-raised transition-colors shadow-sm cursor-pointer"
              >
              <RefreshCw className="w-4 h-4" />
              Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Pending',   count: counts.PENDING,   accent: 'border-l-amber-400', Icon: Clock3 },
            { label: 'Approved',  count: counts.APPROVED,  accent: 'border-l-green-400', Icon: CheckCircle },
            { label: 'Rejected',  count: counts.REJECTED,  accent: 'border-l-red-400',   Icon: XCircle },
            { label: 'Cancelled', count: counts.CANCELLED, accent: 'border-l-slate-300', Icon: Ban },
          ].map(({ label, count, accent, Icon }) => (
            <div key={label} className={`bg-surface rounded-xl border border-subtle border-l-4 ${accent} p-4 shadow-sm`}>
              <p className="text-2xl font-bold text-primary">{isLoading ? '—' : count}</p>
              <p className="text-xs text-muted mt-0.5 flex items-center gap-1"><Icon className="w-3 h-3" />{label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="flex gap-1 p-1 bg-surface border border-subtle rounded-xl shadow-sm overflow-x-auto">
            {TABS.map(({ key, label }) => (
              <button key={key} onClick={() => setStatusFilter(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                  statusFilter === key ? 'bg-accent text-white shadow-sm' : 'text-secondary hover:text-primary hover:bg-raised'
                }`}>
                {label}
                <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${statusFilter === key ? 'bg-white/25 text-white' : 'bg-muted-fill text-secondary'}`}>
                  {counts[key] ?? 0}
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-surface border border-subtle rounded-xl shadow-sm flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 text-muted flex-shrink-0" />
            <input type="text" placeholder="Search ID, user, resource, purpose..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="text-sm outline-none bg-transparent w-full placeholder:text-muted text-primary" />
            {search && <button onClick={() => setSearch('')} className="text-muted hover:text-primary text-xs leading-none cursor-pointer">✕</button>}
          </div>
        </div>

        {/* Table */}
        <div className="bg-surface rounded-2xl border border-subtle shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-raised border-b border-subtle">
                  {['Booking ID', 'Resource', 'User', 'Date & Time', 'Attendees', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [...Array(4)].map((_, i) => <SkeletonRow key={i} />)
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7}>
                    <div className="flex flex-col items-center justify-center py-16">
                      <div className="w-14 h-14 bg-muted-fill rounded-full flex items-center justify-center mb-3">
                        <AlertCircle className="w-7 h-7 text-muted" />
                      </div>
                      <p className="text-secondary font-medium">No bookings found</p>
                      <p className="text-muted text-sm mt-1">{search ? 'Try a different search.' : 'No bookings match this filter.'}</p>
                    </div>
                  </td></tr>
                ) : filtered.map(booking => {
                  const busy = statusMutation.isPending && statusMutation.variables?.id === booking.id;
                  return (
                    <tr key={booking.id} className="border-b border-subtle hover:bg-accent-subtle transition-colors">

                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center px-2.5 py-1 bg-muted-fill text-secondary text-xs font-mono font-semibold rounded-lg">
                          {fmtBid(booking.id)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-sm font-semibold text-primary">{booking.resourceName || `Resource #${booking.resourceId}`}</p>
                        <p className="text-xs text-muted mt-0.5 truncate max-w-[140px]">{booking.purpose}</p>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-secondary">User #{booking.userId}</td>
                      <td className="px-4 py-3.5 text-sm text-secondary whitespace-nowrap">
                        <div>{fmtDate(booking.startTime)}</div>
                        <div className="text-xs text-muted">{fmtTime(booking.startTime)} – {fmtTime(booking.endTime)}</div>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-secondary text-center">{booking.attendees ?? '—'}</td>
                      <td className="px-4 py-3.5"><StatusBadge status={booking.status} /></td>

                      {/* Actions */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1 flex-wrap">

                          {/* View — always enabled */}
                          <button onClick={() => setViewTarget(booking)} title="View details"
                            className="p-1.5 text-blue-500 hover:bg-accent-subtle rounded-lg transition-colors cursor-pointer">
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit — PENDING only */}
                          <button
                            onClick={() => !editDisabled(booking) && setEditTarget(booking)}
                            disabled={editDisabled(booking)}
                            title={editDisabled(booking) ? 'Only PENDING bookings can be edited' : 'Edit booking'}
                            className={`p-1.5 rounded-lg transition-colors ${editDisabled(booking) ? 'text-muted cursor-not-allowed' : 'text-indigo-500 hover:bg-accent-subtle cursor-pointer'}`}>
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          {/* Approve — PENDING only */}
                          <button
                            onClick={() => !approveDisabled(booking) && approve(booking.id)}
                            disabled={approveDisabled(booking) || busy}
                            title={approveDisabled(booking) ? 'Can only approve PENDING bookings' : 'Approve — generates QR code'}
                            className={`p-1.5 rounded-lg transition-colors ${approveDisabled(booking) ? 'text-muted cursor-not-allowed' : 'text-green-600 hover:bg-accent-subtle cursor-pointer'}`}>
                            {busy && !approveDisabled(booking)
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <CheckCircle className="w-3.5 h-3.5" />}
                          </button>

                          {/* Reject — PENDING only */}
                          <button
                            onClick={() => !rejectDisabled(booking) && setRejectTarget(booking)}
                            disabled={rejectDisabled(booking)}
                            title={rejectDisabled(booking) ? 'Can only reject PENDING bookings' : 'Reject booking'}
                            className={`p-1.5 rounded-lg transition-colors ${rejectDisabled(booking) ? 'text-muted cursor-not-allowed' : 'text-red-500 hover:bg-accent-subtle cursor-pointer'}`}>
                            <XCircle className="w-3.5 h-3.5" />
                          </button>

                          {/* Cancel — APPROVED only */}
                          <button
                            onClick={() => !cancelDisabled(booking) && setCancelTarget(booking)}
                            disabled={cancelDisabled(booking)}
                            title={cancelDisabled(booking) ? 'Cancel is only for APPROVED bookings' : 'Cancel approved booking'}
                            className={`p-1.5 rounded-lg transition-colors ${cancelDisabled(booking) ? 'text-muted cursor-not-allowed' : 'text-orange-500 hover:bg-accent-subtle cursor-pointer'}`}>
                            <Ban className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete — REJECTED / CANCELLED / overdue APPROVED */}
                          <button
                            onClick={() => !deleteDisabled(booking) && setDeleteTarget(booking)}
                            disabled={deleteDisabled(booking)}
                            title={deleteDisabled(booking) ? 'Cannot delete PENDING or active bookings' : 'Delete record'}
                            className={`p-1.5 rounded-lg transition-colors ${deleteDisabled(booking) ? 'text-muted cursor-not-allowed' : 'text-red-400 hover:bg-accent-subtle cursor-pointer'}`}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {!isLoading && filtered.length > 0 && (
            <div className="px-4 py-3 border-t border-subtle text-xs text-muted">
              Showing {filtered.length} of {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
              {search && ` matching "${search}"`}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {rejectTarget && <RejectModal onConfirm={reject} onClose={() => setRejectTarget(null)} isPending={statusMutation.isPending} />}
      {cancelTarget && <CancelModal booking={cancelTarget} onConfirm={cancel} onClose={() => setCancelTarget(null)} isPending={statusMutation.isPending} />}
      {deleteTarget && <DeleteModal booking={deleteTarget} onConfirm={() => deleteMutation.mutate({ id: deleteTarget.id })} onClose={() => setDeleteTarget(null)} isPending={deleteMutation.isPending} />}
      {editTarget   && <BookingEditForm booking={editTarget} onClose={() => setEditTarget(null)} onSuccess={() => setEditTarget(null)} />}
      {viewTarget   && <BookingDetailModal booking={viewTarget} onClose={() => setViewTarget(null)} />}
    </div>
  );
};

export default AdminBookingReview;
