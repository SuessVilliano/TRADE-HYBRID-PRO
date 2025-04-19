import { eq } from 'drizzle-orm';
import { storage } from '../storage';
import { tradeSignals } from '../../shared/schema';
import { log } from '../utils/logger';
import axios from 'axios';
import { tradingViewService } from './tradingview-service';

// Type for the multiplayer server websocket interface
import { MultiplayerServer } from '../multiplayer';

// Use the storage.db instance that's correctly configured
const db = storage.db;

/**
 * SignalUpdaterService
 * 
 * This service is responsible for periodically updating the status of active trading signals
 * by checking current prices from TradingView and determining if signals should be updated
 * (hit take profit, hit stop loss, etc.)
 */
class SignalUpdaterService {
  private updateInterval: NodeJS.Timeout | null = null;
  private readonly intervalMs: number = 3600000; // 1 hour in milliseconds
  
  /**
   * Start the signal updater service
   */
  public start(): void {
    log('Starting Signal Updater Service', 'signal-updater');
    
    // Run immediately once
    this.updateActiveSignals();
    
    // Set up hourly check
    this.updateInterval = setInterval(() => {
      this.updateActiveSignals();
    }, this.intervalMs);
    
    log(`Signal updater will run every ${this.intervalMs / 60000} minutes`, 'signal-updater');
  }
  
