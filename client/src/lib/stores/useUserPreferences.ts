import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TabId = 
  | 'market'
  | 'news'
  | 'trade'
  | 'journal'
  | 'leaderboard'
  | 'assistant'
  | 'signals'
  | 'copy'
  | 'thc'
  | 'ai-analysis'
  | 'bots';

interface TabDefinition {
  id: TabId;
  icon: string;
  label: string;
}

interface UserPreferencesState {
  // Bottom navigation tabs selected by the user (max 5)
  selectedBottomTabs: TabId[];
  
  // All available tabs with their definitions
  availableTabs: TabDefinition[];
  
  // Actions
  setSelectedBottomTabs: (tabs: TabId[]) => void;
  addBottomTab: (tabId: TabId) => void;
  removeBottomTab: (tabId: TabId) => void;
  moveBottomTab: (fromIndex: number, toIndex: number) => void;
  resetToDefaults: () => void;
}

// Default tabs that will appear in the bottom navigation
const DEFAULT_BOTTOM_TABS: TabId[] = ['market', 'trade', 'signals', 'assistant', 'thc'];

// All available tabs with their icon and label definitions
const ALL_AVAILABLE_TABS: TabDefinition[] = [
  { id: 'market', icon: 'BarChart2', label: 'Charts' },
  { id: 'news', icon: 'Newspaper', label: 'News' },
  { id: 'trade', icon: 'Activity', label: 'Trade' },
  { id: 'journal', icon: 'BookOpen', label: 'Journal' },
  { id: 'leaderboard', icon: 'Award', label: 'Leaders' },
  { id: 'assistant', icon: 'Bot', label: 'AI' },
  { id: 'signals', icon: 'Bell', label: 'Signals' },
  { id: 'copy', icon: 'Copy', label: 'Copy' },
  { id: 'thc', icon: 'Coins', label: 'THC' },
  { id: 'ai-analysis', icon: 'BrainCircuit', label: 'Analysis' },
  { id: 'bots', icon: 'Zap', label: 'Bots' }
];

// Create the store with persistence
export const useUserPreferences = create<UserPreferencesState>()(
  persist(
    (set, get) => ({
      // Initialize with default tabs
      selectedBottomTabs: [...DEFAULT_BOTTOM_TABS],
      availableTabs: ALL_AVAILABLE_TABS,
      
      setSelectedBottomTabs: (tabs) => {
        // Make sure we don't exceed the max number of tabs
        const limitedTabs = tabs.slice(0, 5);
        set({ selectedBottomTabs: limitedTabs });
      },
      
      addBottomTab: (tabId) => {
        const { selectedBottomTabs } = get();
        // Don't add if already exists or if we're at max tabs
        if (selectedBottomTabs.includes(tabId) || selectedBottomTabs.length >= 5) return;
        
        set({ selectedBottomTabs: [...selectedBottomTabs, tabId] });
      },
      
      removeBottomTab: (tabId) => {
        const { selectedBottomTabs } = get();
        // Don't remove if it's the last tab
        if (selectedBottomTabs.length <= 1) return;
        
        set({ 
          selectedBottomTabs: selectedBottomTabs.filter(id => id !== tabId) 
        });
      },
      
      moveBottomTab: (fromIndex, toIndex) => {
        const { selectedBottomTabs } = get();
        const tabs = [...selectedBottomTabs];
        
        // Make sure indices are valid
        if (
          fromIndex < 0 || 
          fromIndex >= tabs.length || 
          toIndex < 0 || 
          toIndex >= tabs.length
        ) {
          return;
        }
        
        // Move the tab
        const [tab] = tabs.splice(fromIndex, 1);
        tabs.splice(toIndex, 0, tab);
        
        set({ selectedBottomTabs: tabs });
      },
      
      resetToDefaults: () => {
        set({ selectedBottomTabs: [...DEFAULT_BOTTOM_TABS] });
      }
    }),
    {
      name: 'trade-hybrid-user-preferences',
    }
  )
);