// stores/sidebarStore.ts
import { create } from "zustand";

interface SidebarState {
  mobileSidebarOpen: boolean;
  toggleMobileSidebar: () => void;
  setMobileSidebar: (value: boolean) => void;
}

const useSidebarStore = create<SidebarState>((set) => ({
  mobileSidebarOpen: false,
  toggleMobileSidebar: () => set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),
  setMobileSidebar: (value: boolean) => set({ mobileSidebarOpen: value }),
}));

export default useSidebarStore;
