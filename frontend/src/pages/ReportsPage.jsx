import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchBookings } from '../services/api';
import { getTickets } from '../services/ticketApi';
import { useAuthStore } from '../store/authStore';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie,
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import {
  BarChart2, FileText, Download, Calendar, PieChart as PieIcon,
  TrendingUp, HardHat, CheckCircle2, AlertCircle, Sparkles, Filter, Shield
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ── Palette Config ── */
const THEME_COLORS = {
  primary: '#3b82f6', 
  secondary: '#8b5cf6', 
  success: '#10b981', 
  warning: '#f59e0b', 
  danger: '#ef4444', 
  neutral: '#6b7280'  
};

const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

const ReportsPage = () => {
  const { user } = useAuthStore();
  const [timeRange, setTimeRange] = useState('30'); 
  const [reportType, setReportType] = useState('OVERVIEW'); 

  // Enforce role perspectives
  useEffect(() => {
    if (user?.role === 'TECHNICIAN') setReportType('MAINTENANCE');
    else if (user?.role === 'BOOKING_OFFICER') setReportType('BOOKINGS');
    else if (user?.role === 'FACILITY_MANAGER') setReportType('FACILITIES');
    else setReportType('OVERVIEW');
  }, [user]);

  /* ── Queries ── */
  const { data: bookings = [] } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => fetchBookings({})
  });

  const { data: tickets = [] } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => getTickets()
  });

  /* ── Derived Reports State ── */
  const reportData = useMemo(() => {
    const now = new Date();
    const cutoffDate = new Date();
    cutoffDate.setDate(now.getDate() - parseInt(timeRange));

    const filteredBookings = bookings.filter(b => b.createdAt && new Date(b.createdAt) >= cutoffDate);
    const filteredTickets = tickets.filter(t => t.createdAt && new Date(t.createdAt) >= cutoffDate);

    /* 1. Bookings Status */
    const bookingStatusMap = { APPROVED: 0, PENDING: 0, CANCELLED: 0, REJECTED: 0 };
    filteredBookings.forEach(b => {
      if (bookingStatusMap[b.status] !== undefined) bookingStatusMap[b.status]++;
    });
    const bookingStatusData = Object.entries(bookingStatusMap).map(([name, value]) => ({ name, value }));

    /* 2. Maintenance Status */
    const ticketStatusMap = { OPEN: 0, IN_PROGRESS: 0, RESOLVED: 0 };
    filteredTickets.forEach(t => {
      if (ticketStatusMap[t.status] !== undefined) ticketStatusMap[t.status]++;
    });
    const ticketStatusData = Object.entries(ticketStatusMap).map(([name, value]) => ({ name, value }));

    /* 3. Trend Over Timeframe */
    const trendMap = {};
    for (let i = parseInt(timeRange); i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      trendMap[label] = { date: label, bookings: 0, issues: 0 };
    }

    filteredBookings.forEach(b => {
      const label = new Date(b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (trendMap[label]) trendMap[label].bookings++;
    });

    filteredTickets.forEach(t => {
      const label = new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (trendMap[label]) trendMap[label].issues++;
    });

    const timelineTrend = Object.values(trendMap);

    /* 4. Category breakdown */
    const categoryMap = {};
    filteredTickets.forEach(t => {
      const cat = t.category || 'General';
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });
    const categoryBreakdown = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

    return {
      totalBookings: filteredBookings.length,
      approvedBookings: bookingStatusMap.APPROVED,
      totalIssues: filteredTickets.length,
      resolvedIssues: ticketStatusMap.RESOLVED,
      bookingStatusData,
      ticketStatusData,
      timelineTrend,
      categoryBreakdown
    };
  }, [bookings, tickets, timeRange]);

  /* ── Simulation Export ── */
  const handleExport = (format) => {
    const toastId = toast.loading(`Generating ${format.toUpperCase()} Report...`);
    setTimeout(() => {
      toast.success(`${format.toUpperCase()} Report downloaded successfully`, { id: toastId });
    }, 1200);
  };

  /* ── Visibility mapping ── */
  const canSeeTab = (tab) => {
    if (user?.role === 'ADMIN') return true;
    if (tab === 'OVERVIEW' && ['ADMIN', 'USER'].includes(user?.role)) return true;
    if (tab === 'BOOKINGS' && ['BOOKING_OFFICER', 'ADMIN'].includes(user?.role)) return true;
    if (tab === 'MAINTENANCE' && ['TECHNICIAN', 'ADMIN'].includes(user?.role)) return true;
    if (tab === 'FACILITIES' && ['FACILITY_MANAGER', 'ADMIN'].includes(user?.role)) return true;
    return false;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-primary animate-in fade-in duration-500">
      
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary flex items-center gap-2">
            <BarChart2 className="w-8 h-8 text-accent animate-pulse" />
            {user?.role === 'ADMIN' ? 'Enterprise Analytics' : 
             user?.role === 'TECHNICIAN' ? 'Maintenance Intelligence' :
             user?.role === 'BOOKING_OFFICER' ? 'Space Occupancy Insights' :
             'Operations Dashboard'}
          </h1>
          <p className="text-sm text-muted mt-1 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-accent" /> Role perspective: <span className="font-bold text-accent uppercase">{user?.role}</span>
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Time range picker */}
          <div className="flex bg-raised border border-subtle p-1 rounded-xl">
            {[
              { id: '7', label: '7D' },
              { id: '30', label: '30D' },
              { id: '365', label: '1Y' }
            ].map(range => (
              <button
                key={range.id}
                onClick={() => setTimeRange(range.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all border-none ${
                  timeRange === range.id
                    ? 'bg-accent text-white shadow-md'
                    : 'text-muted hover:text-primary bg-transparent'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleExport('csv')}
            className="flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent-hover text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer border-none"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* ── Type Selector (Pills) ── */}
      <div className="flex bg-surface border border-subtle p-1 rounded-2xl mb-8 w-fit shadow-sm">
        {[
          { id: 'OVERVIEW', label: 'General Overview', icon: FileText },
          { id: 'BOOKINGS', label: 'Booking Stats', icon: Calendar },
          { id: 'MAINTENANCE', label: 'Incident Workflows', icon: HardHat },
          { id: 'FACILITIES', label: 'Space Inventory', icon: PieIcon }
        ]
        .filter(t => canSeeTab(t.id))
        .map(type => {
          const Icon = type.icon;
          return (
            <button
              key={type.id}
              onClick={() => setReportType(type.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-none ${
                reportType === type.id
                  ? 'bg-raised text-accent shadow-sm'
                  : 'text-muted hover:text-primary bg-transparent'
              }`}
            >
              <Icon className="w-4 h-4" />
              {type.label}
            </button>
          );
        })}
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {(user?.role === 'ADMIN' || user?.role === 'BOOKING_OFFICER' || user?.role === 'USER') && (
          <>
            <div className="bg-surface border border-subtle rounded-3xl p-6 shadow-md">
              <p className="text-[10px] font-black text-muted uppercase tracking-wider mb-1">Total Bookings</p>
              <h3 className="text-3xl font-black text-primary">{reportData.totalBookings}</h3>
            </div>
            <div className="bg-surface border border-subtle rounded-3xl p-6 shadow-md">
              <p className="text-[10px] font-black text-muted uppercase tracking-wider mb-1">Approved reservations</p>
              <h3 className="text-3xl font-black text-emerald-500">{reportData.approvedBookings}</h3>
            </div>
          </>
        )}

        {(user?.role === 'ADMIN' || user?.role === 'TECHNICIAN' || user?.role === 'FACILITY_MANAGER') && (
          <>
            <div className="bg-surface border border-subtle rounded-3xl p-6 shadow-md">
              <p className="text-[10px] font-black text-muted uppercase tracking-wider mb-1">Incident Tickets</p>
              <h3 className="text-3xl font-black text-amber-500">{reportData.totalIssues}</h3>
            </div>
            <div className="bg-surface border border-subtle rounded-3xl p-6 shadow-md">
              <p className="text-[10px] font-black text-muted uppercase tracking-wider mb-1">Resolved Orders</p>
              <h3 className="text-3xl font-black text-success">{reportData.resolvedIssues}</h3>
            </div>
          </>
        )}
      </div>

      {/* ── Operational Visualizations ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Timeline Trend Chart */}
        {(reportType === 'OVERVIEW' || reportType === 'BOOKINGS') && (
          <div className="lg:col-span-2 bg-surface border border-subtle rounded-3xl p-6 shadow-md">
            <h4 className="text-sm font-black text-primary mb-4">Daily Reservation Trend</h4>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%" minHeight={288}>
                <AreaChart data={reportData.timelineTrend}>
                  <defs>
                    <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={THEME_COLORS.primary} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={THEME_COLORS.primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                  <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
                  <Area type="monotone" dataKey="bookings" stroke={THEME_COLORS.primary} strokeWidth={2} fillOpacity={1} fill="url(#colorBookings)" name="Approved Bookings" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Category breakdown (Maintenance issues) */}
        {(reportType === 'OVERVIEW' || reportType === 'MAINTENANCE') && (
          <div className="bg-surface border border-subtle rounded-3xl p-6 shadow-md flex flex-col justify-between">
            <h4 className="text-sm font-black text-primary mb-6">Issue Category Mix</h4>
            <div className="h-56 w-full flex-1">
              {reportData.categoryBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%" minHeight={224}>
                  <PieChart>
                    <Pie data={reportData.categoryBreakdown} innerRadius={50} outerRadius={75} paddingAngle={6} dataKey="value">
                      {reportData.categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-muted italic">No data</div>
              )}
            </div>
          </div>
        )}

        {/* Booking Status split */}
        {reportType === 'BOOKINGS' && (
          <div className="bg-surface border border-subtle rounded-3xl p-6 shadow-md">
            <h4 className="text-sm font-black text-primary mb-4">Fulfillment Ratios</h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%" minHeight={256}>
                <BarChart data={reportData.bookingStatusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                  <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }} />
                  <Bar dataKey="value" fill={THEME_COLORS.primary} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Maintenance Breakdown */}
        {reportType === 'MAINTENANCE' && (
          <div className="lg:col-span-2 bg-surface border border-subtle rounded-3xl p-6 shadow-md">
            <h4 className="text-sm font-black text-primary mb-4">Pipeline Breakdown</h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%" minHeight={256}>
                <BarChart data={reportData.ticketStatusData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                  <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }} />
                  <Bar dataKey="value" fill={THEME_COLORS.warning} radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Space Capacity (Facilities) */}
        {reportType === 'FACILITIES' && (
          <div className="lg:col-span-3 bg-surface border border-subtle rounded-3xl p-6 shadow-md text-center py-20 text-muted">
            <PieIcon className="w-12 h-12 text-accent mx-auto mb-4 opacity-50" />
            <h5 className="font-bold text-primary mb-1">Space Optimization Modules</h5>
            <p className="text-xs max-w-sm mx-auto">Tracking architectural deployments and spatial safety protocols securely.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default ReportsPage;
