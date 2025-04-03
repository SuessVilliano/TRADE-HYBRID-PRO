import React from 'react';
import { Button } from './button';
import { Separator } from './separator';
import { notificationService } from '@/lib/services/notification-service';
import { pushNotificationService } from '@/lib/services/push-notification-service';
import { toast } from 'sonner';
import { API_ENDPOINTS } from '@/lib/constants';
import { useAuth } from '@/lib/hooks/use-auth';

/**
 * A simple button to test the notification system
 */
export function TestNotificationButton() {
  const { user } = useAuth();
  const sendTestNotification = () => {
    // Send a test system notification
    notificationService.notifySystem(
      'Test Notification',
      'This is a test of the notification system. Everything is working properly!',
      5 // High priority
    );
  };
  
  const sendTestPriceAlert = () => {
    // Send a test price alert notification
    notificationService.notifyPriceAlert(
      'BTC/USD',
      42069.42,
      'above',
      42000,
      'crypto',
      4 // Medium-high priority
    );
  };
  
  const sendTestSignalEntry = () => {
    // Send a test signal entry notification
    notificationService.notifySignalEntry(
      'ETH/USD',
      'buy',
      2420.50,
      2350.00,
      2550.00,
      'crypto',
      87,
      4 // Medium-high priority
    );
  };
  
  const sendTestTakeProfit = () => {
    // Send a test take profit notification
    notificationService.notifyTakeProfit(
      'SOL/USD',
      137.25,
      '+14.5%',
      'crypto',
      4 // Medium-high priority
    );
  };
  
  const sendTestStopLoss = () => {
    // Send a test stop loss notification
    notificationService.notifyStopLoss(
      'AAPL',
      178.50,
      '-3.2%',
      'stocks',
      4 // Medium-high priority
    );
  };
  
  // Send a test push notification (browser notification)
  const sendTestPushNotification = async () => {
    if (!user || !user.id) {
      toast.error('You need to be logged in to test push notifications');
      return;
    }
    
    try {
      // Initialize push notification service if needed
      await pushNotificationService.initialize(user.id);
      
      // Test the push notification
      const success = await pushNotificationService.testPushNotification();
      
      if (success) {
        toast.success('Test push notification sent. Check your notifications.');
      } else {
        toast.error('Failed to send test push notification. Check console for details.');
      }
    } catch (error) {
      console.error('Error sending test push notification:', error);
      toast.error('Error sending test push notification');
    }
  };
  
  // Send a test push notification via server API (works when browser is closed)
  const sendTestServerPushNotification = async () => {
    if (!user || !user.id) {
      toast.error('You need to be logged in to test push notifications');
      return;
    }
    
    try {
      // Send a push notification via the server API
      const response = await fetch(`${API_ENDPOINTS.NOTIFICATIONS}/push/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
          title: 'Test Push Notification',
          body: 'This is a test push notification from the server!'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(`Push notification sent to ${data.stats.successful} of ${data.stats.total} devices`);
      } else {
        toast.error(data.error || 'Failed to send push notification');
      }
    } catch (error) {
      console.error('Error sending server push notification:', error);
      toast.error('Error sending server push notification');
    }
  };
  
  return (
    <div className="flex flex-col gap-2">
      <Button variant="outline" size="sm" onClick={sendTestNotification}>
        Test System Notification
      </Button>
      <Button variant="outline" size="sm" onClick={sendTestPriceAlert}>
        Test Price Alert
      </Button>
      <Button variant="outline" size="sm" onClick={sendTestSignalEntry}>
        Test Signal Entry
      </Button>
      <Button variant="outline" size="sm" onClick={sendTestTakeProfit}>
        Test Take Profit
      </Button>
      <Button variant="outline" size="sm" onClick={sendTestStopLoss}>
        Test Stop Loss
      </Button>
      
      <Separator className="my-2" />
      <h4 className="text-sm font-medium mb-2">Push Notifications (Service Worker)</h4>
      
      <Button variant="outline" size="sm" onClick={sendTestPushNotification}>
        Test Client Push Notification
      </Button>
      <Button variant="outline" size="sm" onClick={sendTestServerPushNotification}>
        Test Server Push Notification
      </Button>
    </div>
  );
}

export default TestNotificationButton;