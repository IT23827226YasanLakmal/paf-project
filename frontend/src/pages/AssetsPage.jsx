import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchResources, createResource, updateResourceStatus, updateResource, deleteResource } from '../services/api';
import EquipmentForm from '../components/EquipmentForm';
import BookingForm from '../components/BookingForm';
import QRModal from '../components/QRModal';
import { Plus, Filter, Search, Trash2, AlertCircle, RefreshCcw, CalendarCheck, Laptop, X, Pencil } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCatalogueUiStore } from '../store/catalogueUiStore';

const AssetsPage = () => {
    const { user } = useAuthStore();
    const isAdmin = ['FACILITY_MANAGER', 'ADMIN'].includes(user?.role);

    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [editingResource, setEditingResource] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [subCategory, setSubCategory] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const itemsPerPage = 3;
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
        onMutate: async ({ id, status }) => {
            await queryClient.cancelQueries({ queryKey: ['resources'] });
            const previousResources = queryClient.getQueryData(['resources', filterType]);

            queryClient.setQueryData(['resources', filterType], (old) => 
                old ? old.map(res => res.id === id ? { ...res, status } : res) : []
            );

            return { previousResources };
        },
        onError: (err, newVariables, context) => {
            queryClient.setQueryData(['resources', filterType], context.previousResources);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['resources'] });
        }
    });

    const editMutation = useMutation({
        mutationFn: ({ id, data }) => updateResource(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['resources'] });
            setEditingResource(null);
        }
    });

    const handleEditSubmit = async (data) => {
        if (!editingResource?.id) return;
        return await editMutation.mutateAsync({ id: editingResource.id, data });
    };

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
        setDeleteConfirmId(id);
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
        if (res.type !== 'EQUIPMENT') return false;

        const nameLower = res.name.toLowerCase();
        if (subCategory === 'LAPTOPS') return nameLower.includes('laptop') || nameLower.includes('macbook') || nameLower.includes('computer');
        if (subCategory === 'MONITORS') return nameLower.includes('monitor') || nameLower.includes('display') || nameLower.includes('screen');
        if (subCategory === 'PROJECTORS') return nameLower.includes('projector');
        if (subCategory === 'CAMERAS') return nameLower.includes('camera') || nameLower.includes('lens') || nameLower.includes('gimbal');
        
        return true;
    });

    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, subCategory]);

    const totalPages = Math.ceil(filteredResources.length / itemsPerPage);
    const paginatedItems = filteredResources.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-8 space-y-6">
            
            {/* Removed upper title floating constraints */}

            {/* ── Modal Add Form ── */}
            {isAdmin && showForm && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-overlay rounded-2xl p-6 shadow-2xl w-full max-w-xl relative animate-fade-in" style={{ border: '1px solid var(--border-subtle)' }}>
                        <div className="flex justify-between items-center mb-4 pb-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            <h2 className="text-lg font-bold text-primary">
                                Onboard Equipment Asset
                            </h2>
                            <button onClick={() => setShowForm(false)} className="text-muted hover:text-primary transition-colors p-1.5 rounded-lg hover:bg-muted-fill cursor-pointer border-none bg-transparent">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <EquipmentForm 
                            onSubmit={handleCreate} 
                            onCancel={() => setShowForm(false)} 
                        />
                    </div>
                </div>
            )}

            {/* ── Controls Toolbar ── */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-surface p-3.5 rounded-2xl shadow-sm border border-subtle">
                <div className="flex flex-1 items-center gap-3 w-full md:max-w-md bg-raised border border-subtle rounded-xl px-3 py-2">
                    <Search className="w-4 h-4 text-muted" />
                    <input 
                        type="text" 
                        placeholder="Search tools, devices, gear..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none text-sm text-primary outline-none focus:ring-0 w-full"
                    />
                </div>

                <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
                    <Filter className="w-4 h-4 text-muted" />
                    <select 
                        value={subCategory} 
                        onChange={(e) => setSubCategory(e.target.value)}
                        className="bg-raised border border-subtle rounded-xl text-xs font-semibold text-primary px-3 py-2 outline-none focus:ring-2 focus:ring-accent cursor-pointer"
                    >
                        <option value="" className="bg-surface">All Equipment</option>
                        <option value="LAPTOPS" className="bg-surface">Laptops & Computers</option>
                        <option value="MONITORS" className="bg-surface">Monitors & Displays</option>
                        <option value="PROJECTORS" className="bg-surface">Projectors & AV</option>
                        <option value="CAMERAS" className="bg-surface">Cameras & Media</option>
                    </select>

                    {isAdmin && (
                        <button onClick={() => setShowForm(true)} className="inline-flex items-center px-4 py-2.5 bg-accent hover-bg-accent text-white text-sm font-semibold rounded-xl transition-all shadow-sm cursor-pointer border-none flex-shrink-0">
                            <Plus className="w-4 h-4 mr-2" strokeWidth={2.5} /> 
                            Add Asset
                        </button>
                    )}
                </div>
            </div>

            {/* ── Main Enterprise Table ── */}
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <RefreshCcw className="animate-spin text-accent w-8 h-8" />
                </div>
            ) : (
                <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedItems.map((res) => (
                        <div 
                            key={res.id} 
                            className="bg-surface rounded-3xl p-6 border border-subtle shadow-md hover:shadow-xl hover:border-accent/40 hover:-translate-y-1 flex flex-col justify-between gap-5 transition-all duration-300 relative group overflow-hidden"
                        >
                            {/* Card Header Tag/Status */}
                            <div className="flex items-center justify-between gap-2 z-10">
                                <span className="text-[10px] font-black px-2.5 py-1 rounded-xl bg-accent/10 text-accent uppercase tracking-wider">
                                    {res.type?.replace('_', ' ') || 'ASSET'}
                                </span>

                                {isAdmin ? (
                                    <select 
                                        value={res.status} 
                                        onChange={(e) => handleStatusUpdate(res.id, e.target.value)}
                                        className={`text-xs font-bold px-2.5 py-1 rounded-xl outline-none cursor-pointer border transition-colors bg-surface
                                            ${res.status === 'ACTIVE' ? 'border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/5' : ''}
                                            ${res.status === 'MAINTENANCE' ? 'border-amber-500/20 text-amber-500 hover:bg-amber-500/5' : ''}
                                            ${res.status === 'OUT_OF_ORDER' ? 'border-red-500/20 text-red-500 hover:bg-red-500/5' : ''}
                                        `}
                                    >
                                        <option value="ACTIVE" className="bg-surface text-emerald-500 font-bold">ACTIVE</option>
                                        <option value="MAINTENANCE" className="bg-surface text-amber-500 font-bold">MAINTENANCE</option>
                                        <option value="OUT_OF_ORDER" className="bg-surface text-red-500 font-bold">OUT OF ORDER</option>
                                    </select>
                                ) : (
                                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-xl border tracking-wide uppercase
                                        ${res.status === 'ACTIVE' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : ''}
                                        ${res.status === 'MAINTENANCE' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : ''}
                                        ${res.status === 'OUT_OF_ORDER' ? 'bg-red-500/10 border-red-500/20 text-red-500' : ''}
                                    `}>
                                        {res.status.replace('_', ' ')}
                                    </span>
                                )}
                            </div>

                            {/* Asset Illustration or Real Image */}
                            <div className="relative w-full aspect-video rounded-2xl bg-raised border border-subtle overflow-hidden flex items-center justify-center flex-shrink-0">
                                {res.imageUrl ? (
                                    <img 
                                        src={res.imageUrl.startsWith('http') ? res.imageUrl : `http://localhost:8080${res.imageUrl}`} 
                                        alt={res.name} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-center p-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-accent/20 to-accent/5 flex items-center justify-center text-accent mb-2 group-hover:rotate-6 transition-transform">
                                            <Laptop className="w-6 h-6" />
                                        </div>
                                        <p className="text-xs font-bold text-muted uppercase tracking-wider">{res.availabilityWindows || 'Always open'}</p>
                                    </div>
                                )}
                            </div>

                            {/* Main Descriptions */}
                            <div className="flex-1 flex flex-col justify-start">
                                <h3 className="text-lg font-black tracking-tight text-primary leading-tight group-hover:text-accent transition-colors">
                                    {res.name}
                                </h3>
                                <p className="text-xs font-medium text-muted mt-1.5 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-muted rounded-full flex-shrink-0" />
                                    {res.location || 'Central Inventory'}
                                </p>
                            </div>

                            {/* Cards Command Gateway */}
                            <div className="pt-3 border-t border-subtle flex justify-end items-center gap-2 z-10">
                                {isAdmin ? (
                                    <>
                                        <button 
                                            onClick={() => setEditingResource(res)}
                                            className="p-2.5 rounded-xl bg-raised hover:bg-muted-fill text-muted hover:text-accent border border-subtle cursor-pointer transition-colors shadow-sm flex items-center justify-center"
                                            title="Edit Asset"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleShowQR(res)}
                                            className="p-2.5 rounded-xl bg-raised hover:bg-muted-fill text-muted hover:text-accent border border-subtle cursor-pointer transition-colors shadow-sm flex items-center justify-center"
                                            title="View QR Code"
                                        >
                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(res.id)}
                                            className="p-2.5 rounded-xl bg-raised hover:bg-red-500/10 text-muted hover:text-red-500 border border-subtle cursor-pointer transition-colors shadow-sm flex items-center justify-center"
                                            title="Delete Asset"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </>
                                ) : (
                                    <button 
                                        onClick={() => handleBook(res)}
                                        disabled={res.status !== 'ACTIVE'}
                                        className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-accent hover-bg-accent text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer border-none disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        <CalendarCheck className="w-3.5 h-3.5" /> Request Rental
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    
                    {filteredResources.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center p-12 bg-surface rounded-3xl border border-subtle">
                            <AlertCircle className="w-10 h-10 text-muted mb-3" />
                            <h3 className="text-base font-bold text-primary">Zero Equipment Nodes</h3>
                            <p className="text-xs text-muted mt-1 text-center max-w-xs">There are no operational device arrays available.</p>
                        </div>
                    )}
                </div>

                {/* ── Pagination Gateway ── */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-8">
                        <button 
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            className="px-4 py-2 text-xs font-bold bg-surface border border-subtle text-primary rounded-xl hover:bg-raised transition-colors disabled:opacity-40 disabled:hover:bg-surface cursor-pointer"
                        >
                            Previous
                        </button>
                        
                        <div className="flex items-center gap-1">
                            {[...Array(totalPages)].map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentPage(idx + 1)}
                                    className={`w-8 h-8 text-xs font-black rounded-xl transition-all cursor-pointer ${currentPage === idx + 1 ? 'bg-accent text-white shadow-sm border-none' : 'bg-surface text-secondary hover:bg-raised border border-subtle'}`}
                                >
                                    {idx + 1}
                                </button>
                            ))}
                        </div>

                        <button 
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            className="px-4 py-2 text-xs font-bold bg-surface border border-subtle text-primary rounded-xl hover:bg-raised transition-colors disabled:opacity-40 disabled:hover:bg-surface cursor-pointer"
                        >
                            Next
                        </button>
                    </div>
                )}
                </>
            )}

            {isAdmin && editingResource && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-overlay rounded-2xl p-6 shadow-2xl w-full max-w-xl relative animate-fade-in" style={{ border: '1px solid var(--border-subtle)' }}>
                        <div className="flex justify-between items-center mb-4 pb-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            <h2 className="text-lg font-bold text-primary">
                                Update Equipment Details
                            </h2>
                            <button onClick={() => setEditingResource(null)} className="text-muted hover:text-primary transition-colors p-1.5 rounded-lg hover:bg-muted-fill cursor-pointer border-none bg-transparent">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <EquipmentForm 
                            onSubmit={handleEditSubmit} 
                            onCancel={() => setEditingResource(null)} 
                            resource={editingResource}
                        />
                    </div>
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

            {deleteConfirmId && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-overlay border border-subtle glass-card p-6 rounded-2xl max-w-sm w-full text-center shadow-xl flex flex-col gap-4">
                        <h3 className="text-lg font-bold text-primary">Confirm Deletion</h3>
                        <p className="text-sm text-secondary">Are you completely sure you want to permanently delete this item? This operation cannot be undone.</p>
                        <div className="flex gap-3 justify-center mt-2">
                            <button 
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-4 py-2 text-xs font-bold rounded-xl bg-raised border border-subtle text-muted hover:text-primary cursor-pointer transition-all border-none"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => {
                                    deleteMutation.mutate(deleteConfirmId);
                                    setDeleteConfirmId(null);
                                }}
                                className="px-4 py-2 text-xs font-bold rounded-xl bg-red-500 hover:bg-red-600 text-white cursor-pointer transition-all border-none"
                            >
                                Delete Permanently
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssetsPage;
