import React, { useState } from 'react';
import { X, Camera, Upload } from 'lucide-react';
import { uploadResourceImage } from '../services/api';

const ResourceForm = ({ onSubmit, onCancel, resource = null }) => {
    const [formData, setFormData] = useState({
        name: resource?.name || '',
        type: resource?.type || 'LECTURE_HALL',
        capacity: resource?.capacity || '',
        location: resource?.location || '',
        availabilityWindows: resource?.availabilityWindows || '',
        status: resource?.status || 'ACTIVE'
    });

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(resource?.imageUrl || null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = {
                ...formData,
                capacity: formData.capacity === '' ? null : parseInt(formData.capacity)
            };
            
            const savedResource = await onSubmit(data);

            // If there's an image file, upload it separately
            if (imageFile && savedResource?.id) {
                await uploadResourceImage(savedResource.id, imageFile);
            }
        } catch (error) {
            console.error('Submission failed', error);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Add New Resource</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Image Upload Area */}
                <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group relative overflow-hidden">
                    {imagePreview ? (
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                            <img 
                                src={imagePreview.startsWith('data:') ? imagePreview : `http://localhost:8080${imagePreview}`} 
                                className="w-full h-full object-cover" 
                                alt="Preview" 
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <label className="cursor-pointer bg-white/20 backdrop-blur-md p-3 rounded-full hover:bg-white/40 transition-all">
                                    <Camera className="w-6 h-6 text-white" />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                </label>
                            </div>
                        </div>
                    ) : (
                        <label className="cursor-pointer flex flex-col items-center py-6 w-full">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-full mb-3">
                                <Upload className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-semibold text-slate-900">Upload Asset Photo</span>
                            <span className="text-xs text-slate-500 mt-1">PNG, JPG up to 5MB</span>
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                        </label>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                        <input required type="text" name="name" value={formData.name} onChange={handleChange} 
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                        <select name="type" value={formData.type} onChange={handleChange}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
                            <option value="LECTURE_HALL">Lecture Hall</option>
                            <option value="LAB">Laboratory</option>
                            <option value="EQUIPMENT">Equipment</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Capacity</label>
                        <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} 
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                        <input type="text" name="location" value={formData.location} onChange={handleChange} 
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Availability Windows</label>
                        <input type="text" name="availabilityWindows" placeholder="e.g. 08:00 - 17:00" value={formData.availabilityWindows} onChange={handleChange} 
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                    </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-slate-100">
                    <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                        Cancel
                    </button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm">
                        Save Resource
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ResourceForm;
