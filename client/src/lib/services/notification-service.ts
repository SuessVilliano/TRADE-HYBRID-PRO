
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
    // Add notification to queue
    this.notificationQueue.push(message);

    // Play different sounds based on notification type
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

    // Process queue if not already processing
    if (!this.isProcessing) {
      this.processQueue();
    }
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

    // Wait for a short delay before processing next notification
    await new Promise(resolve => setTimeout(resolve, 300));
    this.processQueue();
  }
}

export default NotificationService;
