import { toast } from 'sonner';
import { TradingSignal } from '../stores/useSignals';
import { useRouter } from 'next/router';

export class SignalNotificationService {
  private static audio = typeof window !== 'undefined' ? new Audio('/sounds/signal-alert.mp3') : null;

  static showSignalNotification(signal: TradingSignal) {
    // Play notification sound
    if (this.audio) {
      this.audio.volume = 0.5;
      this.audio.play().catch(err => console.warn('Audio play failed:', err));
    }

    const message = `${signal.action.toUpperCase()} Signal: ${signal.symbol}`;
    const description = `Entry: ${signal.entry} | SL: ${signal.stopLoss} | TP: ${signal.takeProfit}`;

    switch (signal.action.toLowerCase()) {
      case 'buy':
        toast.success(message, {
          description,
          duration: 8000,
          ...(signal.confidence > 80 ? { duration: 12000 } : {}),
          action: {
            label: 'View Signal',
            onClick: () => window.location.href = '/trading-signals'
          },
        });
        break;
      case 'sell':
        toast.error(message, {
          description,
          duration: 8000,
          ...(signal.confidence > 80 ? { duration: 12000 } : {}),
          action: {
            label: 'View Signal',
            onClick: () => window.location.href = '/trading-signals'
          },
        });
        break;
    }
  }

  static showAdminMessage(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
    if (this.audio) {
      this.audio.play().catch(err => console.warn('Audio play failed:', err));
    }

    toast[type](message, {
      duration: 8000,
      action: {
        label: 'View All',
        onClick: () => window.location.href = '/notifications'
      }
    });
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