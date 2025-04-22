/**
 * Notification Service 
 * Handles all notification related functionality including in-app notifications and desktop notifications
 */

export interface NotificationDetail {
  id: string;
  title: string;
  body: string;
  type: 'price-alert' | 'signal-entry' | 'signal-update' | 'signal-expiry' | 'take-profit' | 'stop-loss' | 'system';
  priority: 'low' | 'normal' | 'high';
  timestamp: Date;
  read?: boolean;
  dismissable?: boolean;
  link?: string;
  linkText?: string;
  metadata?: Record<string, any>;
}

class NotificationService {
  private static instance: NotificationService;
  private notificationQueue: NotificationDetail[] = [];
  private isProcessing: boolean = false;
  private audioContext: AudioContext | null = null;
  private sounds: Record<string, AudioBuffer> = {};
  private notificationsEnabled: boolean = true;
  private desktopNotificationsEnabled: boolean = false;
  private soundEnabled: boolean = true;
  private readonly storageKey = 'tradehybrid_notifications';
  
  private constructor() {
    this.checkPermissions();
    this.loadSettings();
    this.initAudioContext();
    this.preloadSounds();
  }
  
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }
  
  // Initialize audio context for notification sounds
  private initAudioContext() {
    try {
      // Initialize AudioContext when user interacts with the page
      const initAudio = () => {
        if (!this.audioContext) {
          this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          window.removeEventListener('click', initAudio);
          window.removeEventListener('touchstart', initAudio);
        }
      };
      
      window.addEventListener('click', initAudio);
      window.addEventListener('touchstart', initAudio);
    } catch (error) {
      console.error('Error initializing audio context:', error);
    }
  }
  
  // Preload notification sounds
  private async preloadSounds() {
    try {
      const soundFiles = {
        'success': '/sounds/notification-success.mp3',
        'error': '/sounds/notification-error.mp3',
        'info': '/sounds/notification-info.mp3',
        'warning': '/sounds/notification-warning.mp3',
        'generic': '/sounds/notification.mp3'
      };
      
      // Preload sounds when audio context is available
      const loadSounds = async () => {
        if (!this.audioContext) return;
        
        for (const [key, url] of Object.entries(soundFiles)) {
          try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            this.sounds[key] = await this.audioContext.decodeAudioData(arrayBuffer);
          } catch (error) {
            console.error(`Error loading sound ${key}:`, error);
          }
        }
      };
      
      // Check for audio context periodically
      const checkAudioContext = setInterval(() => {
        if (this.audioContext) {
          loadSounds();
          clearInterval(checkAudioContext);
        }
      }, 500);
      
      // Clear interval after 10 seconds to avoid infinite checking
      setTimeout(() => clearInterval(checkAudioContext), 10000);
    } catch (error) {
      console.error('Error preloading sounds:', error);
    }
  }
  
  // Play notification sound
  private playSound(type: 'success' | 'error' | 'info' | 'warning' | 'generic' = 'generic') {
    if (!this.soundEnabled || !this.audioContext) return;
    
    try {
      // Use the requested sound or fall back to generic
      const sound = this.sounds[type] || this.sounds.generic;
      if (!sound) return;
      
      // Create audio source
      const source = this.audioContext.createBufferSource();
      source.buffer = sound;
      
      // Create gain node for volume control
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = 0.3; // Set volume to 30%
      
      // Connect nodes
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // Play sound
      source.start(0);
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }
  
  // Check notification permissions
  private async checkPermissions() {
    try {
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          this.desktopNotificationsEnabled = true;
        } else if (Notification.permission !== 'denied') {
          const permission = await Notification.requestPermission();
          this.desktopNotificationsEnabled = permission === 'granted';
        }
      }
    } catch (error) {
      console.error('Error checking notification permissions:', error);
    }
  }
  
  // Load user notification settings
  private loadSettings() {
    try {
      const settings = localStorage.getItem('notification_settings');
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        this.notificationsEnabled = parsedSettings.enabled ?? true;
        this.soundEnabled = parsedSettings.sound ?? true;
        this.desktopNotificationsEnabled = parsedSettings.desktop ?? false;
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  }
  
  // Save user notification settings
  private saveSettings() {
    try {
      const settings = {
        enabled: this.notificationsEnabled,
        sound: this.soundEnabled,
        desktop: this.desktopNotificationsEnabled
      };
      localStorage.setItem('notification_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  }
  
  // Update notification settings
  public updateSettings(settings: {
    enabled?: boolean;
    sound?: boolean;
    desktop?: boolean;
  }) {
    if (settings.enabled !== undefined) this.notificationsEnabled = settings.enabled;
    if (settings.sound !== undefined) this.soundEnabled = settings.sound;
    if (settings.desktop !== undefined) this.desktopNotificationsEnabled = settings.desktop;
    this.saveSettings();
  }
  
  // Show a standard notification
  public showNotification(notification: Omit<NotificationDetail, 'id' | 'timestamp'>) {
    if (!this.notificationsEnabled) return;
    
    const notificationDetail: NotificationDetail = {
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...notification
    };
    
    // Add to queue for processing
    this.notificationQueue.push(notificationDetail);
    
    if (!this.isProcessing) {
      this.processQueue();
    }
    
    return notificationDetail.id;
  }
  
  // Show a trading signal notification
  public showSignalNotification(symbol: string, type: 'buy' | 'sell', price: number, provider: string) {
    return this.showNotification({
      title: `New ${type.toUpperCase()} Signal for ${symbol}`,
      body: `${provider} has issued a new ${type} signal for ${symbol} at ${price}`,
      type: 'signal-entry',
      priority: 'normal',
      dismissable: true,
      link: '/signals',
      linkText: 'View Signal',
      metadata: { symbol, type, price, provider }
    });
  }
  
  // Show a price alert notification
  public showPriceAlertNotification(symbol: string, price: number, condition: 'above' | 'below', targetPrice: number) {
    return this.showNotification({
      title: `Price Alert: ${symbol}`,
      body: `${symbol} is now ${condition} ${targetPrice} (Current: ${price})`,
      type: 'price-alert',
      priority: 'normal',
      dismissable: true,
      link: '/chart',
      linkText: 'View Chart',
      metadata: { symbol, price, condition, targetPrice }
    });
  }
  
  // Show a take profit notification
  public showTakeProfitNotification(symbol: string, price: number, profit: string) {
    return this.showNotification({
      title: `Take Profit Hit: ${symbol}`,
      body: `Your ${symbol} position hit take profit at ${price} (${profit})`,
      type: 'take-profit',
      priority: 'normal',
      dismissable: true,
      metadata: { symbol, price, profit }
    });
  }
  
  // Show a stop loss notification
  public showStopLossNotification(symbol: string, price: number, loss: string) {
    return this.showNotification({
      title: `Stop Loss Hit: ${symbol}`,
      body: `Your ${symbol} position hit stop loss at ${price} (${loss})`,
      type: 'stop-loss',
      priority: 'high',
      dismissable: true,
      metadata: { symbol, price, loss }
    });
  }
  
  // Show a system notification
  public showSystemNotification(title: string, body: string, priority: 'low' | 'normal' | 'high' = 'normal') {
    return this.showNotification({
      title,
      body,
      type: 'system',
      priority,
      dismissable: true
    });
  }
  
  // Process notification queue
  private async processQueue() {
    if (this.notificationQueue.length === 0) {
      this.isProcessing = false;
      return;
    }
    
    this.isProcessing = true;
    const notification = this.notificationQueue.shift()!;
    
    // Dispatch event for in-app notification
    this.showInAppNotification(notification);
    
    // Show desktop notification if enabled
    if (this.desktopNotificationsEnabled) {
      this.showDesktopNotification(notification);
    }
    
    // Play notification sound
    let soundType: 'success' | 'error' | 'info' | 'warning' | 'generic' = 'generic';
    switch (notification.type) {
      case 'take-profit':
        soundType = 'success';
        break;
      case 'stop-loss':
        soundType = 'error';
        break;
      case 'signal-entry':
      case 'signal-update':
        soundType = 'info';
        break;
      case 'signal-expiry':
        soundType = 'warning';
        break;
      default:
        soundType = 'generic';
    }
    this.playSound(soundType);
    
    // Store notification in history
    this.storeNotification(notification);
    
    // Process next notification with slight delay
    setTimeout(() => this.processQueue(), 300);
  }
  
  // Show in-app notification
  private showInAppNotification(notification: NotificationDetail) {
    try {
      // Dispatch custom event that will be caught by NotificationListener component
      const event = new CustomEvent('in-app-notification', { detail: notification });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Error showing in-app notification:', error);
    }
  }
  
  // Show desktop notification
  private showDesktopNotification(notification: NotificationDetail) {
    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        const desktopNotification = new Notification(notification.title, {
          body: notification.body,
          icon: '/icon.png'
        });
        
        // Handle click on desktop notification
        if (notification.link) {
          desktopNotification.onclick = () => {
            window.focus();
            window.location.href = notification.link!;
          };
        }
      }
    } catch (error) {
      console.error('Error showing desktop notification:', error);
    }
  }
  
  // Store notification in history
  private storeNotification(notification: NotificationDetail) {
    try {
      // Get existing notifications
      const storedNotifications = localStorage.getItem(this.storageKey);
      let notifications: NotificationDetail[] = [];
      
      if (storedNotifications) {
        notifications = JSON.parse(storedNotifications);
      }
      
      // Add new notification to the beginning of the array
      notifications.unshift(notification);
      
      // Limit the number of stored notifications (keep last 50)
      if (notifications.length > 50) {
        notifications = notifications.slice(0, 50);
      }
      
      // Store notifications
      localStorage.setItem(this.storageKey, JSON.stringify(notifications));
    } catch (error) {
      console.error('Error storing notification:', error);
    }
  }
  
  // Get all stored notifications
  public getNotifications(): NotificationDetail[] {
    try {
      const storedNotifications = localStorage.getItem(this.storageKey);
      
      if (storedNotifications) {
        return JSON.parse(storedNotifications);
      }
      
      return [];
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }
  
  // Mark notification as read
  public markAsRead(id: string) {
    try {
      const storedNotifications = localStorage.getItem(this.storageKey);
      
      if (storedNotifications) {
        const notifications: NotificationDetail[] = JSON.parse(storedNotifications);
        const updatedNotifications = notifications.map(notification => {
          if (notification.id === id) {
            return { ...notification, read: true };
          }
          return notification;
        });
        
        localStorage.setItem(this.storageKey, JSON.stringify(updatedNotifications));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }
  
  // Mark all notifications as read
  public markAllAsRead() {
    try {
      const storedNotifications = localStorage.getItem(this.storageKey);
      
      if (storedNotifications) {
        const notifications: NotificationDetail[] = JSON.parse(storedNotifications);
        const updatedNotifications = notifications.map(notification => {
          return { ...notification, read: true };
        });
        
        localStorage.setItem(this.storageKey, JSON.stringify(updatedNotifications));
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }
  
  // Clear all notifications
  public clearAllNotifications() {
    localStorage.removeItem(this.storageKey);
  }
  
  // Get unread notification count
  public getUnreadCount(): number {
    try {
      const notifications = this.getNotifications();
      return notifications.filter(notification => !notification.read).length;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();