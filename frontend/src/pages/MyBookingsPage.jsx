import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBookings, fetchResources, deleteBooking, updateBookingStatus } from '../services/api';
import { useAuthStore } from '../store/authStore';
import BookingDetailModal from '../components/BookingDetailModal';
import BookingEditForm from '../components/BookingEditForm';
import BookingForm from '../components/BookingForm';
import {
  Search, Plus, Eye, Pencil, Trash2, RefreshCw,
  BookOpen, ChevronRight, Loader2, Ban, X,
  CalendarCheck, Shield
} from 'lucide-react';

//Helpers
const fmtBid  = id  => `B${String(id).padStart(4, '0')}`;
const fmtDate = iso => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const fmtTime = iso => new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

const STATUS_CFG = {
  PENDING:   { label: 'Pending',   bg: 'bg-amber-500/10',  text: 'text-amber-500',  border: 'border-amber-500/20' },
  APPROVED:  { label: 'Approved',  bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' },
  REJECTED:  { label: 'Rejected',  bg: 'bg-red-500/10',    text: 'text-red-500',    border: 'border-red-500/20' },
  CANCELLED: { label: 'Cancelled', bg: 'bg-muted-fill',    text: 'text-muted',      border: 'border-subtle' },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_CFG[status];
  if (!s) return null;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${s.bg} ${s.text} ${s.border}`}>
      {s.label}
    </span>
  );
};

// Cancel modal
const CancelModal = ({ booking, onConfirm, onClose, isPending }) => {
  const [reason, setReason] = useState('');
  const needsReason = booking?.status === 'APPROVED';
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-overlay rounded-2xl shadow-2xl p-6 max-w-sm w-full" style={{ border: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-500/10 rounded-full flex items-center justify-center flex-shrink-0">
            <Ban className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h3 className="font-bold text-primary">Cancel Booking</h3>
            <p className="text-muted text-xs mt-0.5">
              {needsReason ? 'Approved bookings require a cancellation reason.' : 'Cancel this pending booking?'}
            </p>
          </div>
        </div>
        {needsReason && (
          <textarea 
            value={reason} 
            onChange={e => setReason(e.target.value)}
            placeholder="Reason for cancellation (required)..." 
            rows={3}
            className="w-full bg-surface border border-subtle rounded-xl px-3 py-2 text-sm text-primary placeholder:text-muted outline-none resize-none mb-4" 
          />
        )}
        <div className={`flex gap-3 ${!needsReason ? 'mt-1' : ''}`}>
          <button 
            onClick={onClose}
            className="flex-1 py-2.5 bg-raised text-secondary hover:text-primary text-sm font-medium rounded-xl transition-colors"
            style={{ border: '1px solid var(--border-subtle)' }}
          >
            Back
          </button>
          <button 
            onClick={() => onConfirm(reason)}
            disabled={(needsReason && !reason.trim()) || isPending}
            className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
            Cancel Booking
          </button>
        </div>
      </div>
    </div>
  );
};

//Delete confirm modal 
const DeleteModal = ({ booking, onConfirm, onClose, isPending }) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
    <div className="bg-overlay rounded-2xl shadow-2xl p-6 max-w-sm w-full" style={{ border: '1px solid var(--border-subtle)' }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center flex-shrink-0">
          <Trash2 className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <h3 className="font-bold text-primary">Delete Booking {fmtBid(booking?.id)}</h3>
          <p className="text-muted text-xs mt-0.5">This action cannot be undone.</p>
        </div>
      </div>
      <div className="flex gap-3">
        <button 
          onClick={onClose}
          className="flex-1 py-2.5 bg-raised text-secondary hover:text-primary text-sm font-medium rounded-xl transition-colors"
          style={{ border: '1px solid var(--border-subtle)' }}
        >
          Cancel
        </button>
        <button 
          onClick={onConfirm} 
          disabled={isPending}
          className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          Delete
        </button>
      </div>
    </div>
  </div>
);



//Skeleton
const SkeletonRow = () => (
  <tr className="animate-pulse" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
    {[...Array(7)].map((_, i) => (
      <td key={i} className="px-4 py-4">
        <div className="h-4 bg-muted-fill rounded-md" style={{ width: `${55 + (i * 11) % 35}%` }} />
      </td>
    ))}
  </tr>
);

// MyBookingsPage
const MyBookingsPage = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter]   = useState('');
  const [search, setSearch]               = useState('');
  const [viewTarget, setViewTarget]       = useState(null);
  const [editTarget, setEditTarget]       = useState(null);
  const [deleteTarget, setDeleteTarget]   = useState(null);
  const [cancelTarget, setCancelTarget]   = useState(null);
  const [showSelector, setShowSelector]   = useState(false);
  const [bookingTarget, setBookingTarget] = useState(null);

  const { data: bookings = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['bookings', 'my', user?.id || 'fake-user-1', statusFilter],
    queryFn:  () => fetchBookings({ userId: user?.id || 1, status: statusFilter || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBooking,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['bookings'] }); setDeleteTarget(null); },
    onError: err => { alert(err.message || 'Delete failed.'); setDeleteTarget(null); },
  });

  const cancelMutation = useMutation({
    mutationFn: updateBookingStatus,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['bookings'] }); setCancelTarget(null); },
    onError: err => alert(err.message || 'Cancel failed.'),
  });

  const canEdit = b => b.status === 'PENDING';
  const canCancel = b => b.status === 'PENDING' || b.status === 'APPROVED';
  const deleteDisabled = b => {
    if (b.status === 'REJECTED' || b.status === 'CANCELLED') return false; 
    if (b.status === 'APPROVED' && new Date(b.endTime) < new Date()) return false;
    return true; 
  };

  const handleCancelConfirm = reason =>
    cancelMutation.mutate({ id: cancelTarget.id, status: 'CANCELLED', adminNote: reason || undefined });

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
      String(b.id).includes(q) ||
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
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">


        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-primary flex items-center gap-2.5">
              <CalendarCheck className="w-8 h-8 text-accent animate-pulse" />
              My Bookings
            </h1>
            <p className="text-sm text-muted mt-1 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-accent" /> Role perspective: <span className="font-bold text-accent uppercase">{user?.role}</span>
            </p>
          </div>
          <button 
            onClick={() => setShowSelector(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent hover-bg-accent text-white text-sm font-semibold rounded-xl transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} /> New Booking
          </button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Pending',   count: counts.PENDING,   border: 'border-l-amber-500' },
            { label: 'Approved',  count: counts.APPROVED,  border: 'border-l-emerald-500' },
            { label: 'Rejected',  count: counts.REJECTED,  border: 'border-l-red-500' },
            { label: 'Cancelled', count: counts.CANCELLED, border: 'border-l-muted' },
          ].map(({ label, count, border }) => (
            <div 
              key={label} 
              className={`bg-surface rounded-xl border-l-4 ${border} p-4 shadow-sm`}
              style={{ borderTop: '1px solid var(--border-subtle)', borderRight: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}
            >
              <p className="text-2xl font-bold text-primary">{isLoading ? '—' : count}</p>
              <p className="text-xs text-muted mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap gap-3 mb-5">
          {/* Status tabs */}
          <div className="flex gap-1 p-1 bg-surface rounded-xl shadow-sm overflow-x-auto" style={{ border: '1px solid var(--border-subtle)' }}>
            {TABS.map(({ key, label }) => (
              <button 
                key={key} 
                onClick={() => setStatusFilter(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                  statusFilter === key ? 'bg-accent text-white shadow-sm' : 'text-secondary hover:text-primary hover:bg-raised'
                }`}
              >
                {label}
                <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${statusFilter === key ? 'bg-white/20 text-white' : 'bg-muted-fill text-secondary'}`}>
                  {counts[key] ?? 0}
                </span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 bg-surface rounded-xl shadow-sm flex-1 min-w-[200px] max-w-sm" style={{ border: '1px solid var(--border-subtle)' }}>
            <Search className="w-4 h-4 text-muted flex-shrink-0" />
            <input 
              type="text" 
              placeholder="Search ID, purpose, resource..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="text-sm outline-none bg-transparent w-full placeholder:text-muted text-primary" 
            />
            {search && <button onClick={() => setSearch('')} className="text-muted hover:text-primary text-xs">✕</button>}
          </div>

          {/* Refresh */}
          <button 
            onClick={async () => {
              await queryClient.removeQueries({ queryKey: ['bookings'], exact: false });
              await refetch();
            }}
            className="flex items-center gap-2 px-3 py-2 bg-surface text-secondary hover:text-primary hover:bg-raised rounded-xl text-sm font-medium transition-colors shadow-sm cursor-pointer"
            style={{ border: '1px solid var(--border-subtle)' }}
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Table */}
        <div className="bg-surface rounded-2xl shadow-sm overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-raised" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  {['Booking ID', 'Resource', 'Date', 'Time', 'Attendees', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-muted uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ divideColor: 'var(--border-subtle)' }}>
                {isLoading ? (
                  [...Array(3)].map((_, i) => <SkeletonRow key={i} />)
                ) : isError ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-red-500 text-sm font-medium">
                      Failed to load reservations. 
                      <button onClick={() => refetch()} className="underline text-accent ml-1.5 cursor-pointer">Retry</button>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="flex flex-col items-center justify-center py-16 text-center bg-surface">
                        <div className="w-16 h-16 bg-muted-fill rounded-full flex items-center justify-center mb-4">
                          <BookOpen className="w-8 h-8 text-muted" />
                        </div>
                        <h3 className="text-primary font-semibold">{search ? 'No results found' : 'No bookings yet'}</h3>
                        <p className="text-muted text-sm mt-1">{search ? 'Try different keywords.' : 'Click "New Booking" to get started.'}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map(booking => {
                    const isDelDisabled = deleteDisabled(booking);
                    return (
                      <tr key={booking.id} className="hover:bg-raised transition-colors">
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center px-2.5 py-1 bg-muted-fill text-primary text-xs font-mono font-semibold rounded-lg">
                            {fmtBid(booking.id)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="text-sm font-semibold text-primary">
                            {booking.resourceName || `Resource #${booking.resourceId}`}
                          </p>
                          <p className="text-xs text-muted mt-0.5 truncate max-w-[160px]">{booking.purpose}</p>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-secondary whitespace-nowrap">{fmtDate(booking.startTime)}</td>
                        <td className="px-4 py-3.5 text-sm text-secondary whitespace-nowrap">
                          {fmtTime(booking.startTime)} – {fmtTime(booking.endTime)}
                        </td>
                        <td className="px-4 py-3.5 text-sm text-secondary text-center">{booking.attendees ?? '—'}</td>
                        <td className="px-4 py-3.5"><StatusBadge status={booking.status} /></td>

                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1">
                            {/* View */}
                            <button 
                              onClick={() => setViewTarget(booking)}
                              title="View details"
                              className="p-1.5 rounded-lg transition-colors text-accent bg-accent-subtle hover:bg-accent hover:text-white cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => canEdit(booking) && setEditTarget(booking)}
                              title={canEdit(booking) ? 'Edit booking' : 'Only PENDING bookings can be edited'}
                              disabled={!canEdit(booking)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                canEdit(booking)
                                  ? 'text-accent bg-accent-subtle hover:bg-accent hover:text-white cursor-pointer'
                                  : 'text-muted bg-muted-fill cursor-not-allowed'
                              }`}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>

                            {/* Cancel */}
                            <button
                              onClick={() => canCancel(booking) && setCancelTarget(booking)}
                              title={canCancel(booking) ? 'Cancel booking' : 'Cannot cancel this booking'}
                              disabled={!canCancel(booking)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                canCancel(booking)
                                  ? 'text-orange-500 bg-orange-500/10 hover:bg-orange-500 hover:text-white cursor-pointer'
                                  : 'text-muted bg-muted-fill cursor-not-allowed'
                              }`}
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => !isDelDisabled && setDeleteTarget(booking)}
                              title={isDelDisabled ? 'Cannot delete active booking' : 'Delete booking'}
                              disabled={isDelDisabled}
                              className={`p-1.5 rounded-lg transition-colors ${
                                isDelDisabled
                                  ? 'text-muted bg-muted-fill cursor-not-allowed'
                                  : 'text-red-500 bg-red-500/10 hover:bg-red-500 hover:text-white cursor-pointer'
                              }`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      {viewTarget && (
        <BookingDetailModal 
          booking={viewTarget} 
          onClose={() => setViewTarget(null)} 
        />
      )}
      
      {editTarget && (
        <BookingEditForm 
          booking={editTarget} 
          onClose={() => setEditTarget(null)} 
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['bookings'] })} 
        />
      )}

      {cancelTarget && (
        <CancelModal 
          booking={cancelTarget} 
          onConfirm={handleCancelConfirm} 
          onClose={() => setCancelTarget(null)} 
          isPending={cancelMutation.isPending} 
        />
      )}

      {deleteTarget && (
        <DeleteModal 
          booking={deleteTarget} 
          onConfirm={() => deleteMutation.mutate(deleteTarget.id)} 
          onClose={() => setDeleteTarget(null)} 
          isPending={deleteMutation.isPending} 
        />
      )}

      {showSelector && (
        <BookingForm 
          onClose={() => setShowSelector(false)} 
          onSuccess={() => { queryClient.invalidateQueries({ queryKey: ['bookings'] }); setShowSelector(false); }} 
        />
      )}

      {bookingTarget && (
        <BookingForm 
          resource={bookingTarget} 
          onClose={() => setBookingTarget(null)} 
          onSuccess={() => { queryClient.invalidateQueries({ queryKey: ['bookings'] }); setBookingTarget(null); }} 
        />
      )}
    </>
  );
};

export default MyBookingsPage;
