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
      
      // Handle trading signal notifications with real data
      if (detail.type === 'signal-entry' && detail.metadata) {
        const { symbol, type, price, stopLoss, takeProfit, provider } = detail.metadata;
        
        // Show notification with actual webhook data
        const toastType = type === 'buy' ? 'success' : 'error';
        const title = `${(type || 'unknown').toUpperCase()} Signal: ${symbol || 'UNKNOWN'}`;
        const description = `Entry: ${price || 0} | SL: ${stopLoss || 0} | TP: ${takeProfit || 0}`;
        
        toast[toastType](title, {
          description: `Signal received via WebSocket\n${description}`,
          duration: 8000,
          action: {
            label: 'View Details',
            onClick: () => {
              // Show detailed signal information
              const signalInfo = `
Symbol: ${symbol}
Entry: ${price}
Stop Loss: ${stopLoss}
Take Profit: ${takeProfit}
Provider: ${provider}
`;
              
              // Create browser notification with real data
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(title, {
                  body: signalInfo,
                  icon: '/icon.png'
                });
              }
            }
          }
        });
        
        return; // Exit early for signal notifications
      }
      
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
    
    // Connect to WebSocket for real-time webhook notifications
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    let ws: WebSocket | null = null;
    
    try {
      ws = new WebSocket(wsUrl);
      
      ws.addEventListener('message', (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle webhook notifications with real data
          if (data.type === 'webhook_notification' && data.data) {
            const { title, body, metadata } = data.data;
            
            // Create notification event with real webhook data
            const notificationEvent = new CustomEvent('in-app-notification', {
              detail: {
                id: `webhook-${Date.now()}`,
                title: title,
                body: body,
                type: 'signal-entry',
                priority: 'normal',
                timestamp: new Date(),
                dismissable: true,
                metadata: metadata
              }
            });
            
            // Dispatch the notification
            window.dispatchEvent(notificationEvent);
            
            console.log('Webhook notification processed with real data:', {
              title,
              body,
              metadata
            });
          }
          
          // Handle trading signals
          if (data.type === 'trading_signal' && data.data && data.data.signal) {
            const { signal, provider, rawPayload } = data.data;
            
            console.log('Trading signal received with raw payload:', rawPayload);
            
            // Create notification for trading signal
            const signalNotification = new CustomEvent('in-app-notification', {
              detail: {
                id: `signal-${Date.now()}`,
                title: `${signal.side?.toUpperCase() || 'UNKNOWN'} Signal: ${signal.symbol || 'UNKNOWN'}`,
                body: `Entry: ${signal.entryPrice || 0} | SL: ${signal.stopLoss || 0} | TP: ${signal.takeProfit || 0}`,
                type: 'signal-entry',
                priority: 'normal',
                timestamp: new Date(),
                dismissable: true,
                metadata: {
                  symbol: signal.symbol,
                  type: signal.side,
                  price: signal.entryPrice,
                  stopLoss: signal.stopLoss,
                  takeProfit: signal.takeProfit,
                  provider: provider,
                  rawPayload: rawPayload
                }
              }
            });
            
            window.dispatchEvent(signalNotification);
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      });
      
      ws.addEventListener('open', () => {
        console.log('Notification WebSocket connected');
      });
      
    } catch (error) {
      console.error('Error setting up notification WebSocket:', error);
    }
    
    // Send a one-time test notification on component mount (only in development)
    if (process.env.NODE_ENV !== 'production') {
      const hasShownTestNotification = sessionStorage.getItem('test-notification-shown');
      if (!hasShownTestNotification) {
        // Use setTimeout to ensure the listener is registered first
        setTimeout(() => {
          // Test notification using the notification service
          notificationService.showNotification({
            title: 'Notification System Ready',
            body: 'Ready to receive webhook notifications.',
            type: 'system',
            priority: 'normal',
            dismissable: true
          });
          sessionStorage.setItem('test-notification-shown', 'true');
        }, 2000);
      }
    }
    
    // Clean up when component unmounts
    return () => {
      window.removeEventListener('in-app-notification', handleNotification);
      
      if (ws) {
        ws.close();
      }
    };
  }, []);
  
  // This component doesn't render anything visible
  return null;
}