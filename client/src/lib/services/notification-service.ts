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

import { toast } from 'react-toastify';
import { Sound } from '../utils/sound';

interface SignalNotification {
  type: 'entry' | 'exit' | 'alert' | 'warning';
  symbol: string;
  message: string;
  sound?: boolean;
  priority?: 'low' | 'medium' | 'high';
}

class NotificationService {
  private static instance: NotificationService;
  private audioContext: AudioContext;
  private sounds: Map<string, AudioBuffer>;

  private constructor() {
    this.audioContext = new AudioContext();
    this.sounds = new Map();
    this.preloadSounds();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async preloadSounds() {
    const soundUrls = {
      entry: '/sounds/entry.mp3',
      exit: '/sounds/exit.mp3',
      alert: '/sounds/alert.mp3',
      warning: '/sounds/warning.mp3'
    };

    for (const [key, url] of Object.entries(soundUrls)) {
      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        this.sounds.set(key, audioBuffer);
      } catch (err) {
        console.error(`Failed to load sound: ${key}`, err);
      }
    }
  }

  private playSound(type: string) {
    const buffer = this.sounds.get(type);
    if (buffer) {
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(this.audioContext.destination);
      source.start(0);
    }
  }

  public notify({
    type,
    symbol,
    message,
    sound = true,
    priority = 'medium'
  }: SignalNotification) {
    // Visual notification
    toast(message, {
      type: type === 'warning' ? 'error' : 'info',
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      className: `notification-${priority}`,
      icon: this.getIcon(type)
    });

    // Audio notification
    if (sound) {
      this.playSound(type);
    }

    // Push notification if supported
    if (Notification.permission === 'granted') {
      new Notification(`Trade Signal: ${symbol}`, {
        body: message,
        icon: '/icons/trade-signal.png',
        badge: '/icons/badge.png',
        tag: symbol,
        renotify: true
      });
    }
  }

  private getIcon(type: string) {
    switch (type) {
      case 'entry':
        return '📈';
      case 'exit':
        return '📉';
      case 'alert':
        return '🔔';
      case 'warning':
        return '⚠️';
      default:
        return '💡';
    }
  }
}

export const notificationService = NotificationService.getInstance();