import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchResources, createResource, updateResourceStatus, deleteResource } from '../services/api';
import ResourceForm from '../components/ResourceForm';
import BookingForm from '../components/BookingForm';
import QRModal from '../components/QRModal';
import { Plus, Filter, Search, Trash2, Edit2, AlertCircle, RefreshCcw, LayoutGrid, CalendarCheck, Building2, Laptop, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCatalogueUiStore } from '../store/catalogueUiStore';

const CataloguePage = ({ defaultTab = 'facilities' }) => {
    const { user } = useAuthStore();
    const isAdmin = ['FACILITY_MANAGER', 'ADMIN'].includes(user?.role);

    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryTab, setCategoryTab] = useState(defaultTab); // 'facilities' or 'resources'
    const { filterType, setFilterType, selectedResourceForQR, setSelectedResourceForQR, selectedResourceForBooking, setSelectedResourceForBooking } = useCatalogueUiStore();

    // Queries
    const { data: resources = [], isLoading } = useQuery({
        queryKey: ['resources', filterType],
        queryFn: () => fetchResources(filterType || null)
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: createResource,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['resources'] });
            setShowForm(false);
        }
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }) => updateResourceStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['resources'] });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteResource,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['resources'] });
        }
    });

    const handleCreate = async (data) => {
        return await createMutation.mutateAsync(data);
    };
    
    const handleStatusUpdate = (id, newStatus) => {
        updateStatusMutation.mutate({ id, status: newStatus });
    };

    const handleDelete = (id) => {
        if(window.confirm('Are you sure you want to delete this resource?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleShowQR = (resource) => {
        setSelectedResourceForQR(resource);
    };

    const handleBook = (resource) => {
        setSelectedResourceForBooking(resource);
    };

    const filteredResources = resources.filter(res => {
        const matchesSearch = res.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (res.location && res.location.toLowerCase().includes(searchQuery.toLowerCase()));
        
        if (!matchesSearch) return false;

        if (categoryTab === 'facilities') {
            return res.type === 'LECTURE_HALL' || res.type === 'LAB';
        } else {
            return res.type === 'EQUIPMENT';
        }
    });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            
            {/* ── Page Title ── */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-black text-primary tracking-tight">
                        {isAdmin ? 'Facilities & Asset Control' : 'Resource Catalogue'}
                    </h1>
                    <p className="text-secondary mt-1 text-sm">
                        {isAdmin ? 'Provision and oversee real-time university infrastructure.' : 'Browse and book university spaces & resources.'}
                    </p>
                </div>
                {isAdmin && (
                    <button onClick={() => setShowForm(true)} className="inline-flex items-center px-4 py-2.5 bg-accent hover-bg-accent text-white text-sm font-semibold rounded-xl transition-all shadow-sm cursor-pointer border-none">
                        <Plus className="w-4 h-4 mr-2" strokeWidth={2.5} /> 
                        {categoryTab === 'facilities' ? 'Add Facility' : 'Add Asset'}
                    </button>
                )}
            </div>

            {/* ── Modal Add Form ── */}
            {isAdmin && showForm && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-overlay rounded-2xl p-6 shadow-2xl w-full max-w-xl relative animate-fade-in" style={{ border: '1px solid var(--border-subtle)' }}>
                        <div className="flex justify-between items-center mb-4 pb-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            <h2 className="text-lg font-bold text-primary">
                                {categoryTab === 'facilities' ? 'Register New Facility' : 'Onboard Equipment Asset'}
                            </h2>
                            <button onClick={() => setShowForm(false)} className="text-muted hover:text-primary transition-colors p-1.5 rounded-lg hover:bg-muted-fill cursor-pointer border-none bg-transparent">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <ResourceForm 
                            onSubmit={handleCreate} 
                            onCancel={() => setShowForm(false)} 
                            defaultType={categoryTab === 'facilities' ? 'LECTURE_HALL' : 'EQUIPMENT'}
                        />
                    </div>
                </div>
            )}

            {/* ── Section Selection Tabs ── */}
            <div className="flex border-b border-subtle gap-8">
                <button 
                    onClick={() => setCategoryTab('facilities')}
                    className={`flex items-center gap-2 pb-3 text-sm font-bold transition-colors cursor-pointer relative bg-transparent border-none ${categoryTab === 'facilities' ? 'text-accent' : 'text-muted hover:text-primary'}`}
                >
                    <Building2 className="w-4.5 h-4.5" />
                    University Facilities
                    {categoryTab === 'facilities' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />}
                </button>
                <button 
                    onClick={() => setCategoryTab('resources')}
                    className={`flex items-center gap-2 pb-3 text-sm font-bold transition-colors cursor-pointer relative bg-transparent border-none ${categoryTab === 'resources' ? 'text-accent' : 'text-muted hover:text-primary'}`}
                >
                    <Laptop className="w-4.5 h-4.5" />
                    Equipment Assets
                    {categoryTab === 'resources' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />}
                </button>
            </div>

            {/* ── Controls Toolbar ── */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-surface p-3.5 rounded-2xl shadow-sm border border-subtle">
                <div className="flex flex-1 items-center gap-3 w-full md:max-w-md bg-raised border border-subtle rounded-xl px-3 py-2">
                    <Search className="w-4 h-4 text-muted" />
                    <input 
                        type="text" 
                        placeholder={categoryTab === 'facilities' ? "Search halls, labs, locations..." : "Search tools, devices, gear..."} 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none text-sm text-primary outline-none focus:ring-0 w-full"
                    />
                </div>

                <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
                    <Filter className="w-4 h-4 text-muted" />
                    <select 
                        value={filterType} 
                        onChange={(e) => setFilterType(e.target.value)}
                        className="bg-raised border border-subtle rounded-xl text-xs font-semibold text-primary px-3 py-2 outline-none focus:ring-2 focus:ring-accent cursor-pointer"
                    >
                        <option value="" className="bg-surface">All Types</option>
                        {categoryTab === 'facilities' ? (
                            <>
                                <option value="LECTURE_HALL" className="bg-surface">Lecture Halls</option>
                                <option value="LAB" className="bg-surface">Laboratories</option>
                            </>
                        ) : (
                            <option value="EQUIPMENT" className="bg-surface">Equipment Assets</option>
                        )}
                    </select>
                </div>
            </div>

            {/* ── Main Enterprise Table ── */}
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <RefreshCcw className="animate-spin text-accent w-8 h-8" />
                </div>
            ) : (
                <div className="bg-surface rounded-2xl shadow-sm border border-subtle overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                            <tr className="bg-raised text-xs font-bold text-muted uppercase tracking-wider border-b border-subtle">
                                <th className="px-6 py-4">Resource Info</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Capacity</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-subtle text-sm">
                            {filteredResources.map((res) => (
                                <tr key={res.id} className="hover:bg-raised/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-primary">{res.name}</div>
                                        <div className="text-xs text-muted mt-0.5">{res.location || 'No location set'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-semibold px-2 py-1 rounded bg-accent-subtle text-accent uppercase">
                                            {res.type?.replace('_', ' ') || 'ASSET'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-secondary">
                                        {res.capacity ? `${res.capacity} pax` : '—'}
                                    </td>
                                    <td className="px-6 py-4">
                                        {isAdmin ? (
                                            <select 
                                                value={res.status} 
                                                onChange={(e) => handleStatusUpdate(res.id, e.target.value)}
                                                className={`text-xs font-bold px-2.5 py-1 rounded-lg outline-none cursor-pointer border
                                                    ${res.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : ''}
                                                    ${res.status === 'MAINTENANCE' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : ''}
                                                    ${res.status === 'OUT_OF_ORDER' ? 'bg-red-500/10 text-red-500 border-red-500/20' : ''}
                                                `}
                                            >
                                                <option value="ACTIVE" className="bg-surface text-emerald-500 font-bold">ACTIVE</option>
                                                <option value="MAINTENANCE" className="bg-surface text-amber-500 font-bold">MAINTENANCE</option>
                                                <option value="OUT_OF_ORDER" className="bg-surface text-red-500 font-bold">OUT OF ORDER</option>
                                            </select>
                                        ) : (
                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border
                                                ${res.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : ''}
                                                ${res.status === 'MAINTENANCE' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : ''}
                                                ${res.status === 'OUT_OF_ORDER' ? 'bg-red-500/10 text-red-500 border-red-500/20' : ''}
                                            `}>
                                                {res.status}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {isAdmin ? (
                                                <>
                                                    <button 
                                                        onClick={() => handleShowQR(res)}
                                                        className="p-2 rounded-lg bg-raised text-muted hover:text-accent border border-subtle cursor-pointer transition-colors"
                                                        title="View QR Code"
                                                    >
                                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(res.id)}
                                                        className="p-2 rounded-lg bg-raised text-muted hover:text-red-500 border border-subtle cursor-pointer transition-colors"
                                                        title="Delete Asset"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </>
                                            ) : (
                                                <button 
                                                    onClick={() => handleBook(res)}
                                                    disabled={res.status !== 'ACTIVE'}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent hover-bg-accent text-white font-semibold text-xs rounded-xl shadow-sm transition-colors cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <CalendarCheck className="w-3.5 h-3.5" /> Book
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredResources.length === 0 && (
                        <div className="flex flex-col items-center justify-center p-12 bg-raised border-t border-subtle">
                            <AlertCircle className="w-8 h-8 text-muted mb-2" />
                            <h3 className="text-sm font-semibold text-primary">No resources found</h3>
                            <p className="text-xs text-muted mt-1 text-center">Empty records for {categoryTab}.</p>
                        </div>
                    )}
                </div>
            )}

            <QRModal 
                isOpen={!!selectedResourceForQR} 
                onClose={() => setSelectedResourceForQR(null)} 
                resource={selectedResourceForQR} 
            />

            {selectedResourceForBooking && (
                <BookingForm 
                    resource={selectedResourceForBooking} 
                    onClose={() => setSelectedResourceForBooking(null)} 
                    onSuccess={() => alert('Booking requested successfully! Navigate to My Bookings to view its status.')}
                />
            )}
        </div>
    );
};

export default CataloguePage;
