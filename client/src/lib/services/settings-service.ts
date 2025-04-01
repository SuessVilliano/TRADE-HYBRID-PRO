/**
 * Settings Service - Manages user preferences and settings
 * Handles dashboard layout customization, theme settings, etc.
 */

import axios from 'axios';

export interface UserSettings {
  dashboardOrder?: string[]; // Array of module IDs in preferred order
  theme?: string;
  notificationsEnabled?: boolean;
  soundsEnabled?: boolean;
}

export enum DashboardModule {
  TRADE = 'trade',
  JOURNAL = 'journal',
  METAVERSE = 'metaverse',
  LEARN = 'learn',
  SIGNALS = 'signals',
  LEADERBOARD = 'leaderboard',
  PROFILE = 'profile',
  SETTINGS = 'settings',
  BOTS = 'bots',
  NEWS = 'news'
}

// Default dashboard order
export const DEFAULT_DASHBOARD_ORDER = [
  DashboardModule.TRADE,
  DashboardModule.JOURNAL,
  DashboardModule.METAVERSE,
  DashboardModule.LEARN,
  DashboardModule.SIGNALS,
  DashboardModule.LEADERBOARD,
  DashboardModule.BOTS,
  DashboardModule.NEWS,
  DashboardModule.PROFILE,
  DashboardModule.SETTINGS
];

class SettingsService {
  private settings: UserSettings;
  
  constructor() {
    this.settings = {
      dashboardOrder: [...DEFAULT_DASHBOARD_ORDER],
      theme: 'dark',
      notificationsEnabled: true,
      soundsEnabled: true
    };
    
    // Try to load from localStorage
    this.loadFromLocalStorage();
  }
  
  /**
   * Get user settings from localStorage
   */
  private loadFromLocalStorage() {
    try {
      const storedSettings = localStorage.getItem('userSettings');
      if (storedSettings) {
        this.settings = {
          ...this.settings,
          ...JSON.parse(storedSettings)
        };
      }
    } catch (error) {
      console.error('Failed to load settings from localStorage:', error);
    }
  }
  
  /**
   * Save settings to localStorage
   */
  private saveToLocalStorage() {
    try {
      localStorage.setItem('userSettings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error);
    }
  }
  
  /**
   * Get all user settings
   */
  getSettings(): UserSettings {
    return { ...this.settings };
  }
  
  /**
   * Update user settings
   */
  async updateSettings(newSettings: Partial<UserSettings>, userId?: number): Promise<UserSettings> {
    // Update local settings
    this.settings = {
      ...this.settings,
      ...newSettings
    };
    
    // Save to localStorage
    this.saveToLocalStorage();
    
    // If userId is provided, sync with server
    if (userId) {
      try {
        await axios.post(`/api/settings/${userId}`, newSettings);
      } catch (error) {
        console.error('Failed to sync settings with server:', error);
        // Continue with local settings even if server sync fails
      }
    }
    
    return { ...this.settings };
  }
  
  /**
   * Get dashboard modules in user's preferred order
   */
  getDashboardOrder(): string[] {
    return this.settings.dashboardOrder || [...DEFAULT_DASHBOARD_ORDER];
  }
  
  /**
   * Update dashboard module order
   */
  async updateDashboardOrder(newOrder: string[], userId?: number): Promise<string[]> {
    // Update local settings
    this.settings.dashboardOrder = newOrder;
    
    // Save to localStorage
    this.saveToLocalStorage();
    
    // If userId is provided, sync with server
    if (userId) {
      try {
        await axios.post(`/api/settings/${userId}/dashboard-order`, { dashboardOrder: newOrder });
      } catch (error) {
        console.error('Failed to sync dashboard order with server:', error);
        // Continue with local settings even if server sync fails
      }
    }
    
    return [...newOrder];
  }
  
  /**
   * Track usage of dashboard modules to automatically adjust order
   */
  async trackModuleUsage(moduleId: string, userId?: number): Promise<void> {
    // Get current order
    const currentOrder = this.getDashboardOrder();
    
    // Find index of the used module
    const moduleIndex = currentOrder.indexOf(moduleId);
    
    if (moduleIndex > 0) {
      // Move the module one position higher in priority if it's not already at the top
      const newOrder = [...currentOrder];
      // Remove from current position
      newOrder.splice(moduleIndex, 1);
      // Add at one position higher
      newOrder.splice(moduleIndex - 1, 0, moduleId);
      
      // Update the order
      await this.updateDashboardOrder(newOrder, userId);
    }
  }
  
  /**
   * Load settings from server (called after login)
   */
  async loadSettingsFromServer(userId: number): Promise<UserSettings> {
    try {
      const response = await axios.get(`/api/settings/${userId}`);
      
      // Merge with default settings
      this.settings = {
        ...this.settings,
        ...response.data
      };
      
      // Save to localStorage
      this.saveToLocalStorage();
      
      return { ...this.settings };
    } catch (error) {
      console.error('Failed to load settings from server:', error);
      return { ...this.settings };
    }
  }
  
  /**
   * Reset settings to defaults
   */
  async resetSettings(userId?: number): Promise<UserSettings> {
    const defaultSettings: UserSettings = {
      dashboardOrder: [...DEFAULT_DASHBOARD_ORDER],
      theme: 'dark',
      notificationsEnabled: true,
      soundsEnabled: true
    };
    
    // Update local settings
    this.settings = { ...defaultSettings };
    
    // Save to localStorage
    this.saveToLocalStorage();
    
    // If userId is provided, sync with server
    if (userId) {
      try {
        await axios.post(`/api/settings/${userId}/reset`, {});
      } catch (error) {
        console.error('Failed to reset settings on server:', error);
      }
    }
    
    return { ...defaultSettings };
  }
}

// Export as singleton
export const settingsService = new SettingsService();