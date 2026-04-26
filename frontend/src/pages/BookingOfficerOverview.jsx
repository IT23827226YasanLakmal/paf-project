import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchBookings, fetchBookingStats } from '../services/api';
import { Link } from 'react-router-dom';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, 
  PieChart, Pie, Cell, BarChart, Bar 
} from 'recharts';
import { 
  MoreHorizontal, Clock3, CheckCircle2, 
  XCircle, Ban, BookOpen, Shield, BarChart3, ChevronRight
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

/* ---------- Config & Helpers ---------- */
const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const STATUS_CONFIG = {
  PENDING:   { label: 'Pending',   color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: Clock3 },
  APPROVED:  { label: 'Approved',  color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20', icon: CheckCircle2 },
  REJECTED:  { label: 'Rejected',  color: 'text-red-500',   bg: 'bg-red-500/10',   border: 'border-red-500/20',   icon: XCircle },
  CANCELLED: { label: 'Cancelled', color: 'text-muted',     bg: 'bg-muted/10',     border: 'border-subtle',       icon: Ban },
};

const BookingOfficerOverview = () => {
  const { user } = useAuthStore();
  const [range, setRange] = useState('7'); // days

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['bookings', 'officer-dashboard'],
    queryFn: () => fetchBookings({})
  });

  const { data: bookingStats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['bookingStats', range],
    queryFn: () => fetchBookingStats(parseInt(range)),
  });

  /* ---------- Calculations ---------- */
  const stats = useMemo(() => {
    if (!bookingStats) return { total: 0, approved: 0, pending: 0, cancelled: 0 };
    return { 
      total: bookingStats.totalRequests, 
      approved: bookingStats.approvedRequests, 
      pending: bookingStats.pendingRequests, 
      cancelled: bookingStats.cancelledRejectedRequests 
    };
  }, [bookingStats]);

  const trendData = bookingStats?.trend || [];
  const topResources = bookingStats?.topResources || [];
  const dayOfWeekData = bookingStats?.peakDays || [];

  const recentBookings = useMemo(() => {
    return [...bookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);
  }, [bookings]);

  if (isLoading || isStatsLoading) return <div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 animate-in fade-in duration-500 min-h-0 text-primary">
      
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-accent animate-pulse" />
            Booking Operations Control
          </h1>
          <p className="text-sm text-muted mt-1 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-accent" /> Role perspective: <span className="font-bold text-accent uppercase">{user?.role}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-raised border border-subtle p-1 rounded-xl">
            {[
              { id: '7', label: '7D' },
              { id: '30', label: '30D' },
              { id: '365', label: '1Y' }
            ].map(r => (
              <button
                key={r.id}
                onClick={() => setRange(r.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all border-none ${
                  range === r.id
                    ? 'bg-accent text-white shadow-md'
                    : 'text-muted hover:text-primary bg-transparent'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Requests', value: stats.total, icon: <BookOpen className="w-6 h-6 text-muted" /> },
          { label: 'Approved', value: stats.approved, icon: <CheckCircle2 className="w-6 h-6 text-green-500" /> },
          { label: 'Pending Review', value: stats.pending, icon: <Clock3 className="w-6 h-6 text-amber-500" /> },
          { label: 'Cancelled/Rejected', value: stats.cancelled, icon: <Ban className="w-6 h-6 text-red-500" /> },
        ].map((stat, i) => (
          <div key={i} className="bg-surface p-6 rounded-3xl border border-subtle shadow-sm flex justify-between items-start hover:border-accent/30 transition-all duration-300">
            <div>
              <p className="text-xs font-bold text-muted uppercase tracking-wider mb-2">{stat.label}</p>
              <h3 className="text-3xl font-black text-primary">{stat.value.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-raised rounded-xl">
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Booking Volume Trend */}
        <div className="lg:col-span-2 bg-surface p-6 rounded-3xl border border-subtle shadow-sm">
          <div className="mb-6">
            <h3 className="font-bold text-primary">Booking Request Trend</h3>
            <p className="text-xs text-muted">Overview of approved vs pending requests</p>
          </div>
          
          <div className="h-64 w-full min-h-[256px]">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={256}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                  <Tooltip contentStyle={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', borderRadius: '12px', border: '1px solid var(--border-subtle)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  <Line type="monotone" name="Approved" dataKey="approved" stroke="#10b981" strokeWidth={4} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: 'var(--bg-surface)' }} activeDot={{ r: 6 }} />
                  <Line type="monotone" name="Pending" dataKey="pending" stroke="#f59e0b" strokeWidth={4} dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: 'var(--bg-surface)' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted italic text-sm">No data available</div>
            )}
          </div>
        </div>

        {/* Top Resources */}
        <div className="bg-surface p-6 rounded-3xl border border-subtle shadow-sm flex flex-col">
          <h3 className="font-bold text-primary mb-6">Top Resources</h3>
          <div className="flex-1 min-h-[200px]">
            {topResources.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
                <PieChart>
                  <Pie
                    data={topResources}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {topResources.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted italic text-sm">No data</div>
            )}
          </div>
          <div className="mt-4 grid grid-cols-1 gap-2">
            {topResources.map((p, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-[10px] font-bold text-secondary uppercase truncate max-w-[120px]">{p.name}</span>
                </div>
                <span className="text-xs font-bold text-primary">{p.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Day of Week Peak (Bar) */}
        <div className="bg-surface p-6 rounded-3xl border border-subtle shadow-sm">
          <h3 className="font-bold text-primary mb-6">Peak Booking Days</h3>
          <div className="h-64 min-h-[256px]">
            {dayOfWeekData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={256}>
                <BarChart data={dayOfWeekData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                  <YAxis hide />
                  <Tooltip cursor={{ fill: 'var(--bg-raised)' }} contentStyle={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }} />
                  <Bar dataKey="value" name="Bookings" fill="var(--accent)" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted italic text-sm">No data</div>
            )}
          </div>
        </div>

        {/* Recent Bookings List */}
        <div className="lg:col-span-2 bg-surface rounded-3xl border border-subtle shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-subtle flex justify-between items-center">
            <h3 className="font-bold text-primary">Recent Bookings</h3>
            <Link to="/app/admin-review" className="text-xs font-bold text-muted hover:text-accent transition-colors flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold text-muted uppercase tracking-widest bg-raised">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Resource & User</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle">
                {recentBookings.map((booking) => {
                  const status = STATUS_CONFIG[booking.status] || STATUS_CONFIG.PENDING;
                  return (
                    <tr key={booking.id} className="hover:bg-raised/50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-xs font-bold text-primary">
                          {new Date(booking.startTime || booking.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-[10px] text-muted">
                          {new Date(booking.startTime || booking.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <p className="text-sm font-bold text-primary line-clamp-1 truncate max-w-[240px]">
                            {booking.resourceName || `Resource #${booking.resourceId}`}
                          </p>
                          <p className="text-[10px] font-bold text-muted uppercase tracking-tight">
                            User #{booking.userId}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wide border ${status.bg} ${status.color} ${status.border}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${status.color.replace('text', 'bg')}`} />
                          {status.label}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-1.5 text-muted hover:text-primary hover:bg-raised rounded-lg border border-transparent hover:border-subtle transition-all cursor-pointer bg-transparent">
                           <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BookingOfficerOverview;
