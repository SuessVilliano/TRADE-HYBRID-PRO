import axios from 'axios';
import { BrokerCredentials, BrokerService } from './broker-connection-service';

/**
 * Options for Alpaca Broker API
 */
interface AlpacaBrokerOptions {
  isSandbox: boolean;
}

/**
 * Service for interacting with Alpaca Broker API
 */
export class AlpacaBrokerService {
  private apiKey: string;
  private secretKey: string;
  private baseUrl: string;

  constructor(credentials?: BrokerCredentials, options: AlpacaBrokerOptions = { isSandbox: true }) {
    // Use credentials provided or fall back to environment variables
    this.apiKey = credentials?.apiKey || process.env.ALPACA_BROKER_API_KEY || '';
    this.secretKey = credentials?.secretKey || process.env.ALPACA_BROKER_API_SECRET || '';
    
    if (!this.apiKey || !this.secretKey) {
      throw new Error('API key and secret key are required for Alpaca Broker API');
    }
    
    console.log(`Using Alpaca Broker API Key: ${this.apiKey.substring(0, 4)}...`);
    
    // Use the appropriate API URL based on environment
    if (options.isSandbox) {
      this.baseUrl = process.env.ALPACA_BROKER_API_URL || 'https://broker-api.sandbox.alpaca.markets';
    } else {
      this.baseUrl = 'https://broker-api.alpaca.markets';
    }
  }

  /**
   * Initialize the service
   */
  async initialize(): Promise<void> {
    // Verify credentials by making a test API call
    try {
      await this.getAccounts();
      console.log('Successfully initialized Alpaca Broker service');
    } catch (error) {
      console.error('Failed to initialize Alpaca Broker service:', error);
      throw new Error('Invalid Alpaca Broker credentials');
    }
  }

  /**
   * Get all accounts
   */
  async getAccounts(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/v1/accounts`, {
        headers: this.getHeaders(),
      });
      
      return response.data;
    } catch (error) {
      console.error('Error getting Alpaca Broker accounts:', error);
      throw error;
    }
  }

  /**
   * Get account by ID
   */
  async getAccount(accountId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/v1/accounts/${accountId}`, {
        headers: this.getHeaders(),
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error getting Alpaca Broker account ${accountId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new trading account
   */
  async createAccount(accountData: any): Promise<any> {
    try {
      const response = await axios.post(`${this.baseUrl}/v1/accounts`, accountData, {
        headers: this.getHeaders(),
      });
      
      return response.data;
    } catch (error) {
      console.error('Error creating Alpaca Broker account:', error);
      throw error;
    }
  }

  /**
   * Get account positions
   */
  async getPositions(accountId: string): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/v1/trading/accounts/${accountId}/positions`, {
        headers: this.getHeaders(),
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error getting positions for account ${accountId}:`, error);
      throw error;
    }
  }

  /**
   * Place an order for an account
   */
  async placeOrder(accountId: string, orderData: any): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/v1/trading/accounts/${accountId}/orders`, 
        orderData,
        { headers: this.getHeaders() }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error placing order for account ${accountId}:`, error);
      throw error;
    }
  }

  /**
   * Get order history for an account
   */
  async getOrderHistory(accountId: string): Promise<any[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/v1/trading/accounts/${accountId}/orders`, 
        { headers: this.getHeaders() }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error getting order history for account ${accountId}:`, error);
      throw error;
    }
  }

  /**
   * Get headers for API requests
   */
  private getHeaders() {
    return {
      'APCA-API-KEY-ID': this.apiKey,
      'APCA-API-SECRET-KEY': this.secretKey,
      'Content-Type': 'application/json'
    };
  }
}