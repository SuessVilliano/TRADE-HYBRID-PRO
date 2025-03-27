import { create } from 'zustand';

interface ControlsState {
  controlsEnabled: boolean;
  toggleControls: () => void;
  enableControls: () => void;
  disableControls: () => void;
  setControlsEnabled: (enabled: boolean) => void;
}

export const useControlsStore = create<ControlsState>((set) => ({
  controlsEnabled: true,
  toggleControls: () => set((state) => ({ controlsEnabled: !state.controlsEnabled })),
  enableControls: () => set({ controlsEnabled: true }),
  disableControls: () => set({ controlsEnabled: false }),
  setControlsEnabled: (enabled: boolean) => set({ controlsEnabled: enabled }),
}));