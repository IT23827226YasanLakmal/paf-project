import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchResources, fetchFacilityStats } from '../services/api';
import {
  Users, Activity, Calendar, Shield, MapPin, Sparkles, 
  Clock, CheckCircle, AlertTriangle, Building, ArrowUpRight
} from 'lucide-react';

const FacilityDashboard = () => {
    const { data: resources = [], isLoading: isResourcesLoading } = useQuery({
        queryKey: ['resources', null],
        queryFn: () => fetchResources(null)
    });

    const { data: facilityStats, isLoading: isStatsLoading } = useQuery({
        queryKey: ['facilityStats'],
        queryFn: () => fetchFacilityStats()
    });

    const [timeRange, setTimeRange] = useState('This week');

    // Derived analytics
    const totalNodes = useMemo(() => facilityStats?.totalResources ?? resources.length, [facilityStats, resources]);
    const lectureHalls = useMemo(() => facilityStats?.lectureHalls ?? resources.filter(r => r.type === 'LECTURE_HALL').length, [facilityStats, resources]);
    const labs = useMemo(() => facilityStats?.labs ?? resources.filter(r => r.type === 'LAB').length, [facilityStats, resources]);
    const healthScore = useMemo(() => facilityStats?.healthScore ?? '98%', [facilityStats]);
    const interactionIncrease = useMemo(() => facilityStats?.interactionIncrease ?? '+180%', [facilityStats]);

    // Occupancy breakdown
    const occupancy = useMemo(() => facilityStats?.occupancy ?? [
        { day: 'Mon', count: 45 },
        { day: 'Tue', count: 72 },
        { day: 'Wed', count: 68 },
        { day: 'Thu', count: 85 },
        { day: 'Fri', count: 50 },
        { day: 'Sat', count: 12 },
        { day: 'Sun', count: 8 }
    ], [facilityStats]);

    if (isResourcesLoading || isStatsLoading) return <div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div></div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            
            {/* ── Dashboard Header ── */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-primary flex items-center gap-2.5">
                        <Building className="w-8 h-8 text-accent animate-pulse" />
                        Facility Overview
                    </h1>
                    <p className="text-sm text-muted mt-1 flex items-center gap-1.5">
                        <Shield className="w-4 h-4 text-accent" /> Role perspective: <span className="font-bold text-accent uppercase">FACILITY_MANAGER</span>
                    </p>
                </div>
                <div className="flex bg-raised p-1 rounded-xl border border-subtle shadow-sm">
                    {['Today', 'This week', 'This month'].map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                                timeRange === range
                                    ? 'bg-accent text-white shadow-md'
                                    : 'text-muted hover:text-primary'
                            }`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Primary Analytical Content Grid ── */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* 1. Meeting Room Occupancy Chart */}
                <div className="xl:col-span-2 bg-surface rounded-3xl p-6 shadow-sm flex flex-col" style={{ border: '1px solid var(--border-subtle)' }}>
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-primary">Space Occupancy</h3>
                            <p className="text-xs text-muted">Averaged across active campus areas</p>
                        </div>
                        <span className="text-2xl font-extrabold text-accent flex items-center gap-1 animate-pulse">
                            72 <span className="text-xs font-medium text-secondary">People/Avg</span>
                        </span>
                    </div>

                    {/* Bar visual map */}
                    <div className="flex-1 flex items-end justify-between gap-2 pt-6 min-h-[220px]">
                        {occupancy.map((o, idx) => {
                            const pct = Math.max(10, Math.min(100, (o.count / 100) * 100));
                            return (
                                <div key={idx} className="flex-1 flex flex-col items-center gap-3 group">
                                    <span className="text-xs font-bold text-muted opacity-0 group-hover:opacity-100 transition-opacity mb-1">{o.count}</span>
                                    <div className="w-full bg-raised rounded-xl overflow-hidden flex items-end relative h-[160px]">
                                        <div 
                                            className="w-full bg-gradient-to-t from-accent to-accent/60 rounded-t-xl transition-all duration-1000 ease-out group-hover:brightness-110"
                                            style={{ height: `${pct}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-bold text-primary">{o.day}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 2. Frequency & Health Gauges */}
                <div className="bg-surface rounded-3xl p-6 shadow-sm flex flex-col justify-between" style={{ border: '1px solid var(--border-subtle)' }}>
                    <div>
                        <h3 className="text-lg font-bold text-primary mb-1">Asset Frequency</h3>
                        <p className="text-xs text-muted">Weekly interaction rates</p>
                    </div>

                    <div className="flex flex-col items-center justify-center py-6 relative">
                        {/* Gauge container */}
                        <div className="w-40 h-20 overflow-hidden relative flex items-end">
                            <div className="w-40 h-40 border-[14px] border-muted-fill rounded-full absolute top-0 left-0" />
                            <div 
                                className="w-40 h-40 border-[14px] border-accent rounded-full absolute top-0 left-0 transition-transform duration-1000 ease-out" 
                                style={{ transform: 'rotate(135deg)', clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)' }}
                            />
                        </div>
                        <div className="text-center mt-4">
                            <span className="text-3xl font-black text-primary tracking-tight">{interactionIncrease}</span>
                            <p className="text-xs text-secondary font-medium mt-0.5">Interaction increase</p>
                        </div>
                    </div>

                    <div className="space-y-2 text-xs font-semibold text-muted bg-raised p-3.5 rounded-2xl border border-subtle">
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-amber-500 rounded-full" /> Moderate Load</span>
                            <span className="text-primary">1-2 days/week</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-accent rounded-full" /> Intensive Load</span>
                            <span className="text-primary">3-5 days/week</span>
                        </div>
                    </div>
                </div>

            </div>

            {/* ── Secondary Descriptive Info Tiles ── */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { title: 'Total Resources', value: totalNodes, desc: 'Managed assets', icon: Building, color: 'text-blue-500' },
                    { title: 'Lecture Halls', value: lectureHalls, desc: 'Ready for use', icon: Users, color: 'text-violet-500' },
                    { title: 'Labs', value: labs, desc: 'Allocated blocks', icon: Activity, color: 'text-emerald-500' },
                    { title: 'Health Score', value: healthScore, desc: 'Optimal operations', icon: Shield, color: 'text-accent' }
                ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                        <div key={i} className="bg-surface p-5 rounded-2xl shadow-sm space-y-3" style={{ border: '1px solid var(--border-subtle)' }}>
                            <div className="flex justify-between items-start">
                                <div className="w-9 h-9 bg-raised rounded-xl flex items-center justify-center flex-shrink-0" style={{ border: '1px solid var(--border-subtle)' }}>
                                    <Icon className={`w-4 h-4 ${item.color}`} />
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-muted opacity-40" />
                            </div>
                            <div>
                                <p className="text-xs text-muted font-medium">{item.title}</p>
                                <h3 className="text-2xl font-black text-primary tracking-tight mt-0.5">{item.value}</h3>
                                <p className="text-[10px] text-secondary font-medium mt-1">{item.desc}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default FacilityDashboard;
