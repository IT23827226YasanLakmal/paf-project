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
} from 'lucide-react';

//Helpers
const fmtBid  = id  => `B${String(id).padStart(4, '0')}`;
const fmtDate = iso => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const fmtTime = iso => new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

const STATUS_CFG = {
  PENDING:   { label: 'Pending',   bg: 'bg-amber-50',  text: 'text-amber-700',  dot: 'bg-amber-400',  border: 'border-amber-200' },
  APPROVED:  { label: 'Approved',  bg: 'bg-green-50',  text: 'text-green-700',  dot: 'bg-green-400',  border: 'border-green-200' },
  REJECTED:  { label: 'Rejected',  bg: 'bg-red-50',    text: 'text-red-600',    dot: 'bg-red-400',    border: 'border-red-200' },
  CANCELLED: { label: 'Cancelled', bg: 'bg-slate-100', text: 'text-slate-500',  dot: 'bg-slate-300',  border: 'border-slate-200' },
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

// Cancel modal
const CancelModal = ({ booking, onConfirm, onClose, isPending }) => {
  const [reason, setReason] = useState('');
  const needsReason = booking?.status === 'APPROVED';
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full border border-slate-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Ban className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Cancel Booking</h3>
            <p className="text-slate-500 text-xs mt-0.5">
              {needsReason ? 'Approved bookings require a cancellation reason.' : 'Cancel this pending booking?'}
            </p>
          </div>
        </div>
        {needsReason && (
          <textarea value={reason} onChange={e => setReason(e.target.value)}
            placeholder="Reason for cancellation (required)..." rows={3}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm 
            text-gray-900 bg-white placeholder:text-gray-400 
            outline-none focus:ring-2 focus:ring-blue-400 resize-none mb-4" />
        )}
        <div className={`flex gap-3 ${!needsReason ? 'mt-1' : ''}`}>
          <button onClick={onClose}
            className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">
            Back
          </button>
          <button onClick={() => onConfirm(reason)}
            disabled={(needsReason && !reason.trim()) || isPending}
            className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
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
    <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full border border-slate-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
          <Trash2 className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900">Delete Booking {fmtBid(booking?.id)}</h3>
          <p className="text-slate-500 text-xs mt-0.5">This action cannot be undone.</p>
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={onClose}
          className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">
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

//Resource selector
const ResourceSelectorModal = ({ onSelect, onClose }) => {
  const { data: resources = [], isLoading } = useQuery({
    queryKey: ['resources'],
    queryFn:  () => fetchResources(null),
  });
  const active = resources.filter(r => r.status === 'ACTIVE');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Select a Resource</h2>
            <p className="text-sm text-slate-500 mt-0.5">Choose which resource to book</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 max-h-72 overflow-y-auto space-y-2">
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-slate-400 animate-spin" /></div>
          ) : active.length === 0 ? (
            <p className="text-center text-slate-400 py-8 text-sm">No active resources available.</p>
          ) : active.map(r => (
            <button key={r.id} onClick={() => onSelect(r)}
              className="w-full text-left p-3.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl transition-all group">
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-700">{r.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {r.type.replace('_', ' ')}
                    {r.location ? ` · ${r.location}` : ''}
                    {r.capacity ? ` · Capacity: ${r.capacity}` : ''}
                  </p>
                </div>
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex-shrink-0">Active</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

//Skeleton
const SkeletonRow = () => (
  <tr className="animate-pulse border-b border-slate-50">
    {[...Array(8)].map((_, i) => (
      <td key={i} className="px-4 py-4">
        <div className="h-4 bg-slate-100 rounded-md" style={{ width: `${55 + (i * 11) % 35}%` }} />
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
    queryKey: ['bookings', 'my', user?.id, statusFilter],
    queryFn:  () => fetchBookings({ userId: user?.id || 1, status: statusFilter || undefined }),
    enabled:  !!user,
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

  //Button rules
  // Edit: PENDING only
  const canEdit = b => b.status === 'PENDING';
  // Cancel: PENDING or APPROVED
  const canCancel = b => b.status === 'PENDING' || b.status === 'APPROVED';
  // Delete: ALWAYS shown but DISABLED for PENDING and active APPROVED
  const deleteDisabled = b => {
    if (b.status === 'REJECTED' || b.status === 'CANCELLED') return false;  // enabled
    if (b.status === 'APPROVED' && new Date(b.endTime) < new Date()) return false; // overdue — enabled
    return true; // PENDING or active APPROVED — disabled
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-sm text-slate-400 mb-3">
          <span>Home</span><ChevronRight className="w-4 h-4" />
          <span className="text-slate-600 font-medium">My Bookings</span>
        </div>

        {/* Header */}
        <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Bookings</h1>
            <p className="text-slate-500 text-sm mt-1">Track and manage your resource reservations.</p>
          </div>
          {/* ── New Booking button — top right ── */}
          <button onClick={() => setShowSelector(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
            <Plus className="w-4 h-4" />New Booking
          </button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Pending',   count: counts.PENDING,   accent: 'border-l-amber-400' },
            { label: 'Approved',  count: counts.APPROVED,  accent: 'border-l-green-400' },
            { label: 'Rejected',  count: counts.REJECTED,  accent: 'border-l-red-400' },
            { label: 'Cancelled', count: counts.CANCELLED, accent: 'border-l-slate-300' },
          ].map(({ label, count, accent }) => (
            <div key={label} className={`bg-white rounded-xl border border-slate-200 border-l-4 ${accent} p-4 shadow-sm`}>
              <p className="text-2xl font-bold text-slate-900">{isLoading ? '—' : count}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap gap-3 mb-5">
          {/* Status tabs */}
          <div className="flex gap-1 p-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-x-auto">
            {TABS.map(({ key, label }) => (
              <button key={key} onClick={() => setStatusFilter(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  statusFilter === key ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}>
                {label}
                <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${statusFilter === key ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {counts[key] ?? 0}
                </span>
              </button>
            ))}
          </div>
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl shadow-sm flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input type="text" placeholder="Search ID, purpose, resource..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="text-sm outline-none bg-transparent w-full placeholder:text-slate-400 text-slate-700" />
            {search && <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600 text-xs leading-none">✕</button>}
        </div>
           {/* Refresh */}
            <button onClick={async () => {
                console.log("Manual refresh clicked");

                await queryClient.removeQueries({ queryKey: ['bookings'], exact: false });
                await refetch();
                }}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
                >
                <RefreshCw className="w-4 h-4" />
                Refresh
            </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['Booking ID', 'Resource', 'Date', 'Time', 'Attendees', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [...Array(3)].map((_, i) => <SkeletonRow key={i} />)
                ) : isError ? (
                  <tr><td colSpan={7} className="text-center py-12 text-red-500 text-sm">
                    Failed to load.{' '}
                    <button onClick={() => refetch()} className="underline text-blue-600">Retry</button>
                  </td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7}>
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <BookOpen className="w-8 h-8 text-slate-400" />
                      </div>
                      <h3 className="text-slate-700 font-semibold">{search ? 'No results found' : 'No bookings yet'}</h3>
                      <p className="text-slate-400 text-sm mt-1">{search ? 'Try different keywords.' : 'Click "New Booking" to get started.'}</p>
                    </div>
                  </td></tr>
                ) : (
                  filtered.map(booking => {
                    const isDelDisabled = deleteDisabled(booking);
                    return (
                      <tr key={booking.id} className="border-b border-slate-50 hover:bg-blue-50/20 transition-colors">
                        {/* Booking ID — B0001 format */}
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-mono font-semibold rounded-lg">
                            {fmtBid(booking.id)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="text-sm font-semibold text-slate-800">
                            {booking.resourceName || `Resource #${booking.resourceId}`}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[160px]">{booking.purpose}</p>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-slate-600 whitespace-nowrap">{fmtDate(booking.startTime)}</td>
                        <td className="px-4 py-3.5 text-sm text-slate-600 whitespace-nowrap">
                          {fmtTime(booking.startTime)} – {fmtTime(booking.endTime)}
                        </td>
                        <td className="px-4 py-3.5 text-sm text-slate-600 text-center">{booking.attendees ?? '—'}</td>
                        <td className="px-4 py-3.5"><StatusBadge status={booking.status} /></td>

                        {/* ── Actions column — all buttons always shown ── */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1">

                            {/* View — always enabled */}
                            <button onClick={() => setViewTarget(booking)}
                              title="View details"
                              className="p-1.5 rounded-lg transition-colors text-blue-500 hover:bg-blue-100"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit — enabled only for PENDING */}
                            <button
                              onClick={() => canEdit(booking) && setEditTarget(booking)}
                              title={canEdit(booking) ? 'Edit booking' : 'Only PENDING bookings can be edited'}
                              disabled={!canEdit(booking)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                canEdit(booking)
                                  ? 'text-indigo-500 hover:bg-indigo-100 cursor-pointer'
                                  : 'text-slate-300 cursor-not-allowed'
                              }`}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>

                            {/* Cancel — enabled for PENDING or APPROVED */}
                            <button
                              onClick={() => canCancel(booking) && setCancelTarget(booking)}
                              title={canCancel(booking) ? 'Cancel booking' : 'Cannot cancel this booking'}
                              disabled={!canCancel(booking)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                canCancel(booking)
                                  ? 'text-orange-500 hover:bg-orange-100 cursor-pointer'
                                  : 'text-slate-300 cursor-not-allowed'
                              }`}
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete — always shown, disabled for PENDING and active APPROVED */}
                            <button
                              onClick={() => !isDelDisabled && setDeleteTarget(booking)}
                              title={
                                isDelDisabled
                                  ? booking.status === 'PENDING'
                                    ? 'Cannot delete PENDING — admin must review first'
                                    : 'Cannot delete active approved booking'
                                  : 'Delete booking'
                              }
                              disabled={isDelDisabled}
                              className={`p-1.5 rounded-lg transition-colors ${
                                isDelDisabled
                                  ? 'text-slate-300 cursor-not-allowed'
                                  : 'text-red-500 hover:bg-red-100 cursor-pointer'
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
          {!isLoading && filtered.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-50 text-xs text-slate-400">
              Showing {filtered.length} of {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
              {search && ` matching "${search}"`}
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      {showSelector && (
        <ResourceSelectorModal
          onSelect={r => { setShowSelector(false); setBookingTarget(r); }}
          onClose={() => setShowSelector(false)}
        />
      )}
      {bookingTarget && (
        <BookingForm resource={bookingTarget} onClose={() => setBookingTarget(null)} onSuccess={() => setBookingTarget(null)} />
      )}
      {editTarget && (
        <BookingEditForm booking={editTarget} onClose={() => setEditTarget(null)} onSuccess={() => setEditTarget(null)} />
      )}
      {cancelTarget && (
        <CancelModal booking={cancelTarget} onConfirm={handleCancelConfirm} onClose={() => setCancelTarget(null)} isPending={cancelMutation.isPending} />
      )}
      {deleteTarget && (
        <DeleteModal booking={deleteTarget} onConfirm={() => deleteMutation.mutate({ id: deleteTarget.id })} onClose={() => setDeleteTarget(null)} isPending={deleteMutation.isPending} />
      )}
      {viewTarget && (
        <BookingDetailModal booking={viewTarget} onClose={() => setViewTarget(null)} />
      )}
    </div>
  );
};

export default MyBookingsPage;
