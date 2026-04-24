import React from 'react';

const FacilityDashboard = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Facility Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-sm font-medium text-slate-500 mb-1">Total Resources</h3>
                    <p className="text-3xl font-bold text-slate-900">--</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-sm font-medium text-slate-500 mb-1">Under Maintenance</h3>
                    <p className="text-3xl font-bold text-orange-600">--</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-sm font-medium text-slate-500 mb-1">Active Bookings</h3>
                    <p className="text-3xl font-bold text-blue-600">--</p>
                </div>
            </div>
            
            <div className="mt-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Maintenance Activity</h2>
                <div className="text-slate-500 text-sm">
                    No recent maintenance activity to display.
                </div>
            </div>
        </div>
    );
};

export default FacilityDashboard;
