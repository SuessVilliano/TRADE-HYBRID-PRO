
class NotificationService {
  private static instance: NotificationService;
  private audioContext: AudioContext;
  private gainNode: GainNode;
  private oscillator: OscillatorNode | null = null;
  private notificationQueue: string[] = [];
  private isProcessing: boolean = false;

  private constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);
    this.gainNode.gain.value = 0.1;
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private playSound(frequency: number, duration: number) {
    this.oscillator = this.audioContext.createOscillator();
    this.oscillator.connect(this.gainNode);
    this.oscillator.frequency.value = frequency;
    this.oscillator.start();
    setTimeout(() => {
      if (this.oscillator) {
        this.oscillator.stop();
        this.oscillator.disconnect();
        this.oscillator = null;
      }
    }, duration);
  }

  public notify(message: string, type: 'success' | 'error' | 'info' = 'info') {
    this.notificationQueue.push(message);
    
    switch (type) {
      case 'success':
        this.playSound(800, 200);
        break;
      case 'error':
        this.playSound(300, 400);
        break;
      case 'info':
        this.playSound(600, 150);
        break;
    }

    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  public notifySystem(title: string, message: string, priority: number) {
    this.notify(`${title}: ${message}`, 'info');
  }

  public notifyPriceAlert(symbol: string, price: number, condition: string, targetPrice: number, marketType: string, priority: number) {
    this.notify(`${symbol} ${condition} ${targetPrice} (${price})`, 'info');
  }

  public notifySignalEntry(symbol: string, direction: string, price: number, stopLoss: number, takeProfit: number, marketType: string, confidence: number, priority: number) {
    this.notify(`${direction.toUpperCase()} ${symbol} @ ${price}`, 'success');
  }

  public notifyTakeProfit(symbol: string, price: number, profit: string, marketType: string, priority: number) {
    this.notify(`TP Hit ${symbol} @ ${price} (${profit})`, 'success');
  }

  public notifyStopLoss(symbol: string, price: number, loss: string, marketType: string, priority: number) {
    this.notify(`SL Hit ${symbol} @ ${price} (${loss})`, 'error');
  }

  private async processQueue() {
    if (this.notificationQueue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;
    const message = this.notificationQueue.shift();

    if (message) {
      console.log('Notification:', message);
    }

    await new Promise(resolve => setTimeout(resolve, 300));
    this.processQueue();
  }
}

// Export the singleton instance
export const notificationService = NotificationService.getInstance();
