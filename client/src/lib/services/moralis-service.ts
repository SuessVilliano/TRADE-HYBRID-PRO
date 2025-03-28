import { check_secrets } from '../utils';
import { apiKeyManager } from './api-key-manager';

export interface MoralisTokenData {
  token_address: string;
  symbol: string;
  name: string;
  logo?: string;
  thumbnail?: string;
  decimals: number;
  balance: string;
  possible_spam?: boolean;
}

export interface MoralisTokenPrice {
  tokenName: string;
  tokenSymbol: string;
  tokenLogo: string;
  tokenDecimals: string;
  nativePrice: {
    value: string;
    decimals: number;
    name: string;
    symbol: string;
  };
  usdPrice: number;
  usdPriceFormatted: string;
  exchangeAddress: string;
  exchangeName: string;
}

export interface MoralisNFTData {
  token_address: string;
  token_id: string;
  amount: string;
  owner_of: string;
  token_hash: string;
  block_number_minted: string;
  block_number: string;
  contract_type: string;
  name: string;
  symbol: string;
  token_uri: string;
  metadata: string;
  last_token_uri_sync: string;
  last_metadata_sync: string;
}

export interface MoralisTokenTransfer {
  transaction_hash: string;
  address: string;
  block_timestamp: string;
  block_number: string;
  block_hash: string;
  to_address: string;
  from_address: string;
  value: string;
  transaction_index: number;
  log_index: number;
}

export class MoralisService {
  private apiKey: string = '';
  private initialized = false;
  private readonly baseUrl = 'https://deep-index.moralis.io/api/v2';
  private rateLimits = {
    requestsPerMinute: 60, // Converting from per second to per minute
    requestsPerDay: 100000
  };
  private requestLog: Array<{ timestamp: number, endpoint: string }> = [];

  constructor() {}

  async initialize(): Promise<boolean> {
    try {
      // First try to get the API key from the API key manager
      await apiKeyManager.initialize();
      const apiKeyConfig = await apiKeyManager.getApiKey('moralis');
      
      if (apiKeyConfig && apiKeyConfig.isValid) {
        this.apiKey = apiKeyConfig.key;
        console.log('Using Moralis API key from API Key Manager');
      } else {
        // Fall back to checking environment variables directly
        const hasKey = await check_secrets(['MORALIS_API_KEY']);
        if (!hasKey) {
          console.log('Moralis API key not found');
          return false;
        } else {
          // Get from environment
          this.apiKey = process.env.MORALIS_API_KEY || '';
        }
        
        // Update the API key manager with this key
        await apiKeyManager.setApiKey('moralis', {
          key: this.apiKey,
          isValid: true,
          tier: 'premium', // Using premium as a valid tier
          rateLimits: {
            requestsPerMinute: 60, // 2 per second = 60 per min
            requestsPerDay: 100000,
            requestsRemaining: 100000 // Add this to match the interface
          }
        });
      }
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize Moralis service:', error);
      return false;
    }
  }

