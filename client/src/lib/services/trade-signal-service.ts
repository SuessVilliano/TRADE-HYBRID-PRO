import { userSettingsService } from './user-settings-service';

// Trade Signal Types
export type TradeSignal = {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  entry: number;
  stopLoss: number;
  takeProfit: number;
  timestamp: Date;
  source: string;
  risk: number;
  notes?: string;
  timeframe?: string; // Added timeframe field
  status?: 'active' | 'completed' | 'cancelled'; // Added status field
};

// Event handlers
type SignalEventType = 'signal_added' | 'signal_updated' | 'signal_removed';
type SignalEventHandler = (signal: TradeSignal) => void;

class TradeSignalService {
  private signals: TradeSignal[] = [];
  private eventHandlers: Record<SignalEventType, SignalEventHandler[]> = {
    signal_added: [],
    signal_updated: [],
    signal_removed: []
  };
  private notificationsEnabled: boolean = true; // Default to enabled

  constructor() {
    // Load real signals from the API instead of mock data
    this.fetchRealSignals();
    
    // Subscribe to user settings changes
    userSettingsService.subscribe('settings_changed', (settings) => {
      this.notificationsEnabled = settings.notifications.signalAlerts;
    });
    
    // Initialize notification state from user settings
    const settings = userSettingsService.getSettings();
    this.notificationsEnabled = settings.notifications.signalAlerts;
    
    // Set up periodic refresh of signals (every 60 seconds)
    if (typeof window !== 'undefined') {
      setInterval(() => this.fetchRealSignals(), 60000);
    }
  }
  
