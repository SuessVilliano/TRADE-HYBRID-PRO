import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { NotificationDetail, notificationService } from '@/lib/services/notification-service';

/**
 * This component listens for in-app notification events and displays them using the toast system
 * It doesn't render anything, just sets up event listeners
 */
export function NotificationListener() {
  useEffect(() => {
    // Convert notification priority to toast duration
    const priorityToDuration = (priority: string): number => {
      switch (priority) {
        case 'high':
          return 8000; // 8 seconds for high priority
        case 'normal':
          return 5000; // 5 seconds for normal priority
        case 'low':
          return 3000; // 3 seconds for low priority
        default:
          return 5000;
      }
    };
    
    // Convert notification type to toast type
    const notificationTypeToToastType = (type: string): 'success' | 'info' | 'warning' | 'error' | 'default' => {
      switch (type) {
        case 'price-alert':
        case 'signal-entry':
        case 'signal-update':
          return 'info';
        case 'take-profit':
          return 'success';
        case 'stop-loss':
        case 'signal-expiry':
          return 'warning';
        case 'system':
          return 'info';
        default:
          return 'info';
      }
    };
    
    // Handle in-app notification event
    const handleNotification = (event: Event) => {
      const customEvent = event as CustomEvent<NotificationDetail>;
      const detail = customEvent.detail;
      
      console.log('In-app notification received:', detail);
      
      // Determine toast type and duration
      const toastType = notificationTypeToToastType(detail.type);
      const duration = priorityToDuration(detail.priority);
      
      // Configure toast options
      const toastOptions = {
        description: detail.body,
        duration: duration,
        id: detail.id,
        action: detail.link ? {
          label: detail.linkText || 'View',
          onClick: () => window.location.href = detail.link!
        } : undefined,
        onAutoClose: () => {
          // Mark notification as read when toast is closed
          if (detail.dismissable !== false) {
            // Mark as read in the notification service
            notificationService.markAsRead(detail.id);
          }
        }
      };
      
      // Show the toast based on type
      switch (toastType) {
        case 'success':
          toast.success(detail.title, toastOptions);
          break;
        case 'warning':
          toast.warning(detail.title, toastOptions);
          break;
        case 'error':
          toast.error(detail.title, toastOptions);
          break;
        case 'info':
        default:
          toast.info(detail.title, toastOptions);
          break;
      }
    };
    
    // Add event listener for in-app notifications
    window.addEventListener('in-app-notification', handleNotification);
    
    // Send a test notification on component mount (only in development)
    if (process.env.NODE_ENV !== 'production') {
      // Use setTimeout to ensure the listener is registered first
      setTimeout(() => {
        // Test notification using the notification service
        notificationService.showNotification({
          title: 'Notification System Active',
          body: 'The notification system is now active and ready to display notifications.',
          type: 'system',
          priority: 'normal',
          dismissable: true
        });
      }, 2000);
    }
    
    // Clean up when component unmounts
    return () => {
      window.removeEventListener('in-app-notification', handleNotification);
    };
  }, []);
  
  // This component doesn't render anything visible
  return null;
}