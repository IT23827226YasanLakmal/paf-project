import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTicket, uploadTicketImages } from '../../services/ticketApi';
import { AlertCircle, Camera, CheckCircle2, Loader2, UploadCloud, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const IncidentReportForm = ({ onReportComplete }) => {
  const [formData, setFormData] = useState({
    resourceId: '', 
    category: 'HARDWARE',
    priority: 'MEDIUM',
    description: '',
  });
  const [files, setFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { user } = useAuthStore();
  
  const queryClient = useQueryClient();

  const ticketMutation = useMutation({
    mutationFn: createTicket,
    onError: (error) => {
      console.error("Error creating ticket:", error);
    }
  });

  const handleFileChange = (e) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).slice(0, 3 - files.length);
      const newFiles = [...files, ...selectedFiles];
      setFiles(newFiles);
      
      const newPreviews = selectedFiles.map(f => URL.createObjectURL(f));
      setFilePreviews([...filePreviews, ...newPreviews]);
    }
  };

  const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);

    const newPreviews = [...filePreviews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setFilePreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.description) return;

    setUploadProgress(20);
    
    try {
        const ticketData = {
            resourceId: parseInt(formData.resourceId), 
            userId: user?.supabaseUid || user?.id, 
            category: formData.category,
            description: formData.description,
            priority: formData.priority,
            status: 'OPEN',
        };

        const savedTicket = await ticketMutation.mutateAsync(ticketData);
        setUploadProgress(50);

        if (files.length > 0 && savedTicket?.id) {
            await uploadTicketImages(savedTicket.id, files);
        }
        
        setUploadProgress(100);
        
        // Success feedback
        queryClient.invalidateQueries({ queryKey: ['tickets'] });
        setTimeout(() => {
            if (onReportComplete) onReportComplete();
        }, 800);

    } catch (err) {
        console.error(err);
        setUploadProgress(0);
        alert(`Submission failed. Ensure the backend is running and files are under 10MB.`);
    }
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
          <label className="text-xs font-bold text-muted uppercase tracking-wider block mb-1">
            Photo Evidence (Max 3)
          </label>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {filePreviews.map((preview, idx) => (
                  <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-subtle bg-raised">
                      <img src={preview} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-none shadow-lg"
                      >
                         <X className="w-3 h-3" />
                      </button>
                  </div>
              ))}
              
              {files.length < 3 && (
                  <div className="relative aspect-square">
                      <input 
                        type="file" 
                        id="file-upload" 
                        className="hidden" 
                        accept="image/*"
                        multiple
                        onChange={handleFileChange} 
                      />
                      <label 
                        htmlFor="file-upload" 
                        className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-subtle bg-raised hover:bg-muted-fill rounded-xl cursor-pointer transition-all"
                      >
                          <div className="w-10 h-10 bg-surface rounded-full shadow-sm flex items-center justify-center mb-2">
                             <Camera className="w-4 h-4 text-accent" />
                          </div>
                          <span className="text-[10px] font-bold text-primary">Add Photo</span>
                          <span className="text-[9px] text-muted">{3 - files.length} slots left</span>
                      </label>
                  </div>
              )}
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