  // Fetch real signals from the API
  async fetchRealSignals(): Promise<void> {
    try {
      console.log('Fetching real trading signals from API...');
      const response = await fetch('/api/signals/trading-signals');
      
      if (!response.ok) {
        throw new Error(`Error fetching signals: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Raw signals response:', data);
      
      if (data && data.signals && Array.isArray(data.signals)) {
        // Convert the API signal format to our internal format
        const newSignals: TradeSignal[] = data.signals.map((apiSignal: any) => {
          const confidence = Math.floor(Math.random() * 20) + 80; // Random confidence between 80-99
          
          // Determine which timeframe to use
          let timeframe = apiSignal.timeframe || '1d';
          if (apiSignal.Provider) {
            if (apiSignal.Provider.includes('Hybrid')) {
              timeframe = '10m';
            } else if (apiSignal.Provider.includes('Paradox')) {
              timeframe = '30m';
            } else if (apiSignal.Provider.includes('Solaris')) {
              timeframe = '5m';
            }
          }
          
          return {
            id: apiSignal.id || `api-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            symbol: apiSignal.Symbol || apiSignal.symbol || 'UNKNOWN',
            type: (apiSignal.Direction || apiSignal.side || 'buy').toLowerCase() === 'buy' ? 'buy' : 'sell',
            entry: apiSignal['Entry Price'] || apiSignal.entryPrice || 0,
            stopLoss: apiSignal['Stop Loss'] || apiSignal.stopLoss || 0,
            takeProfit: apiSignal['Take Profit'] || apiSignal.takeProfit || apiSignal.TP1 || 0,
            timestamp: new Date(apiSignal.Date || apiSignal.generatedAt || Date.now()),
            source: apiSignal.Provider || apiSignal.provider || 'API',
            risk: 1,
            notes: apiSignal.Notes || apiSignal.notes || `${timeframe} timeframe signal`,
            timeframe: timeframe,
            status: (apiSignal.Status || 'active').toLowerCase() as 'active' | 'completed' | 'cancelled'
          };
        });
        
        console.log('Refreshed signals:', newSignals);
        
        // Replace the existing signals array with the new signals
        this.signals = newSignals;
      }
    } catch (error) {
      console.error('Error fetching signals:', error);
    }
  }

  // Subscribe to signal events
  subscribe(event: SignalEventType, handler: SignalEventHandler): void {
    this.eventHandlers[event].push(handler);
  }

  // Unsubscribe from signal events
  unsubscribe(event: SignalEventType, handler: SignalEventHandler): void {
    this.eventHandlers[event] = this.eventHandlers[event].filter(h => h !== handler);
  }

  // Trigger event
  private triggerEvent(event: SignalEventType, signal: TradeSignal): void {
    this.eventHandlers[event].forEach(handler => handler(signal));
  }

  // Add a new signal
  addSignal(signal: TradeSignal): void {
    this.signals.unshift(signal); // Add to beginning of array
    this.triggerEvent('signal_added', signal);
    
    // Show notification if enabled
    if (this.notificationsEnabled) {
      this.showSignalNotification(signal);
    }
  }
  
  // Show notification for a new signal
  private showSignalNotification(signal: TradeSignal): void {
    // Format currency with 2 decimal places or more if needed
    const formatPrice = (price: number): string => {
      if (price < 0.01) return price.toString(); // For very small values, use full precision
      return price.toLocaleString(undefined, { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 6
      });
    };
    
    // Create notification title
    const title = `${signal.type.toUpperCase()} Signal: ${signal.symbol}`;
    
    // Create notification body
    const body = `Entry: ${formatPrice(signal.entry)} | SL: ${formatPrice(signal.stopLoss)} | TP: ${formatPrice(signal.takeProfit)}${signal.notes ? `\n${signal.notes}` : ''}`;
    
    // Determine notification icon based on signal type
    const icon = signal.type === 'buy' 
      ? '/images/buy-signal-icon.png' 
      : '/images/sell-signal-icon.png';
    
    // Show the notification
    userSettingsService.showNotification(title, {
      body,
      icon,
      badge: '/images/notification-badge.png',
      tag: `signal-${signal.id}`,
      data: signal,
      requireInteraction: false,
      silent: false
    });
  }

  // Get all signals
  getAllSignals(): TradeSignal[] {
    return [...this.signals]; // Return a copy to prevent direct modification
  }

  // Initialize mock data
  private initializeMockData(): void {
    const mockSignals: TradeSignal[] = [
      {
        id: '1',
        symbol: 'BTCUSDT',
        type: 'buy',
        entry: 68420.50,
        stopLoss: 67000.00,
        takeProfit: 72000.00,
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        source: 'AI Signal',
        risk: 2,
        notes: 'Strong support at $67,000 with increasing volume'
      },
      {
        id: '2',
        symbol: 'ETHUSDT',
        type: 'buy',
        entry: 3450.75,
        stopLoss: 3350.00,
        takeProfit: 3650.00,
        timestamp: new Date(Date.now() - 1000 * 60 * 45),
        source: 'TradingView',
        risk: 1,
        notes: 'Breaking out of bullish flag pattern on 4h chart'
      },
      {
        id: '3',
        symbol: 'SOLUSDT',
        type: 'sell',
        entry: 147.50,
        stopLoss: 154.00,
        takeProfit: 130.00,
        timestamp: new Date(Date.now() - 1000 * 60 * 120),
        source: 'Community',
        risk: 3,
        notes: 'Bearish divergence on RSI, approaching resistance'
      },
      {
        id: '4',
        symbol: 'DOGEUSDT',
        type: 'buy',
        entry: 0.1235,
        stopLoss: 0.1180,
        takeProfit: 0.1350,
        timestamp: new Date(Date.now() - 1000 * 60 * 180),
        source: 'AI Signal',
        risk: 2,
        notes: 'Positive sentiment analysis from social media data'
      },
      {
        id: '5',
        symbol: 'AVAXUSDT',
        type: 'sell',
        entry: 28.75,
        stopLoss: 30.50,
        takeProfit: 24.00,
        timestamp: new Date(Date.now() - 1000 * 60 * 240),
        source: 'Oscillator',
        risk: 2,
        notes: 'Overbought on multiple timeframes'
      },
      {
        id: '6',
        symbol: 'BNBUSDT',
        type: 'buy',
        entry: 572.50,
        stopLoss: 550.00,
        takeProfit: 620.00,
        timestamp: new Date(Date.now() - 1000 * 60 * 300),
        source: 'Pattern',
        risk: 1,
        notes: 'Double bottom pattern with increasing buy volume'
      },
    ];

    this.signals = mockSignals;
  }

  // Search signals by symbol
  searchBySymbol(query: string): TradeSignal[] {
    return this.signals.filter(signal => 
      signal.symbol.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Filter signals by type
  filterByType(type: 'buy' | 'sell'): TradeSignal[] {
    return this.signals.filter(signal => signal.type === type);
  }

  // Filter signals by source
  filterBySource(source: string): TradeSignal[] {
    return this.signals.filter(signal => signal.source === source);
  }
  
  // Add a test signal (for testing notification system)
  addTestSignal(): void {
    const testSignal: TradeSignal = {
      id: `test-${Date.now()}`,
      symbol: 'BTCUSDT',
      type: Math.random() > 0.5 ? 'buy' : 'sell',
      entry: 69420.50,
      stopLoss: 68000.00,
      takeProfit: 72000.00,
      timestamp: new Date(),
      source: 'Test Signal',
      risk: 1,
      notes: 'This is a test signal to verify notification settings'
    };
    
    this.addSignal(testSignal);
  }
}

// Export singleton instance
export const tradeSignalService = new TradeSignalService();