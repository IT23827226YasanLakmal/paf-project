import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchBookings } from '../services/api';
import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#7c3aed', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6'];

const BookingOfficerDashboard = () => {
  const [range, setRange] = useState('1W');

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['bookings', 'officer-dashboard'],
    queryFn: () => fetchBookings({})
  });

  // ===============================
  // 📅 FILTER BY RANGE
  // ===============================
  const filtered = useMemo(() => {
    const now = new Date();
    let days = 7;

    if (range === '1D') days = 1;
    if (range === '1M') days = 30;

    return bookings.filter(b => {
      if (!b.startTime) return false;
      const d = new Date(b.startTime);
      return (now - d) / (1000 * 60 * 60 * 24) <= days;
    });
  }, [bookings, range]);

  // ===============================
  // 📊 KPI STATS
  // ===============================
  const stats = useMemo(() => {
    return {
      total: filtered.length,
      approved: filtered.filter(b => b.status === 'APPROVED').length,
      pending: filtered.filter(b => b.status === 'PENDING').length,
      rejected: filtered.filter(b => b.status === 'REJECTED').length,
      cancelled: filtered.filter(b => b.status === 'CANCELLED').length,
    };
  }, [filtered]);

  // ===============================
  // 📈 LINE CHART
  // ===============================
  const lineData = useMemo(() => {
    const map = {};
    filtered.forEach(b => {
      const h = new Date(b.startTime).getHours();
      map[h] = (map[h] || 0) + 1;
    });

    return Object.keys(map).map(h => ({
      hour: `${h}:00`,
      bookings: map[h]
    }));
  }, [filtered]);

  // ===============================
  // 🔥 HEATMAP (FIXED)
  // ===============================
  const heatmap = useMemo(() => {
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

    // initialize full grid
    const grid = {};
    days.forEach(day => {
      grid[day] = Array(24).fill(0);
    });

    filtered.forEach(b => {
      if (!b.startTime) return;

      const d = new Date(b.startTime);
      const dayIndex = (d.getDay() + 6) % 7;
      const day = days[dayIndex];
      const hour = d.getHours();

      grid[day][hour] += 1;
    });

    return days.map(day => ({
      day,
      hours: grid[day]
    }));
  }, [filtered]);

  // ===============================
  // 🥧 TOP RESOURCES
  // ===============================
  const topResources = useMemo(() => {
    const map = {};

    filtered.forEach(b => {
      const key = b.resourceName || `Resource ${b.resourceId}`;
      map[key] = (map[key] || 0) + 1;
    });

    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a,b) => b.value - a.value)
      .slice(0,5);
  }, [filtered]);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-400 text-white px-6 py-5 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Booking Officer Dashboard</h1>
          <p className="text-sm opacity-80">Monitor and manage reservations</p>
        </div>

        <div className="flex gap-2">
          {['1D','1W','1M'].map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 rounded-lg text-sm ${
                range === r ? 'bg-white text-purple-600' : 'bg-white/20'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 space-y-6">

        {/* EMPTY STATE */}
        {!isLoading && filtered.length === 0 && (
          <div className="bg-white rounded-xl p-6 text-center text-gray-400">
            No booking data in selected range
          </div>
        )}

        {/* KPI */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label:'Total', value:stats.total },
            { label:'Approved', value:stats.approved },
            { label:'Pending', value:stats.pending },
            { label:'Rejected', value:stats.rejected },
            { label:'Cancelled', value:stats.cancelled }
          ].map(s => (
            <div key={s.label} className="bg-white p-4 rounded-xl shadow-sm">
              <p className="text-sm text-gray-500">{s.label}</p>
              <p className="text-2xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>

        {/* LINE CHART */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="font-bold mb-4">Bookings Per Hour</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="bookings" stroke="#7c3aed" strokeWidth={3}/>
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* HEATMAP */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="font-bold mb-4">Peak Reservations</h3>

          <div className="overflow-x-auto">
            {heatmap.map(row => (
              <div key={row.day} className="flex items-center gap-1 mb-1">
                <span className="w-10 text-xs text-gray-500">{row.day}</span>

                {row.hours.map((v,i)=>{
                  const color =
                    v === 0 ? 'bg-gray-100' :
                    v < 2 ? 'bg-purple-200' :
                    v < 5 ? 'bg-purple-400' :
                            'bg-purple-700';

                  return (
                    <div
                      key={i}
                      className={`w-4 h-4 rounded ${color}`}
                      title={`${row.day} ${i}:00 → ${v}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* DONUT */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="font-bold mb-4">Top Resources</h3>

          {topResources.length === 0 ? (
            <p className="text-gray-400 text-sm text-center">No data</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={topResources} dataKey="value" nameKey="name" outerRadius={90}>
                  {topResources.map((_,i)=>(
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>
    </div>
  );
};

export default BookingOfficerDashboard;