import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchBookings, fetchResources } from '../services/api';
import { getTickets } from '../services/ticketApi';
import { useAuthStore } from '../store/authStore';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie,
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import {
  BarChart2, FileText, Download, Calendar, PieChart as PieIcon,
  TrendingUp, HardHat, CheckCircle2, AlertCircle, Sparkles, Filter, Shield, Laptop
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
  const [facilityTypeFilter, setFacilityTypeFilter] = useState('ALL');
  const [facilityStatusFilter, setFacilityStatusFilter] = useState('ALL'); 
  const [equipmentStatusFilter, setEquipmentStatusFilter] = useState('ALL');
  const [equipmentLocationFilter, setEquipmentLocationFilter] = useState('ALL');
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
    queryFn: () => fetchBookings({}),
    refetchInterval: 5000
  });

  const { data: tickets = [] } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => getTickets(),
    refetchInterval: 5000
  });

  const { data: resources = [] } = useQuery({
    queryKey: ['resources', null],
    queryFn: () => fetchResources(null),
    refetchInterval: 5000
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

    /* 5. Filter for Space Inventory (Exclude Equipment) */
    let spaceResources = resources.filter(r => r.type !== 'EQUIPMENT');

    if (facilityTypeFilter !== 'ALL') {
      spaceResources = spaceResources.filter(r => r.type === facilityTypeFilter);
    }
    if (facilityStatusFilter !== 'ALL') {
      spaceResources = spaceResources.filter(r => r.status === facilityStatusFilter);
    }

    /* 6. Resource Type Breakdown */
    const resourceTypeMap = {};
    spaceResources.forEach(r => {
      const type = r.type?.replace('_', ' ') || 'Other';
      resourceTypeMap[type] = (resourceTypeMap[type] || 0) + 1;
    });
    const resourceTypeData = Object.entries(resourceTypeMap).map(([name, value]) => ({ name, value }));

    /* 7. Resource Status Breakdown */
    const resourceStatusMap = { ACTIVE: 0, MAINTENANCE: 0, OUT_OF_ORDER: 0 };
    spaceResources.forEach(r => {
      if (resourceStatusMap[r.status] !== undefined) resourceStatusMap[r.status]++;
      else resourceStatusMap[r.status] = (resourceStatusMap[r.status] || 0) + 1;
    });
    const resourceStatusData = Object.entries(resourceStatusMap).map(([name, value]) => ({ name, value }));

    /* 8. Capacity by Type */
    const capacityTypeMap = {};
    spaceResources.forEach(r => {
      const type = r.type?.replace('_', ' ') || 'Other';
      if (!capacityTypeMap[type]) capacityTypeMap[type] = { name: type, total: 0, count: 0 };
      capacityTypeMap[type].total += r.capacity || 0;
      capacityTypeMap[type].count++;
    });
    const capacityTypeData = Object.values(capacityTypeMap).map(d => ({
      name: d.name,
      avgCapacity: d.count > 0 ? Math.round(d.total / d.count) : 0
    }));

    /* 9. Equipment Metrics */
    const allEquip = resources.filter(r => r.type === 'EQUIPMENT');
    const equipmentLocations = Array.from(new Set(allEquip.map(r => r.location).filter(Boolean)));

    let equipmentResources = [...allEquip];
    if (equipmentStatusFilter !== 'ALL') {
      equipmentResources = equipmentResources.filter(r => r.status === equipmentStatusFilter);
    }
    if (equipmentLocationFilter !== 'ALL') {
      equipmentResources = equipmentResources.filter(r => r.location === equipmentLocationFilter);
    }

    const equipmentStatusMap = { ACTIVE: 0, MAINTENANCE: 0, OUT_OF_ORDER: 0 };
    equipmentResources.forEach(r => {
      if (equipmentStatusMap[r.status] !== undefined) equipmentStatusMap[r.status]++;
      else equipmentStatusMap[r.status] = (equipmentStatusMap[r.status] || 0) + 1;
    });
    const equipmentStatusData = Object.entries(equipmentStatusMap).map(([name, value]) => ({ name, value }));

    return {
      totalBookings: filteredBookings.length,
      approvedBookings: bookingStatusMap.APPROVED,
      totalIssues: filteredTickets.length,
      resolvedIssues: ticketStatusMap.RESOLVED,
      bookingStatusData,
      ticketStatusData,
      timelineTrend,
      categoryBreakdown,
      resourceTypeData,
      resourceStatusData,
      capacityTypeData,
      totalFacilities: spaceResources.length,
      activeFacilities: spaceResources.filter(r => r.status === 'ACTIVE').length,
      equipmentStatusData,
      totalEquipment: equipmentResources.length,
      activeEquipment: equipmentResources.filter(r => r.status === 'ACTIVE').length,
      equipmentLocations
    };
  }, [bookings, tickets, resources, timeRange, facilityTypeFilter, facilityStatusFilter, equipmentStatusFilter, equipmentLocationFilter]);

  /* ── Simulation Export ── */
  const handleExport = (format) => {
    const toastId = toast.loading(`Generating ${format.toUpperCase()} Report...`);
    
    try {
      const escapeCSV = (val) => {
        if (val === null || val === undefined) return '';
        const str = String(val);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      let csvContent = '';
      let filename = `report_${reportType.toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`;

      if (reportType === 'BOOKINGS') {
        const headers = ['Booking ID', 'User ID', 'Resource ID', 'Status', 'Created At'];
        const rows = bookings.map(b => [
          escapeCSV(b.id),
          escapeCSV(b.userId),
          escapeCSV(b.resourceId),
          escapeCSV(b.status),
          escapeCSV(b.createdAt ? new Date(b.createdAt).toLocaleString() : '')
        ]);
        csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
      } else if (reportType === 'MAINTENANCE') {
        const headers = ['Ticket ID', 'Title', 'Status', 'Category', 'Created At'];
        const rows = tickets.map(t => [
          escapeCSV(t.id),
          escapeCSV(t.title),
          escapeCSV(t.status),
          escapeCSV(t.category),
          escapeCSV(t.createdAt ? new Date(t.createdAt).toLocaleString() : '')
        ]);
        csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
      } else if (reportType === 'FACILITIES') {
        const spaceResources = resources.filter(r => r.type !== 'EQUIPMENT');
        const headers = ['Facility ID', 'Name', 'Type', 'Capacity', 'Location', 'Status'];
        const rows = spaceResources.map(r => [
          escapeCSV(r.id),
          escapeCSV(r.name),
          escapeCSV(r.type),
          escapeCSV(r.capacity),
          escapeCSV(r.location),
          escapeCSV(r.status)
        ]);
        csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
      } else if (reportType === 'EQUIPMENT') {
        const equipmentResources = resources.filter(r => r.type === 'EQUIPMENT');
        const headers = ['Asset ID', 'Name', 'Status', 'Location'];
        const rows = equipmentResources.map(r => [
          escapeCSV(r.id),
          escapeCSV(r.name),
          escapeCSV(r.status),
          escapeCSV(r.location)
        ]);
        csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
      } else {
        // OVERVIEW
        const spaceResources = resources.filter(r => r.type !== 'EQUIPMENT');
        const headers = ['Metric', 'Value'];
        const rows = [
          ['Total Bookings', reportData.totalBookings],
          ['Approved Bookings', reportData.approvedBookings],
          ['Total Issues', reportData.totalIssues],
          ['Resolved Issues', reportData.resolvedIssues],
          ['Total Facilities', spaceResources.length],
          ['Active Facilities', spaceResources.filter(r => r.status === 'ACTIVE').length]
        ];
        csvContent = [headers, ...rows].map(e => [escapeCSV(e[0]), escapeCSV(e[1])].join(",")).join("\n");
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`${format.toUpperCase()} Report downloaded successfully`, { id: toastId });
    } catch (error) {
      console.error('Export failed', error);
      toast.error('Failed to generate report', { id: toastId });
    }
  };

  /* ── Visibility mapping ── */
  const canSeeTab = (tab) => {
    if (user?.role === 'ADMIN') return true;
    if (tab === 'OVERVIEW' && ['ADMIN', 'USER'].includes(user?.role)) return true;
    if (tab === 'BOOKINGS' && ['BOOKING_OFFICER', 'ADMIN'].includes(user?.role)) return true;
    if (tab === 'MAINTENANCE' && ['TECHNICIAN', 'ADMIN'].includes(user?.role)) return true;
    if (tab === 'FACILITIES' && ['FACILITY_MANAGER', 'ADMIN'].includes(user?.role)) return true;
    if (tab === 'EQUIPMENT' && ['FACILITY_MANAGER', 'ADMIN'].includes(user?.role)) return true;
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
          {/* Space Inventory Filters */}
          {reportType === 'FACILITIES' && (
            <div className="flex items-center gap-2 bg-raised border border-subtle p-1 rounded-xl">
              <select 
                value={facilityTypeFilter} 
                onChange={(e) => setFacilityTypeFilter(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-muted hover:text-primary outline-none cursor-pointer px-2 py-1"
              >
                <option value="ALL" className="bg-surface">All Types</option>
                <option value="LECTURE_HALL" className="bg-surface">Lecture Halls</option>
                <option value="LAB" className="bg-surface">Laboratories</option>
                <option value="CAFE" className="bg-surface">Cafes</option>
                <option value="LIBRARY" className="bg-surface">Libraries</option>
                <option value="SPORT" className="bg-surface">Sports Areas</option>
                <option value="AUDITORIUM" className="bg-surface">Auditoriums</option>
                <option value="STAFF" className="bg-surface">Staff Spaces</option>
              </select>
              <div className="w-px h-4 bg-subtle" />
              <select 
                value={facilityStatusFilter} 
                onChange={(e) => setFacilityStatusFilter(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-muted hover:text-primary outline-none cursor-pointer px-2 py-1"
              >
                <option value="ALL" className="bg-surface">All Statuses</option>
                <option value="ACTIVE" className="bg-surface">Active</option>
                <option value="MAINTENANCE" className="bg-surface">Maintenance</option>
                <option value="OUT_OF_ORDER" className="bg-surface">Out of Order</option>
              </select>
            </div>
          )}
          {/* Equipment Filters */}
          {reportType === 'EQUIPMENT' && (
            <div className="flex items-center gap-2 bg-raised border border-subtle p-1 rounded-xl">
              <select 
                value={equipmentStatusFilter} 
                onChange={(e) => setEquipmentStatusFilter(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-muted hover:text-primary outline-none cursor-pointer px-2 py-1"
              >
                <option value="ALL" className="bg-surface">All Statuses</option>
                <option value="ACTIVE" className="bg-surface">Active</option>
                <option value="MAINTENANCE" className="bg-surface">Maintenance</option>
                <option value="OUT_OF_ORDER" className="bg-surface">Out of Order</option>
              </select>
              <div className="w-px h-4 bg-subtle" />
              <select 
                value={equipmentLocationFilter} 
                onChange={(e) => setEquipmentLocationFilter(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-muted hover:text-primary outline-none cursor-pointer px-2 py-1"
              >
                <option value="ALL" className="bg-surface">All Locations</option>
                {reportData.equipmentLocations?.map(loc => (
                  <option key={loc} value={loc} className="bg-surface">{loc}</option>
                ))}
              </select>
            </div>
          )}
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
          { id: 'FACILITIES', label: 'Space Inventory', icon: PieIcon },
          { id: 'EQUIPMENT', label: 'Equipment Assets', icon: Laptop }
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

        {(user?.role === 'ADMIN' || user?.role === 'FACILITY_MANAGER') && (
          <>
            <div className="bg-surface border border-subtle rounded-3xl p-6 shadow-md">
              <p className="text-[10px] font-black text-muted uppercase tracking-wider mb-1">Total Facilities</p>
              <h3 className="text-3xl font-black text-primary">{reportData.totalFacilities}</h3>
            </div>
            <div className="bg-surface border border-subtle rounded-3xl p-6 shadow-md">
              <p className="text-[10px] font-black text-muted uppercase tracking-wider mb-1">Active Spaces</p>
              <h3 className="text-3xl font-black text-emerald-500">{reportData.activeFacilities}</h3>
            </div>
          </>
        )}

        {(user?.role === 'ADMIN' || user?.role === 'FACILITY_MANAGER') && (
          <>
            <div className="bg-surface border border-subtle rounded-3xl p-6 shadow-md">
              <p className="text-[10px] font-black text-muted uppercase tracking-wider mb-1">Total Equipment</p>
              <h3 className="text-3xl font-black text-primary">{reportData.totalEquipment}</h3>
            </div>
            <div className="bg-surface border border-subtle rounded-3xl p-6 shadow-md">
              <p className="text-[10px] font-black text-muted uppercase tracking-wider mb-1">Active Equipment</p>
              <h3 className="text-3xl font-black text-emerald-500">{reportData.activeEquipment}</h3>
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
          <>
            {/* Resource Type Breakdown (Pie) */}
            <div className="bg-surface border border-subtle rounded-3xl p-6 shadow-md flex flex-col justify-between">
              <h4 className="text-sm font-black text-primary mb-6">Facility Type Mix</h4>
              <div className="h-56 w-full flex-1">
                {reportData.resourceTypeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%" minHeight={224}>
                    <PieChart>
                      <Pie data={reportData.resourceTypeData} innerRadius={50} outerRadius={75} paddingAngle={6} dataKey="value">
                        {reportData.resourceTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-muted italic">No data</div>
                )}
              </div>
            </div>

            {/* Resource Status Breakdown (Bar) */}
            <div className="bg-surface border border-subtle rounded-3xl p-6 shadow-md">
              <h4 className="text-sm font-black text-primary mb-4">Operational Status</h4>
              <div className="h-64 w-full">
                {reportData.resourceStatusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%" minHeight={256}>
                    <BarChart data={reportData.resourceStatusData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                      <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                      <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
                      <Bar dataKey="value" fill={THEME_COLORS.primary} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-muted italic">No data</div>
                )}
              </div>
            </div>

            {/* Average Capacity by Type (Bar) */}
            <div className="bg-surface border border-subtle rounded-3xl p-6 shadow-md">
              <h4 className="text-sm font-black text-primary mb-4">Average Seating Capacity</h4>
              <div className="h-64 w-full">
                {reportData.capacityTypeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%" minHeight={256}>
                    <BarChart data={reportData.capacityTypeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                      <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                      <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
                      <Bar dataKey="avgCapacity" fill={THEME_COLORS.secondary} radius={[6, 6, 0, 0]} name="Avg Pax" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-muted italic">No data</div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Equipment Assets */}
        {reportType === 'EQUIPMENT' && (
          <>
            <div className="bg-surface border border-subtle rounded-3xl p-6 shadow-md flex flex-col justify-between">
              <h4 className="text-sm font-black text-primary mb-6">Equipment Availability</h4>
              <div className="h-56 w-full flex-1">
                {reportData.equipmentStatusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%" minHeight={224}>
                    <PieChart>
                      <Pie data={reportData.equipmentStatusData} innerRadius={50} outerRadius={75} paddingAngle={6} dataKey="value">
                        {reportData.equipmentStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-muted italic">No data</div>
                )}
              </div>
            </div>

            <div className="bg-surface border border-subtle rounded-3xl p-6 shadow-md lg:col-span-2">
              <h4 className="text-sm font-black text-primary mb-4">Asset Distribution</h4>
              <div className="h-64 w-full">
                {reportData.equipmentStatusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%" minHeight={256}>
                    <BarChart data={reportData.equipmentStatusData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                      <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                      <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
                      <Bar dataKey="value" fill={THEME_COLORS.secondary} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-muted italic">No data</div>
                )}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default ReportsPage;
