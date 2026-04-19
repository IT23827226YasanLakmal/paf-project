import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchResources, createResource, updateResourceStatus, deleteResource } from '../services/api';
import ResourceCard from '../components/ResourceCard';
import ResourceForm from '../components/ResourceForm';
import QRModal from '../components/QRModal';
import { Plus, Filter } from 'lucide-react';

const CataloguePage = () => {
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [filterType, setFilterType] = useState('');
    const [selectedResourceForQR, setSelectedResourceForQR] = useState(null);

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

    const handleCreate = (data) => createMutation.mutate(data);
    
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

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Facilities & Assets</h1>
                    <p className="text-slate-500 mt-2">Manage all university bookable resources.</p>
                </div>
                {!showForm && (
                    <button onClick={() => setShowForm(true)} className="inline-flex items-center px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors shadow-sm cursor-pointer hover:shadow-md">
                        <Plus className="w-4 h-4 mr-2" /> Add Resource
                    </button>
                )}
            </div>

            {showForm && (
                <div className="mb-8">
                    <ResourceForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
                </div>
            )}

            <div className="mb-6 flex items-center space-x-4 bg-white p-3 rounded-lg border border-slate-200 shadow-sm w-fit">
                <Filter className="w-5 h-5 text-slate-400 ml-2" />
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
                    className="bg-transparent border-none text-sm font-medium text-slate-700 outline-none cursor-pointer pr-4 focus:ring-0">
                    <option value="">All Types</option>
                    <option value="LECTURE_HALL">Lecture Halls</option>
                    <option value="LAB">Laboratories</option>
                    <option value="EQUIPMENT">Equipment</option>
                </select>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {resources.map(resource => (
                        <ResourceCard 
                            key={resource.id} 
                            resource={resource} 
                            onStatusUpdate={handleStatusUpdate}
                            onDelete={handleDelete}
                            onShowQR={handleShowQR}
                        />
                    ))}
                    {resources.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center p-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl">
                            <h3 className="text-lg font-medium text-slate-900">No resources found</h3>
                            <p className="text-slate-500 mt-1 text-center">Get started by creating a new facility or equipment asset.</p>
                        </div>
                    )}
                </div>
            )}

            <QRModal 
                isOpen={!!selectedResourceForQR} 
                onClose={() => setSelectedResourceForQR(null)} 
                resource={selectedResourceForQR} 
            />
        </div>
    );
};

export default CataloguePage;
