import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTicket } from '../../services/ticketApi';
import { supabase } from '../../services/supabaseClient';
import { AlertCircle, Camera, CheckCircle2, Loader2, UploadCloud } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const IncidentReportForm = ({ onReportComplete }) => {
  const [formData, setFormData] = useState({
    resourceId: '1', // Defaulting for now, in a real app this would be populated from Role 1's resources
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
            
            // Note: Make sure the bucket 'incident-images' is created and is public in Supabase
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
            alert("Failed to upload image. Submitting ticket without image or please configure your Supabase bucket.");
        }
    }

    setUploadProgress(100);

    const ticketData = {
        resourceId: parseInt(formData.resourceId) || 1, // Fallback dummy ID if not selected
        userId: user?.id || 1, // Fallback dummy user ID if not logged in proper
        category: formData.category,
        description: formData.description,
        priority: formData.priority,
        status: 'OPEN',
        imageUrl: imageUrl,
    };

    ticketMutation.mutate(ticketData);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden max-w-2xl mx-auto mt-8">
      <div className="bg-slate-50 border-b border-slate-100 px-8 py-5 flex items-center gap-3">
        <AlertCircle className="text-blue-500 w-6 h-6" />
        <h2 className="text-xl font-bold tracking-tight text-slate-800">Report an Incident</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600">Affected Resource ID</label>
            <input 
                type="number" 
                value={formData.resourceId}
                onChange={(e) => setFormData({...formData, resourceId: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                placeholder="e.g. 102"
                required
            />
            <p className="text-xs text-slate-400">Enter the ID of the faulty equipment/hall.</p>
            </div>

            <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600">Category</label>
            <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
                <option value="HARDWARE">Hardware Failure</option>
                <option value="SOFTWARE">Software/Network Issue</option>
                <option value="CLEANING">Cleaning/Maintenance required</option>
            </select>
            </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-600">Priority Level</label>
          <div className="grid grid-cols-4 gap-3">
            {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map(level => (
               <label 
                 key={level} 
                 className={`cursor-pointer border rounded-xl py-3 px-2 text-center text-sm font-medium transition-all ${
                     formData.priority === level 
                        ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500 shadow-sm' 
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300'
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
          <label className="text-sm font-semibold text-slate-600">Description</label>
          <textarea 
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 resize-none"
            placeholder="Please describe the issue in detail..."
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-600 block">Photo Evidence (Optional)</label>
          
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
                    filePreview ? 'border-blue-400 bg-blue-50/50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400'
                }`}
              >
                 {filePreview ? (
                     <div className="relative w-full h-full p-2 group">
                         <img src={filePreview} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                            <span className="text-white text-sm font-medium flex items-center gap-2"><UploadCloud className="w-4 h-4" /> Change Photo</span>
                         </div>
                     </div>
                 ) : (
                     <div className="flex flex-col items-center justify-center py-5 text-slate-400">
                         <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3">
                            <Camera className="w-5 h-5 text-blue-500" />
                         </div>
                        <p className="text-sm font-medium text-slate-600">Click to upload a photo</p>
                        <p className="text-xs text-slate-400 mt-1">PNG, JPG, GIF up to 5MB</p>
                     </div>
                 )}
              </label>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
           <button 
             type="button" 
             onClick={() => window.history.back()}
             className="px-6 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors"
           >
              Cancel
           </button>
           <button 
             type="submit" 
             disabled={ticketMutation.isPending}
             className="px-8 py-2.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-200 transition-all focus:ring-4 focus:ring-blue-100 flex items-center gap-2 disabled:bg-blue-400"
           >
              {ticketMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {uploadProgress > 0 && uploadProgress < 100 ? `Uploading Image ${uploadProgress}%...` : 'Submitting...'}
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
