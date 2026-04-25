import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchResources, createResource, updateResourceStatus, deleteResource } from '../services/api';
import ResourceCard from '../components/ResourceCard';
import ResourceForm from '../components/ResourceForm';
import BookingForm from '../components/BookingForm';
import QRModal from '../components/QRModal';
import { Plus, Filter } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCatalogueUiStore } from '../store/catalogueUiStore';

const CataloguePage = () => {
    const { user } = useAuthStore();
    const isAdmin = ['FACILITY_MANAGER', 'ADMIN'].includes(user?.role);

    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
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

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-primary tracking-tight">
                        {isAdmin ? 'Facilities & Assets' : 'Resource Catalogue'}
                    </h1>
                    <p className="text-secondary mt-2">
                        {isAdmin ? 'Manage all university bookable resources.' : 'Browse and book university resources.'}
                    </p>
                </div>
                {isAdmin && !showForm && (
                    <button onClick={() => setShowForm(true)} className="inline-flex items-center px-4 py-2 bg-accent hover-bg-accent text-white text-sm font-medium rounded-xl transition-colors shadow-sm cursor-pointer">
                        <Plus className="w-4 h-4 mr-2" /> Add Resource
                    </button>
                )}
            </div>

            {isAdmin && showForm && (
                <div className="mb-8 bg-surface rounded-2xl p-6" style={{ border: '1px solid var(--border-subtle)' }}>
                    <ResourceForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
                </div>
            )}

            <div className="mb-6 flex items-center space-x-4 bg-surface p-3 rounded-xl shadow-sm w-fit" style={{ border: '1px solid var(--border-subtle)' }}>
                <Filter className="w-5 h-5 text-muted ml-2" />
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
                    className="bg-transparent border-none text-sm font-medium text-primary outline-none cursor-pointer pr-4 focus:ring-0">
                    <option value="" className="text-primary bg-surface">All Types</option>
                    <option value="LECTURE_HALL" className="text-primary bg-surface">Lecture Halls</option>
                    <option value="LAB" className="text-primary bg-surface">Laboratories</option>
                    <option value="EQUIPMENT" className="text-primary bg-surface">Equipment</option>
                </select>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {resources.map(resource => (
                        <ResourceCard 
                            key={resource.id} 
                            resource={resource} 
                            userRole={user?.role}
                            onStatusUpdate={handleStatusUpdate}
                            onDelete={handleDelete}
                            onShowQR={handleShowQR}
                            onBook={handleBook}
                        />
                    ))}
                    {resources.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center p-12 bg-raised border-2 border-dashed border-subtle rounded-2xl">
                            <h3 className="text-lg font-medium text-primary">No resources found</h3>
                            <p className="text-secondary mt-1 text-center">Get started by creating a new facility or equipment asset.</p>
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
