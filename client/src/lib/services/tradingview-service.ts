import axios from 'axios';

// Interfaces for TradingView specific data
export interface TradingViewPriceData {
  s: string;               // Symbol
  lp: number;              // Last price 
  ch: number;              // Change
  chp: number;             // Change percentage
  tv: number;              // Total volume
  h: number;               // High
  l: number;               // Low
  o: number;               // Open
  c: number;               // Close
  v: number;               // Volume
  t: number;               // Timestamp
}

export interface TradingViewSymbolInfo {
  symbol: string;
  description: string;
  type: string;           // 'stock', 'forex', 'crypto', etc.
  exchange: string;
  currency: string;
  timezone: string;
  session_regular: string; // Regular trading hours e.g., "0900-1600"
  listed_exchange: string;
}

export interface TradingViewIndicator {
  name: string;
  value: string | number;
  interpretation: 'bullish' | 'bearish' | 'neutral';
}

export interface TradingViewAnalysis {
  symbol: string;
  timestamp: number;
  indicators: {
    oscillators: TradingViewIndicator[];
    movingAverages: TradingViewIndicator[];
    summary: {
      rating: string;
      score: number;
      recommendation: string;
    }
  }
}

// Main TradingView Service Class
export class TradingViewService {
  private apiKey: string;
  private userId: string;
  private baseUrl: string = 'https://api.tradingview.com/v1';
  private isConnected: boolean = false;
  private headers: { [key: string]: string } = {};

  constructor(apiKey: string, userId: string) {
    this.apiKey = apiKey;
    this.userId = userId;
    this.headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'User-ID': this.userId,
      'Content-Type': 'application/json'
    };
  }

  // Connect to the TradingView API
  async connect(): Promise<boolean> {
    try {
      // Validate API credentials with a simple request
      const response = await axios.get(`${this.baseUrl}/auth/verify`, {
        headers: this.headers
      });
      
      if (response.status === 200 && response.data.status === 'success') {
        this.isConnected = true;
        console.log('Successfully connected to TradingView API');
        return true;
      } else {
        throw new Error('Failed to authenticate with TradingView API');
      }
    } catch (error) {
      console.error('TradingView connection error:', error);
      this.isConnected = false;
      return false;
    }
  }

  // Get market data for a symbol
  async getMarketData(symbol: string): Promise<TradingViewPriceData | null> {
    this.ensureConnected();
    
    try {
      const response = await axios.get(`${this.baseUrl}/market-data/price?symbol=${encodeURIComponent(symbol)}`, {
        headers: this.headers
      });
      
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error(`Failed to fetch market data for ${symbol}`);
      }
    } catch (error) {
      console.error(`Error fetching TradingView market data for ${symbol}:`, error);
      return null;
    }
  }

  // Get technical analysis for a symbol
  async getTechnicalAnalysis(symbol: string): Promise<TradingViewAnalysis | null> {
    this.ensureConnected();
    
    try {
      const response = await axios.get(`${this.baseUrl}/scan/technical-analysis?symbol=${encodeURIComponent(symbol)}`, {
        headers: this.headers
      });
      
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error(`Failed to fetch technical analysis for ${symbol}`);
      }
    } catch (error) {
      console.error(`Error fetching TradingView technical analysis for ${symbol}:`, error);
      return null;
    }
  }

  // Get symbol information
  async getSymbolInfo(symbol: string): Promise<TradingViewSymbolInfo | null> {
    this.ensureConnected();
    
    try {
      const response = await axios.get(`${this.baseUrl}/market-data/symbol-info?symbol=${encodeURIComponent(symbol)}`, {
        headers: this.headers
      });
      
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error(`Failed to fetch symbol info for ${symbol}`);
      }
    } catch (error) {
      console.error(`Error fetching TradingView symbol info for ${symbol}:`, error);
      return null;
    }
  }

  // Search for symbols
  async searchSymbols(query: string, limit: number = 10): Promise<TradingViewSymbolInfo[]> {
    this.ensureConnected();
    
    try {
      const response = await axios.get(`${this.baseUrl}/symbol-search?query=${encodeURIComponent(query)}&limit=${limit}`, {
        headers: this.headers
      });
      
      if (response.status === 200) {
        return response.data.symbols;
      } else {
        throw new Error(`Failed to search symbols for query: ${query}`);
      }
    } catch (error) {
      console.error(`Error searching TradingView symbols for query: ${query}`, error);
      return [];
    }
  }

  // Create alert
  async createAlert(options: {
    symbol: string;
    name: string;
    message: string;
    condition: string;
    type: 'price' | 'study' | 'position';
    price?: number;
    expiration?: number;  // Time in ms, 0 = no expiration
  }): Promise<{ id: string } | null> {
    this.ensureConnected();
    
    try {
      const response = await axios.post(`${this.baseUrl}/alerts/create`, options, {
        headers: this.headers
      });
      
      if (response.status === 201) {
        return { id: response.data.alert_id };
      } else {
        throw new Error('Failed to create alert');
      }
    } catch (error) {
      console.error('Error creating TradingView alert:', error);
      return null;
    }
  }

  // Get active alerts
  async getAlerts(): Promise<any[]> {
    this.ensureConnected();
    
    try {
      const response = await axios.get(`${this.baseUrl}/alerts/active`, {
        headers: this.headers
      });
      
      if (response.status === 200) {
        return response.data.alerts;
      } else {
        throw new Error('Failed to fetch alerts');
      }
    } catch (error) {
      console.error('Error fetching TradingView alerts:', error);
      return [];
    }
  }

  // Delete alert
  async deleteAlert(alertId: string): Promise<boolean> {
    this.ensureConnected();
    
    try {
      const response = await axios.delete(`${this.baseUrl}/alerts/${alertId}`, {
        headers: this.headers
      });
      
      return response.status === 200;
    } catch (error) {
      console.error(`Error deleting TradingView alert ${alertId}:`, error);
      return false;
    }
  }

  // Get chart data
  async getChartData(symbol: string, resolution: string, from: number, to: number): Promise<any> {
    this.ensureConnected();
    
    try {
      const response = await axios.get(`${this.baseUrl}/chart/history`, {
        headers: this.headers,
        params: {
          symbol,
          resolution,
          from,
          to
        }
      });
      
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error(`Failed to fetch chart data for ${symbol}`);
      }
    } catch (error) {
      console.error(`Error fetching TradingView chart data for ${symbol}:`, error);
      throw error;
    }
  }

  // Private helper methods
  private ensureConnected(): void {
    if (!this.isConnected) {
      throw new Error('Not connected to TradingView API. Please call connect() first.');
    }
  }
}

// Factory function to create the TradingView service
export function createTradingViewService(apiKey: string, userId: string): TradingViewService {
  return new TradingViewService(apiKey, userId);
}