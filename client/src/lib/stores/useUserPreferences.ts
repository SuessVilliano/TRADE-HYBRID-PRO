import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Define tab configuration interface
export interface TabConfig {
  id: string;
  label: string;
  icon: string;
  active: boolean;
  order: number;
}

// Define user preferences state interface
interface UserPreferencesState {
  // Theme preferences
  theme: 'light' | 'dark' | 'system';
  highContrastMode: boolean;
  reducedMotion: boolean;
  
  // Chart preferences
  defaultTimeframe: string;
  defaultChartType: 'candles' | 'line' | 'bars' | 'area';
  showVolume: boolean;
  showGrid: boolean;
  chartIndicators: string[];
  
  // UI preferences
  showTradingTips: boolean;
  showMicroTips: boolean;
  sidebarCollapsed: boolean;
  bottomNavTabs: TabConfig[];
  defaultPage: string;
  
  // Notification preferences
  enablePriceAlerts: boolean;
  enableNewsAlerts: boolean;
  enableTradeNotifications: boolean;
  enableSocialNotifications: boolean;
  notificationSound: boolean;
  
  // Actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleHighContrastMode: () => void;
  toggleReducedMotion: () => void;
  setDefaultTimeframe: (timeframe: string) => void;
  setDefaultChartType: (type: 'candles' | 'line' | 'bars' | 'area') => void;
  toggleShowVolume: () => void;
  toggleShowGrid: () => void;
  addChartIndicator: (indicator: string) => void;
  removeChartIndicator: (indicator: string) => void;
  toggleTradingTips: () => void;
  toggleMicroTips: () => void;
  toggleSidebarCollapsed: () => void;
  setBottomNavTabs: (tabs: TabConfig[]) => void;
  toggleBottomNavTab: (tabId: string) => void;
  reorderBottomNavTabs: (tabId: string, newOrder: number) => void;
  setDefaultPage: (page: string) => void;
  togglePriceAlerts: () => void;
  toggleNewsAlerts: () => void;
  toggleTradeNotifications: () => void;
  toggleSocialNotifications: () => void;
  toggleNotificationSound: () => void;
  resetPreferences: () => void;
}

// Default bottom nav tabs configuration
const defaultBottomNavTabs: TabConfig[] = [
  {
    id: 'home',
    label: 'Home',
    icon: 'Home',
    active: true, // Active - 1 of 4
    order: 0
  },
  {
    id: 'trading',
    label: 'Trade',
    icon: 'BarChart',
    active: true, // Active - 2 of 4
    order: 1
  },
  {
    id: 'connect-broker',
    label: 'Connect Broker',
    icon: 'Link',
    active: false,
    order: 2
  },
  {
    id: 'smart-trade',
    label: 'Smart Trade',
    icon: 'Sparkles',
    active: false,
    order: 3
  },
  {
    id: 'game',
    label: 'Game',
    icon: 'Gamepad2',
    active: false,
    order: 4
  },
  {
    id: 'signals',
    label: 'Signals',
    icon: 'LineChart',
    active: true, // Active - 3 of 4
    order: 5
  },
  {
    id: 'journal',
    label: 'Journal',
    icon: 'FileText',
    active: false,
    order: 6
  },
  {
    id: 'learn',
    label: 'Learn',
    icon: 'BookOpen',
    active: false,
    order: 7
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
    icon: 'BarChart3',
    active: false,
    order: 8
  },
  {
    id: 'social',
    label: 'Social',
    icon: 'Users',
    active: true, // Active - 4 of 4
    order: 9
  },
  {
    id: 'marketplace',
    label: 'NFT Market',
    icon: 'Store',
    active: false,
    order: 10
  },
  {
    id: 'affiliate',
    label: 'Affiliate',
    icon: 'Share2',
    active: false,
    order: 11
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'Settings',
    active: false,
    order: 12
  }
];

// Default state for user preferences
const defaultState = {
  // Theme preferences
  theme: 'system' as const,
  highContrastMode: false,
  reducedMotion: false,
  
  // Chart preferences
  defaultTimeframe: '1h',
  defaultChartType: 'candles' as const,
  showVolume: true,
  showGrid: true,
  chartIndicators: ['ema', 'macd'],
  
  // UI preferences
  showTradingTips: true,
  showMicroTips: true,
  sidebarCollapsed: false,
  bottomNavTabs: defaultBottomNavTabs,
  defaultPage: 'home',
  
  // Notification preferences
  enablePriceAlerts: true,
  enableNewsAlerts: true,
  enableTradeNotifications: true,
  enableSocialNotifications: true,
  notificationSound: true,
};

