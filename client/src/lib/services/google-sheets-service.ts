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
  // The spreadsheet IDs used for signals (from environment)
  private readonly PARADOX_SHEET_ID = '1jWQKlzry3PJ1ECJO_SbNczpRjfpvi4sMEaYu_pN6Jg8';
  private readonly SOLARIS_SHEET_ID = '1jWQKlzry3PJ1ECJO_SbNczpRjfpvi4sMEaYu_pN6Jg8';
  private readonly HYBRID_SHEET_ID = '1jWQKlzry3PJ1ECJO_SbNczpRjfpvi4sMEaYu_pN6Jg8';
  
  // URLs for different types of signals
  private readonly CRYPTO_SIGNALS_URL = `https://docs.google.com/spreadsheets/d/${this.PARADOX_SHEET_ID}/gviz/tq?tqx=out:json&gid=0`; // Paradox
  private readonly FUTURES_SIGNALS_URL = `https://docs.google.com/spreadsheets/d/${this.HYBRID_SHEET_ID}/gviz/tq?tqx=out:json&gid=128714687`; // Hybrid AI
  private readonly FOREX_SIGNALS_URL = `https://docs.google.com/spreadsheets/d/${this.SOLARIS_SHEET_ID}/gviz/tq?tqx=out:json&gid=1470834705`; // Solaris

  // Fetch crypto signals (Paradox AI)
  async fetchCryptoSignals(): Promise<TradeSignal[]> {
    try {
      // First try to fetch signals from our backend API
      try {
        const response = await axios.get('/api/sheets/trading-signals', {
          params: {
            marketType: 'crypto',
            gid: 0
          }
        });
        
        console.log('Server response for crypto signals:', 
                   response.data ? 'Data received' : 'Empty response');
        
        if (response.data && response.data.signals && response.data.signals.length > 0) {
          // Transform the signals to our format
          return this.transformSignalsToTradeSignals(response.data.signals, 'crypto', 'Paradox');
        }
        
        // If no signals from API, fallback to direct fetch
        console.log('No crypto signals from API, falling back to direct fetch');
      } catch (apiError) {
        console.error('API fetch error for crypto signals, falling back to direct fetch:', apiError);
      }
      
      // Fallback to direct fetch
      return await this.fetchSignalsFromSheet(this.CRYPTO_SIGNALS_URL, 'crypto', 'Paradox');
    } catch (error) {
      console.error('Error fetching crypto signals:', error);
      return [];
    }
  }

  // Fetch futures signals (Hybrid AI)
  async fetchFuturesSignals(): Promise<TradeSignal[]> {
    try {
      // First try to fetch signals from our backend API
      try {
        const response = await axios.get('/api/sheets/trading-signals', {
          params: {
            marketType: 'futures',
            gid: 1
          }
        });
        
        console.log('Server response for futures signals:', 
                   response.data ? 'Data received' : 'Empty response');
        
        if (response.data && response.data.signals && response.data.signals.length > 0) {
          // Transform the signals to our format
          return this.transformSignalsToTradeSignals(response.data.signals, 'futures', 'Hybrid');
        }
        
        // If no signals from API, fallback to direct fetch
        console.log('No futures signals from API, falling back to direct fetch');
      } catch (apiError) {
        console.error('API fetch error for futures signals, falling back to direct fetch:', apiError);
      }
      
      // Fallback to direct fetch
      return await this.fetchSignalsFromSheet(this.FUTURES_SIGNALS_URL, 'futures', 'Hybrid');
    } catch (error) {
      console.error('Error fetching futures signals:', error);
      return [];
    }
  }

  // Fetch forex signals (Solaris AI)
  async fetchForexSignals(): Promise<TradeSignal[]> {
    try {
      // First try to fetch signals from our backend API
      try {
        const response = await axios.get('/api/sheets/trading-signals', {
          params: {
            marketType: 'forex',
            gid: 2
          }
        });
        
        console.log('Server response for forex signals:', 
                   response.data ? 'Data received' : 'Empty response');
        
        if (response.data && response.data.signals && response.data.signals.length > 0) {
          // Transform the signals to our format
          return this.transformSignalsToTradeSignals(response.data.signals, 'forex', 'Solaris');
        }
        
        // If no signals from API, fallback to direct fetch
        console.log('No forex signals from API, falling back to direct fetch');
      } catch (apiError) {
        console.error('API fetch error for forex signals, falling back to direct fetch:', apiError);
      }
      
      // Fallback to direct fetch
      return await this.fetchSignalsFromSheet(this.FOREX_SIGNALS_URL, 'forex', 'Solaris');
    } catch (error) {
      console.error('Error fetching forex signals:', error);
      return [];
    }
  }
  
  // Transform signals from API to TradeSignal format
  private transformSignalsToTradeSignals(
    signals: Record<string, any>[], 
    marketType: 'crypto' | 'forex' | 'futures',
    provider: 'Paradox' | 'Hybrid' | 'Solaris'
  ): TradeSignal[] {
    return signals.map((signal, index) => {
      try {
        // Attempt to extract important fields
        const asset = signal.Symbol || signal.Asset || signal.Pair || 'Unknown';
        
        // Parse direction
        const directionStr = signal.Direction || signal.Side || signal.Type || '';
        const direction = this.parseDirection(directionStr);
        
        // Parse prices
        const entryPrice = this.parseNumber(signal['Entry Price'] || signal.Entry || signal.Price || 0);
        const stopLoss = this.parseNumber(signal['Stop Loss'] || signal.SL || signal.Stop || 0);
        const takeProfit1 = this.parseNumber(signal['Take Profit'] || signal.TP || signal.TP1 || signal.Target || 0);
        const takeProfit2 = this.parseNumber(signal.TP2 || signal['Take Profit 2'] || signal['Target 2'] || 0);
        const takeProfit3 = this.parseNumber(signal.TP3 || signal['Take Profit 3'] || signal['Target 3'] || 0);
        
        // Parse status
        const statusStr = signal.Status || signal.Result || '';
        const status = this.parseStatus(statusStr);
        
        // Parse timestamps
        const timestamp = signal.Timestamp || signal.Date || signal.Time || new Date().toISOString();
        
        // Only include valid signals
        if (asset !== 'Unknown' && entryPrice > 0) {
          const tradeSignal: TradeSignal = {
            id: `${provider}-${index}-${Date.now()}`,
            timestamp: typeof timestamp === 'string' ? timestamp : new Date().toISOString(),
            asset,
            direction,
            entryPrice,
            stopLoss,
            takeProfit1,
            takeProfit2,
            takeProfit3,
            status,
            marketType,
            provider,
            pnl: this.parseNumber(signal['P&L'] || signal.PnL || signal.Profit || 0),
            pnlPercentage: this.parseNumber(signal['P&L %'] || signal.ROI || signal.Return || 0),
            notes: signal.Notes || signal.Comments || '',
            accuracy: provider === 'Paradox' ? 0.89 : provider === 'Hybrid' ? 0.92 : 0.85,
          };
          
          // Generate AI analysis
          tradeSignal.aiAnalysis = this.generateAIAnalysis(tradeSignal);
          
          return tradeSignal;
        }
      } catch (error) {
        console.error(`Error transforming signal at index ${index}:`, error);
      }
      
      // Return a null value for invalid signals to be filtered out
      return null as unknown as TradeSignal;
    }).filter(signal => signal !== null); // Filter out null signals
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
    try {
      console.log(`Fetching signals from ${url}`);
      
      // Add cache-busting parameter to prevent caching issues
      const urlWithCacheBuster = `${url}&timestamp=${new Date().getTime()}`;
      
      const response = await axios.get(urlWithCacheBuster, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      // Check if we got a valid response
      if (!response || !response.data) {
        console.error('Empty response from Google Sheets API');
        return [];
      }
      
      // Log the response for debugging
      console.log('Google Sheets response received:', 
                 response.data.length > 100 ? response.data.substring(0, 100) + '...' : response.data);
      
      // Extract JSON data from Google's JSONP-like response
      // Try different substring approaches to handle Google's response format
      let jsonData;
      try {
        // Standard format (most common)
        if (response.data.indexOf('/*O_o*/') > -1) {
          const start = response.data.indexOf('(');
          const end = response.data.lastIndexOf(')');
          const jsonpData = response.data.substring(start + 1, end);
          jsonData = JSON.parse(jsonpData);
        } else if (response.data.startsWith('google.visualization.Query.setResponse(')) {
          // Format with google.visualization prefix
          const jsonpData = response.data.substring(41, response.data.length - 2);
          jsonData = JSON.parse(jsonpData);
        } else {
          // Try the previous approach
          jsonData = JSON.parse(response.data.substring(47).slice(0, -2));
        }
      } catch (e) {
        console.error('Error parsing JSON from Google Sheets response:', e);
        console.log('Raw response:', response.data);
        
        // Try a more general approach
        try {
          const startIdx = response.data.indexOf('{');
          const endIdx = response.data.lastIndexOf('}') + 1;
          if (startIdx >= 0 && endIdx > startIdx) {
            const jsonText = response.data.substring(startIdx, endIdx);
            jsonData = JSON.parse(jsonText);
          } else {
            throw new Error('Could not find valid JSON in response');
          }
        } catch (e2) {
          console.error('Second attempt to parse JSON failed:', e2);
          return [];
        }
      }
      
      // Check if we have the expected format
      if (!jsonData || !jsonData.table || !jsonData.table.cols || !jsonData.table.rows) {
        console.error('Unexpected response format from Google Sheets', jsonData);
        return [];
      }
      
      // Extract column headers
      const headers = jsonData.table.cols.map((col: any) => col.label || col.id || '');
      console.log('Column headers:', headers);
      
      // Iterate through rows to build signals
      const signals: TradeSignal[] = [];
      
      for (let i = 0; i < jsonData.table.rows.length; i++) {
        const row = jsonData.table.rows[i];
        if (!row.c) continue; // Skip rows without cells
        
        // Create an array of cell values
        const values = row.c.map((cell: any) => {
          if (cell === null) return null;
          return cell.v !== undefined ? cell.v : null;
        });
        
        // Skip empty rows
        if (values.every((v: any) => v === null)) continue;
        
        // Create an object matching column headers to values
        const rowData: Record<string, any> = {};
        headers.forEach((header: string, idx: number) => {
          if (header && idx < values.length) {
            rowData[header] = values[idx];
          }
        });
        
        console.log(`Processing row ${i}:`, rowData);
        
        // Create a signal with more lenient field matching
        try {
          // Match up common field names - search for keys case-insensitively
          const findField = (possibleNames: string[]): string | null => {
            for (const name of possibleNames) {
              // Exact match
              if (rowData[name] !== undefined) return rowData[name];
              
              // Case-insensitive match
              const key = Object.keys(rowData).find(k => k.toLowerCase() === name.toLowerCase());
              if (key) return rowData[key];
            }
            return null;
          };
          
          const timestamp = findField(['Timestamp', 'Date', 'Time', 'Created']) || new Date().toISOString();
          const asset = findField(['Symbol', 'Asset', 'Pair', 'Instrument', 'Ticker']) || 'Unknown';
          const direction = this.parseDirection(findField(['Direction', 'Side', 'Position', 'Type', 'Action']) || '');
          const entryPrice = this.parseNumber(findField(['Entry Price', 'Entry', 'Open Price', 'Price']));
          const stopLoss = this.parseNumber(findField(['Stop Loss', 'SL', 'Stop']));
          const takeProfit1 = this.parseNumber(findField(['Take Profit', 'TP', 'TP1', 'Target', 'Target 1']));
          const takeProfit2 = this.parseNumber(findField(['TP2', 'Target 2', 'Take Profit 2']));
          const takeProfit3 = this.parseNumber(findField(['TP3', 'Target 3', 'Take Profit 3']));
          const status = this.parseStatus(findField(['Status', 'Result', 'State']) || '');
          const notes = findField(['Notes', 'Comments', 'Description', 'Info']) || '';
          
          // Only add valid signals
          if (asset && asset !== 'Unknown' && entryPrice > 0) {
            const signal: TradeSignal = {
              id: `${provider}-${i}-${Date.now()}`,
              timestamp: typeof timestamp === 'string' ? timestamp : new Date().toISOString(),
              asset,
              direction,
              entryPrice,
              stopLoss,
              takeProfit1,
              takeProfit2,
              takeProfit3,
              status,
              marketType,
              provider,
              pnl: this.parseNumber(findField(['P&L', 'Profit/Loss', 'PnL', 'Profit'])),
              pnlPercentage: this.parseNumber(findField(['P&L %', 'ROI', 'Return', 'PnL %'])),
              notes,
              accuracy: provider === 'Paradox' ? 0.89 : provider === 'Hybrid' ? 0.92 : 0.85,
            };
            
            // Generate AI analysis based on the signal
            signal.aiAnalysis = this.generateAIAnalysis(signal);
            
            signals.push(signal);
          }
        } catch (e) {
          console.error(`Error processing row ${i}:`, e);
          // Continue with next row rather than failing the entire fetch
        }
      }
      
      console.log(`Successfully processed ${signals.length} signals`);
      return signals;
    } catch (error) {
      console.error('Error in fetchSignalsFromSheet:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message, error.stack);
      }
      return [];
    }
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