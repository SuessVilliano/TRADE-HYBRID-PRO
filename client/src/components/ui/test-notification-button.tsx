import React from 'react';
import { Button } from './button';
import { notificationService } from '@/lib/services/notification-service';
import { Bell } from 'lucide-react';

// Export as named export and default export
export function TestNotificationButton() {
  // Send a test notification
  const sendTestNotification = () => {
    notificationService.showNotification({
      title: 'Test Notification',
      body: 'This is a test notification to verify the notification system is working properly.',
      type: 'system',
      priority: 'normal',
      dismissable: true,
      link: '/dashboard',
      linkText: 'Go to Dashboard'
    });
  };
  
  // Send a test signal notification
  const sendTestSignalNotification = () => {
    notificationService.showSignalNotification(
      'BTCUSDT',
      'buy',
      68500,
      'Paradox AI'
    );
  };
  
  // Send a test price alert notification
  const sendTestPriceAlertNotification = () => {
    notificationService.showPriceAlertNotification(
      'ETHUSDT',
      3400,
      'above',
      3350
    );
  };
  
  // Send a test take profit notification
  const sendTestTakeProfitNotification = () => {
    notificationService.showTakeProfitNotification(
      'BTCUSDT',
      69500,
      '+5.3%'
    );
  };
  
  // Send a test stop loss notification
  const sendTestStopLossNotification = () => {
    notificationService.showStopLossNotification(
      'SOLUSDT',
      142.50,
      '-2.8%'
    );
  };
  
  return (
    <div className="fixed bottom-4 right-4 flex flex-col space-y-2">
      <Button 
        size="sm" 
        variant="outline"
        className="bg-slate-800/90 border-slate-700 gap-1"
        onClick={sendTestNotification}
      >
        <Bell className="h-4 w-4" />
        Test Notification
      </Button>
      
      <Button 
        size="sm" 
        variant="outline"
        className="bg-slate-800/90 border-slate-700 gap-1 text-blue-400 hover:text-blue-300"
        onClick={sendTestSignalNotification}
      >
        Signal Notification
      </Button>
      
      <Button 
        size="sm" 
        variant="outline"
        className="bg-slate-800/90 border-slate-700 gap-1 text-amber-400 hover:text-amber-300"
        onClick={sendTestPriceAlertNotification}
      >
        Price Alert
      </Button>
      
      <Button 
        size="sm" 
        variant="outline"
        className="bg-slate-800/90 border-slate-700 gap-1 text-green-400 hover:text-green-300"
        onClick={sendTestTakeProfitNotification}
      >
        Take Profit
      </Button>
      
      <Button 
        size="sm" 
        variant="outline"
        className="bg-slate-800/90 border-slate-700 gap-1 text-red-400 hover:text-red-300"
        onClick={sendTestStopLossNotification}
      >
        Stop Loss
      </Button>
    </div>
  );
}

// Also export as default
export default TestNotificationButton;