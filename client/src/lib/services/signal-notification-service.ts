import { toast } from 'sonner';
import { TradingSignal } from '../stores/useSignals';

/**
 * Signal Notification Service
 * 
 * This service provides methods to display trading signal notifications
 * using toast notifications with custom styling based on signal type.
 */
export class SignalNotificationService {
  /**
   * Show a toast notification for a new trading signal
   */
  static showSignalNotification(signal: TradingSignal): void {
    // Choose notification sound based on signal type
    const audioFile = signal.action === 'buy' 
      ? '/assets/sounds/signal_buy.mp3' 
      : signal.action === 'sell' 
        ? '/assets/sounds/signal_sell.mp3'
        : '/assets/sounds/notification.mp3';
    
    // Play notification sound if available
    const audio = new Audio(audioFile);
    audio.volume = 0.5;
    audio.play().catch(err => console.log('Audio play failed:', err));
    
    // Format message with key details
    const message = `${signal.action.toUpperCase()} ${signal.symbol} [${signal.source}]`;
    
    // Format description with more details
    let description = `${signal.strategy}`;
    if (signal.timeframe) {
      description += ` • ${signal.timeframe}`;
    }
    if (signal.confidence) {
      description += ` • ${Math.round(signal.confidence)}% Confidence`;
    }
    
    // Show toast with appropriate styling based on signal action
    switch (signal.action) {
      case 'buy':
        toast.success(message, {
          description,
          duration: 8000,
          // Use higher duration to simulate importance for high confidence signals
          ...(signal.confidence > 80 ? { duration: 12000 } : {}),
          action: {
            label: 'View Details',
            onClick: () => window.location.href = '/trading-signals'
          },
        });
        break;
      case 'sell':
        toast.error(message, {
          description,
          duration: 8000,
          // Use higher duration to simulate importance for high confidence signals
          ...(signal.confidence > 80 ? { duration: 12000 } : {}),
          action: {
            label: 'View Details',
            onClick: () => window.location.href = '/trading-signals'
          },
        });
        break;
      default:
        toast.info(message, {
          description,
          duration: 6000,
          action: {
            label: 'View Details',
            onClick: () => window.location.href = '/trading-signals'
          },
        });
    }
  }
  
  /**
   * Show a summary notification for multiple new signals
   */
  static showMultipleSignalsNotification(signals: TradingSignal[]): void {
    if (signals.length === 0) return;
    
    // Play notification sound
    const audio = new Audio('/assets/sounds/notification.mp3');
    audio.volume = 0.3;
    audio.play().catch(err => console.log('Audio play failed:', err));
    
    // Group signals by action
    const buySignals = signals.filter(s => s.action === 'buy');
    const sellSignals = signals.filter(s => s.action === 'sell');
    const otherSignals = signals.filter(s => s.action !== 'buy' && s.action !== 'sell');
    
    // Create summary
    let description = '';
    if (buySignals.length > 0) {
      description += `${buySignals.length} BUY signal${buySignals.length > 1 ? 's' : ''}\n`;
    }
    if (sellSignals.length > 0) {
      description += `${sellSignals.length} SELL signal${sellSignals.length > 1 ? 's' : ''}\n`;
    }
    if (otherSignals.length > 0) {
      description += `${otherSignals.length} other signal${otherSignals.length > 1 ? 's' : ''}\n`;
    }
    
    // Show summary toast
    toast.info(`${signals.length} new trading signals`, {
      description,
      duration: 5000,
      action: {
        label: 'View All',
        onClick: () => window.location.href = '/trading-signals'
      },
    });
  }
}

export default SignalNotificationService;