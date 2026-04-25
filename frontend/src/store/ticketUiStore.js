import { create } from 'zustand';

export const useTicketUiStore = create((set) => ({
  activeTab: 'board',
  selectedTicket: null,
  
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  setSelectedTicket: (ticket) => set({ selectedTicket: ticket }),
  
  clearSelectedTicket: () => set({ selectedTicket: null }),
}));
