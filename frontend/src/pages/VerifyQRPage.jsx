import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle, XCircle, Clock, Calendar, Users, MapPin,
  FileText, QrCode, AlertTriangle, Loader2, ArrowLeft,
  Building2, Hash,
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:8080/api';

//Format helpers
const fmtDate   = iso => new Date(iso).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
const fmtTime   = iso => new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
const fmtBid    = id  => `B${String(id).padStart(4, '0')}`;
const isOverdue = iso => new Date(iso) < new Date();

//Info row
const Row = ({ icon: Icon, label, children }) => (
  <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 mt-0.5">
      <Icon className="w-4 h-4 text-gray-400" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
      <div className="text-sm font-medium text-gray-800">{children}</div>
    </div>
  </div>
);

// VerifyQrPage — displayed when a QR code URL is opened
// Route: /verify-qr/:token
const VerifyQrPage = () => {
  const { token } = useParams();

  const [booking, setBooking]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    if (!token) { setError('No QR token provided.'); setLoading(false); return; }

    fetch(`${API_BASE_URL}/bookings/verify-qr/${token}`)
      .then(async res => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || data.error || `Error ${res.status}`);
        }
        return res.json();
      })
      .then(data => { setBooking(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [token]);

  //Loading
  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
        <p className="text-gray-600 font-medium">Verifying booking...</p>
      </div>
    </div>
  );

  //Error / Invalid
  if (error || !booking) return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
          <XCircle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid QR Code</h1>
        <p className="text-gray-500 text-sm mb-6">
          {error || 'This QR code is invalid or has expired.'}
        </p>
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
          <p className="text-xs text-red-600 font-medium">
            This may happen if the booking was cancelled, rejected, or the QR code is outdated.
          </p>
        </div>
        <Link to="/app/catalogue"
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back to Smart Campus
        </Link>
      </div>
    </div>
  );

  //Booking state helpers
  const started    = new Date(booking.startTime) <= new Date();
  const ended      = isOverdue(booking.endTime);
  const isActive   = started && !ended;
  const isUpcoming = !started;

  const statusLabel = ended ? 'Session Ended' : isActive ? 'Currently Active' : 'Upcoming';
  const statusColor = ended
    ? { bg: 'bg-gray-100',  text: 'text-gray-600',  border: 'border-gray-200',  dot: 'bg-gray-400' }
    : isActive
    ? { bg: 'bg-green-50',  text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500' }
    : { bg: 'bg-blue-50',   text: 'text-blue-700',  border: 'border-blue-200',  dot: 'bg-blue-400' };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* ── Top badge — VERIFIED ── */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-full text-sm font-semibold shadow-lg">
            <CheckCircle className="w-4 h-4" />
            Booking Verified
          </div>
        </div>

        {/* ── Main card ── */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">

          {/* Green header strip */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-xs font-semibold uppercase tracking-widest mb-1">
                  Smart Campus Hub
                </p>
                <h1 className="text-white text-xl font-bold">
                  {booking.resourceName || `Resource #${booking.resourceId}`}
                </h1>
                <p className="text-green-200 text-sm mt-0.5 font-mono">{fmtBid(booking.id)}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <QrCode className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Session status pill */}
          <div className="px-6 pt-4">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${statusColor.bg} ${statusColor.text} ${statusColor.border}`}>
              <span className={`w-2 h-2 rounded-full ${statusColor.dot} ${isActive ? 'animate-pulse' : ''}`} />
              {statusLabel}
            </div>
          </div>

          {/* Details */}
          <div className="px-6 py-2">

            <Row icon={Calendar} label="Date">
              {fmtDate(booking.startTime)}
            </Row>

            <Row icon={Clock} label="Time">
              <span className="flex items-center gap-2 flex-wrap">
                {fmtTime(booking.startTime)} – {fmtTime(booking.endTime)}
                {booking.durationMinutes && (
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-full font-normal">
                    {booking.durationMinutes >= 60
                      ? `${Math.floor(booking.durationMinutes / 60)}h${booking.durationMinutes % 60 ? ` ${booking.durationMinutes % 60}m` : ''}`
                      : `${booking.durationMinutes}m`}
                  </span>
                )}
              </span>
            </Row>

            <Row icon={Hash} label="Booking ID">
              <span className="font-mono">{fmtBid(booking.id)}</span>
            </Row>

            <Row icon={Users} label="User">
              User #{booking.userId}
            </Row>

            {booking.attendees && (
              <Row icon={Users} label="Attendees">
                {booking.attendees} {booking.attendees === 1 ? 'person' : 'people'}
              </Row>
            )}

            <Row icon={FileText} label="Purpose">
              {booking.purpose}
            </Row>
          </div>

          {/* Active / timing message */}
          <div className="mx-6 mb-5">
            {isActive && (
              <div className="p-3.5 bg-green-50 border border-green-200 rounded-xl flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-700 font-medium">
                  This booking is currently active. Entry is authorised.
                </p>
              </div>
            )}
            {isUpcoming && (
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-700 font-medium">
                  Upcoming booking — entry from {fmtTime(booking.startTime)}.
                </p>
              </div>
            )}
            {ended && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700 font-medium">
                  This booking has already ended.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Verified at {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </p>
            <Link to="/app/user/bookings"
              className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium">
              <ArrowLeft className="w-3.5 h-3.5" />
              Smart Campus
            </Link>
          </div>
        </div>

        {/* Small disclaimer */}
        <p className="text-center text-xs text-gray-400 mt-4">
          Smart Campus Operations Hub · Booking {fmtBid(booking.id)}
        </p>
      </div>
    </div>
  );
};

export default VerifyQrPage;
