import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { fetchBookings, fetchResources } from '../services/api';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  Tooltip as ReTooltip, CartesianGrid,
} from 'recharts';
import {
  MapPin, Users, Activity, ArrowRight, Clock,
  CheckCircle2, XCircle, AlertCircle, TrendingUp, Sparkles,
  Plus, CalendarDays,
} from 'lucide-react';

/* ---------- helpers ---------- */
const getDayLabel = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};
const todayLabel = () =>
  new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

const buildChartData = (bookings, range) => {
  const days = range === 'Week' ? 7 : range === 'Month' ? 30 : 365;
  const now = new Date();
  const buckets = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    buckets[key] = 0;
  }
  bookings.forEach((b) => {
    const key = b.startTime?.slice(0, 10);
    if (key && key in buckets) buckets[key]++;
  });
  const entries = Object.entries(buckets);
  const step = range === 'Year' ? Math.ceil(entries.length / 12) : range === 'Month' ? 5 : 1;
  return entries.map(([date, count], i) => ({
    label: i % step === 0 ? getDayLabel(date) : '',
    Bookings: count,
  }));
};

/* Status config */
const S_CFG = {
  PENDING:   { color: 'text-amber-500',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20',  icon: AlertCircle },
  APPROVED:  { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle2 },
  REJECTED:  { color: 'text-red-500',    bg: 'bg-red-500/10',    border: 'border-red-500/20',    icon: XCircle },
  CANCELLED: { color: 'text-muted',      bg: 'bg-muted-fill',    border: 'border-subtle',         icon: XCircle },
};

const TYPE_COLOR = {
  LAB:          { bg: 'bg-blue-500/10',    icon: 'text-blue-500',   label: 'LAB',          labelBg: 'bg-blue-500/10 text-blue-500' },
  LECTURE_HALL: { bg: 'bg-violet-500/10',  icon: 'text-violet-500', label: 'LECTURE HALL', labelBg: 'bg-violet-500/10 text-violet-500' },
  EQUIPMENT:    { bg: 'bg-orange-500/10', icon: 'text-orange-500', label: 'EQUIPMENT',    labelBg: 'bg-orange-500/10 text-orange-500' },
};

/* ---------- sub-components ---------- */
const StatPill = ({ label, value, max, color }) => {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm text-secondary font-medium">{label}</span>
        <span className="text-sm font-bold text-primary">{value}/{max}</span>
      </div>
      <div className="w-full h-2 bg-muted-fill rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

const ResourceBookCard = ({ resource, onBook }) => {
  const cfg = TYPE_COLOR[resource.type] || TYPE_COLOR.EQUIPMENT;
  return (
    <div
      className="bg-surface rounded-2xl p-4 transition-all duration-200 group hover:shadow-md"
      style={{ border: '1px solid var(--border-subtle)' }}
    >
      <div className="flex justify-between items-start mb-3">
        <div className={`w-8 h-8 ${cfg.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
          <Activity className={`w-4 h-4 ${cfg.icon}`} />
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${cfg.labelBg}`}>
          {cfg.label}
        </span>
      </div>
      <h4 className="font-bold text-primary text-sm mb-1">{resource.name}</h4>
      {resource.location && (
        <div className="flex items-center gap-1 text-xs text-muted mb-1">
          <MapPin className="w-3 h-3" /> {resource.location}
        </div>
      )}
      {resource.capacity && (
        <div className="flex items-center gap-1 text-xs text-muted mb-3">
          <Users className="w-3 h-3" /> Capacity: {resource.capacity}
        </div>
      )}
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1 text-xs text-emerald-500 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
          Available now
        </span>
        <button
          onClick={() => onBook(resource)}
          className="flex items-center gap-1 px-3 py-1.5 bg-accent hover-bg-accent text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
        >
          Book <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="bg-overlay shadow-xl rounded-xl px-3 py-2"
        style={{ border: '1px solid var(--border-subtle)' }}
      >
        <p className="text-xs text-muted mb-0.5">{label}</p>
        <p className="text-sm font-bold text-primary">{payload[0].value} bookings</p>
      </div>
    );
  }
  return null;
};

/* ---------- Main DashboardPage ---------- */
const DashboardPage = ({ onBookResource }) => {
  const { user } = useAuthStore();
  const [chartRange, setChartRange] = useState('Month');

  const { data: bookings = [] } = useQuery({
    queryKey: ['bookings', 'my', user?.id],
    queryFn: () => fetchBookings({ userId: user?.id || 1 }),
  });

  const { data: resources = [] } = useQuery({
    queryKey: ['resources', null],
    queryFn: () => fetchResources(null),
  });

  const activeResources = useMemo(
    () => resources.filter((r) => r.status === 'ACTIVE').slice(0, 4),
    [resources]
  );

  const pending  = bookings.filter((b) => b.status === 'PENDING').length;
  const approved = bookings.filter((b) => b.status === 'APPROVED').length;
  const total    = bookings.length;

  const chartData = useMemo(() => buildChartData(bookings, chartRange), [bookings, chartRange]);

  const recent = useMemo(
    () => [...bookings].sort((a, b) => new Date(b.startTime) - new Date(a.startTime)).slice(0, 5),
    [bookings]
  );

  return (
    <div className="flex gap-6 min-h-0">
      {/* ── LEFT MAIN COLUMN ── */}
      <div className="flex-1 min-w-0 space-y-6">

        {/* Greeting */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted font-medium mb-1">{todayLabel()}</p>
            <h1 className="text-2xl font-extrabold text-primary tracking-tight leading-tight flex items-center gap-2.5">
              {getGreeting()},{' '}
              <span className="text-accent">{user?.name?.split(' ')[0] || 'there'}</span>
              <Sparkles className="w-5 h-5 text-accent opacity-80" strokeWidth={1.5} />
            </h1>
            {pending > 0 ? (
              <p className="text-secondary mt-1 text-sm">
                You have <span className="font-semibold text-primary">{pending}</span> pending booking{pending !== 1 ? 's' : ''} and{' '}
                <span className="font-semibold text-primary">{approved}</span> starting soon.
              </p>
            ) : (
              <p className="text-secondary mt-1 text-sm">All caught up — no pending bookings.</p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 flex-shrink-0 mt-1">
            <button
              onClick={() => window.location.href = '/app/catalogue'}
              className="flex items-center gap-2 px-4 py-2 bg-accent hover-bg-accent text-white text-sm font-semibold rounded-xl shadow-sm transition-colors cursor-pointer border-none"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              Book Resource
            </button>
          </div>
        </div>

        {/* Booking Activity Chart */}
        <div
          className="bg-surface rounded-2xl p-6 shadow-sm"
          style={{ border: '1px solid var(--border-subtle)' }}
        >
          <div className="flex items-center justify-between mb-1">
            <div>
              <h2 className="font-bold text-primary text-base">Booking Activity</h2>
              <p className="text-xs text-muted mt-0.5">Track your reservation history</p>
            </div>
            <div className="flex items-center gap-1 p-1 bg-muted-fill rounded-xl">
              {['Week', 'Month', 'Year'].map((r) => (
                <button
                  key={r}
                  onClick={() => setChartRange(r)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    chartRange === r
                      ? 'bg-accent text-white shadow-sm'
                      : 'text-muted hover:text-primary'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Total bookings pill */}
          <div className="flex items-center gap-4 mb-6 mt-4">
            <div className="bg-accent-subtle rounded-xl px-4 py-3 flex flex-col">
              <span className="text-xl font-black text-accent">+{total}</span>
              <span className="text-xs text-secondary font-medium mt-0.5">Total Bookings</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-secondary">
              <TrendingUp className="w-4 h-4 text-muted" />
              <span>— Bookings</span>
            </div>
          </div>

          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%" minHeight={180}>
              <LineChart data={chartData} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <ReTooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border-subtle)', strokeWidth: 1 }} />
                <Line
                  type="monotone"
                  dataKey="Bookings"
                  stroke="var(--accent)"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: 'var(--accent)', strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* My Bookings summary */}
          <div
            className="bg-surface rounded-2xl p-5 shadow-sm"
            style={{ border: '1px solid var(--border-subtle)' }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-primary">My Bookings</h3>
              <button
                onClick={() => window.location.href = '/app/my-bookings'}
                className="text-xs font-semibold text-accent hover:underline flex items-center gap-1 cursor-pointer"
              >
                View All <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-4">
              <StatPill label="Approved" value={approved} max={total || 1} color="bg-emerald-500" />
              <StatPill label="Pending" value={pending} max={total || 1} color="bg-amber-500" />
              <StatPill label="Rejected" value={bookings.filter(b => b.status === 'REJECTED').length} max={total || 1} color="bg-red-500" />
            </div>
          </div>

          {/* Recent Activity */}
          <div
            className="bg-surface rounded-2xl p-5 shadow-sm"
            style={{ border: '1px solid var(--border-subtle)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-primary">Recent Activity</h3>
              <span className="text-xs text-muted font-medium">Last 5</span>
            </div>
            {recent.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <Clock className="w-8 h-8 text-muted mb-2" />
                <p className="text-sm text-muted">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {recent.map((b) => {
                  const cfg = S_CFG[b.status] || S_CFG.CANCELLED;
                  const Icon = cfg.icon;
                  const dateStr = b.startTime
                    ? new Date(b.startTime).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : '';
                  return (
                    <div
                      key={b.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border ${cfg.bg} ${cfg.border}`}
                    >
                      <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${cfg.color}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-primary truncate">
                          {b.resourceName || `Resource #${b.resourceId}`}
                        </p>
                        <p className="text-xs text-secondary mt-0.5">{dateStr}</p>
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wide flex-shrink-0 ${cfg.color}`}>
                        {b.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── RIGHT COLUMN: Book a Resource ── */}
      <div className="w-72 flex-shrink-0 hidden xl:block">
        <div
          className="bg-surface rounded-2xl p-5 shadow-sm sticky top-6"
          style={{ border: '1px solid var(--border-subtle)' }}
        >
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-primary">Book a Resource</h3>
            <ArrowRight className="w-4 h-4 text-muted" />
          </div>
          <p className="text-xs text-muted mb-5">Available spaces &amp; equipment</p>
          <div className="space-y-3">
            {activeResources.length === 0 ? (
              <p className="text-sm text-muted text-center py-8">No resources available</p>
            ) : (
              activeResources.map((r) => (
                <ResourceBookCard key={r.id} resource={r} onBook={onBookResource} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
