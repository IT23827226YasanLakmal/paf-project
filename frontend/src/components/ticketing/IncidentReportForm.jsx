import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTicket } from '../../services/ticketApi';
import { supabase } from '../../supabaseClient';
import { AlertCircle, Camera, CheckCircle2, Loader2, UploadCloud } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const IncidentReportForm = ({ onReportComplete }) => {
  const [formData, setFormData] = useState({
    resourceId: '1', 
    category: 'HARDWARE',
    priority: 'MEDIUM',
    description: '',
  });
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { user } = useAuthStore();
  
  const queryClient = useQueryClient();

  const ticketMutation = useMutation({
    mutationFn: createTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      if (onReportComplete) onReportComplete();
    },
    onError: (error) => {
      console.error("Error creating ticket:", error);
      alert("Failed to submit report. Ensure the backend is running.");
    }
  });

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setFilePreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.description) return;

    let imageUrl = null;

    if (file) {
        try {
            setUploadProgress(10);
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            setUploadProgress(40);
            
            const { error: uploadError, data } = await supabase.storage
              .from('incident-images')
              .upload(filePath, file);

            setUploadProgress(80);

            if (uploadError) {
                console.error('Upload Error:', uploadError);
                throw uploadError;
            }

            if (data) {
                 const { data: { publicUrl } } = supabase.storage
                    .from('incident-images')
                    .getPublicUrl(filePath);
                 imageUrl = publicUrl;
            }
        } catch (err) {
            console.error(err);
            alert(`Upload failed: ${err.message || "Unknown error"}. Ensure your Supabase bucket 'incident-images' exists and has an 'INSERT' policy for public uploads.`);
        }
    }

    setUploadProgress(100);

    const ticketData = {
        resourceId: parseInt(formData.resourceId), 
        userId: user?.supabaseUid || user?.id, 
        category: formData.category,
        description: formData.description,
        priority: formData.priority,
        status: 'OPEN',
        imageUrl: imageUrl,
    };

    ticketMutation.mutate(ticketData);
  };

  return (
    <div className="bg-surface rounded-2xl shadow-sm overflow-hidden max-w-2xl mx-auto mt-8" style={{ border: '1px solid var(--border-subtle)' }}>
      <div className="bg-gradient-to-r from-accent/20 via-accent/5 to-raised px-8 py-5 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <AlertCircle className="text-accent w-6 h-6 animate-pulse" />
        <h2 className="text-xl font-black tracking-tight text-primary">Report an Incident</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
            <label className="text-xs font-bold text-muted uppercase tracking-wider block mb-1">Affected Resource ID</label>
            <input 
                type="number" 
                value={formData.resourceId}
                onChange={(e) => setFormData({...formData, resourceId: e.target.value})}
                className="w-full px-4 py-3 bg-raised border border-subtle rounded-xl focus:ring-2 focus:ring-accent outline-none transition-all placeholder:text-muted text-primary"
                placeholder="e.g. 102"
                required
            />
            <p className="text-xs text-muted">Enter the ID of the faulty equipment/hall.</p>
            </div>

            <div className="space-y-2">
            <label className="text-xs font-bold text-muted uppercase tracking-wider block mb-1">Category</label>
            <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-3 bg-raised border border-subtle rounded-xl focus:ring-2 focus:ring-accent outline-none transition-all text-primary"
            >
                <option value="HARDWARE" className="text-primary bg-surface">Hardware Failure</option>
                <option value="SOFTWARE" className="text-primary bg-surface">Software/Network Issue</option>
                <option value="CLEANING" className="text-primary bg-surface">Cleaning/Maintenance required</option>
            </select>
            </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-muted uppercase tracking-wider block mb-1">Priority Level</label>
          <div className="grid grid-cols-4 gap-3">
            {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map(level => (
               <label 
                 key={level} 
                 className={`cursor-pointer border rounded-xl py-3 px-2 text-center text-sm font-medium transition-all ${
                     formData.priority === level 
                        ? 'bg-accent-subtle border-accent text-accent ring-1 ring-accent shadow-sm' 
                        : 'bg-surface border-subtle text-muted hover:bg-raised'
                 }`}
               >
                 <input 
                    type="radio" 
                    name="priority" 
                    value={level}
                    className="hidden"
                    onChange={() => setFormData({...formData, priority: level})}
                 />
                 {level}
               </label> 
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-muted uppercase tracking-wider block mb-1">Description</label>
          <textarea 
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full px-4 py-3 bg-raised border border-subtle rounded-xl focus:ring-2 focus:ring-accent outline-none transition-all placeholder:text-muted resize-none text-primary"
            placeholder="Please describe the issue in detail..."
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-muted uppercase tracking-wider block mb-1">Photo Evidence (Optional)</label>
          
          <div className="relative">
              <input 
                type="file" 
                id="file-upload" 
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange} 
              />
              <label 
                htmlFor="file-upload" 
                className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                    filePreview ? 'border-accent bg-accent-subtle' : 'border-subtle bg-raised hover:bg-muted-fill'
                }`}
              >
                 {filePreview ? (
                     <div className="relative w-full h-full p-2 group">
                         <img src={filePreview} alt="Preview" className="w-full h-full object-contain rounded-xl" />
                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                            <span className="text-white text-sm font-medium flex items-center gap-2"><UploadCloud className="w-4 h-4" /> Change Photo</span>
                         </div>
                     </div>
                 ) : (
                     <div className="flex flex-col items-center justify-center py-5 text-muted">
                          <div className="w-12 h-12 bg-surface rounded-full shadow-sm flex items-center justify-center mb-3">
                             <Camera className="w-5 h-5 text-accent" />
                          </div>
                         <p className="text-sm font-medium text-primary">Click to upload a photo</p>
                         <p className="text-xs text-muted mt-1">PNG, JPG, GIF up to 5MB</p>
                     </div>
                 )}
              </label>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
           <button 
             type="button" 
             onClick={() => window.history.back()}
             className="px-6 py-2.5 rounded-xl font-medium text-secondary hover:bg-raised transition-colors cursor-pointer"
           >
              Cancel
           </button>
           <button 
             type="submit" 
             disabled={ticketMutation.isPending}
             className="px-8 py-2.5 rounded-xl font-semibold text-white bg-accent hover-bg-accent shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
           >
              {ticketMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {uploadProgress > 0 && uploadProgress < 100 ? `Uploading ${uploadProgress}%` : 'Submitting...'}
                  </>
              ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Submit Ticket
                  </>
              )}
           </button>
        </div>
      </form>
    </div>
  );
};

export default IncidentReportForm;
