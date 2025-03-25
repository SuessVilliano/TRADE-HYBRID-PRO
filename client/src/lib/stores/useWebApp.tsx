import { create } from 'zustand';

interface WebAppState {
  isOpen: boolean;
  url: string;
  
  // Actions
  openWebApp: (url?: string) => void;
  closeWebApp: () => void;
}

// Default Trade Hybrid web app URL
const DEFAULT_URL = 'https://app.tradehybrid.co';

export const useWebApp = create<WebAppState>((set) => ({
  isOpen: false,
  url: DEFAULT_URL,
  
  openWebApp: (url = DEFAULT_URL) => set({ isOpen: true, url }),
  closeWebApp: () => set({ isOpen: false }),
}));