import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useBookingUiStore = create(
  persist(
    (set) => ({
      // ── Admin Booking Review Page State ──
      adminStatusFilter: '',
      adminSearch: '',
      adminViewTarget: null,
      adminEditTarget: null,
      adminDeleteTarget: null,
      adminCancelTarget: null,
      adminRejectTarget: null,

      // ── My Bookings Page State ──
      myStatusFilter: '',
      mySearch: '',
      myViewTarget: null,
      myEditTarget: null,
      myDeleteTarget: null,
      myCancelTarget: null,

      // ── Admin Actions ──
      setAdminStatusFilter: (status) => set({ adminStatusFilter: status }),
      setAdminSearch: (query) => set({ adminSearch: query }),
      setAdminViewTarget: (booking) => set({ adminViewTarget: booking }),
      setAdminEditTarget: (booking) => set({ adminEditTarget: booking }),
      setAdminDeleteTarget: (booking) => set({ adminDeleteTarget: booking }),
      setAdminCancelTarget: (booking) => set({ adminCancelTarget: booking }),
      setAdminRejectTarget: (booking) => set({ adminRejectTarget: booking }),

      // ── My Bookings Actions ──
      setMyStatusFilter: (status) => set({ myStatusFilter: status }),
      setMySearch: (query) => set({ mySearch: query }),
      setMyViewTarget: (booking) => set({ myViewTarget: booking }),
      setMyEditTarget: (booking) => set({ myEditTarget: booking }),
      setMyDeleteTarget: (booking) => set({ myDeleteTarget: booking }),
      setMyCancelTarget: (booking) => set({ myCancelTarget: booking }),

      // ── Batch reset (clear all modals for a page) ──
      resetAdminModals: () =>
        set({
          adminViewTarget: null,
          adminEditTarget: null,
          adminDeleteTarget: null,
          adminCancelTarget: null,
          adminRejectTarget: null,
        }),

      resetMyModals: () =>
        set({
          myViewTarget: null,
          myEditTarget: null,
          myDeleteTarget: null,
          myCancelTarget: null,
        }),

      // ── Reset all state ──
      resetAll: () =>
        set({
          adminStatusFilter: '',
          adminSearch: '',
          adminViewTarget: null,
          adminEditTarget: null,
          adminDeleteTarget: null,
          adminCancelTarget: null,
          adminRejectTarget: null,
          myStatusFilter: '',
          mySearch: '',
          myViewTarget: null,
          myEditTarget: null,
          myDeleteTarget: null,
          myCancelTarget: null,
        }),
    }),
    {
      name: 'booking-ui-store', // localStorage key
      partialize: (state) => ({
        // Only persist filters, not modal targets
        adminStatusFilter: state.adminStatusFilter,
        adminSearch: state.adminSearch,
        myStatusFilter: state.myStatusFilter,
        mySearch: state.mySearch,
      }),
    }
  )
);