import React, { useEffect } from 'react';
import { toast } from 'sonner';

interface NotificationDetail {
  type: string;
  title: string;
  body: string;
  tag: string;
  data: any;
  priority: 'low' | 'normal' | 'high';
  timestamp: number;
}

/**
 * This component listens for in-app notification events and displays them using the sonner toast system
 * It bridges the notification service with the toast UI
 */
export const NotificationListener: React.FC = () => {
  useEffect(() => {
    // Convert notification priority to toast type
    const priorityToToastType = (priority: string): 'success' | 'info' | 'warning' | 'error' | 'default' => {
      switch (priority) {
        case 'high':
          return 'error';
        case 'normal':
          return 'info';
        case 'low':
          return 'success';
        default:
          return 'info';
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
    
    const handleNotification = (event: Event) => {
      const customEvent = event as CustomEvent<NotificationDetail>;
      const detail = customEvent.detail;
      
      console.log('In-app notification received:', detail);
      
      // Show the notification as a toast
      const toastType = notificationTypeToToastType(detail.type);
      const duration = detail.priority === 'high' ? 10000 : 5000; // High priority toasts stay longer
      
      // Handle different toast types
      if (toastType === 'success') {
        toast.success(detail.title, {
          description: detail.body,
          duration: duration,
        });
      } else if (toastType === 'error') {
        toast.error(detail.title, {
          description: detail.body,
          duration: duration,
        });
      } else if (toastType === 'warning') {
        toast.warning(detail.title, {
          description: detail.body,
          duration: duration,
        });
      } else if (toastType === 'info') {
        toast.info(detail.title, {
          description: detail.body,
          duration: duration,
        });
      } else {
        // Default case
        toast(detail.title, {
          description: detail.body,
          duration: duration,
        });
      }
    };
    
    // Add event listener
    window.addEventListener('in-app-notification', handleNotification);
    
    // Cleanup
    return () => {
      window.removeEventListener('in-app-notification', handleNotification);
    };
  }, []);
  
  // This component doesn't render anything
  return null;
};

export default NotificationListener;