// Create and export the store
export const useUserPreferences = create<UserPreferencesState>()(
  persist(
    (set, get) => ({
      ...defaultState,
      
      // Theme actions
      setTheme: (theme) => set({ theme }),
      toggleHighContrastMode: () => set((state) => ({ highContrastMode: !state.highContrastMode })),
      toggleReducedMotion: () => set((state) => ({ reducedMotion: !state.reducedMotion })),
      
      // Chart actions
      setDefaultTimeframe: (timeframe) => set({ defaultTimeframe: timeframe }),
      setDefaultChartType: (type) => set({ defaultChartType: type }),
      toggleShowVolume: () => set((state) => ({ showVolume: !state.showVolume })),
      toggleShowGrid: () => set((state) => ({ showGrid: !state.showGrid })),
      addChartIndicator: (indicator) => set((state) => {
        if (state.chartIndicators.includes(indicator)) return state;
        return { chartIndicators: [...state.chartIndicators, indicator] };
      }),
      removeChartIndicator: (indicator) => set((state) => ({
        chartIndicators: state.chartIndicators.filter(i => i !== indicator)
      })),
      
      // UI actions
      toggleTradingTips: () => set((state) => ({ showTradingTips: !state.showTradingTips })),
      toggleMicroTips: () => set((state) => ({ showMicroTips: !state.showMicroTips })),
      toggleSidebarCollapsed: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      
      // Bottom nav actions
      setBottomNavTabs: (tabs) => set({ bottomNavTabs: tabs }),
      toggleBottomNavTab: (tabId) => set((state) => {
        // First, check if there are any duplicate tabs with the same ID
        // This fixes the issue where multiple copies of the same tab appear
        const dedupedTabs: TabConfig[] = [];
        const idMap = new Map<string, boolean>();
        
        for (const tab of state.bottomNavTabs) {
          if (!idMap.has(tab.id)) {
            idMap.set(tab.id, true);
            dedupedTabs.push(tab);
          }
        }
        
        // If we removed any duplicates, update the state first
        if (dedupedTabs.length < state.bottomNavTabs.length) {
          return { bottomNavTabs: dedupedTabs };
        }
        
        const activeTabsCount = state.bottomNavTabs.filter(t => t.active).length;
        const currentTab = state.bottomNavTabs.find(t => t.id === tabId);
        
        // Don't deactivate if it's the only active tab
        if (currentTab?.active && activeTabsCount <= 1) {
          return state;
        }
        
        // Don't activate if we already have 4 active tabs
        if (!currentTab?.active && activeTabsCount >= 4) {
          return state;
        }
        
        return {
          bottomNavTabs: state.bottomNavTabs.map(tab => 
            tab.id === tabId ? { ...tab, active: !tab.active } : tab
          )
        };
      }),
      reorderBottomNavTabs: (tabId, newOrder) => set((state) => {
        // First, get the tab to be moved
        const tabToMove = state.bottomNavTabs.find(tab => tab.id === tabId);
        if (!tabToMove) return state;
        
        // Create a new array with the tab removed
        const otherTabs = state.bottomNavTabs.filter(tab => tab.id !== tabId);
        
        // Update order numbers for all tabs
        const updatedTabs = [
          ...otherTabs.map(tab => {
            // If the tab's order is greater than or equal to the new order,
            // increment it to make room for the moved tab
            if (tab.order >= newOrder) {
              return { ...tab, order: tab.order + 1 };
            }
            return tab;
          }),
          // Add the moved tab with the new order
          { ...tabToMove, order: newOrder }
        ].sort((a, b) => a.order - b.order);
        
        return { bottomNavTabs: updatedTabs };
      }),
      
      setDefaultPage: (page) => set({ defaultPage: page }),
      
      // Notification actions
      togglePriceAlerts: () => set((state) => ({ enablePriceAlerts: !state.enablePriceAlerts })),
      toggleNewsAlerts: () => set((state) => ({ enableNewsAlerts: !state.enableNewsAlerts })),
      toggleTradeNotifications: () => set((state) => ({ enableTradeNotifications: !state.enableTradeNotifications })),
      toggleSocialNotifications: () => set((state) => ({ enableSocialNotifications: !state.enableSocialNotifications })),
      toggleNotificationSound: () => set((state) => ({ notificationSound: !state.notificationSound })),
      
      // Reset all preferences to default
      resetPreferences: () => set(defaultState),
    }),
    {
      name: 'trade-hybrid-preferences',
      storage: createJSONStorage(() => localStorage)
    }
  )
);