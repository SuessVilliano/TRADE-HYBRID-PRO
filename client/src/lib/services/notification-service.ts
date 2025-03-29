// Notification service for handling various types of notifications
// This service handles both browser notifications and sound alerts

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  sound?: string;
  priority?: 'low' | 'normal' | 'high';
  requireInteraction?: boolean;
  actions?: { action: string; title: string; icon?: string }[];
  data?: any;
  // vibrate?: number[]; // Vibration API not available in all browsers
}

export type NotificationType = 
  | 'price-alert' 
  | 'signal-entry' 
  | 'signal-update' 
  | 'signal-expiry' 
  | 'take-profit' 
  | 'stop-loss' 
  | 'technical-pattern'
  | 'system';

interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  browser: boolean;
  inApp: boolean;
  soundVolume: number;
  signalEntry: boolean;
  signalUpdate: boolean;
  signalExpiry: boolean;
  priceAlert: boolean;
  takeProfit: boolean;
  stopLoss: boolean;
  technicalPattern: boolean;
  alertSound: string;
  successSound: string;
  warningSound: string;
  priorityLevel: number;
  markets: {
    crypto: boolean;
    forex: boolean;
    stocks: boolean;
    futures: boolean;
  };
  enabledSymbols: {
    crypto: string[];
    stocks: string[];
    forex: string[];
    futures: string[];
  };
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  workingDaysOnly: boolean;
}

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  sound: true,
  browser: true,
  inApp: true,
  soundVolume: 70,
  
  signalEntry: true,
  signalUpdate: true,
  signalExpiry: true,
  priceAlert: true,
  takeProfit: true,
  stopLoss: true,
  technicalPattern: false,
  
  alertSound: 'price-alert',
  successSound: 'success',
  warningSound: 'trading-signal',
  
  priorityLevel: 3,
  
  markets: {
    crypto: true,
    forex: true,
    stocks: true,
    futures: true,
  },
  
  enabledSymbols: {
    crypto: [],
    stocks: [],
    forex: [],
    futures: [],
  },
  
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  workingDaysOnly: false,
};

