import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAdminStats } from '../services/api';
import { useAuthStore } from '../store/authStore';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import {
  ShieldAlert, Users, Wrench, Calendar, Sparkles, ArrowRight,
  TrendingUp, CheckCircle2, Clock, AlertCircle, Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminOverview = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [chartRange, setChartRange] = useState('Month');

    const { data: adminStats, isLoading } = useQuery({
        queryKey: ['adminStats'],
        queryFn: () => fetchAdminStats(),
    });
    
    // Stats calculations
    const stats = useMemo(() => {
        if (!adminStats) return { totalBookings: 0, pendingBookings: 0, activeResources: 0, openTickets: 0 };
        return { 
            totalBookings: adminStats.totalBookings, 
            pendingBookings: adminStats.pendingBookings, 
            activeResources: adminStats.activeResources, 
            openTickets: adminStats.openTickets 
        };
    }, [adminStats]);

    const bookingFlowData = adminStats?.bookingFlow || [];

    if (isLoading) return <div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div></div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-primary">

            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-primary tracking-tight leading-tight flex items-center gap-3">
                        <ShieldAlert className="w-8 h-8 text-accent flex-shrink-0 animate-pulse" />
                        System Administrator Hub
                    </h1>
                    <p className="text-sm text-muted mt-1 flex items-center gap-1.5">
                        <Shield className="w-4 h-4 text-accent" /> Role perspective: <span className="font-bold text-accent uppercase">{user?.role}</span>
                    </p>
                </div>
            </div>

            {/* ── Master Dash Counters ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                <div className="bg-surface rounded-2xl p-6 border border-subtle shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-muted uppercase tracking-wider">Gross Reservations</p>
                        <h3 className="text-3xl font-black text-primary mt-1">{stats.totalBookings}</h3>
                        <p className="text-xs text-secondary mt-1 font-medium">All historical entries</p>
                    </div>
                    <div className="w-12 h-12 bg-accent/10 text-accent rounded-2xl flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-surface rounded-2xl p-6 border border-subtle shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-muted uppercase tracking-wider">Awaiting Decisions</p>
                        <h3 className="text-3xl font-black text-amber-500 mt-1">{stats.pendingBookings}</h3>
                        <p className="text-xs text-secondary mt-1 font-medium">Require fast approval</p>
                    </div>
                    <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <Clock className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-surface rounded-2xl p-6 border border-subtle shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-muted uppercase tracking-wider">Deployed Assets</p>
                        <h3 className="text-3xl font-black text-emerald-500 mt-1">{stats.activeResources}</h3>
                        <p className="text-xs text-secondary mt-1 font-medium">Live available clusters</p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <Wrench className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-surface rounded-2xl p-6 border border-subtle shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-muted uppercase tracking-wider">Open Tickets</p>
                        <h3 className="text-3xl font-black text-red-500 mt-1">{stats.openTickets}</h3>
                        <p className="text-xs text-secondary mt-1 font-medium">Unresolved reports</p>
                    </div>
                    <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                </div>

            </div>

            {/* ── Secondary Layout ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Visual Statistics */}
                <div className="lg:col-span-2 bg-surface p-6 rounded-2xl border border-subtle flex flex-col shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-bold text-primary text-base">Booking Flow Dynamics</h3>
                            <p className="text-xs text-muted mt-0.5">Statistical scaling matrices</p>
                        </div>
                        <div className="flex items-center gap-1 p-1 bg-muted-fill rounded-xl">
                            {['Week', 'Month'].map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setChartRange(r)}
                                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border-none ${
                                        chartRange === r ? 'bg-accent text-white' : 'text-muted hover:text-primary bg-transparent'
                                    }`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-64 flex-1">
                        <ResponsiveContainer width="100%" height="100%" minHeight={256}>
                            <AreaChart data={bookingFlowData}>
                                <defs>
                                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-subtle)', borderRadius: '12px' }} />
                                <Area type="monotone" dataKey="val" stroke="var(--accent)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorVal)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Direct Control Operations */}
                <div className="bg-surface p-6 rounded-2xl border border-subtle shadow-sm space-y-4">
                    <h3 className="font-bold text-primary text-base">Internal Command Nodes</h3>
                    
                    <div className="space-y-2">
                        <button 
                            onClick={() => navigate('/app/booking-officer/review')}
                            className="w-full flex items-center justify-between p-4 bg-raised hover:bg-muted-fill border border-subtle rounded-xl text-sm font-bold text-primary transition-all cursor-pointer"
                        >
                            <span className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-accent" /> Booking Admin
                            </span>
                            <ArrowRight className="w-4 h-4 text-muted" />
                        </button>

                        <button 
                            onClick={() => navigate('/app/facility-manager/overview')}
                            className="w-full flex items-center justify-between p-4 bg-raised hover:bg-muted-fill border border-subtle rounded-xl text-sm font-bold text-primary transition-all cursor-pointer"
                        >
                            <span className="flex items-center gap-2">
                                <Wrench className="w-4 h-4 text-accent" /> Facility Admin
                            </span>
                            <ArrowRight className="w-4 h-4 text-muted" />
                        </button>

                        <button 
                            onClick={() => navigate('/app/admin/users')}
                            className="w-full flex items-center justify-between p-4 bg-raised hover:bg-muted-fill border border-subtle rounded-xl text-sm font-bold text-primary transition-all cursor-pointer"
                        >
                            <span className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-accent" /> User Management
                            </span>
                            <ArrowRight className="w-4 h-4 text-muted" />
                        </button>
                    </div>

                </div>

            </div>

        </div>
    );
};

export default AdminOverview;
