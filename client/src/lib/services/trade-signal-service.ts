export interface TradeSignal {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  entry: number;
  stopLoss: number;
  takeProfit: number;
  risk: number;
  source: string;
  notes?: string;
  timestamp: Date;
}

export interface TradeExecution {
  id: string;
  signalId: string;
  status: 'pending' | 'executed' | 'failed' | 'canceled';
  executedAt: Date;
  brokerId?: string;
  orderReference?: string;
  error?: string;
}

// Event types for trade signal service
type TradeSignalEvent = 'signal_added' | 'execution_created' | 'execution_updated' | 'abatev_copy' | 'abatev_execute';

class TradeSignalService {
  private signals: TradeSignal[] = [];
  private executions: TradeExecution[] = [];
  private callbacks: Map<string, Function[]> = new Map();

  constructor() {
    this.loadFromStorage();
    
    // For demo purposes, initialize with mock signals if none exist
    if (this.signals.length === 0) {
      this.initializeMockSignals();
    }
  }

  getAllSignals(): TradeSignal[] {
    return [...this.signals];
  }

  getSignalById(id: string): TradeSignal | undefined {
    return this.signals.find(signal => signal.id === id);
  }

  addSignal(signal: Omit<TradeSignal, 'id' | 'timestamp'>): TradeSignal {
    const newSignal: TradeSignal = {
      id: this.generateId(),
      ...signal,
      timestamp: new Date()
    };

    this.signals.push(newSignal);
    this.saveToStorage();
    this.triggerCallbacks('signal_added', newSignal);

    return newSignal;
  }

  executeSignal(signalId: string, brokerId?: string): TradeExecution {
    const signal = this.getSignalById(signalId);
    if (!signal) {
      throw new Error(`Signal with id ${signalId} not found`);
    }

    const execution: TradeExecution = {
      id: this.generateId(),
      signalId,
      status: 'pending',
      executedAt: new Date(),
      brokerId
    };

    this.executions.push(execution);
    this.saveToStorage();
    this.triggerCallbacks('execution_created', execution);

    // In a real implementation, we would integrate with the broker API here
    
    // For demo purposes, simulate successful execution after delay
    setTimeout(() => {
      execution.status = 'executed';
      execution.orderReference = `ORD-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      this.saveToStorage();
      this.triggerCallbacks('execution_updated', execution);
    }, 2000);

    return execution;
  }

  getExecutionsForSignal(signalId: string): TradeExecution[] {
    return this.executions.filter(execution => execution.signalId === signalId);
  }

  subscribe(event: TradeSignalEvent, callback: Function): void {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }
    this.callbacks.get(event)?.push(callback);
  }

  unsubscribe(event: TradeSignalEvent, callback: Function): void {
    if (!this.callbacks.has(event)) return;
    
    const callbacks = this.callbacks.get(event);
    if (!callbacks) return;
    
    const index = callbacks.indexOf(callback);
    if (index !== -1) {
      callbacks.splice(index, 1);
      this.callbacks.set(event, callbacks);
    }
  }

  // Signal copying for ABATEV panel
  copySignalToABATEV(signalId: string): boolean {
    const signal = this.getSignalById(signalId);
    if (!signal) return false;
    
    // Trigger ABATEV copy event with the signal ID
    this.triggerCallbacks('abatev_copy', signalId);
    
    return true;
  }

  // Signal execution via ABATEV
  executeSignalViaABATEV(signalId: string): boolean {
    const signal = this.getSignalById(signalId);
    if (!signal) return false;
    
    // Create an execution record for tracking
    const execution: TradeExecution = {
      id: this.generateId(),
      signalId,
      status: 'pending',
      executedAt: new Date(),
      brokerId: 'abatev'
    };
    
    this.executions.push(execution);
    this.saveToStorage();
    
    // Trigger ABATEV execute event with the signal ID
    this.triggerCallbacks('abatev_execute', signalId);
    
    return true;
  }

  private initializeMockSignals(): void {
    const mockSignals = [
      {
        symbol: 'BTC/USD',
        type: 'buy' as const,
        entry: 65450,
        stopLoss: 64320,
        takeProfit: 68900,
        risk: 1.5,
        source: 'AI Forecast',
        notes: 'Strong bullish divergence on 4h chart'
      },
      {
        symbol: 'ETH/USD',
        type: 'sell' as const,
        entry: 3280,
        stopLoss: 3420,
        takeProfit: 2950,
        risk: 2,
        source: 'Tech Patterns',
        notes: 'Double top formation with decreasing volume'
      },
      {
        symbol: 'EUR/USD',
        type: 'buy' as const,
        entry: 1.0952,
        stopLoss: 1.0920,
        takeProfit: 1.1050,
        risk: 1,
        source: 'Economic Calendar',
        notes: 'Potential trend continuation after US inflation data'
      }
    ];

    for (const mockSignal of mockSignals) {
        const mockSignalWithId: TradeSignal = {
          id: this.generateId(),
          ...mockSignal,
          timestamp: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24))
        };
        this.signals.push(mockSignalWithId);
    }

    this.saveToStorage();
  }

  private triggerCallbacks(event: string, data: any): void {
    const callbacks = this.callbacks.get(event);
    if (!callbacks) return;
    
    for (const callback of callbacks) {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in trade signal service ${event} callback:`, error);
      }
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('trade_signals', JSON.stringify(this.signals));
      localStorage.setItem('trade_executions', JSON.stringify(this.executions));
    } catch (error) {
      console.error('Error saving trade signals to storage:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const signalsData = localStorage.getItem('trade_signals');
      const executionsData = localStorage.getItem('trade_executions');
      
      if (signalsData) {
        this.signals = JSON.parse(signalsData).map((signal: any) => ({
          ...signal,
          timestamp: new Date(signal.timestamp)
        }));
      }
      
      if (executionsData) {
        this.executions = JSON.parse(executionsData).map((execution: any) => ({
          ...execution,
          executedAt: new Date(execution.executedAt)
        }));
      }
    } catch (error) {
      console.error('Error loading trade signals from storage:', error);
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
  }
}

export const tradeSignalService = new TradeSignalService();