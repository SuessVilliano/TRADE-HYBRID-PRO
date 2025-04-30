/**
 * Solscan API Adapter for the Trade Hybrid platform
 * 
 * This adapter provides integration with the Solscan API for Solana blockchain data.
 * It uses the SOLSCAN_API_KEY from environment variables for authentication.
 */

import axios from 'axios';
import { sleep } from '../../utils';

// Base API URL for Solscan
const SOLSCAN_API_BASE_URL = 'https://api.solscan.io';

// Rate limiting: 1 request per second to avoid hitting API limits
const RATE_LIMIT_MS = 1000;

// Types for Solscan API responses
interface SolscanTokenInfo {
  symbol: string;
  name: string;
  icon: string;
  address: string;
  decimals: number;
  totalSupply: string;
  mintAuthority: string;
  supply: string;
  marketCap: number;
}

interface SolscanTokenHolder {
  address: string;
  amount: string;
  decimals: number;
  owner: string;
  rank: number;
}

interface SolscanTokenMetadata {
  metadataAddress: string;
  mintAddress: string;
  offChainData: {
    name: string;
    symbol: string;
    description: string;
    image: string;
    animation_url?: string;
    external_url?: string;
    attributes?: Array<{ trait_type: string; value: string }>;
  };
  onChainData: {
    name: string;
    symbol: string;
    uri: string;
    sellerFeeBasisPoints: number;
    creators: Array<{ address: string; share: number; verified: boolean }>;
  };
}

interface SolscanAccountInfo {
  lamports: number;
  ownerProgram: string;
  type: string;
  rentEpoch: number;
  executable: boolean;
  account: string;
}

interface SolscanTransaction {
  txHash: string;
  blockTime: number;
  slot: number;
  fee: number;
  status: string;
  lamport: number;
  signer: string[];
  parsedInstruction: any[];
}

/**
 * Solscan Adapter class for interacting with Solscan API
 */
export class SolscanAdapter {
  private apiKey: string;
  private lastRequestTime: number = 0;

