import axios from 'axios';
import { TradeSignal } from './google-sheets-service';

// Define a standardized webhook signal interface that maps to TradeSignal format
export interface WebhookSignal {
  id: string;
  Symbol?: string;
  Asset?: string;
  Direction?: string;
  'Entry Price'?: number;
  'Stop Loss'?: number;
  'Take Profit'?: number;
  TP1?: number;
  TP2?: number;
  TP3?: number;
  Status?: string;
  Date?: string;
  Time?: string;
  Provider?: string;
  Notes?: string;
  [key: string]: any; // Allow for additional fields
}

// Types for historical data
interface HistoricalDataPoint {
  timestamp: string;
  open: number;
  high: number;
  close: number;
  low: number;
  volume: number;
}

// Trade analysis result
export interface TradeAnalysisResult {
  signalId: string;
  asset: string;
  entryPrice: number;
  entryTime: string;
  direction: 'long' | 'short';
  stopLoss: number;
  takeProfit1: number;
  takeProfit2?: number;
  takeProfit3?: number;
  outcome: 'Active' | 'SL Hit' | 'TP1 Hit' | 'TP2 Hit' | 'TP3 Hit' | 'Expired' | 'No Data';
  hitTime?: string;
  pnl?: number;
  pnlPercentage?: number;
}

// Upload result
export interface UploadResult {
  success: boolean;
  message: string;
  filename?: string;
}

// Class for signal analyzer
export class SignalsAnalyzerService {
  // Base URL for API calls
  private readonly API_BASE_URL = '/api/signals-analyzer';
  
  // Storage for historical data
  private historicalDataCache: Map<string, HistoricalDataPoint[]> = new Map();
  
  // Upload historical price data
  async uploadHistoricalData(file: File, asset: string): Promise<UploadResult> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('asset', asset);
      
