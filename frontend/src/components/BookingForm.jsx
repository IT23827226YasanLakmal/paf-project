import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createBooking } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { X, Calendar, Clock, Users, FileText, AlertTriangle, Loader2, CheckCircle, Info } from 'lucide-react';

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
    <div className="flex items-start gap-2 p-2.5 bg-red-50 border border-red-200 rounded-lg text-sm">
      <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
      <span className="text-red-700">
        Booking #{b.id} — {fmtD(b.startTime)}, {fmt(b.startTime)} – {fmt(b.endTime)}
      </span>
    </div>
  );
};

const BookingForm = ({ resource, onClose, onSuccess }) => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    date: '',
    startTime: '',
    endTime: '',
    purpose: '',
    attendees: 1,
  });

  const [errors, setErrors] = useState({});
  const [conflictData, setConflictData] = useState(null);

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
    
    // Time logic validation
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
    if (resource?.capacity && Number(form.attendees) > resource.capacity) e.attendees = `Max ${resource.capacity}`;
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setConflictData(null);
    if (!validate()) return;

    const payload = {
      resourceId: resource.id,
      userId: user?.id || 1,
      startTime: `${form.date}T${form.startTime}:00`,
      endTime: `${form.date}T${form.endTime}:00`,
      purpose: form.purpose.trim(),
      attendees: Number(form.attendees),
    };

    mutation.mutate(payload);
  };

  const inp = (f) => 
    `w-full px-3 py-2 border rounded-lg text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-400 text-gray-900 
     ${errors[f] ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'}`;

  // 🚨 Capacity Alert Logic
  const isOverCapacity = resource?.capacity && Number(form.attendees) > resource.capacity;
  const isNearCapacity = resource?.capacity && Number(form.attendees) >= resource.capacity * 0.9 && !isOverCapacity;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Book Resource</h2>
            <p className="text-sm text-gray-500 mt-0.5">{resource?.name}</p>
            <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-400">
              {resource?.location && <span>📍 {resource.location}</span>}
              {resource?.capacity && <span>👥 Capacity: {resource.capacity}</span>}
              {resource?.availabilityWindows && <span>🕐 {resource.availabilityWindows}</span>}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pt-4 space-y-3">
          {/* Conflict Alert */}
          {conflictData && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <p className="text-sm font-semibold text-red-800">Scheduling Conflict</p>
              </div>
              <p className="text-red-700 text-sm mb-2">{conflictData.message}</p>
              <div className="space-y-1.5">
                {conflictData.conflictingBookings?.map(b => <ConflictCard key={b.id} b={b} />)}
              </div>
            </div>
          )}

          {/* 🚨 Dynamic Capacity Alerts */}
          {isOverCapacity && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">
                <strong>Capacity Exceeded:</strong> This resource allows a maximum of {resource.capacity} attendees. Please reduce the number.
              </p>
            </div>
          )}
          {isNearCapacity && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-700">
                <strong>Near Capacity:</strong> You are booking close to the maximum room capacity of {resource.capacity}.
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <Calendar className="w-3.5 h-3.5 inline mr-1" /> Date
            </label>
            <input type="date" value={form.date} min={new Date().toISOString().split('T')[0]} onChange={e => handleChange('date', e.target.value)} className={inp('date')} />
            {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[['startTime', 'Start Time'], ['endTime', 'End Time']].map(([f, label]) => (
              <div key={f}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <Clock className="w-3.5 h-3.5 inline mr-1" />{label}
                </label>
                <input type="time" value={form[f]} onChange={e => handleChange(f, e.target.value)} className={inp(f)} />
                {errors[f] && <p className="text-red-500 text-xs mt-1">{errors[f]}</p>}
              </div>
            ))}
          </div>

          {calcDuration(form.startTime, form.endTime) && (
            <span className="inline-block px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 text-xs font-semibold rounded-full">
              ⏱ Duration: {calcDuration(form.startTime, form.endTime)}
            </span>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <FileText className="w-3.5 h-3.5 inline mr-1" /> Purpose
            </label>
            <textarea value={form.purpose} rows={3} placeholder="Min. 10 characters..." onChange={e => handleChange('purpose', e.target.value)} spellCheck={false} className={`${inp('purpose')} resize-none`} />
            <div className="flex justify-between mt-1">
              {errors.purpose ? <p className="text-red-500 text-xs">{errors.purpose}</p> : <span />}
              <span className="text-xs text-gray-400">{form.purpose.length}/500</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <Users className="w-3.5 h-3.5 inline mr-1" /> Attendees
            </label>
            <input type="number" min={1} max={resource?.capacity || 1000} value={form.attendees} onChange={e => handleChange('attendees', e.target.value)} className={inp('attendees')} />
            {errors.attendees && <p className="text-red-500 text-xs mt-1">{errors.attendees}</p>}
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={mutation.isPending || isOverCapacity} className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl transition-colors flex items-center justify-center gap-2">
              {mutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <><CheckCircle className="w-4 h-4" /> Request Booking</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;