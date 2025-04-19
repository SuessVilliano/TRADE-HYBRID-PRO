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
    // Add some mock data for development
    this.initializeMockData();
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
}

// Export singleton instance
export const tradeSignalService = new TradeSignalService();