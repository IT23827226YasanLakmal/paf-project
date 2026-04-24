import React from 'react';

const UserManagement = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">User Management</h1>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-slate-900">System Users</h2>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                        Add User
                    </button>
                </div>
                <div className="p-6">
                    <div className="text-slate-500 text-sm">
                        User list table will be rendered here.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
