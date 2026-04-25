import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTickets } from '../services/ticketApi';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, 
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { 
  Package, ChevronRight, MoreHorizontal, AlertCircle, 
  CheckCircle2, Hammer, Activity, Plus
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

/* ---------- Config & Helpers ---------- */
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const STATUS_CONFIG = {
  OPEN: { label: 'Open', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', icon: Package },
  IN_PROGRESS: { label: 'In Progress', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', icon: Hammer },
  RESOLVED: { label: 'Resolved', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: CheckCircle2 },
};

const PRIORITY_COLORS = {
  URGENT: '#ef4444',
  HIGH: '#f59e0b',
  MEDIUM: '#3b82f6',
  LOW: '#64748b',
};

const TechnicianOverview = () => {
  const { user } = useAuthStore();
  
  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => getTickets()
  });

  /* ---------- Calculations ---------- */
  const stats = useMemo(() => {
    const total = tickets.length;
    const active = tickets.filter(t => ['OPEN', 'IN_PROGRESS'].includes(t.status)).length;
    const resolved = tickets.filter(t => t.status === 'RESOLVED').length;
    const urgent = tickets.filter(t => t.priority === 'URGENT').length;
    return { total, active, resolved, urgent };
  }, [tickets]);

  const categoryData = useMemo(() => {
    const counts = tickets.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [tickets]);

  const priorityData = useMemo(() => {
    const counts = tickets.reduce((acc, t) => {
      acc[t.priority] = (acc[t.priority] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [tickets]);

  const recentTickets = useMemo(() => {
    return [...tickets].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);
  }, [tickets]);

  if (isLoading) return <div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 min-h-0 text-primary">
      
      {/* ── Breadcrumbs & Top Action ── */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="text-muted">Support</span>
          <ChevronRight className="w-4 h-4 text-muted" />
          <span className="text-primary font-bold">Technician Overview</span>
        </div>
        
        <button className="flex items-center gap-2 bg-accent hover-bg-accent text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all border-none cursor-pointer">
          <Plus className="w-4 h-4" />
          Add New
        </button>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'All tickets', value: stats.total, icon: <Package className="w-6 h-6 text-slate-400" /> },
          { label: 'Active tickets', value: stats.active, icon: <Activity className="w-6 h-6 text-blue-400" /> },
          { label: 'Resolved total', value: stats.resolved, icon: <CheckCircle2 className="w-6 h-6 text-emerald-400" /> },
          { label: 'Urgent issues', value: stats.urgent, icon: <AlertCircle className="w-6 h-6 text-red-400" /> },
        ].map((stat, i) => (
          <div key={i} className="bg-surface p-6 rounded-2xl border border-subtle shadow-sm flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-muted uppercase tracking-wider mb-2">{stat.label}</p>
              <h3 className="text-3xl font-black text-primary">{stat.value.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-muted-fill rounded-xl">
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Ticket Volume Trend */}
        <div className="lg:col-span-2 bg-surface p-6 rounded-2xl border border-subtle shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-primary">Ticket Resolution Trend</h3>
              <p className="text-xs text-muted mt-1">Overview of solved vs incoming tickets</p>
            </div>
            <select className="bg-muted-fill border-none text-primary rounded-lg text-xs font-bold px-3 py-1.5 outline-none cursor-pointer">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
            </select>
          </div>
          
          <div className="h-64 w-full min-h-[256px]">
            {tickets.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={256}>
                <LineChart data={[
                  { name: 'Mon', solved: 4, open: 6 },
                  { name: 'Tue', solved: 7, open: 5 },
                  { name: 'Wed', solved: 5, open: 8 },
                  { name: 'Thu', solved: 10, open: 4 },
                  { name: 'Fri', solved: 8, open: 7 },
                  { name: 'Sat', solved: 3, open: 2 },
                  { name: 'Sun', solved: 4, open: 3 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                  <Tooltip contentStyle={{ background: 'var(--bg-overlay)', color: 'var(--text-primary)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }} />
                  <Line type="monotone" dataKey="solved" stroke="#10b981" strokeWidth={4} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="open" stroke="#3b82f6" strokeWidth={4} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted italic text-sm">No ticket data available</div>
            )}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-surface p-6 rounded-2xl border border-subtle shadow-sm flex flex-col">
          <h3 className="font-bold text-primary mb-6">Ticket Priority</h3>
          <div className="flex-1 min-h-[200px]">
            {tickets.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
                <PieChart>
                  <Pie
                    data={priorityData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.name] || '#cbd5e1'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted italic text-sm">No data</div>
            )}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {priorityData.map((p, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PRIORITY_COLORS[p.name] }} />
                <span className="text-[10px] font-bold text-muted uppercase">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Category Breakdown (Bar) */}
        <div className="bg-surface p-6 rounded-2xl border border-subtle shadow-sm">
          <h3 className="font-bold text-primary mb-6">Average tickets created</h3>
          <div className="h-64 min-h-[256px]">
            {tickets.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={256}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                  <YAxis hide />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted italic text-sm">No data</div>
            )}
          </div>
        </div>

        {/* Recent Tickets List */}
        <div className="lg:col-span-2 bg-surface rounded-2xl border border-subtle shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-subtle flex justify-between items-center">
            <h3 className="font-bold text-primary">Recent tickets</h3>
            <button className="text-xs font-bold text-muted hover:text-primary transition-colors flex items-center gap-1 bg-transparent border-none cursor-pointer">
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold text-muted uppercase tracking-widest bg-muted-fill">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Ticket</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle">
                {recentTickets.map((ticket, i) => {
                  const status = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.OPEN;
                  const StatusIcon = status.icon;
                  return (
                    <tr key={ticket.id} className="hover:bg-muted-fill transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-xs font-bold text-primary">{new Date(ticket.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <p className="text-sm font-bold text-primary line-clamp-1 truncate max-w-[240px]">{ticket.description}</p>
                          <p className="text-[10px] font-bold text-muted uppercase tracking-tight">{ticket.category}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border ${status.bg} ${status.color} ${status.border}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${status.color.replace('text', 'bg')}`} />
                          {status.label}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-1.5 text-muted hover:text-primary hover:bg-muted-fill rounded-lg border border-transparent hover:border-subtle transition-all shadow-sm bg-transparent cursor-pointer">
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

export default TechnicianOverview;
