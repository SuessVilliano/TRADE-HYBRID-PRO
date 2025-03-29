import React from 'react';
import { Button } from './button';
import { notificationService } from '@/lib/services/notification-service';

/**
 * A simple button to test the notification system
 */
export function TestNotificationButton() {
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
    </div>
  );
}

export default TestNotificationButton;