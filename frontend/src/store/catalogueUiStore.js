import { create } from 'zustand';

export const useCatalogueUiStore = create((set) => ({
    filterType: '',
    searchQuery: '',
    selectedResourceForQR: null,

    setFilterType: (type) => set({ filterType: type }),
    setSearchQuery: (query) => set({ searchQuery: query }),
    setSelectedResourceForQR: (resource) => set({ selectedResourceForQR: resource }),
}));