  constructor() {
    // Get the API key from environment variables
    this.apiKey = process.env.SOLSCAN_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('SOLSCAN_API_KEY is not set in environment variables. API requests may be rate limited.');
    }
  }
  
  /**
   * Set a new API key
   */
  public setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    console.log('Solscan API key updated');
  }
  
  /**
   * Update API key and test if it works
   */
  public async updateApiKey(apiKey: string): Promise<boolean> {
    this.apiKey = apiKey;
    console.log('Solscan API key updated');
    
    // Test if the API key works
    try {
      // Make a simple request to test the API key
      await this.getNetworkStatus();
      return true;
    } catch (error) {
      console.error('Error testing new Solscan API key:', error);
      return false;
    }
  }

  /**
   * Initialize the adapter
   */
  async initialize(): Promise<boolean> {
    try {
      // Test connection to Solscan API
      await this.getTokenInfo('4kXPBvQthvpes9TC7h6tXsYxWPUbYWpocBMVUG3eBLy4'); // THC token address
      console.log('Solscan adapter initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Solscan adapter:', error);
      return false;
    }
  }

  /**
   * Apply rate limiting between API requests
   */
  private async applyRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < RATE_LIMIT_MS && this.lastRequestTime > 0) {
      const waitTime = RATE_LIMIT_MS - timeSinceLastRequest;
      await sleep(waitTime);
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Check if the Solscan API key is valid
   */
  public async isApiKeyValid(): Promise<boolean> {
    if (!this.apiKey) {
      return false;
    }
    
    try {
      // Try a simple request to check if the API key is valid
      await this.makeRequest('/token/meta', { tokenAddress: '4kXPBvQthvpes9TC7h6tXsYxWPUbYWpocBMVUG3eBLy4' }, true);
      return true;
    } catch (error) {
      console.log('Solscan API key validation failed:', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }

  /**
   * Make a request to the Solscan API
   */
  private async makeRequest<T>(
    endpoint: string, 
    params: Record<string, any> = {}, 
    ignoreErrors: boolean = false
  ): Promise<T> {
    await this.applyRateLimit();
    
    try {
      const url = `${SOLSCAN_API_BASE_URL}${endpoint}`;
      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };
      
      // Add API key if available
      if (this.apiKey) {
        // For Solscan, we need to add the API key as an X-API-KEY header
        headers['X-API-KEY'] = this.apiKey;
      }
      
      const response = await axios.get<T>(url, {
        headers,
        params
      });
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`Solscan API error (${endpoint}):`, error.response?.status, error.response?.data);
        
        if (ignoreErrors) {
          // Return a default empty response object when ignoring errors
          return {} as T;
        }
        
        throw new Error(`Solscan API error: ${error.response?.status} ${error.response?.statusText}`);
      }
      
      console.error(`Error calling Solscan API (${endpoint}):`, error);
      
      if (ignoreErrors) {
        // Return a default empty response object when ignoring errors
        return {} as T;
      }
      
      throw error;
    }
  }

  /**
   * Get token information by address
   */
  async getTokenInfo(tokenAddress: string): Promise<SolscanTokenInfo> {
    return await this.makeRequest<SolscanTokenInfo>(`/token/meta?tokenAddress=${tokenAddress}`);
  }

  /**
   * Get token holders by token address
   */
  async getTokenHolders(tokenAddress: string, limit: number = 10, offset: number = 0): Promise<SolscanTokenHolder[]> {
    return await this.makeRequest<SolscanTokenHolder[]>(
      `/token/holders?tokenAddress=${tokenAddress}&limit=${limit}&offset=${offset}`
    );
  }

  /**
   * Get token metadata by token address
   */
  async getTokenMetadata(tokenAddress: string): Promise<SolscanTokenMetadata> {
    return await this.makeRequest<SolscanTokenMetadata>(`/token/metadata?tokenAddress=${tokenAddress}`);
  }

  /**
   * Get account information by address
   */
  async getAccountInfo(address: string): Promise<SolscanAccountInfo> {
    return await this.makeRequest<SolscanAccountInfo>(`/account?address=${address}`);
  }

  /**
   * Get transactions by address
   */
  async getTransactions(address: string, limit: number = 10, before: number = 0): Promise<SolscanTransaction[]> {
    const params: Record<string, any> = {
      account: address, 
      limit
    };
    
    if (before > 0) {
      params.beforeHash = before;
    }
    
    return await this.makeRequest<SolscanTransaction[]>('/transaction/sol-txs', params);
  }

  /**
   * Get THC token information
   * This is a specific helper method for the Trade Hybrid token
   */
  async getTHCTokenInfo(): Promise<SolscanTokenInfo> {
    // THC token address is hardcoded as 4kXPBvQthvpes9TC7h6tXsYxWPUbYWpocBMVUG3eBLy4
    return await this.getTokenInfo('4kXPBvQthvpes9TC7h6tXsYxWPUbYWpocBMVUG3eBLy4');
  }

  /**
   * Get THC token holders
   */
  async getTHCTokenHolders(limit: number = 10, offset: number = 0): Promise<SolscanTokenHolder[]> {
    return await this.getTokenHolders('4kXPBvQthvpes9TC7h6tXsYxWPUbYWpocBMVUG3eBLy4', limit, offset);
  }

  /**
   * Get validator information by validator address
   */
  async getValidatorInfo(validatorAddress: string): Promise<any> {
    // Note: This is a specialized endpoint for validator information
    return await this.makeRequest<any>(`/validator/detail?validator=${validatorAddress}`);
  }

  /**
   * Get Trade Hybrid validator information
   */
  async getTradeHybridValidatorInfo(): Promise<any> {
    // Trade Hybrid validator address is hardcoded as 5Mp3EF1donYxLxhe5hs6HoWpAucZGLZ76NKRNztkjEej
    return await this.getValidatorInfo('5Mp3EF1donYxLxhe5hs6HoWpAucZGLZ76NKRNztkjEej');
  }
}