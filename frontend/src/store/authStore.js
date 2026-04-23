import { create } from 'zustand';

export const useAuthStore = create((set) => ({

    //  Mock users (for testing roles)
    mockUsers: [
        {
            id: 1,
            name: "Normal User",
            role: "USER",
        },
        {
            id: 2,
            name: "Tech Guy",
            role: "TECHNICIAN",
        },
        {
            id: 3,
            name: "Admin User",
            role: "ADMIN",
        },
    ],

    // Current logged user
    user: null,

    // Set real user (from login later)
    setUser: (user) => set({ user }),

    //  Switch user manually (FOR TESTING)
    switchUser: (role) =>
        set((state) => ({
            user: state.mockUsers.find((u) => u.role === role)
        })),

    // Logout
    logout: () => set({ user: null }),
}));