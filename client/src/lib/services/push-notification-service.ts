/**
 * Push Notification Service
 * 
 * This service manages push notification subscriptions and provides
 * methods for checking if push notifications are supported, subscribing,
 * and unsubscribing.
 */

import { API_BASE_URL, API_ENDPOINTS } from '../constants';

// VAPID public key from environment variables
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '-kmNFXssQJhgjHaBBmegDTYD6GL5NezpNnXGkEe-8Xo';

// PushNotificationService singleton class
class PushNotificationService {
  // Flag to track if the service has been initialized
  private initialized: boolean = false;
  
  // Flag to track if push notifications are supported
  private supported: boolean = false;
  
  // Flag to track if the application has permission for notifications
  private permission: NotificationPermission = 'default';
  
  // Service worker registration
  private swRegistration: ServiceWorkerRegistration | null = null;
  
  // Current user ID
  private userId: number | null = null;
  
  /**
   * Check if push notifications are supported by the browser
   */
  public isPushNotificationSupported(): boolean {
    return (
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  }
  
  /**
   * Initialize the push notification service
   */
  public async initialize(userId?: number): Promise<void> {
    // If already initialized, return
    if (this.initialized) {
      return;
    }
    
    // Set the user ID if provided
    if (userId) {
      this.userId = userId;
    }
    
    // Check if push notifications are supported
    this.supported = this.isPushNotificationSupported();
    
    if (!this.supported) {
      console.warn('Push notifications are not supported in this browser');
      return;
    }
    
    // Get the current notification permission
    this.permission = Notification.permission;
    
    // Register the service worker
    try {
      this.swRegistration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service Worker registered:', this.swRegistration);
      
      // Mark as initialized
      this.initialized = true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
  
  /**
   * Set the current user ID
   */
  public setUserId(userId: number): void {
    this.userId = userId;
  }
  
  /**
   * Get the current user ID
   */
  public getUserId(): number | null {
    return this.userId;
  }
  
  /**
   * Request permission for notifications
   */
  public async requestPermission(): Promise<NotificationPermission> {
    if (!this.supported) {
      return 'denied';
    }
    
    try {
      this.permission = await Notification.requestPermission();
      return this.permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }
  
  /**
   * Get the current notification permission
   */
  public getPermission(): NotificationPermission {
    if (!this.supported) {
      return 'denied';
    }
    
    return this.permission;
  }
  
  /**
   * Check if the user is subscribed to push notifications
   */
  public async isSubscribed(): Promise<boolean> {
    if (!this.supported || !this.swRegistration) {
      return false;
    }
    
    try {
      const subscription = await this.swRegistration.pushManager.getSubscription();
      return !!subscription;
    } catch (error) {
      console.error('Error checking push subscription:', error);
      return false;
    }
  }
  
  /**
   * Subscribe to push notifications
   */
  public async subscribeToPushNotifications(): Promise<PushSubscription | null> {
    if (!this.supported || !this.swRegistration || !this.userId) {
      console.warn('Cannot subscribe to push notifications: ', {
        supported: this.supported,
        swRegistration: !!this.swRegistration,
        userId: this.userId
      });
      return null;
    }
    
    // If permission is not granted, request it
    if (this.permission !== 'granted') {
      const permission = await this.requestPermission();
      
      if (permission !== 'granted') {
        console.warn('Notification permission was not granted');
        return null;
      }
      
      this.permission = permission;
    }
    
    try {
      // Convert the base64 VAPID public key to a Uint8Array
      const applicationServerKey = this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      
      // Subscribe to push notifications
      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey
      });
      
      console.log('User is subscribed to push notifications:', subscription);
      
      // Send the subscription to the server
      const response = await fetch(`${API_ENDPOINTS.NOTIFICATIONS}/push/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subscription,
          userId: this.userId
        })
      });
      
      if (!response.ok) {
        console.error('Error sending push subscription to server:', await response.json());
        return null;
      }
      
      return subscription;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return null;
    }
  }
  
  /**
   * Unsubscribe from push notifications
   */
  public async unsubscribeFromPushNotifications(): Promise<boolean> {
    if (!this.supported || !this.swRegistration || !this.userId) {
      return false;
    }
    
    try {
      // Get the current subscription
      const subscription = await this.swRegistration.pushManager.getSubscription();
      
      if (!subscription) {
        return true; // Already unsubscribed
      }
      
      // Send the unsubscribe request to the server
      const response = await fetch(`${API_ENDPOINTS.NOTIFICATIONS}/push/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          userId: this.userId
        })
      });
      
      if (!response.ok) {
        console.error('Error sending push unsubscription to server:', await response.json());
      }
      
      // Unsubscribe from push notifications
      const success = await subscription.unsubscribe();
      
      console.log('User is unsubscribed from push notifications:', success);
      
      return success;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      return false;
    }
  }
  
  /**
   * Convert a base64 string to a Uint8Array
   * This is needed for the applicationServerKey
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    return outputArray;
  }
  
  /**
   * Test push notifications
   */
  public async testPushNotification(): Promise<boolean> {
    if (!this.userId) {
      console.warn('Cannot test push notifications: No user ID');
      return false;
    }
    
    try {
      const response = await fetch(`${API_ENDPOINTS.NOTIFICATIONS}/push/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: this.userId
        })
      });
      
      if (!response.ok) {
        console.error('Error testing push notifications:', await response.json());
        return false;
      }
      
      console.log('Test push notification sent');
      return true;
    } catch (error) {
      console.error('Error testing push notifications:', error);
      return false;
    }
  }
}

// Export a singleton instance of the service
export const pushNotificationService = new PushNotificationService();