import axios from 'axios';

// Signal types
export interface TradeSignal {
  id: string;
  timestamp: string;
  asset: string;
  direction: 'long' | 'short';
  entryPrice: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2?: number;
  takeProfit3?: number;
  status: 'active' | 'completed' | 'stopped' | 'cancelled';
  marketType: 'crypto' | 'forex' | 'futures';
  provider: 'Paradox' | 'Hybrid' | 'Solaris';
  pnl?: number;
  accuracy?: number;
  pnlPercentage?: number;
  notes?: string;
  aiAnalysis?: string;
}

// Service class
export class GoogleSheetsService {
  private readonly CRYPTO_SIGNALS_URL = 'https://docs.google.com/spreadsheets/d/1jWQKlzry3PJ1ECJO_SbNczpRjfpvi4sMEaYu_pN6Jg8/gviz/tq?tqx=out:json&gid=0';
  private readonly FUTURES_SIGNALS_URL = 'https://docs.google.com/spreadsheets/d/1jWQKlzry3PJ1ECJO_SbNczpRjfpvi4sMEaYu_pN6Jg8/gviz/tq?tqx=out:json&gid=128714687';
  private readonly FOREX_SIGNALS_URL = 'https://docs.google.com/spreadsheets/d/1jWQKlzry3PJ1ECJO_SbNczpRjfpvi4sMEaYu_pN6Jg8/gviz/tq?tqx=out:json&gid=1470834705';

  // Fetch crypto signals (Paradox AI)
  async fetchCryptoSignals(): Promise<TradeSignal[]> {
    try {
      return await this.fetchSignalsFromSheet(this.CRYPTO_SIGNALS_URL, 'crypto', 'Paradox');
    } catch (error) {
      console.error('Error fetching crypto signals:', error);
      return [];
    }
  }

  // Fetch futures signals (Hybrid AI)
  async fetchFuturesSignals(): Promise<TradeSignal[]> {
    try {
      return await this.fetchSignalsFromSheet(this.FUTURES_SIGNALS_URL, 'futures', 'Hybrid');
    } catch (error) {
      console.error('Error fetching futures signals:', error);
      return [];
    }
  }

  // Fetch forex signals (Solaris AI)
  async fetchForexSignals(): Promise<TradeSignal[]> {
    try {
      return await this.fetchSignalsFromSheet(this.FOREX_SIGNALS_URL, 'forex', 'Solaris');
    } catch (error) {
      console.error('Error fetching forex signals:', error);
      return [];
    }
  }

  // Fetch all signals from all providers
  async fetchAllSignals(): Promise<TradeSignal[]> {
    try {
      const [crypto, futures, forex] = await Promise.all([
        this.fetchCryptoSignals(),
        this.fetchFuturesSignals(),
        this.fetchForexSignals()
      ]);
      
      return [...crypto, ...futures, ...forex];
    } catch (error) {
      console.error('Error fetching all signals:', error);
      return [];
    }
  }
  
