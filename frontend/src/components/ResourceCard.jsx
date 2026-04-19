import React from 'react';
import { MapPin, Users, Activity, Settings, QrCode } from 'lucide-react';

const ResourceCard = ({ resource, onStatusUpdate, onDelete, onShowQR }) => {
    const isLab = resource.type === 'LAB';
    const isHall = resource.type === 'LECTURE_HALL';
    
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all group flex flex-col h-full">
            {/* Image Header */}
            <div className="relative aspect-video w-full bg-slate-100 overflow-hidden border-b border-slate-100">
                {resource.imageUrl ? (
                    <img 
                        src={`http://localhost:8080${resource.imageUrl}`} 
                        alt={resource.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                        {isLab && <Activity className="w-12 h-12 mb-2" />}
                        {isHall && <Users className="w-12 h-12 mb-2" />}
                        {!isLab && !isHall && <Settings className="w-12 h-12 mb-2" />}
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">No Photo</span>
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
                            ${isLab ? 'bg-blue-100 text-blue-800' : 
                              isHall ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'}`}>
                            {resource.type.replace('_', ' ')}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 border-b border-transparent hover:border-slate-300 pb-1">{resource.name}</h3>
                    </div>
                </div>
                
                <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm text-slate-600">
                        <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                        {resource.location || 'Location not specified'}
                    </div>
                    {resource.capacity && (
                        <div className="flex items-center text-sm text-slate-600">
                            <Users className="w-4 h-4 mr-2 text-slate-400" />
                            Capacity: {resource.capacity}
                        </div>
                    )}
                    <div className="flex items-center text-sm text-slate-600">
                        <Activity className="w-4 h-4 mr-2 text-slate-400" />
                        Available: {resource.availabilityWindows || 'Anytime'}
                    </div>
                </div>
                
                <div className="flex items-center space-x-2 pt-4 border-t border-slate-100">
                    <button 
                        onClick={() => onStatusUpdate(resource.id, resource.status === 'ACTIVE' ? 'OUT_OF_SERVICE' : 'ACTIVE')}
                        className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors border border-slate-200"
                    >
                        Toggle Status
                    </button>
                    <button 
                        onClick={() => onShowQR(resource)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                        title="Generate QR Code"
                    >
                        <QrCode className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => onDelete(resource.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                    >
                        <Settings className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResourceCard;
