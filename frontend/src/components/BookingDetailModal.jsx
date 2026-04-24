import React from 'react';
import { X, FileText, QrCode, Info, CheckCircle, XCircle, Clock3, Ban, Calendar, Clock, Users } from 'lucide-react';

const STATUS_CFG = {
    PENDING:   { label: 'Pending Review', bg: 'bg-amber-50',   text: 'text-amber-700',  border: 'border-amber-200',  Icon: Clock3 },
    APPROVED:  { label: 'Approved',       bg: 'bg-green-50',   text: 'text-green-700',  border: 'border-green-200',  Icon: CheckCircle },
    REJECTED:  { label: 'Rejected',       bg: 'bg-red-50',     text: 'text-red-700',    border: 'border-red-200',    Icon: XCircle },
    CANCELLED: { label: 'Cancelled',      bg: 'bg-gray-50',    text: 'text-gray-500',   border: 'border-gray-200',   Icon: Ban },
};

const fmtDate = iso => new Date(iso).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
const fmtTime = iso => new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
const fmtDT   = iso => new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

const InfoRow = ({ label, children }) => (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-24 flex-shrink-0 pt-0.5">{label}</span>
        <span className="text-sm text-gray-700 flex-1">{children}</span>
    </div>
);

const QrImage = ({ token }) => (
    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`${window.location.origin}/verify-qr/${token}`)}`}
        alt="QR Code" className="w-36 h-36 rounded-xl border-2 border-green-200" />
);

const BookingDetailModal = ({ booking, onClose }) => {
    if (!booking) return null;
    const s = STATUS_CFG[booking.status] || STATUS_CFG.PENDING;
    const Icon = s.Icon;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">

                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Booking Details</h2>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">ID #{booking.id}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
                </div>

                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">

                    {/* Status badge */}
                    <div className="flex justify-center">
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${s.bg} ${s.text} ${s.border}`}>
                            <Icon className="w-4 h-4" />{s.label}
                        </span>
                    </div>

                    {/* Core info */}
                    <div className="bg-gray-50 rounded-xl border border-gray-100 px-4 py-1">
                        <InfoRow label="Resource">{booking.resourceName || `Resource #${booking.resourceId}`}</InfoRow>
                        <InfoRow label="User">User #{booking.userId}</InfoRow>
                        <InfoRow label="Date">
                            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-gray-400" />{fmtDate(booking.startTime)}</span>
                        </InfoRow>
                        <InfoRow label="Time">
                            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-gray-400" />{fmtTime(booking.startTime)} – {fmtTime(booking.endTime)}{booking.durationMinutes && <span className="text-gray-400">({booking.durationMinutes}m)</span>}</span>
                        </InfoRow>
                        {booking.attendees && <InfoRow label="Attendees"><span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-gray-400" />{booking.attendees} {booking.attendees === 1 ? 'person' : 'people'}</span></InfoRow>}
                    </div>

                    {/* Purpose */}
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                        <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-1.5 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" />Purpose</p>
                        <p className="text-sm text-gray-700">{booking.purpose}</p>
                    </div>

                    {/* Rejection reason */}
                    {booking.rejectionReason && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                            <p className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-1.5 flex items-center gap-1.5"><XCircle className="w-3.5 h-3.5" />Rejection Reason</p>
                            <p className="text-sm text-gray-700">{booking.rejectionReason}</p>
                        </div>
                    )}

                    {/* Admin note / cancel reason */}
                    {booking.adminNote && (
                        <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                            <p className="text-xs font-semibold text-amber-500 uppercase tracking-wide mb-1.5 flex items-center gap-1.5"><Info className="w-3.5 h-3.5" />Note</p>
                            <p className="text-sm text-gray-700">{booking.adminNote}</p>
                        </div>
                    )}

                    {/* QR Code */}
                    {booking.status === 'APPROVED' && booking.qrCodeToken && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-center">
                            <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-3 flex items-center justify-center gap-1.5"><QrCode className="w-3.5 h-3.5" />Check-in QR Code</p>
                            <div className="flex justify-center mb-2"><QrImage token={booking.qrCodeToken} /></div>
                            <p className="text-xs text-green-600">Show this at the facility entrance</p>
                        </div>
                    )}

                    {/* Timestamps */}
                    <div className="text-xs text-gray-400 space-y-0.5 pt-1">
                        <p>Submitted: {fmtDT(booking.createdAt)}</p>
                        {booking.updatedAt && booking.updatedAt !== booking.createdAt && <p>Updated: {fmtDT(booking.updatedAt)}</p>}
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-100">
                    <button onClick={onClose} className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors">Close</button>
                </div>
            </div>
        </div>
    );
};

export default BookingDetailModal;
