import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createBooking, fetchResources } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { 
  X, Calendar, Clock, Users, FileText, AlertTriangle, 
  Loader2, CheckCircle, Info, Search, Filter, ChevronRight,
  Sparkles, ShieldCheck
} from 'lucide-react';

const calcDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return '';
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const minutes = eh * 60 + em - (sh * 60 + sm);
  if (minutes <= 0) return '';
  return minutes < 60 
    ? `${minutes}m` 
    : `${Math.floor(minutes / 60)}h${minutes % 60 ? ` ${minutes % 60}m` : ''}`;
};

const ConflictCard = ({ b }) => {
  const fmt = (iso) => new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const fmtD = (iso) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return (
    <div className="flex items-start gap-2 p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-sm">
      <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
      <span className="text-red-500 font-medium">
        Booking #{b.id} — {fmtD(b.startTime)}, {fmt(b.startTime)} – {fmt(b.endTime)}
      </span>
    </div>
  );
};

const BookingForm = ({ resource, onClose, onSuccess }) => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Multi-step state
  const [step, setStep] = useState(resource ? 2 : 1);
  const [selectedResource, setSelectedResource] = useState(resource || null);
  
  // Step 1 State (Filters)
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');

  // Step 2 State (Form)
  const [form, setForm] = useState({
    date: '',
    startTime: '',
    endTime: '',
    purpose: '',
    attendees: 1,
  });

  const [errors, setErrors] = useState({});
  const [conflictData, setConflictData] = useState(null);

  // Fetch resources for Step 1
  const { data: resources = [], isLoading: resourcesLoading } = useQuery({
    queryKey: ['resources'],
    queryFn: () => fetchResources(null),
    enabled: !resource, // Only fetch if we need to select
  });

  const activeResources = useMemo(() => {
    return resources.filter(r => r.status === 'ACTIVE');
  }, [resources]);

  const filteredResources = useMemo(() => {
    return activeResources.filter(res => {
      const matchesSearch = res.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (res.location && res.location.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = !filterType || res.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [activeResources, searchQuery, filterType]);

  const mutation = useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      onSuccess?.();
      onClose();
    },
    onError: (err) => {
      if (err.response?.status === 409) {
        setConflictData(err.response.data);
      } else {
        alert(err.message || 'Failed to create booking');
      }
    },
  });

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
    if (conflictData) setConflictData(null);
  };

  const validate = () => {
    const e = {};
    if (!form.date) e.date = 'Required';
    if (!form.startTime) e.startTime = 'Required';
    if (!form.endTime) e.endTime = 'Required';
    
    if (form.startTime && form.endTime) {
      const start = new Date(`2000-01-01T${form.startTime}`);
      const end = new Date(`2000-01-01T${form.endTime}`);
      const diffMins = (end - start) / 1000 / 60;
      
      if (start >= end) e.endTime = 'Must be after start time';
      else if (diffMins < 30) e.endTime = 'Minimum 30 minutes required';
      else if (diffMins > 480) e.endTime = 'Maximum 8 hours allowed';
    }

    if (!form.purpose.trim()) e.purpose = 'Required';
    if (form.purpose.trim().length < 10) e.purpose = 'Min 10 characters';
    if (Number(form.attendees) < 1) e.attendees = 'Min 1';
    if (selectedResource?.capacity && Number(form.attendees) > selectedResource.capacity) {
      e.attendees = `Max ${selectedResource.capacity}`;
    }
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setConflictData(null);
    if (!validate()) return;

    const payload = {
      resourceId: selectedResource.id,
      userId: user?.id || 1,
      startTime: `${form.date}T${form.startTime}:00`,
      endTime: `${form.date}T${form.endTime}:00`,
      purpose: form.purpose.trim(),
      attendees: Number(form.attendees),
    };

    mutation.mutate(payload);
  };

  const inp = (f) => 
    `w-full px-4 py-3 bg-surface border rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-accent text-primary placeholder:text-muted
     ${errors[f] 
       ? 'border-red-500 bg-red-500/5 focus:ring-red-500' 
       : 'border-subtle hover:border-muted focus:border-accent'
     }`;

  const isOverCapacity = selectedResource?.capacity && Number(form.attendees) > selectedResource.capacity;
  const isNearCapacity = selectedResource?.capacity && Number(form.attendees) >= selectedResource.capacity * 0.9 && !isOverCapacity;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-overlay rounded-3xl shadow-2xl overflow-hidden border border-subtle flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between bg-raised border-b border-subtle">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-subtle text-accent rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-primary">
                {step === 1 ? 'Select a Resource' : 'Booking Details'}
              </h2>
              <p className="text-xs text-muted mt-0.5">
                {step === 1 
                  ? 'Choose a space or equipment to reserve' 
                  : `Reserve ${selectedResource?.name}`
                }
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-muted hover:text-primary transition-colors p-2 rounded-xl hover:bg-muted-fill cursor-pointer border-none bg-transparent"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Resource Selection */}
        {step === 1 && (
          <div className="flex flex-col flex-1 overflow-hidden bg-overlay">
            {/* Search & Filters */}
            <div className="p-4 bg-raised border-b border-subtle flex flex-wrap gap-3">
              <div className="flex-1 min-w-[200px] flex items-center gap-2 px-3 py-2 bg-surface border border-subtle rounded-xl focus-within:ring-2 focus-within:ring-accent focus-within:border-accent transition-all">
                <Search className="w-4 h-4 text-muted flex-shrink-0" />
                <input 
                  type="text" 
                  placeholder="Search name or location..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm text-primary placeholder:text-muted w-full"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted" />
                <select 
                  value={filterType} 
                  onChange={e => setFilterType(e.target.value)}
                  className="bg-surface border border-subtle rounded-xl px-3 py-2 text-sm text-primary outline-none focus:ring-2 focus:ring-accent cursor-pointer"
                >
                  <option value="" className="bg-surface">All Types</option>
                  <option value="LECTURE_HALL" className="bg-surface">Lecture Halls</option>
                  <option value="LAB" className="bg-surface">Laboratories</option>
                  <option value="EQUIPMENT" className="bg-surface">Equipment</option>
                </select>
              </div>
            </div>

            {/* Resource List */}
            <div className="p-6 overflow-y-auto space-y-3 flex-1 bg-overlay">
              {resourcesLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted">
                  <Loader2 className="w-8 h-8 animate-spin text-accent mb-2" />
                  <p className="text-sm">Loading resources...</p>
                </div>
              ) : filteredResources.length === 0 ? (
                <div className="text-center py-12 text-muted">
                  <p className="text-sm font-medium">No active resources found.</p>
                  <p className="text-xs mt-1">Try adjusting your search filters.</p>
                </div>
              ) : (
                filteredResources.map(r => (
                  <button 
                    key={r.id} 
                    onClick={() => { setSelectedResource(r); setStep(2); }}
                    className="w-full text-left p-4 bg-surface hover:bg-raised border border-subtle hover:border-accent rounded-2xl transition-all flex items-center justify-between gap-4 group cursor-pointer"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-primary group-hover:text-accent transition-colors">
                          {r.name}
                        </span>
                        <span className="px-2 py-0.5 bg-accent-subtle text-accent text-[10px] font-bold rounded-md uppercase tracking-wider">
                          {r.type?.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
                        {r.location && <span>📍 {r.location}</span>}
                        {r.capacity && <span>👥 Max {r.capacity}</span>}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted group-hover:text-accent group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Step 2: Booking Details Form */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden bg-overlay">
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Back button if we started at Step 1 */}
              {!resource && (
                <button 
                  type="button" 
                  onClick={() => setStep(1)}
                  className="text-xs font-bold text-accent hover:underline flex items-center gap-1 mb-2 bg-transparent border-none cursor-pointer"
                >
                  ← Back to resource selection
                </button>
              )}

              {/* Resource Summary Card */}
              <div className="p-4 bg-raised border border-subtle rounded-2xl flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-primary">{selectedResource?.name}</h4>
                  <div className="flex flex-wrap gap-x-3 mt-1 text-xs text-muted">
                    {selectedResource?.location && <span>📍 {selectedResource.location}</span>}
                    {selectedResource?.capacity && <span>👥 Capacity: {selectedResource.capacity}</span>}
                  </div>
                </div>
                <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-bold rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Available
                </div>
              </div>

              {/* Alerts */}
              {conflictData && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <p className="text-sm font-semibold text-red-500">Scheduling Conflict</p>
                  </div>
                  <p className="text-red-500 text-xs mb-3">{conflictData.message}</p>
                  <div className="space-y-1.5">
                    {conflictData.conflictingBookings?.map(b => <ConflictCard key={b.id} b={b} />)}
                  </div>
                </div>
              )}

              {isOverCapacity && (
                <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-2 animate-shake">
                  <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-500">
                    <strong>Capacity Exceeded:</strong> Maximum allowed of {selectedResource.capacity} attendees.
                  </p>
                </div>
              )}

              {isNearCapacity && (
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-500">
                    <strong>Near Capacity:</strong> Reaching max room capacity of {selectedResource.capacity}.
                  </p>
                </div>
              )}

              {/* Date Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
                  <Calendar className="w-3.5 h-3.5 inline mr-1" /> Date
                </label>
                <input 
                  type="date" 
                  value={form.date} 
                  min={new Date().toISOString().split('T')[0]} 
                  onChange={e => handleChange('date', e.target.value)} 
                  className={inp('date')} 
                />
                {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
              </div>

              {/* Time Inputs */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  ['startTime', 'Start Time'], 
                  ['endTime', 'End Time']
                ].map(([f, label]) => (
                  <div key={f}>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
                      <Clock className="w-3.5 h-3.5 inline mr-1" /> {label}
                    </label>
                    <input 
                      type="time" 
                      value={form[f]} 
                      onChange={e => handleChange(f, e.target.value)} 
                      className={inp(f)} 
                    />
                    {errors[f] && <p className="text-red-500 text-xs mt-1">{errors[f]}</p>}
                  </div>
                ))}
              </div>

              {/* Duration Badge */}
              {calcDuration(form.startTime, form.endTime) && (
                <div className="flex justify-center">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-bold rounded-full">
                    ⏱ Total Duration: {calcDuration(form.startTime, form.endTime)}
                  </span>
                </div>
              )}

              {/* Purpose Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
                  <FileText className="w-3.5 h-3.5 inline mr-1" /> Purpose
                </label>
                <textarea 
                  value={form.purpose} 
                  rows={3} 
                  placeholder="Describe the purpose of your booking (Min. 10 characters)..." 
                  onChange={e => handleChange('purpose', e.target.value)} 
                  spellCheck={false} 
                  className={`${inp('purpose')} resize-none`} 
                />
                <div className="flex justify-between mt-1 text-[10px]">
                  {errors.purpose ? <p className="text-red-500">{errors.purpose}</p> : <span />}
                  <span className="text-muted">{form.purpose.length}/500</span>
                </div>
              </div>

              {/* Attendees Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
                  <Users className="w-3.5 h-3.5 inline mr-1" /> Attendees
                </label>
                <input 
                  type="number" 
                  min={1} 
                  max={selectedResource?.capacity || 1000} 
                  value={form.attendees} 
                  onChange={e => handleChange('attendees', e.target.value)} 
                  className={inp('attendees')} 
                />
                {errors.attendees && <p className="text-red-500 text-xs mt-1">{errors.attendees}</p>}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-raised border-t border-subtle flex gap-3">
              <button 
                type="button" 
                onClick={onClose} 
                className="flex-1 px-4 py-3 text-sm font-bold text-secondary bg-surface hover:bg-muted-fill border border-subtle rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={mutation.isPending || isOverCapacity} 
                className="flex-1 px-4 py-3 text-sm font-bold text-white bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer border-none shadow-md shadow-accent/20"
              >
                {mutation.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                ) : (
                  <><CheckCircle className="w-4 h-4" /> Request Booking</>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default BookingForm;