      const response = await axios.post(`${this.API_BASE_URL}/upload-historical`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error uploading historical data:', error);
      return {
        success: false,
        message: 'Failed to upload historical data. Please try again.'
      };
    }
  }
  
  // Get available historical data assets
  async getAvailableHistoricalData(): Promise<string[]> {
    try {
      const response = await axios.get(`${this.API_BASE_URL}/available-historical-data`);
      return response.data.assets || [];
    } catch (error) {
      console.error('Error fetching available historical data:', error);
      return [];
    }
  }
  
  // Get historical data for a specific asset
  async getHistoricalData(asset: string, startDate?: string, endDate?: string): Promise<HistoricalDataPoint[]> {
    try {
      // Check if we have this data cached
      const cacheKey = `${asset}_${startDate || ''}_${endDate || ''}`;
      if (this.historicalDataCache.has(cacheKey)) {
        return this.historicalDataCache.get(cacheKey) as HistoricalDataPoint[];
      }
      
      // If not cached, fetch from API
      const params: Record<string, string> = { asset };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const response = await axios.get(`${this.API_BASE_URL}/historical-data`, { params });
      
      // Cache the result for future use
      this.historicalDataCache.set(cacheKey, response.data);
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching historical data for ${asset}:`, error);
      return [];
    }
  }
  
  // Analyze signals with historical data
  async analyzeSignals(
    signals: TradeSignal[], 
    asset: string, 
    startDate?: string, 
    endDate?: string
  ): Promise<TradeAnalysisResult[]> {
    try {
      // Get historical data for analysis
      const historicalData = await this.getHistoricalData(asset, startDate, endDate);
      
      if (!historicalData || historicalData.length === 0) {
        console.error(`No historical data available for ${asset}`);
        return signals.map(signal => ({
          signalId: signal.id,
          asset: signal.asset,
          entryPrice: signal.entryPrice,
          entryTime: signal.timestamp,
          direction: signal.direction,
          stopLoss: signal.stopLoss,
          takeProfit1: signal.takeProfit1,
          takeProfit2: signal.takeProfit2,
          takeProfit3: signal.takeProfit3,
          outcome: 'No Data'
        }));
      }
      
      // Sort historical data by timestamp
      historicalData.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      
      // Analyze each signal
      const results: TradeAnalysisResult[] = [];
      
      for (const signal of signals) {
        // Skip signals for different assets
        if (signal.asset.toLowerCase() !== asset.toLowerCase()) continue;
        
        const entryTime = new Date(signal.timestamp);
        
        // Find data points after the entry time
        const futureData = historicalData.filter(point => 
          new Date(point.timestamp) >= entryTime
        );
        
        if (futureData.length === 0) {
          // No future data available for this signal
          results.push({
            signalId: signal.id,
            asset: signal.asset,
            entryPrice: signal.entryPrice,
            entryTime: signal.timestamp,
            direction: signal.direction,
            stopLoss: signal.stopLoss,
            takeProfit1: signal.takeProfit1,
            takeProfit2: signal.takeProfit2,
            takeProfit3: signal.takeProfit3,
            outcome: 'No Data'
          });
          continue;
        }
        
        // Check if SL or TP was hit first
        let outcome: TradeAnalysisResult['outcome'] = 'Active';
        let hitTime: string | undefined;
        let pnl: number | undefined;
        let pnlPercentage: number | undefined;
        
        for (const dataPoint of futureData) {
          const { high, low, timestamp } = dataPoint;
          
          // For long positions
          if (signal.direction === 'long') {
            // Check if SL was hit (price went below SL)
            if (low <= signal.stopLoss) {
              outcome = 'SL Hit';
              hitTime = timestamp;
              pnl = signal.stopLoss - signal.entryPrice;
              pnlPercentage = ((signal.stopLoss / signal.entryPrice) - 1) * 100;
              break;
            }
            
            // Check if TP1 was hit (price went above TP1)
            if (high >= signal.takeProfit1) {
              outcome = 'TP1 Hit';
              hitTime = timestamp;
              pnl = signal.takeProfit1 - signal.entryPrice;
              pnlPercentage = ((signal.takeProfit1 / signal.entryPrice) - 1) * 100;
              
              // Continue checking if TP2 was hit
              if (signal.takeProfit2 && high >= signal.takeProfit2) {
                outcome = 'TP2 Hit';
                pnl = signal.takeProfit2 - signal.entryPrice;
                pnlPercentage = ((signal.takeProfit2 / signal.entryPrice) - 1) * 100;
                
                // Continue checking if TP3 was hit
                if (signal.takeProfit3 && high >= signal.takeProfit3) {
                  outcome = 'TP3 Hit';
                  pnl = signal.takeProfit3 - signal.entryPrice;
                  pnlPercentage = ((signal.takeProfit3 / signal.entryPrice) - 1) * 100;
                }
              }
              
              break;
            }
          } 
          // For short positions
          else {
            // Check if SL was hit (price went above SL)
            if (high >= signal.stopLoss) {
              outcome = 'SL Hit';
              hitTime = timestamp;
              pnl = signal.entryPrice - signal.stopLoss;
              pnlPercentage = ((signal.entryPrice / signal.stopLoss) - 1) * 100;
              break;
            }
            
            // Check if TP1 was hit (price went below TP1)
            if (low <= signal.takeProfit1) {
              outcome = 'TP1 Hit';
              hitTime = timestamp;
              pnl = signal.entryPrice - signal.takeProfit1;
              pnlPercentage = ((signal.entryPrice / signal.takeProfit1) - 1) * 100;
              
              // Continue checking if TP2 was hit
              if (signal.takeProfit2 && low <= signal.takeProfit2) {
                outcome = 'TP2 Hit';
                pnl = signal.entryPrice - signal.takeProfit2;
                pnlPercentage = ((signal.entryPrice / signal.takeProfit2) - 1) * 100;
                
                // Continue checking if TP3 was hit
                if (signal.takeProfit3 && low <= signal.takeProfit3) {
                  outcome = 'TP3 Hit';
                  pnl = signal.entryPrice - signal.takeProfit3;
                  pnlPercentage = ((signal.entryPrice / signal.takeProfit3) - 1) * 100;
                }
              }
              
              break;
            }
          }
        }
        
        // Add the analysis result
        results.push({
          signalId: signal.id,
          asset: signal.asset,
          entryPrice: signal.entryPrice,
          entryTime: signal.timestamp,
          direction: signal.direction,
          stopLoss: signal.stopLoss,
          takeProfit1: signal.takeProfit1,
          takeProfit2: signal.takeProfit2,
          takeProfit3: signal.takeProfit3,
          outcome,
          hitTime,
          pnl,
          pnlPercentage
        });
      }
      
      return results;
    } catch (error) {
      console.error('Error analyzing signals:', error);
      throw error;
    }
  }
  
  // Update Google Sheet with analysis results
  async updateGoogleSheet(
    spreadsheetId: string, 
    sheetName: string, 
    results: TradeAnalysisResult[]
  ): Promise<boolean> {
    try {
      const response = await axios.post(`${this.API_BASE_URL}/update-sheet`, {
        spreadsheetId,
        sheetName,
        results
      });
      
      return response.data.success;
    } catch (error) {
      console.error('Error updating Google Sheet:', error);
      return false;
    }
  }
  
  // Export analysis results to CSV
  exportResultsToCSV(results: TradeAnalysisResult[]): string {
    // Generate CSV content
    const headers = [
      'Signal ID', 'Asset', 'Direction', 'Entry Price', 'Entry Time',
      'Stop Loss', 'Take Profit 1', 'Take Profit 2', 'Take Profit 3',
      'Outcome', 'Hit Time', 'PnL', 'PnL %'
    ].join(',');
    
    const rows = results.map(result => [
      result.signalId,
      result.asset,
      result.direction,
      result.entryPrice,
      result.entryTime,
      result.stopLoss,
      result.takeProfit1,
      result.takeProfit2 || '',
      result.takeProfit3 || '',
      result.outcome,
      result.hitTime || '',
      result.pnl || '',
      result.pnlPercentage ? `${result.pnlPercentage.toFixed(2)}%` : ''
    ].join(','));
    
    return [headers, ...rows].join('\n');
  }
  
  // Helper method to download CSV file
  downloadCSV(csvContent: string, filename: string): void {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  // Fetch TradingView webhook signals
  async getTradingViewWebhookSignals(): Promise<TradeSignal[]> {
    try {
      const response = await axios.get('/api/webhooks/tradingview');
      
      // Map the response data to TradeSignal format
      return this.convertWebhookSignalsToTradeSignals(response.data);
    } catch (error) {
      console.error('Error fetching TradingView webhook signals:', error);
      return [];
    }
  }
  
  // Fetch internal webhook signals
  async getInternalWebhookSignals(): Promise<TradeSignal[]> {
    try {
      const response = await axios.get('/api/webhooks/signals');
      
      // Map the response data to TradeSignal format
      return this.convertWebhookSignalsToTradeSignals(response.data);
    } catch (error) {
      console.error('Error fetching internal webhook signals:', error);
      return [];
    }
  }
  
  // Helper method to convert webhook signals to TradeSignal format
  private convertWebhookSignalsToTradeSignals(webhookSignals: WebhookSignal[]): TradeSignal[] {
    if (!Array.isArray(webhookSignals)) {
      console.error('Expected array of webhook signals but got:', typeof webhookSignals);
      return [];
    }
    
    return webhookSignals.map(signal => {
      // Convert signal to TradeSignal format
      const timestamp = signal.Date || new Date().toISOString();
      const asset = signal.Symbol || signal.Asset || 'UNKNOWN';
      const direction = signal.Direction?.toLowerCase() || 'long';
      const entryPrice = signal['Entry Price'] || 0;
      const stopLoss = signal['Stop Loss'] || 0;
      const takeProfit1 = signal['Take Profit'] || signal.TP1 || 0;
      const takeProfit2 = signal.TP2;
      const takeProfit3 = signal.TP3;
      const provider = signal.Provider || 'Unknown';
      const notes = signal.Notes || '';
      const status = signal.Status || 'active';
      const marketType = (signal.marketType || 'crypto') as 'crypto' | 'forex' | 'futures';
      
      return {
        id: signal.id,
        timestamp,
        asset,
        direction: direction as 'long' | 'short',
        entryPrice,
        stopLoss,
        takeProfit1,
        takeProfit2,
        takeProfit3,
        provider: provider as any, // Handle string to specific provider type conversion
        notes,
        status: status.toLowerCase() as 'active' | 'completed' | 'stopped' | 'cancelled',
        marketType
      };
    });
  }
}

// Export singleton instance
export const signalsAnalyzerService = new SignalsAnalyzerService();