
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: string;
  settings?: Record<string, any>;
}

interface DashboardLayoutState {
  layouts: LayoutItem[];
  updateLayout: (newLayout: LayoutItem[]) => void;
  resetLayout: () => void;
}

export const useDashboardLayout = create<DashboardLayoutState>()(
  persist(
    (set) => ({
      layouts: [],
      updateLayout: (newLayout) => set({ layouts: newLayout }),
      resetLayout: () => set({ layouts: [] }),
    }),
    {
      name: 'dashboard-layout',
    }
  )
);
