import { create } from 'zustand';

// State for Role & Auth later
export const useAuthStore = create((set) => ({
    user: {
        id: 1,
        name: 'Admin User',
        role: 'ADMIN',
    }, // Mock user for now
    setUser: (user) => set({ user }),
    logout: () => set({ user: null }),
}));
