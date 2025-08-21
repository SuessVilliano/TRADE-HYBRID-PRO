// Browser notifications service for trading signals
interface SignalNotification {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  entry: number;
  source: string;
  timestamp: string;
}

interface NotificationSettings {
  enabled: boolean;
  sounds: boolean;
  showDesktop: boolean;
  providers: {
    paradox: boolean;
    solaris: boolean;
    hybrid: boolean;
  };
}

class NotificationService {
  private settings: NotificationSettings;
  private permissionGranted: boolean = false;

  constructor() {
    // Load settings from localStorage
    this.settings = this.loadSettings();
    this.requestPermission();
  }

  private loadSettings(): NotificationSettings {
    try {
      const saved = localStorage.getItem('trade-signal-notifications');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }

    // Default settings
    return {
      enabled: true,
      sounds: true,
      showDesktop: true,
      providers: {
        paradox: true,
        solaris: true,
        hybrid: true
      }
    };
  }

  private saveSettings(): void {
    try {
      localStorage.setItem('trade-signal-notifications', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  }

  private async requestPermission(): Promise<void> {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        this.permissionGranted = true;
      } else if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        this.permissionGranted = permission === 'granted';
      }
    }
  }

  private shouldNotifyForProvider(provider: string): boolean {
    const providerKey = provider.toLowerCase() as keyof typeof this.settings.providers;
    return this.settings.providers[providerKey] ?? true;
  }

  public async showSignalNotification(signal: SignalNotification): Promise<void> {
    if (!this.settings.enabled || !this.shouldNotifyForProvider(signal.source)) {
      return;
    }

    const title = `${signal.source} Trading Signal`;
    const body = `${signal.type.toUpperCase()} ${signal.symbol} at ${signal.entry}`;
    const icon = '/favicon.ico';

    // Show desktop notification
    if (this.settings.showDesktop && this.permissionGranted && 'Notification' in window) {
      try {
        const notification = new Notification(title, {
          body,
          icon,
          tag: signal.id, // Prevents duplicate notifications
          requireInteraction: false,
          silent: !this.settings.sounds
        });

        // Auto-close after 8 seconds
        setTimeout(() => {
          notification.close();
        }, 8000);

        // Handle click to focus window
        notification.onclick = () => {
          window.focus();
          notification.close();
        };

      } catch (error) {
        console.error('Error showing desktop notification:', error);
      }
    }

    // Play sound if enabled
    if (this.settings.sounds) {
      this.playNotificationSound(signal.type);
    }

    // Show in-app notification (toast)
    this.showInAppNotification(signal);
  }

  private playNotificationSound(type: 'buy' | 'sell'): void {
    try {
      // Create audio element for notification sound
      const audio = new Audio();
      audio.volume = 0.3;
      
      // Use different sounds for buy/sell signals
      if (type === 'buy') {
        // Higher pitch for buy signals
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhCSh+0fPTgjMGHm7A7+OZURE=';
      } else {
        // Lower pitch for sell signals
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhCSh+0fPTgjMGHm7A7+OZURE=';
      }
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log('Audio play failed:', error);
        });
      }
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }

  private showInAppNotification(signal: SignalNotification): void {
    // Dispatch custom event for in-app toast notifications
    const event = new CustomEvent('trade-signal-notification', {
      detail: {
        id: signal.id,
        title: `${signal.source} Signal`,
        message: `${signal.type.toUpperCase()} ${signal.symbol} at ${signal.entry}`,
        type: signal.type,
        source: signal.source,
        timestamp: signal.timestamp
      }
    });
    
    window.dispatchEvent(event);
  }

  // Settings management
  public getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  public updateSettings(newSettings: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
    
    // Re-request permission if desktop notifications were enabled
    if (newSettings.showDesktop && !this.permissionGranted) {
      this.requestPermission();
    }
  }

  public toggleProvider(provider: keyof NotificationSettings['providers']): void {
    this.settings.providers[provider] = !this.settings.providers[provider];
    this.saveSettings();
  }

  public muteAll(): void {
    this.settings.enabled = false;
    this.saveSettings();
  }

  public unmuteAll(): void {
    this.settings.enabled = true;
    this.saveSettings();
  }

  public isEnabled(): boolean {
    return this.settings.enabled;
  }
}

export const notificationService = new NotificationService();
export type { SignalNotification, NotificationSettings };