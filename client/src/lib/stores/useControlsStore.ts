import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ControlsState {
  controlsEnabled: boolean;
  toggleControls: () => void;
  enableControls: () => void;
  disableControls: () => void;
  setControlsEnabled: (enabled: boolean) => void;
}

// Start with controls disabled by default (UI mode)
export const useControlsStore = create<ControlsState>()(
  persist(
    (set) => ({
      controlsEnabled: false, // Default to UI mode (false) instead of navigation mode (true)
      toggleControls: () => set((state) => ({ controlsEnabled: !state.controlsEnabled })),
      enableControls: () => set({ controlsEnabled: true }),
      disableControls: () => set({ controlsEnabled: false }),
      setControlsEnabled: (enabled: boolean) => set({ controlsEnabled: enabled }),
    }),
    {
      name: 'controls-storage',
    }
  )
);