import React, { useState } from 'react';
import { Camera, Upload, AlertCircle } from 'lucide-react';
import { uploadResourceImage } from '../services/api';

const EquipmentForm = ({ onSubmit, onCancel, resource = null }) => {
    const [formData, setFormData] = useState({
        name: resource?.name || '',
        type: 'EQUIPMENT',
        location: resource?.location || '',
        availabilityWindows: resource?.availabilityWindows || '',
        status: resource?.status || 'ACTIVE'
    });

    const [errors, setErrors] = useState({});
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(resource?.imageUrl || null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error as typing
        if (errors[name]) {
            setErrors(prev => {
                const copy = { ...prev };
                delete copy[name];
                return copy;
            });
        }
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

    const validate = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Asset Label / Name is required';
        } else if (formData.name.trim().length < 3) {
            newErrors.name = 'Label must contain at least 3 characters';
        }

        if (formData.availabilityWindows.trim()) {
            const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]\s*-\s*([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
            if (!timeRegex.test(formData.availabilityWindows.trim())) {
                newErrors.availabilityWindows = 'Window must match "HH:mm - HH:mm" (e.g. 09:00 - 18:00)';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            const data = {
                ...formData,
                capacity: null // Equipment typically has no capacity metric
            };
            
            const savedResource = await onSubmit(data);

            if (imageFile && savedResource?.id) {
                await uploadResourceImage(savedResource.id, imageFile);
            }
        } catch (error) {
            console.error('Equipment onboarding failed', error);
        }
    };

    return (
        <div className="bg-surface rounded-2xl p-6 border border-subtle text-primary animate-fade-in">
            <h2 className="text-xl font-black tracking-tight text-primary mb-6">
                {resource ? 'Update Operational Asset' : 'Onboard Equipment Asset'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Photo Upload Area */}
                <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-subtle rounded-2xl bg-raised hover:bg-muted-fill transition-colors group relative overflow-hidden">
                    {imagePreview ? (
                        <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-sm">
                            <img 
                                src={imagePreview.startsWith('data:') ? imagePreview : `http://localhost:8080${imagePreview}`} 
                                className="w-full h-full object-cover" 
                                alt="Preview" 
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <label className="cursor-pointer bg-overlay/30 backdrop-blur-md p-3 rounded-full hover:bg-overlay/50 transition-all">
                                    <Camera className="w-6 h-6 text-white" />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                </label>
                            </div>
                        </div>
                    ) : (
                        <label className="cursor-pointer flex flex-col items-center py-8 w-full">
                            <div className="p-3.5 bg-accent/10 text-accent rounded-2xl mb-3 flex items-center justify-center">
                                <Upload className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-bold text-primary">Upload Gear Photo</span>
                            <span className="text-xs text-muted mt-1 font-medium">PNG, JPG up to 5MB</span>
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                        </label>
                    )}
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Item Label / Name</label>
                        <input 
                            type="text" 
                            name="name" 
                            value={formData.name} 
                            onChange={handleChange} 
                            placeholder="e.g. Sony A7 III Camera"
                            className={`w-full px-4 py-3 bg-raised border text-sm text-primary rounded-xl outline-none focus:ring-2 transition-all ${errors.name ? 'border-red-500/50 focus:ring-red-400' : 'border-subtle focus:ring-accent'}`} 
                        />
                        {errors.name && (
                            <p className="text-xs text-red-500 mt-1 flex items-center gap-1 font-semibold">
                                <AlertCircle className="w-3 h-3" /> {errors.name}
                            </p>
                        )}
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Primary Storage Location</label>
                        <input 
                            type="text" 
                            name="location" 
                            value={formData.location} 
                            onChange={handleChange} 
                            placeholder="e.g. Media Lab Tech-Closet"
                            className="w-full px-4 py-3 bg-raised border border-subtle text-sm text-primary rounded-xl outline-none focus:ring-2 focus:ring-accent transition-all" 
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Reservation window</label>
                        <input 
                            type="text" 
                            name="availabilityWindows" 
                            placeholder="e.g. 09:00 - 18:00" 
                            value={formData.availabilityWindows} 
                            onChange={handleChange} 
                            className={`w-full px-4 py-3 bg-raised border text-sm text-primary rounded-xl outline-none focus:ring-2 transition-all ${errors.availabilityWindows ? 'border-red-500/50 focus:ring-red-400' : 'border-subtle focus:ring-accent'}`} 
                        />
                        {errors.availabilityWindows && (
                            <p className="text-xs text-red-500 mt-1 flex items-center gap-1 font-semibold">
                                <AlertCircle className="w-3 h-3" /> {errors.availabilityWindows}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-subtle">
                    <button 
                        type="button" 
                        onClick={onCancel} 
                        className="px-5 py-2.5 text-sm font-bold text-primary bg-raised hover:bg-muted-fill rounded-xl transition-colors cursor-pointer border border-subtle"
                    >
                        Dismiss
                    </button>
                    <button 
                        type="submit" 
                        className="px-5 py-2.5 text-sm font-bold text-white bg-accent hover-bg-accent rounded-xl shadow-sm transition-all cursor-pointer border-none"
                    >
                        Onboard Asset
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EquipmentForm;