const getSettings = (): NotificationSettings => {
  if (typeof window === 'undefined') {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
  
  try {
    const savedSettings = localStorage.getItem('notification-settings');
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
  } catch (e) {
    console.error('Error reading notification settings', e);
  }
  
  return DEFAULT_NOTIFICATION_SETTINGS;
};

const isInQuietHours = (settings: NotificationSettings): boolean => {
  if (!settings.quietHoursEnabled) {
    return false;
  }
  
  // Check if current time is in quiet hours
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinute;
  
  // Parse quiet hours start/end times
  const [startHour, startMinute] = settings.quietHoursStart.split(':').map(Number);
  const [endHour, endMinute] = settings.quietHoursEnd.split(':').map(Number);
  
  const startTime = startHour * 60 + startMinute;
  const endTime = endHour * 60 + endMinute;
  
  // Handle case where quiet hours span midnight
  if (startTime > endTime) {
    return currentTime >= startTime || currentTime <= endTime;
  }
  
  return currentTime >= startTime && currentTime <= endTime;
};

const isWorkingDay = (): boolean => {
  const now = new Date();
  const day = now.getDay();
  // 0 = Sunday, 6 = Saturday
  return day !== 0 && day !== 6;
};

const isAllowedBySymbolFilter = (
  settings: NotificationSettings, 
  symbol: string, 
  market: 'crypto' | 'forex' | 'stocks' | 'futures'
): boolean => {
  // If market is disabled, return false
  if (!settings.markets[market]) {
    return false;
  }
  
  // If no symbols are specified for this market, allow all symbols in that market
  if (settings.enabledSymbols[market].length === 0) {
    return true;
  }
  
  // Check if the symbol is in the enabled symbols list
  return settings.enabledSymbols[market].includes(symbol);
};

const getSoundForNotificationType = (type: NotificationType, settings: NotificationSettings): string => {
  switch (type) {
    case 'price-alert':
    case 'signal-entry':
    case 'signal-update':
    case 'technical-pattern':
    case 'system':
      return settings.alertSound;
    case 'take-profit':
      return settings.successSound;
    case 'stop-loss':
    case 'signal-expiry':
      return settings.warningSound;
    default:
      return settings.alertSound;
  }
};

const isSettingEnabledForType = (type: NotificationType, settings: NotificationSettings): boolean => {
  switch (type) {
    case 'price-alert':
      return settings.priceAlert;
    case 'signal-entry':
      return settings.signalEntry;
    case 'signal-update':
      return settings.signalUpdate;
    case 'signal-expiry':
      return settings.signalExpiry;
    case 'take-profit':
      return settings.takeProfit;
    case 'stop-loss':
      return settings.stopLoss;
    case 'technical-pattern':
      return settings.technicalPattern;
    case 'system':
      return true; // System notifications are always enabled
    default:
      return true;
  }
};

export class NotificationService {
  private static instance: NotificationService;
  private notificationPermission: NotificationPermission = 'default';
  private recentNotifications: { [key: string]: number } = {}; // For deduplication
  
  private constructor() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.notificationPermission = Notification.permission;
    }
  }
  
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }
  
  private async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    
    if (this.notificationPermission === 'granted') {
      return true;
    }
    
    try {
      const permission = await Notification.requestPermission();
      this.notificationPermission = permission;
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }
  
  private playSound(sound: string, volume: number = 0.7): void {
    try {
      const audio = new Audio(`/sounds/${sound}.mp3`);
      audio.volume = volume;
      audio.play().catch(err => console.error('Error playing sound:', err));
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }
  
  private shouldShowNotification(
    type: NotificationType, 
    symbol?: string, 
    market?: 'crypto' | 'forex' | 'stocks' | 'futures',
    priority: number = 3
  ): boolean {
    const settings = getSettings();
    
    // Check if notifications are enabled
    if (!settings.enabled) {
      return false;
    }
    
    // Check if this notification type is enabled
    if (!isSettingEnabledForType(type, settings)) {
      return false;
    }
    
    // Check priority level
    if (priority < settings.priorityLevel) {
      return false;
    }
    
    // Check quiet hours
    if (isInQuietHours(settings)) {
      return false;
    }
    
    // Check working days only
    if (settings.workingDaysOnly && !isWorkingDay()) {
      return false;
    }
    
    // Check symbol filter if symbol and market are provided
    if (symbol && market) {
      if (!isAllowedBySymbolFilter(settings, symbol, market)) {
        return false;
      }
    }
    
    return true;
  }
  
  // Deduplicate notifications with the same tag within a time window
  private isDuplicate(tag: string, timeWindowMs: number = 5000): boolean {
    const now = Date.now();
    if (tag in this.recentNotifications) {
      const lastTime = this.recentNotifications[tag];
      if (now - lastTime < timeWindowMs) {
        return true;
      }
    }
    
    this.recentNotifications[tag] = now;
    return false;
  }
  
  // Clean up old entries in the deduplication cache
  private cleanupRecentNotifications(): void {
    const now = Date.now();
    const maxAge = 60000; // 1 minute
    
    Object.keys(this.recentNotifications).forEach(tag => {
      if (now - this.recentNotifications[tag] > maxAge) {
        delete this.recentNotifications[tag];
      }
    });
  }
  
  public async notify(
    type: NotificationType,
    options: NotificationOptions,
    symbol?: string,
    market?: 'crypto' | 'forex' | 'stocks' | 'futures',
    priority: number = 3
  ): Promise<boolean> {
    try {
      // Clean up old entries periodically
      this.cleanupRecentNotifications();
      
      // Check if we should show this notification based on user settings
      if (!this.shouldShowNotification(type, symbol, market, priority)) {
        return false;
      }
      
      const settings = getSettings();
      const tag = options.tag || `${type}-${Date.now()}`;
      
      // Deduplicate notifications with the same tag
      if (options.tag && this.isDuplicate(options.tag)) {
        return false;
      }
      
      // Play sound if enabled
      if (settings.sound) {
        const soundFile = options.sound || getSoundForNotificationType(type, settings);
        this.playSound(soundFile, settings.soundVolume / 100);
      }
      
      // Show browser notification if enabled
      if (settings.browser) {
        const permission = await this.requestPermission();
        
        if (permission) {
          // Default icon if not provided
          const icon = options.icon || '/icons/notification-icon.png';
          
          // Create and show the notification
          const notification = new Notification(options.title, {
            body: options.body,
            icon,
            badge: options.badge,
            tag,
            data: options.data,
            // vibrate: options.vibrate, // Vibration API not available in all browsers
            requireInteraction: options.requireInteraction,
            silent: !settings.sound, // Don't play the default sound
          });
          
          notification.onclick = () => {
            // Focus on the window/tab when notification is clicked
            window.focus();
            // Close the notification
            notification.close();
            
            // Trigger any custom click handler
            const event = new CustomEvent('notification-clicked', {
              detail: { type, tag, data: options.data }
            });
            window.dispatchEvent(event);
          };
        }
      }
      
      // Trigger in-app notification event if enabled
      if (settings.inApp) {
        const event = new CustomEvent('in-app-notification', {
          detail: {
            type,
            title: options.title,
            body: options.body,
            tag,
            data: options.data,
            priority: options.priority || 'normal',
            timestamp: Date.now(),
          }
        });
        
        window.dispatchEvent(event);
      }
      
      return true;
    } catch (error) {
      console.error('Error showing notification:', error);
      return false;
    }
  }
  
  // Specialized methods for different notification types
  
  public async notifyPriceAlert(
    symbol: string,
    price: number,
    direction: 'above' | 'below',
    targetPrice: number,
    market: 'crypto' | 'forex' | 'stocks' | 'futures',
    priority: number = 3
  ): Promise<boolean> {
    const title = `Price Alert: ${symbol}`;
    const body = `${symbol} is now ${direction} ${targetPrice} (Current: ${price})`;
    
    return this.notify(
      'price-alert',
      {
        title,
        body,
        tag: `price-alert-${symbol}-${targetPrice}`,
        sound: 'price-alert',
        priority: 'high',
        requireInteraction: true,
        data: { symbol, price, direction, targetPrice, market }
      },
      symbol,
      market,
      priority
    );
  }
  
  public async notifySignalEntry(
    symbol: string,
    side: 'buy' | 'sell',
    entryPrice: number,
    stopLoss: number,
    takeProfit: number,
    market: 'crypto' | 'forex' | 'stocks' | 'futures',
    confidence: number = 75,
    priority: number = 3
  ): Promise<boolean> {
    const title = `${side.toUpperCase()} Signal: ${symbol}`;
    const body = `Entry: ${entryPrice}, SL: ${stopLoss}, TP: ${takeProfit} (${confidence}% confidence)`;
    
    return this.notify(
      'signal-entry',
      {
        title,
        body,
        tag: `signal-entry-${symbol}-${side}-${Date.now()}`,
        sound: 'trading-signal',
        priority: 'high',
        requireInteraction: true,
        data: { symbol, side, entryPrice, stopLoss, takeProfit, market, confidence }
      },
      symbol,
      market,
      priority
    );
  }
  
  public async notifyTakeProfit(
    symbol: string, 
    price: number,
    profit: number | string,
    market: 'crypto' | 'forex' | 'stocks' | 'futures',
    priority: number = 4
  ): Promise<boolean> {
    const title = `Take Profit Hit: ${symbol}`;
    const body = `Price target reached at ${price}. Profit: ${profit}`;
    
    return this.notify(
      'take-profit',
      {
        title,
        body,
        tag: `take-profit-${symbol}-${Date.now()}`,
        sound: 'success',
        priority: 'normal',
        data: { symbol, price, profit, market }
      },
      symbol,
      market,
      priority
    );
  }
  
  public async notifyStopLoss(
    symbol: string, 
    price: number,
    loss: number | string,
    market: 'crypto' | 'forex' | 'stocks' | 'futures',
    priority: number = 4
  ): Promise<boolean> {
    const title = `Stop Loss Hit: ${symbol}`;
    const body = `Stop loss triggered at ${price}. Loss: ${loss}`;
    
    return this.notify(
      'stop-loss',
      {
        title,
        body,
        tag: `stop-loss-${symbol}-${Date.now()}`,
        sound: 'trading-signal',
        priority: 'high',
        data: { symbol, price, loss, market }
      },
      symbol,
      market,
      priority
    );
  }
  
  public async notifySystem(
    title: string,
    body: string,
    priority: number = 5
  ): Promise<boolean> {
    return this.notify(
      'system',
      {
        title,
        body,
        tag: `system-${Date.now()}`,
        sound: 'message',
        priority: 'high',
        data: { type: 'system' }
      },
      undefined,
      undefined,
      priority
    );
  }
}

// Export a singleton instance
export const notificationService = NotificationService.getInstance();