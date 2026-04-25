import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { fetchBookings, fetchResources } from '../services/api';
import {
  Calendar, CheckCircle, Clock, AlertCircle, ArrowRight,
  PlusCircle, LifeBuoy, Bookmark, Sparkles, LayoutGrid
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UserOverview = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();

    // Fetch Bookings
    const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
        queryKey: ['bookings', 'my', user?.id],
        queryFn: () => fetchBookings({ userId: user?.id || 1 }),
    });

    // Fetch resources (to display active spaces in quick-actions optionally)
    const { data: resources = [] } = useQuery({
        queryKey: ['resources'],
        queryFn: () => fetchResources(null),
    });

    const activeBookings = useMemo(() => 
        bookings.filter(b => b.status === 'APPROVED' && new Date(b.endTime) >= new Date()),
        [bookings]
    );

    const pendingBookings = useMemo(() => 
        bookings.filter(b => b.status === 'PENDING'),
        [bookings]
    );

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-primary">
            
            {/* ── Welcome Banner ── */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-accent/20 via-accent/5 to-surface border border-subtle p-8 md:p-10">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2 bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-bold w-fit">
                            <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Welcome back
                        </div>
                        <h1 className="text-3xl font-black tracking-tight leading-tight md:text-4xl">
                            {getGreeting()}, {user?.name || 'Student'}
                        </h1>
                        <p className="text-secondary mt-2 text-sm md:text-base max-w-md">
                            Browse your reserved learning spaces, monitor ticket resolutions, and plan your campus schedule effortlessly.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3 flex-shrink-0">
                        <button 
                            onClick={() => navigate('/app/my-bookings')} 
                            className="inline-flex items-center px-5 py-3 bg-accent hover-bg-accent text-white text-sm font-bold rounded-2xl shadow-sm transition-all cursor-pointer border-none"
                        >
                            <Calendar className="w-4 h-4 mr-2" strokeWidth={2.5} /> View My Bookings
                        </button>
                    </div>
                </div>
                <div className="absolute top-0 right-0 bottom-0 left-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* ── Key Metrics ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Active Bookings */}
                <div className="bg-surface rounded-2xl p-6 border border-subtle shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-muted">Upcoming spaces</p>
                        <h3 className="text-2xl font-black mt-1 text-emerald-500">
                            {activeBookings.length}
                        </h3>
                        <p className="text-xs text-secondary mt-1 font-medium">Valid reservations</p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 flex-shrink-0">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                </div>

                {/* Pending Requests */}
                <div className="bg-surface rounded-2xl p-6 border border-subtle shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-muted">Pending Reviews</p>
                        <h3 className="text-2xl font-black mt-1 text-amber-500">
                            {pendingBookings.length}
                        </h3>
                        <p className="text-xs text-secondary mt-1 font-medium">Awaiting response</p>
                    </div>
                    <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 flex-shrink-0">
                        <Clock className="w-6 h-6" />
                    </div>
                </div>

                {/* Total Bookings */}
                <div className="bg-surface rounded-2xl p-6 border border-subtle shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-muted">Total Activity</p>
                        <h3 className="text-2xl font-black mt-1 text-accent">
                            {bookings.length}
                        </h3>
                        <p className="text-xs text-secondary mt-1 font-medium">Overall lifecycle</p>
                    </div>
                    <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent flex-shrink-0">
                        <Bookmark className="w-6 h-6" />
                    </div>
                </div>

            </div>

            {/* ── Layout Break ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* 1. Schedule Breakdown */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold tracking-tight">Your Upcoming Reservations</h2>
                        <button 
                            onClick={() => navigate('/app/my-bookings')}
                            className="text-xs font-semibold text-accent hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-none"
                        >
                            View history <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {bookingsLoading ? (
                        <div className="bg-surface p-8 rounded-2xl border border-subtle text-center text-muted text-sm font-medium">
                            Loading schedule...
                        </div>
                    ) : activeBookings.length === 0 ? (
                        <div className="bg-raised/50 p-10 rounded-3xl border border-subtle text-center">
                            <Calendar className="w-10 h-10 text-muted mx-auto mb-3" />
                            <p className="text-primary font-bold text-base">No active reservations</p>
                            <p className="text-muted text-xs mt-1 max-w-xs mx-auto">
                                Check support operations if assistance is required.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {activeBookings.map((b) => (
                                <div key={b.id} className="bg-surface rounded-2xl p-4 border border-subtle flex items-center justify-between gap-4 group hover:shadow-md transition-all duration-200">
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-primary truncate">{b.resourceName || `Resource #${b.resourceId}`}</p>
                                        <div className="flex items-center gap-2 mt-1.5 text-xs text-muted">
                                            <span>{new Date(b.startTime).toLocaleDateString()}</span>
                                            <span>•</span>
                                            <span>{new Date(b.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-bold rounded-full flex-shrink-0">
                                        Approved
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 2. Self Service Actions */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold tracking-tight">Help Center</h2>
                    
                    <div className="bg-surface rounded-2xl border border-subtle p-5 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-accent/10 text-accent flex items-center justify-center rounded-xl">
                                <LifeBuoy className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold">Support Resolution</h4>
                                <p className="text-xs text-muted mt-0.5">Report hardware or logistics issues.</p>
                            </div>
                        </div>

                        <button 
                            onClick={() => navigate('/app/technician/tickets')} 
                            className="w-full flex items-center justify-center gap-2 py-3 bg-raised hover:bg-muted-fill border border-subtle rounded-xl text-primary text-sm font-bold transition-all cursor-pointer"
                        >
                            Open Ticketing Workspace
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default UserOverview;
