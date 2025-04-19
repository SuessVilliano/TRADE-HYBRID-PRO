// User Settings Service
// This service manages user preferences and settings, including notification settings.

// Define the user settings interface
export interface UserSettings {
  notifications: {
    signalAlerts: boolean;
    priceAlerts: boolean;
    newsAlerts: boolean;
    emailNotifications: boolean;
    desktopNotifications: boolean;
    soundAlerts: boolean;
  };
  trading: {
    copyTradingEnabled: boolean;
    autoTrade: boolean;
    riskPerTrade: number;
    maxDailyRisk: number;
  };
  display: {
    theme: 'light' | 'dark' | 'system';
    chartStyle: 'candles' | 'line' | 'bars';
    showPnL: boolean;
    showRisk: boolean;
  };
  webhooks: {
    enabled: boolean;
    url: string;
    triggers: string[];
  };
}

// Default settings
const DEFAULT_SETTINGS: UserSettings = {
  notifications: {
    signalAlerts: true,
    priceAlerts: true,
    newsAlerts: false,
    emailNotifications: false,
    desktopNotifications: true,
    soundAlerts: true
  },
  trading: {
    copyTradingEnabled: false,
    autoTrade: false,
    riskPerTrade: 1,
    maxDailyRisk: 5
  },
  display: {
    theme: 'system',
    chartStyle: 'candles',
    showPnL: true,
    showRisk: true
  },
  webhooks: {
    enabled: false,
    url: '',
    triggers: ['new_signal']
  }
};

// Event types for settings changes
export type UserSettingsEvents = 'settings_changed' | 'notifications_toggled';

class UserSettingsService {
  private settings: UserSettings;
  private eventSubscribers: { [key: string]: Function[] };
  private hasCheckedPermission: boolean = false;
  private notificationPermissionGranted: boolean = false;
  
  constructor() {
    this.settings = this.loadSettings();
    this.eventSubscribers = {};
    
    // Initialize notification permission check
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.checkNotificationPermission();
    }
  }
  
  // Load settings from localStorage
  private loadSettings(): UserSettings {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    
    try {
      const savedSettings = localStorage.getItem('user_settings');
      if (savedSettings) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) };
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
    }
    
    return DEFAULT_SETTINGS;
  }
  
  // Save settings to localStorage
  private saveSettingsToStorage(settings: UserSettings): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('user_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving user settings:', error);
    }
  }
  
  // Get settings
  getSettings(): UserSettings {
    return this.settings;
  }
  
  // Save settings
  saveSettings(settings: UserSettings): void {
    this.settings = settings;
    this.saveSettingsToStorage(settings);
    this.notifySubscribers('settings_changed', settings);
  }
  
  // Toggle notification settings
  toggleNotification(type: keyof UserSettings['notifications'], enabled: boolean): void {
    this.settings.notifications[type] = enabled;
    this.saveSettingsToStorage(this.settings);
    this.notifySubscribers('notifications_toggled', { type, enabled });
    this.notifySubscribers('settings_changed', this.settings);
  }
  
  // Check if desktop notifications are supported and permission granted
  async checkNotificationPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      this.notificationPermissionGranted = false;
      this.hasCheckedPermission = true;
      return false;
    }
    
    if (Notification.permission === 'granted') {
      this.notificationPermissionGranted = true;
      this.hasCheckedPermission = true;
      return true;
    } else if (Notification.permission !== 'denied') {
      try {
        const permission = await Notification.requestPermission();
        this.notificationPermissionGranted = permission === 'granted';
        this.hasCheckedPermission = true;
        return this.notificationPermissionGranted;
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        this.notificationPermissionGranted = false;
        this.hasCheckedPermission = true;
        return false;
      }
    }
    
    this.notificationPermissionGranted = false;
    this.hasCheckedPermission = true;
    return false;
  }
  
  // Show desktop notification
  showNotification(title: string, options?: NotificationOptions): void {
    if (!this.settings.notifications.desktopNotifications) {
      return;
    }
    
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }
    
    // If we haven't checked permission, check it now
    if (!this.hasCheckedPermission) {
      this.checkNotificationPermission().then(granted => {
        if (granted) {
          this.createNotification(title, options);
        }
      });
      return;
    }
    
    // If we have checked and have permission, show notification
    if (this.notificationPermissionGranted) {
      this.createNotification(title, options);
    }
  }
  
  // Create a notification with sound if enabled
  private createNotification(title: string, options?: NotificationOptions): void {
    try {
      const notification = new Notification(title, options);
      
      // Play sound if enabled
      if (this.settings.notifications.soundAlerts) {
        this.playNotificationSound();
      }
      
      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000);
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }
  
  // Play notification sound
  playNotificationSound(): void {
    if (!this.settings.notifications.soundAlerts) {
      return;
    }
    
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(err => console.error('Failed to play notification sound:', err));
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }
  
  // Subscribe to events
  subscribe(event: UserSettingsEvents, callback: Function): void {
    if (!this.eventSubscribers[event]) {
      this.eventSubscribers[event] = [];
    }
    
    this.eventSubscribers[event].push(callback);
  }
  
  // Unsubscribe from events
  unsubscribe(event: UserSettingsEvents, callback: Function): void {
    if (!this.eventSubscribers[event]) {
      return;
    }
    
    this.eventSubscribers[event] = this.eventSubscribers[event].filter(
      subscriber => subscriber !== callback
    );
  }
  
  // Notify subscribers of events
  private notifySubscribers(event: UserSettingsEvents, data: any): void {
    if (!this.eventSubscribers[event]) {
      return;
    }
    
    this.eventSubscribers[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in settings ${event} event subscriber:`, error);
      }
    });
  }
}

// Create and export singleton instance
export const userSettingsService = new UserSettingsService();