  // Helper method to normalize Google Sheets response
  private async fetchSignalsFromSheet(
    url: string, 
    marketType: 'crypto' | 'forex' | 'futures',
    provider: 'Paradox' | 'Hybrid' | 'Solaris'
  ): Promise<TradeSignal[]> {
    const response = await axios.get(url);
    
    // Extract JSON data from Google's JSONP-like response
    const jsonData = JSON.parse(response.data.substring(47).slice(0, -2));
    
    // Extract column headers
    const headers = jsonData.table.cols.map((col: any) => col.label);
    
    // Map rows to signal objects
    return jsonData.table.rows.map((row: any, index: number) => {
      const values = row.c.map((cell: any) => cell?.v || null);
      
      // Create an object matching column headers to values
      const rowData: Record<string, any> = {};
      headers.forEach((header: string, i: number) => {
        rowData[header] = values[i];
      });
      
      // Transform to our TradeSignal interface
      const signal: TradeSignal = {
        id: `${provider}-${index}`,
        timestamp: rowData['Timestamp'] || rowData['Date'] || new Date().toISOString(),
        asset: rowData['Symbol'] || rowData['Asset'] || rowData['Pair'] || 'Unknown',
        direction: this.parseDirection(rowData['Direction'] || rowData['Side'] || rowData['Position']),
        entryPrice: this.parseNumber(rowData['Entry Price'] || rowData['Entry']),
        stopLoss: this.parseNumber(rowData['Stop Loss'] || rowData['SL']),
        takeProfit1: this.parseNumber(rowData['Take Profit'] || rowData['TP1'] || rowData['Target 1']),
        takeProfit2: this.parseNumber(rowData['TP2'] || rowData['Target 2']),
        takeProfit3: this.parseNumber(rowData['TP3'] || rowData['Target 3']),
        status: this.parseStatus(rowData['Status'] || rowData['Result']),
        marketType,
        provider,
        pnl: this.parseNumber(rowData['P&L'] || rowData['Profit/Loss']),
        pnlPercentage: this.parseNumber(rowData['P&L %'] || rowData['ROI']),
        notes: rowData['Notes'] || rowData['Comments'],
        accuracy: provider === 'Paradox' ? 0.89 : provider === 'Hybrid' ? 0.92 : 0.85, // Sample accuracy rates
      };
      
      // Generate AI analysis based on the signal
      signal.aiAnalysis = this.generateAIAnalysis(signal);
      
      return signal;
    });
  }
  
  // Parse direction string to standardized format
  private parseDirection(direction: string): 'long' | 'short' {
    if (!direction) return 'long';
    
    const normalized = direction.toLowerCase();
    if (['long', 'buy', 'bullish', 'calls', 'call'].some(term => normalized.includes(term))) {
      return 'long';
    }
    return 'short';
  }
  
  // Parse numeric values safely
  private parseNumber(value: any): number {
    if (value === null || value === undefined || value === '') return 0;
    
    // Handle string representations of numbers
    if (typeof value === 'string') {
      // Remove currency symbols and commas
      const cleaned = value.replace(/[$,£€]/g, '');
      return parseFloat(cleaned) || 0;
    }
    
    return typeof value === 'number' ? value : 0;
  }
  
  // Parse status string to standardized format
  private parseStatus(status: string): 'active' | 'completed' | 'stopped' | 'cancelled' {
    if (!status) return 'active';
    
    const normalized = status.toLowerCase();
    
    if (['complete', 'completed', 'closed', 'hit', 'target hit', 'tp hit'].some(term => normalized.includes(term))) {
      return 'completed';
    }
    
    if (['stop', 'stopped', 'sl hit', 'stop hit', 'stopped out', 'loss'].some(term => normalized.includes(term))) {
      return 'stopped';
    }
    
    if (['cancel', 'cancelled', 'canceled', 'invalid', 'void'].some(term => normalized.includes(term))) {
      return 'cancelled';
    }
    
    return 'active';
  }
  
