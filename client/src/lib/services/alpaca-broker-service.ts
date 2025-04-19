import { config } from '@/lib/config';

interface AlpacaBrokerAccount {
  id: string;
  account_number: string; 
  status: string;
  currency: string;
  buying_power: string;
  cash: string;
  portfolio_value: string;
}

/**
 * Service for interacting with Alpaca Broker API from the client
 */
export class AlpacaBrokerService {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl: string;
  private authenticated: boolean = false;

  constructor() {
    this.apiKey = config.ALPACA_BROKER_API_KEY;
    this.apiSecret = config.ALPACA_BROKER_API_SECRET;
    this.baseUrl = config.ALPACA_BROKER_API_URL;
    
    if (this.apiKey) {
      console.log(`Client using Alpaca Broker API Key: ${this.apiKey.substring(0, 4)}...`);
    }
  }

  /**
   * Initialize the connection
   */
  async connect(): Promise<void> {
    if (!this.apiKey || !this.apiSecret) {
      throw new Error('Alpaca Broker API credentials not available');
    }
    
    try {
      // Make a test API call to verify credentials
      await this.request('/v1/accounts');
      this.authenticated = true;
      console.log('Successfully connected to Alpaca Broker API');
    } catch (error) {
      console.error('Failed to connect to Alpaca Broker API:', error);
      throw error;
    }
  }

  /**
   * Get all trading accounts
   */
  async getAccounts(): Promise<AlpacaBrokerAccount[]> {
    if (!this.authenticated) {
      await this.connect();
    }
    
    return this.request('/v1/accounts');
  }

  /**
   * Get a specific account
   */
  async getAccount(accountId: string): Promise<AlpacaBrokerAccount> {
    if (!this.authenticated) {
      await this.connect();
    }
    
    return this.request(`/v1/accounts/${accountId}`);
  }

  /**
   * Get positions for an account
   */
  async getPositions(accountId: string): Promise<any[]> {
    if (!this.authenticated) {
      await this.connect();
    }
    
    return this.request(`/v1/trading/accounts/${accountId}/positions`);
  }

  /**
   * Get order history for an account
   */
  async getOrderHistory(accountId: string): Promise<any[]> {
    if (!this.authenticated) {
      await this.connect();
    }
    
    return this.request(`/v1/trading/accounts/${accountId}/orders`);
  }

  /**
   * Place an order for an account
   */
  async placeOrder(accountId: string, orderData: any): Promise<any> {
    if (!this.authenticated) {
      await this.connect();
    }
    
    return this.request(`/v1/trading/accounts/${accountId}/orders`, 'POST', orderData);
  }

  /**
   * Get account activities
   */
  async getActivities(accountId: string, activityType: string = 'FILL'): Promise<any[]> {
    if (!this.authenticated) {
      await this.connect();
    }
    
    return this.request(`/v1/accounts/${accountId}/activities?activity_type=${activityType}`);
  }

  /**
   * Generic request method
   */
  private async request(endpoint: string, method: string = 'GET', data?: any): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'APCA-API-KEY-ID': this.apiKey,
      'APCA-API-SECRET-KEY': this.apiSecret,
      'Content-Type': 'application/json'
    };
    
    const options: RequestInit = {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined
    };
    
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Alpaca Broker API error: ${response.status} - ${errorText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error(`Error in Alpaca Broker API request to ${endpoint}:`, error);
      throw error;
    }
  }
}