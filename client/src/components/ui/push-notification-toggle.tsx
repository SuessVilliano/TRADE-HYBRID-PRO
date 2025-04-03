/**
 * Push Notification Toggle Component
 * 
 * This component renders a toggle switch that allows the user to enable/disable push notifications.
 * It handles the subscription/unsubscription process and displays the appropriate UI based on the
 * browser's support for push notifications.
 */

import React, { useEffect, useState } from 'react';
import { Switch } from './switch';
import { pushNotificationService } from '../../lib/services/push-notification-service';
import { toast } from 'sonner';

interface PushNotificationToggleProps {
  className?: string;
  disabled?: boolean;
}

export function PushNotificationToggle({ className, disabled }: PushNotificationToggleProps) {
  // State for tracking if push notifications are supported
  const [supported, setSupported] = useState(false);
  
  // State for tracking if push notifications are enabled
  const [enabled, setEnabled] = useState(false);
  
  // State for tracking if we're loading the initial state
  const [loading, setLoading] = useState(true);

  // Initialize the component
  useEffect(() => {
    const initializeComponent = async () => {
      // Check if push notifications are supported
      const isSupported = pushNotificationService.isPushNotificationSupported();
      setSupported(isSupported);
      
      if (isSupported) {
        // Initialize the push notification service
        await pushNotificationService.initialize();
        
        // Check if we're already subscribed
        const isSubscribed = await pushNotificationService.isSubscribed();
        setEnabled(isSubscribed);
      }
      
      setLoading(false);
    };
    
    initializeComponent();
  }, []);

  // Handle the toggle change
  const handleToggleChange = async (checked: boolean) => {
    try {
      if (checked) {
        // Subscribe to push notifications
        const subscription = await pushNotificationService.subscribeToPushNotifications();
        
        if (subscription) {
          setEnabled(true);
          toast.success('Push notifications enabled');
        } else {
          toast.error('Failed to enable push notifications');
        }
      } else {
        // Unsubscribe from push notifications
        const success = await pushNotificationService.unsubscribeFromPushNotifications();
        
        if (success) {
          setEnabled(false);
          toast.success('Push notifications disabled');
        } else {
          toast.error('Failed to disable push notifications');
        }
      }
    } catch (error) {
      console.error('Error toggling push notifications:', error);
      toast.error('Error toggling push notifications');
    }
  };

  // If push notifications are not supported, show a message
  if (!supported && !loading) {
    return (
      <div className={`text-sm text-muted-foreground ${className}`}>
        Push notifications are not supported in this browser.
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Switch
        checked={enabled}
        onCheckedChange={handleToggleChange}
        disabled={loading || disabled}
        aria-label="Toggle push notifications"
      />
      <span className="text-sm">
        {loading ? 'Loading...' : (enabled ? 'Push notifications enabled' : 'Enable push notifications')}
      </span>
    </div>
  );
}