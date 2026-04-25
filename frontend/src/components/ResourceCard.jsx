import React from 'react';
import { MapPin, Users, Activity, Settings, QrCode } from 'lucide-react';

const ResourceCard = ({ resource, userRole, onStatusUpdate, onDelete, onShowQR, onBook }) => {
    const isLab = resource.type === 'LAB';
    const isHall = resource.type === 'LECTURE_HALL';
    const isAdmin = ['FACILITY_MANAGER', 'ADMIN'].includes(userRole);
    
    return (
        <div 
            className="bg-surface rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all group flex flex-col h-full"
            style={{ border: '1px solid var(--border-subtle)' }}
        >
            {/* Image Header */}
            <div className="relative aspect-video w-full bg-raised overflow-hidden" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                {resource.imageUrl ? (
                    <img 
                        src={`http://localhost:8080${resource.imageUrl}`} 
                        alt={resource.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-muted">
                        {isLab && <Activity className="w-12 h-12 mb-2" />}
                        {isHall && <Users className="w-12 h-12 mb-2" />}
                        {!isLab && !isHall && <Settings className="w-12 h-12 mb-2" />}
                        <span className="text-xs font-bold uppercase tracking-widest">No Photo</span>
                    </div>
                )}
                <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                    resource.status === 'ACTIVE' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                }`}>
                    {resource.status.replace('_', ' ')}
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-3
                            ${isLab ? 'bg-blue-500/10 text-blue-500' : 
                              isHall ? 'bg-violet-500/10 text-violet-500' : 'bg-orange-500/10 text-orange-500'}`}>
                            {resource.type.replace('_', ' ')}
                        </span>
                        <h3 className="text-lg font-bold text-primary pb-1">{resource.name}</h3>
                    </div>
                </div>
                
                <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm text-secondary">
                        <MapPin className="w-4 h-4 mr-2 text-muted" />
                        {resource.location || 'Location not specified'}
                    </div>
                    {resource.capacity && (
                        <div className="flex items-center text-sm text-secondary">
                            <Users className="w-4 h-4 mr-2 text-muted" />
                            Capacity: {resource.capacity}
                        </div>
                    )}
                    <div className="flex items-center text-sm text-secondary">
                        <Activity className="w-4 h-4 mr-2 text-muted" />
                        Available: {resource.availabilityWindows || 'Anytime'}
                    </div>
                </div>
                
                <div className="flex items-center space-x-2 pt-4 mt-auto" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                    {isAdmin ? (
                        <>
                            <button 
                                onClick={() => onStatusUpdate(resource.id, resource.status === 'ACTIVE' ? 'OUT_OF_SERVICE' : 'ACTIVE')}
                                className="flex-1 px-3 py-2 bg-raised hover:bg-muted-fill text-secondary hover:text-primary text-sm font-medium rounded-xl transition-colors"
                                style={{ border: '1px solid var(--border-subtle)' }}
                            >
                                Toggle Status
                            </button>
                            <button 
                                onClick={() => onShowQR(resource)}
                                className="p-2 text-accent bg-accent-subtle hover:bg-accent hover:text-white rounded-xl transition-colors"
                                title="Generate QR Code"
                            >
                                <QrCode className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => onDelete(resource.id)}
                                className="p-2 text-red-500 bg-red-500/10 hover:bg-red-500 hover:text-white rounded-xl transition-colors"
                            >
                                <Settings className="w-4 h-4" />
                            </button>
                        </>
                    ) : (
                        <button 
                            onClick={() => onBook(resource)}
                            disabled={resource.status !== 'ACTIVE'}
                            className={`flex-1 px-3 py-2 text-sm font-medium rounded-xl transition-colors shadow-sm ${
                                resource.status === 'ACTIVE' 
                                    ? 'bg-accent hover-bg-accent text-white cursor-pointer' 
                                    : 'bg-muted-fill text-muted cursor-not-allowed'
                            }`}
                        >
                            {resource.status === 'ACTIVE' ? 'Request Booking' : 'Currently Unavailable'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResourceCard;
