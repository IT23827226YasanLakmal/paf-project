import { create } from 'zustand';
 
export const useBookingUiStore = create((set) => ({
  // Persistent filter state 
  statusFilter: '',
  search: '',
 
  // Modal targets (cleared when modal closes)
  viewTarget: null,
  editTarget: null,
 
  // Actions
  setStatusFilter: (status) => set({ statusFilter: status }),
  setSearch:       (query)  => set({ search: query }),
  setViewTarget:   (booking) => set({ viewTarget: booking }),
  setEditTarget:   (booking) => set({ editTarget: booking }),
}));