  /**
   * Stop the signal updater service
   */
  public stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      log('Signal Updater Service stopped', 'signal-updater');
    }
  }
  
  /**
   * Check if the service is running
   */
  public isRunning(): boolean {
    return this.updateInterval !== null;
  }
  
  /**
   * Update all active signals by checking current prices
   */
  private async updateActiveSignals(): Promise<void> {
    try {
      log('Updating active signals...', 'signal-updater');
      
      // Get all active signals
      const activeSignals = await db.select().from(tradeSignals)
        .where(eq(tradeSignals.status, 'active'));
      
      if (activeSignals.length === 0) {
        log('No active signals to update', 'signal-updater');
        return;
      }
      
      log(`Found ${activeSignals.length} active signals to check`, 'signal-updater');
      
      // Process each signal
      for (const signal of activeSignals) {
        try {
          await this.processSignal(signal);
        } catch (error) {
          log(`Error processing signal ${signal.id}: ${error}`, 'signal-updater');
        }
      }
      
      log('Finished updating active signals', 'signal-updater');
    } catch (error) {
      log(`Error updating active signals: ${error}`, 'signal-updater');
    }
  }
  
  /**
   * Process a single signal
   */
  private async processSignal(signal: any): Promise<void> {
    const { id, symbol, side, entryPrice, stopLoss, metadata } = signal;
    
    try {
      // Skip processing if signal is already closed or cancelled
      if (signal.status !== 'active') {
        return;
      }
      
      // Get current price from TradingView or another source
      const currentPrice = await this.getCurrentPrice(symbol);
      
      if (!currentPrice) {
        log(`Could not get current price for ${symbol}`, 'signal-updater');
        return;
      }
      
      log(`Signal ${id} - ${symbol} current price: ${currentPrice}`, 'signal-updater');
      
      // Extract take profit targets from signal
      // First check standard takeProfit field
      let takeProfit1 = signal.takeProfit;
      
      // Then check for additional TPs in metadata
      let takeProfit2 = null;
      let takeProfit3 = null;
      let tpCurrentTarget = 1; // Default to TP1
      
      // Check if metadata exists and has TP information
      if (metadata) {
        try {
          const metaObj = typeof metadata === 'string' 
            ? JSON.parse(metadata) 
            : metadata;
            
          // Get TP values from metadata
          takeProfit2 = metaObj.takeProfit2 || metaObj.TP2 || null;
          takeProfit3 = metaObj.takeProfit3 || metaObj.TP3 || null;
          
          // Check if any TPs have already been hit (to track current target)
          if (metaObj.tpHit) {
            tpCurrentTarget = metaObj.tpCurrentTarget || 1;
          }
        } catch (e) {
          log(`Error parsing signal metadata: ${e}`, 'signal-updater');
        }
      }
      
      // Determine if any price targets have been hit
      if (side === 'buy') {
        // For buy signals
        if (stopLoss && currentPrice <= stopLoss) {
          // Stop loss hit
          await this.updateSignalStatus(id, 'closed', currentPrice, 'stop_loss');
          log(`Buy signal ${id} (${symbol}) hit stop loss at ${currentPrice}`, 'signal-updater');
        } 
        // Check take profit targets (in order of priority)
        else if (tpCurrentTarget === 3 && takeProfit3 && currentPrice >= parseFloat(takeProfit3)) {
          // TP3 hit (final target)
          await this.updateSignalStatus(id, 'closed', currentPrice, 'take_profit_3');
          log(`Buy signal ${id} (${symbol}) hit TP3 at ${currentPrice}`, 'signal-updater');
        }
        else if (tpCurrentTarget === 2 && takeProfit2 && currentPrice >= parseFloat(takeProfit2)) {
          // TP2 hit
          if (takeProfit3) {
            // If TP3 exists, update status to indicate TP2 hit, but keep signal active
            await this.updateTpStatus(id, currentPrice, 2, 3);
            log(`Buy signal ${id} (${symbol}) hit TP2 at ${currentPrice}, moving to TP3`, 'signal-updater');
          } else {
            // If no TP3, close the signal
            await this.updateSignalStatus(id, 'closed', currentPrice, 'take_profit_2');
            log(`Buy signal ${id} (${symbol}) hit final TP2 at ${currentPrice}`, 'signal-updater');
          }
        }
        else if (tpCurrentTarget === 1 && takeProfit1 && currentPrice >= parseFloat(takeProfit1)) {
          // TP1 hit
          if (takeProfit2) {
            // If TP2 exists, update status to indicate TP1 hit, but keep signal active
            await this.updateTpStatus(id, currentPrice, 1, 2);
            log(`Buy signal ${id} (${symbol}) hit TP1 at ${currentPrice}, moving to TP2`, 'signal-updater');
          } else {
            // If no TP2, close the signal
            await this.updateSignalStatus(id, 'closed', currentPrice, 'take_profit_1');
            log(`Buy signal ${id} (${symbol}) hit final TP1 at ${currentPrice}`, 'signal-updater');
          }
        }
      } else if (side === 'sell') {
        // For sell signals
        if (stopLoss && currentPrice >= stopLoss) {
          // Stop loss hit
          await this.updateSignalStatus(id, 'closed', currentPrice, 'stop_loss');
          log(`Sell signal ${id} (${symbol}) hit stop loss at ${currentPrice}`, 'signal-updater');
        } 
        // Check take profit targets (in order of priority)
        else if (tpCurrentTarget === 3 && takeProfit3 && currentPrice <= parseFloat(takeProfit3)) {
          // TP3 hit (final target)
          await this.updateSignalStatus(id, 'closed', currentPrice, 'take_profit_3');
          log(`Sell signal ${id} (${symbol}) hit TP3 at ${currentPrice}`, 'signal-updater');
        }
        else if (tpCurrentTarget === 2 && takeProfit2 && currentPrice <= parseFloat(takeProfit2)) {
          // TP2 hit
          if (takeProfit3) {
            // If TP3 exists, update status to indicate TP2 hit, but keep signal active
            await this.updateTpStatus(id, currentPrice, 2, 3);
            log(`Sell signal ${id} (${symbol}) hit TP2 at ${currentPrice}, moving to TP3`, 'signal-updater');
          } else {
            // If no TP3, close the signal
            await this.updateSignalStatus(id, 'closed', currentPrice, 'take_profit_2');
            log(`Sell signal ${id} (${symbol}) hit final TP2 at ${currentPrice}`, 'signal-updater');
          }
        }
        else if (tpCurrentTarget === 1 && takeProfit1 && currentPrice <= parseFloat(takeProfit1)) {
          // TP1 hit
          if (takeProfit2) {
            // If TP2 exists, update status to indicate TP1 hit, but keep signal active
            await this.updateTpStatus(id, currentPrice, 1, 2);
            log(`Sell signal ${id} (${symbol}) hit TP1 at ${currentPrice}, moving to TP2`, 'signal-updater');
          } else {
            // If no TP2, close the signal
            await this.updateSignalStatus(id, 'closed', currentPrice, 'take_profit_1');
            log(`Sell signal ${id} (${symbol}) hit final TP1 at ${currentPrice}`, 'signal-updater');
          }
        }
      }
    } catch (error) {
      log(`Error processing signal ${id}: ${error}`, 'signal-updater');
    }
  }
  
  /**
   * Update a signal's take profit status (for multi-target signals)
   * This keeps the signal active but updates metadata to reflect TP status
   */
  private async updateTpStatus(
    id: string,
    hitPrice: number,
    currentTpHit: number,
    nextTpTarget: number
  ): Promise<void> {
    try {
      // Get current signal
      const signalResult = await db.select().from(tradeSignals).where(eq(tradeSignals.id, id)).limit(1);
      
      if (!signalResult || signalResult.length === 0) {
        log(`Signal ${id} not found`, 'signal-updater');
        return;
      }
      
      const signal = signalResult[0];
      
      // Parse existing metadata
      let metadataObj = signal.metadata 
        ? (typeof signal.metadata === 'string' ? JSON.parse(signal.metadata) : signal.metadata)
        : {};
        
      // Update metadata with TP information
      metadataObj = {
        ...metadataObj,
        tpHit: true,
        tpCurrentTarget: nextTpTarget,
        [`tp${currentTpHit}HitPrice`]: hitPrice,
        [`tp${currentTpHit}HitTime`]: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
      
      // Update the signal in the database
      await db.update(tradeSignals)
        .set({
          metadata: metadataObj,
          updatedAt: new Date()
        })
        .where(eq(tradeSignals.id, id));
      
      log(`Updated signal ${id} TP status: TP${currentTpHit} hit at ${hitPrice}, now targeting TP${nextTpTarget}`, 'signal-updater');
      
      // TODO: Broadcast the partial TP hit via WebSocket if needed
    } catch (error) {
      log(`Error updating TP status for signal ${id}: ${error}`, 'signal-updater');
    }
  }
  
  /**
   * Update a signal's status in the database
   */
  private async updateSignalStatus(
    id: string, 
    status: 'active' | 'closed' | 'cancelled', 
    closePrice: number,
    closeReason: string
  ): Promise<void> {
    try {
      // Calculate PnL if possible
      const signal = await db.select().from(tradeSignals).where(eq(tradeSignals.id, id)).limit(1);
      
      if (!signal || signal.length === 0) {
        log(`Signal ${id} not found`, 'signal-updater');
        return;
      }
      
      const signalData = signal[0];
      let pnl = 0;
      
      if (signalData.entryPrice && closePrice) {
        if (signalData.side === 'buy') {
          // For buy signals, profit = (close - entry) / entry
          pnl = (closePrice - signalData.entryPrice) / signalData.entryPrice * 100;
        } else {
          // For sell signals, profit = (entry - close) / entry
          pnl = (signalData.entryPrice - closePrice) / signalData.entryPrice * 100;
        }
      }
      
      // Update the signal in the database
      await db.update(tradeSignals)
        .set({
          status,
          closePrice,
          pnl,
          closedAt: new Date(),
          metadata: signalData.metadata 
            ? { 
                ...JSON.parse(JSON.stringify(signalData.metadata)),
                closeReason,
                closedBy: 'signal_updater'
              }
            : { 
                closeReason,
                closedBy: 'signal_updater'
              },
          updatedAt: new Date()
        })
        .where(eq(tradeSignals.id, id));
      
      log(`Updated signal ${id} status to ${status} with close price ${closePrice}`, 'signal-updater');
      
      // TODO: Broadcast the update to connected clients via WebSocket if needed
    } catch (error) {
      log(`Error updating signal status: ${error}`, 'signal-updater');
      throw error;
    }
  }
  
  /**
   * Get current price for a symbol from TradingView
   * 
   * This method tries to get the current price from the TradingView service.
   * If the TradingView service is not available or fails, it falls back to other
   * methods to get a price.
   */
  private async getCurrentPrice(symbol: string): Promise<number | null> {
    try {
      // First, try to get price from the TradingView service
      if (tradingViewService.hasApiKey()) {
        // Determine exchange based on symbol (crude mapping)
        let exchange: string | undefined;
        
        if (symbol.endsWith('USDT') || symbol.endsWith('BTC') || symbol.endsWith('ETH')) {
          exchange = 'BINANCE';
        } else if (symbol.includes('/') || symbol === 'EURUSD' || symbol === 'GBPUSD') {
          exchange = 'OANDA';
        } else if (symbol === 'ES' || symbol === 'NQ' || symbol === 'CL') {
          exchange = 'CME';
        }
        
        // Try to get price from TradingView service
        const price = await tradingViewService.getCurrentPrice(symbol, exchange);
        
        if (price !== null) {
          log(`Got price for ${symbol} from TradingView: ${price}`, 'signal-updater');
          return price;
        }
      }
      
      // If TradingView service failed or not available, try alternative methods
      
      // Try exchange API for crypto (if crypto symbol)
      if (symbol.endsWith('USDT') || symbol.endsWith('BTC') || symbol.endsWith('ETH')) {
        try {
          // Try Binance API for crypto prices
          const formattedSymbol = symbol.replace('/', '');
          const response = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${formattedSymbol}`);
          
          if (response.data && response.data.price) {
            const price = parseFloat(response.data.price);
            log(`Got price for ${symbol} from Binance: ${price}`, 'signal-updater');
            return price;
          }
        } catch (exchangeError) {
          log(`Failed to get price from Binance for ${symbol}: ${exchangeError}`, 'signal-updater');
        }
      }
      
      // Final fallback - use simulation
      log('Using simulated price checker as fallback', 'signal-updater');
      const { price } = tradingViewService.simulateTradingViewCheck(symbol);
      log(`Got simulated price for ${symbol}: ${price}`, 'signal-updater');
      return price;
    } catch (error) {
      log(`Error getting price for ${symbol}: ${error}`, 'signal-updater');
      return null;
    }
  }
}

// Create a singleton instance
export const signalUpdaterService = new SignalUpdaterService();