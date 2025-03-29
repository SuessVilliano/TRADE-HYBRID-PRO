import React, { useEffect } from 'react';
import { useToast } from './toaster';

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
 * This component listens for in-app notification events and displays them using the toast system
 * It bridges the notification service with the toast UI
 */
export const NotificationListener: React.FC = () => {
  const { addToast } = useToast();
  
  useEffect(() => {
    // Convert notification priority to toast type
    const priorityToToastType = (priority: string) => {
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
    const notificationTypeToToastType = (type: string) => {
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
      
      // Format message to include title and body
      const message = `${detail.title}: ${detail.body}`;
      
      // Add the notification as a toast
      addToast({
        type: notificationTypeToToastType(detail.type),
        message,
        duration: detail.priority === 'high' ? 10000 : 5000, // High priority toasts stay longer
      });
    };
    
    // Add event listener
    window.addEventListener('in-app-notification', handleNotification);
    
    // Cleanup
    return () => {
      window.removeEventListener('in-app-notification', handleNotification);
    };
  }, [addToast]);
  
  // This component doesn't render anything
  return null;
};

export default NotificationListener;