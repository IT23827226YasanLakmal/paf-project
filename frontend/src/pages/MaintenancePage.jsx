import React, { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchResources, updateResourceStatus } from '../services/api';
import { 
  Wrench, AlertTriangle, RefreshCcw, CheckCircle, 
  Settings, Clock, ShieldCheck, Activity
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const MaintenancePage = () => {
    const { user } = useAuthStore();
    const isTechOrAdmin = ['ADMIN', 'TECHNICIAN', 'FACILITY_MANAGER'].includes(user?.role);
    const queryClient = useQueryClient();

    const { data: resources = [], isLoading } = useQuery({
        queryKey: ['resources'],
        queryFn: () => fetchResources(null),
    });

    // Filtering down to resources under attention
    const maintenanceItems = useMemo(() => 
        resources.filter(r => ['MAINTENANCE', 'OUT_OF_ORDER'].includes(r.status)),
        [resources]
    );

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }) => updateResourceStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['resources'] });
        }
    });

    const handleResolve = (id) => {
        if(window.confirm('Mark this resource as operational and return to ACTIVE status?')) {
            updateStatusMutation.mutate({ id, status: 'ACTIVE' });
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-primary">

            {/* ── Header ── */}
            <div>
                <h1 className="text-3xl font-black text-primary tracking-tight leading-tight flex items-center gap-3">
                    <Wrench className="w-8 h-8 text-amber-500 flex-shrink-0 animate-pulse" />
                    Maintenance Management
                </h1>
                <p className="text-secondary mt-1 text-sm">
                    Review and provision infrastructure items that need immediate technical attention.
                </p>
            </div>

            {/* ── Status Snapshot Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                
                <div className="bg-surface rounded-2xl p-6 border border-subtle shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-muted uppercase tracking-wider">Under Maintenance</p>
                        <h3 className="text-2xl font-black text-amber-500 mt-1">
                            {maintenanceItems.filter(i => i.status === 'MAINTENANCE').length}
                        </h3>
                        <p className="text-xs text-secondary mt-1 font-medium">Standard servicing routines</p>
                    </div>
                    <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <Clock className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-surface rounded-2xl p-6 border border-subtle shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-muted uppercase tracking-wider">Out Of Order</p>
                        <h3 className="text-2xl font-black text-red-500 mt-1">
                            {maintenanceItems.filter(i => i.status === 'OUT_OF_ORDER').length}
                        </h3>
                        <p className="text-xs text-secondary mt-1 font-medium">Critical system faults</p>
                    </div>
                    <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-surface rounded-2xl p-6 border border-subtle shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-muted uppercase tracking-wider">Optimal State</p>
                        <h3 className="text-2xl font-black text-emerald-500 mt-1">
                            {resources.filter(r => r.status === 'ACTIVE').length}
                        </h3>
                        <p className="text-xs text-secondary mt-1 font-medium">Stable operational health</p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                </div>

            </div>

            {/* ── Central Servicing List ── */}
            {isLoading ? (
                <div className="flex justify-center items-center py-20">
                    <RefreshCcw className="animate-spin text-accent w-8 h-8" />
                </div>
            ) : maintenanceItems.length === 0 ? (
                <div className="bg-raised/50 p-12 rounded-3xl border border-subtle text-center max-w-xl mx-auto">
                    <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                    <h3 className="font-bold text-primary text-base">Perfect Operations Threshold</h3>
                    <p className="text-muted text-xs mt-1"> No equipment clusters or rooms are experiencing disruptions currently.</p>
                </div>
            ) : (
                <div className="bg-surface rounded-2xl shadow-sm border border-subtle overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-raised text-xs font-bold text-muted uppercase tracking-wider border-b border-subtle">
                                <th className="px-6 py-4">Resource Identifier</th>
                                <th className="px-6 py-4">Status Class</th>
                                <th className="px-6 py-4 text-right">Action Gateway</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-subtle text-sm">
                            {maintenanceItems.map((item) => (
                                <tr key={item.id} className="hover:bg-raised/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-primary">{item.name}</div>
                                        <div className="text-xs text-muted mt-0.5">{item.location || 'N/A'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border 
                                            ${item.status === 'MAINTENANCE' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}
                                        >
                                            <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'MAINTENANCE' ? 'bg-amber-500' : 'bg-red-500'}`} />
                                            {item.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {isTechOrAdmin && (
                                            <button 
                                                onClick={() => handleResolve(item.id)}
                                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-accent hover-bg-accent text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer transition-colors border-none"
                                            >
                                                <CheckCircle className="w-3.5 h-3.5" /> Resolve Fix
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

        </div>
    );
};

export default MaintenancePage;