  private async ensureInitialized() {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  private async request(endpoint: string, params: Record<string, string> = {}): Promise<any> {
    await this.ensureInitialized();
    
    if (!this.checkRateLimits(endpoint)) {
      throw new Error('Rate limit exceeded');
    }
    
    const url = new URL(`${this.baseUrl}${endpoint}`);
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined) {
        url.searchParams.append(key, params[key]);
      }
    });
    
    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-API-Key': this.apiKey
        }
      });
      
      if (!response.ok) {
        throw new Error(`Moralis API error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching from Moralis API:`, error);
      throw error;
    }
  }
  
  /**
   * Check if we're within rate limits
   */
  private checkRateLimits(endpoint: string): boolean {
    const now = Date.now();
    
    // Clean up old requests (older than 1 day)
    this.requestLog = this.requestLog.filter(req => now - req.timestamp < 24 * 60 * 60 * 1000);
    
    // Check daily limit
    if (this.rateLimits.requestsPerDay > 0 && this.requestLog.length >= this.rateLimits.requestsPerDay) {
      console.warn('Moralis API daily rate limit reached');
      return false;
    }
    
    // Check per-minute limit instead of per-second
    const lastMinuteRequests = this.requestLog.filter(req => now - req.timestamp < 60 * 1000);
    if (this.rateLimits.requestsPerMinute > 0 && lastMinuteRequests.length >= this.rateLimits.requestsPerMinute) {
      console.warn('Moralis API per-minute rate limit reached, waiting a bit...');
      return false;
    }
    
    // Log this request
    this.requestLog.push({ timestamp: now, endpoint });
    return true;
  }

  /**
   * Get ERC20 tokens owned by an address
   */
  async getWalletTokens(address: string, chain: string = 'eth'): Promise<MoralisTokenData[]> {
    try {
      const result = await this.request(`/${address}/erc20`, { chain });
      return result || [];
    } catch (error) {
      console.error(`Error fetching tokens for address ${address}:`, error);
      return [];
    }
  }

  /**
   * Get NFTs owned by an address
   */
  async getWalletNFTs(address: string, chain: string = 'eth'): Promise<MoralisNFTData[]> {
    try {
      const result = await this.request(`/${address}/nft`, { chain, format: 'decimal' });
      return result?.result || [];
    } catch (error) {
      console.error(`Error fetching NFTs for address ${address}:`, error);
      return [];
    }
  }

  /**
   * Get token transfers for an address
   */
  async getTokenTransfers(address: string, chain: string = 'eth'): Promise<MoralisTokenTransfer[]> {
    try {
      const result = await this.request(`/${address}/erc20/transfers`, { chain });
      return result?.result || [];
    } catch (error) {
      console.error(`Error fetching token transfers for address ${address}:`, error);
      return [];
    }
  }

  /**
   * Get token price from Moralis
   */
  async getTokenPrice(address: string, chain: string = 'eth'): Promise<MoralisTokenPrice | null> {
    try {
      const result = await this.request(`/erc20/${address}/price`, { chain });
      return result || null;
    } catch (error) {
      console.error(`Error fetching token price for address ${address}:`, error);
      return null;
    }
  }

  /**
   * Get native balance for an address
   */
  async getNativeBalance(address: string, chain: string = 'eth'): Promise<string> {
    try {
      const result = await this.request(`/${address}/balance`, { chain });
      return result?.balance || '0';
    } catch (error) {
      console.error(`Error fetching native balance for address ${address}:`, error);
      return '0';
    }
  }

  /**
   * Get token metadata
   */
  async getTokenMetadata(addresses: string[], chain: string = 'eth'): Promise<any[]> {
    try {
      const result = await this.request('/erc20/metadata', { 
        chain, 
        addresses: addresses.join(',') 
      });
      return result || [];
    } catch (error) {
      console.error(`Error fetching token metadata:`, error);
      return [];
    }
  }

  /**
   * Get historical cryptocurrency data 
   * @param symbol The token symbol (e.g. BTC, ETH)
   * @param days How many days of data to get
   * @param interval The interval for the data points (e.g. 1h, 1d)
   */
  async getTokenHistoricalPrice(symbol: string, days: number = 7, interval: string = '1h'): Promise<any> {
    try {
      // This is using CoinGecko's API format which Moralis doesn't directly support
      // As a workaround, we'll format the request for a commonly used alternative
      const timestamp = Math.floor(Date.now() / 1000);
      const fromTimestamp = timestamp - (days * 24 * 60 * 60);
      
      // Format our request to support both Ethereum and Bitcoin networks
      const chain = symbol.toUpperCase() === 'BTC' ? 'btc' : 'eth';
      
      const tokens = await this.getMarketData(symbol);
      if (!tokens || tokens.length === 0) {
        throw new Error(`Could not find token data for symbol ${symbol}`);
      }
      
      const token = tokens[0];
      
      // Now get price for this token
      const priceData = await this.request(`/erc20/${token.token_address}/price`, {
        chain,
        to_block: timestamp.toString(),
        from_block: fromTimestamp.toString()
      });
      
      // Transform to a format similar to CoinGecko for compatibility with existing code
      return {
        prices: priceData.price_history.map((item: any) => [
          new Date(item.timestamp).getTime(),
          parseFloat(item.price)
        ]),
        market_caps: [],
        total_volumes: []
      };
    } catch (error) {
      console.error(`Error fetching historical price for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Get market data for tokens
   * @param query Optional search query to filter tokens
   * @param limit Maximum number of tokens to return
   */
  async getMarketData(query?: string, limit: number = 100): Promise<any[]> {
    try {
      // This would ideally call Moralis market data endpoint 
      // Since Moralis doesn't have a direct market data endpoint like CoinGecko,
      // we'll simulate it with token metadata 
      const allTokens = [
        { symbol: 'BTC', name: 'Bitcoin', address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599' },
        { symbol: 'ETH', name: 'Ethereum', address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' },
        { symbol: 'USDT', name: 'Tether', address: '0xdac17f958d2ee523a2206206994597c13d831ec7' },
        { symbol: 'USDC', name: 'USD Coin', address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' },
        { symbol: 'BNB', name: 'Binance Coin', address: '0xB8c77482e45F1F44dE1745F52C74426C631bDD52' },
        { symbol: 'XRP', name: 'Ripple', address: '0x1d2f0da169ceb9fc7b3144628db156f3f6c60dbe' },
        { symbol: 'ADA', name: 'Cardano', address: '0x3ee2200efb3400fabb9aacf31297cbdd1d435d47' },
        { symbol: 'DOGE', name: 'Dogecoin', address: '0xba2ae424d960c26247dd6c32edc70b295c744c43' },
        { symbol: 'SOL', name: 'Solana', address: '0x41848373dec95a8b16905184965f867c89975f7f' },
        { symbol: 'DOT', name: 'Polkadot', address: '0x7083609fce4d1d8dc0c979aab8c869ea2c873402' },
        { symbol: 'AVAX', name: 'Avalanche', address: '0x1ce0c2827e2ef14d5c4f29a091d735a204794041' }
      ];
      
      let filteredTokens = allTokens;
      
      // Filter tokens if query is provided
      if (query) {
        const normalizedQuery = query.toLowerCase().replace(/usd$/, '');
        filteredTokens = allTokens.filter(token => 
          token.symbol.toLowerCase().includes(normalizedQuery) || 
          token.name.toLowerCase().includes(normalizedQuery)
        );
      }
      
      // Limit the number of results
      filteredTokens = filteredTokens.slice(0, limit);
      
      // For each token, try to get its price
      const tokenWithPrices = await Promise.all(
        filteredTokens.map(async (token) => {
          try {
            const priceData = await this.getTokenPrice(token.address);
            return {
              ...token,
              usd_price: priceData?.usdPrice || null,
              price_change_24h: 0, // We don't have this data from Moralis
              market_cap: 0 // We don't have this data from Moralis
            };
          } catch (error) {
            console.error(`Error fetching price for ${token.symbol}:`, error);
            return {
              ...token,
              usd_price: null,
              price_change_24h: 0,
              market_cap: 0
            };
          }
        })
      );
      
      return tokenWithPrices;
    } catch (error) {
      console.error('Error fetching market data:', error);
      return [];
    }
  }

  /**
   * Get real-time price for a token
   * @param symbol The token symbol (e.g. BTC, ETH)
   */
  async getTokenCurrentPrice(symbol: string): Promise<number | null> {
    try {
      const tokens = await this.getMarketData(symbol);
      if (!tokens || tokens.length === 0) {
        return null;
      }
      
      return tokens[0].usd_price;
    } catch (error) {
      console.error(`Error fetching current price for ${symbol}:`, error);
      return null;
    }
  }
}

// Export singleton instance
export const moralisService = new MoralisService();