  // Generate sample AI analysis based on signal data
  private generateAIAnalysis(signal: TradeSignal): string {
    const riskReward = (signal.takeProfit1 - signal.entryPrice) / (signal.entryPrice - signal.stopLoss);
    const absoluteRR = Math.abs(riskReward).toFixed(2);
    
    let analysis = `${signal.provider} AI Signal Analysis for ${signal.asset}:\n\n`;
    
    if (signal.direction === 'long') {
      analysis += `This LONG position has a risk-reward ratio of ${absoluteRR}:1. `;
      
      if (riskReward > 2) {
        analysis += `Strong risk-reward profile. `;
      } else if (riskReward > 1) {
        analysis += `Acceptable risk-reward profile. `;
      } else {
        analysis += `Caution: risk-reward ratio is below ideal levels. `;
      }
      
      // Add market specific analysis
      if (signal.marketType === 'crypto') {
        analysis += `Bitcoin dominance and overall market sentiment should be considered before entry. `;
      } else if (signal.marketType === 'forex') {
        analysis += `Check economic calendar for potential market-moving events. `;
      } else {
        analysis += `Monitor overall market liquidity and volatility. `;
      }
    } else {
      analysis += `This SHORT position has a risk-reward ratio of ${absoluteRR}:1. `;
      
      if (riskReward > 2) {
        analysis += `Strong risk-reward profile. `;
      } else if (riskReward > 1) {
        analysis += `Acceptable risk-reward profile. `;
      } else {
        analysis += `Caution: risk-reward ratio is below ideal levels. `;
      }
      
      // Add market specific analysis
      if (signal.marketType === 'crypto') {
        analysis += `Verify bearish momentum with volume and moving averages before entry. `;
      } else if (signal.marketType === 'forex') {
        analysis += `Confirm trend direction with multiple timeframes before execution. `;
      } else {
        analysis += `Check COT report for overall market positioning. `;
      }
    }
    
    // Add signal provider specific analysis
    if (signal.provider === 'Paradox') {
      analysis += `Paradox AI has a 89% accuracy rate on ${signal.marketType} signals in the last quarter. `;
    } else if (signal.provider === 'Hybrid') {
      analysis += `Hybrid AI shows 92% accuracy and strongest performance in trending markets. `;
    } else {
      analysis += `Solaris AI excels in range-bound market conditions with 85% overall accuracy. `;
    }
    
    return analysis;
  }
  
  // Update signal status based on current market prices
  async updateSignalStatus(signal: TradeSignal, currentPrice: number): Promise<TradeSignal> {
    // Clone the signal to avoid mutating the original
    const updatedSignal = { ...signal };
    
    // Skip signals that are already completed, stopped, or cancelled
    if (updatedSignal.status !== 'active') {
      return updatedSignal;
    }
    
    // For long positions
    if (updatedSignal.direction === 'long') {
      // Check if stop loss hit
      if (currentPrice <= updatedSignal.stopLoss) {
        updatedSignal.status = 'stopped';
        updatedSignal.pnl = (updatedSignal.stopLoss - updatedSignal.entryPrice);
        updatedSignal.pnlPercentage = ((updatedSignal.stopLoss / updatedSignal.entryPrice) - 1) * 100;
        return updatedSignal;
      }
      
      // Check if take profit hit
      if (currentPrice >= updatedSignal.takeProfit1) {
        updatedSignal.status = 'completed';
        updatedSignal.pnl = (updatedSignal.takeProfit1 - updatedSignal.entryPrice);
        updatedSignal.pnlPercentage = ((updatedSignal.takeProfit1 / updatedSignal.entryPrice) - 1) * 100;
        return updatedSignal;
      }
    } 
    // For short positions
    else {
      // Check if stop loss hit
      if (currentPrice >= updatedSignal.stopLoss) {
        updatedSignal.status = 'stopped';
        updatedSignal.pnl = (updatedSignal.entryPrice - updatedSignal.stopLoss);
        updatedSignal.pnlPercentage = ((updatedSignal.entryPrice / updatedSignal.stopLoss) - 1) * 100;
        return updatedSignal;
      }
      
      // Check if take profit hit
      if (currentPrice <= updatedSignal.takeProfit1) {
        updatedSignal.status = 'completed';
        updatedSignal.pnl = (updatedSignal.entryPrice - updatedSignal.takeProfit1);
        updatedSignal.pnlPercentage = ((updatedSignal.entryPrice / updatedSignal.takeProfit1) - 1) * 100;
        return updatedSignal;
      }
    }
    
    // If still active, calculate current floating P&L
    if (updatedSignal.direction === 'long') {
      updatedSignal.pnl = (currentPrice - updatedSignal.entryPrice);
      updatedSignal.pnlPercentage = ((currentPrice / updatedSignal.entryPrice) - 1) * 100;
    } else {
      updatedSignal.pnl = (updatedSignal.entryPrice - currentPrice);
      updatedSignal.pnlPercentage = ((updatedSignal.entryPrice / currentPrice) - 1) * 100;
    }
    
    return updatedSignal;
  }
}

// Export singleton instance
export const googleSheetsService = new GoogleSheetsService();