import { check_secrets } from '../utils';
import { apiKeyManager } from './api-key-manager';
import { config } from '../config';

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
  private projectId: string = '7461f7e2-e070-46e3-a1b7-7bd7f6f01ff3';
  private nftApiKey: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImI5NzljZmQ5LTY0NjAtNDMyYS05MDYxLTY0ZTgwZWEyNDdkNCIsIm9yZ0lkIjoiMzQ0NzYiLCJ1c2VySWQiOiIzNDQ4NCIsInR5cGVJZCI6Ijc0NjFmN2UyLWUwNzAtNDZlMy1hMWI3LTdiZDdmNmYwMWZmMyIsInR5cGUiOiJQUk9KRUNUIiwiaWF0IjoxNzA3MTU4MzI2LCJleHAiOjQ4NjI5MTgzMjZ9.megwx3zUApJ0zWzRvYa_8FYszBKnovd8v3fCxfbIcFo';
  private initialized = false;
  private readonly baseUrl = 'https://deep-index.moralis.io/api/v2.2';
  private rateLimits = {
    requestsPerMinute: 60, // Converting from per second to per minute
    requestsPerDay: 100000
  };
  private requestLog: Array<{ timestamp: number, endpoint: string }> = [];

  constructor() {
    // Initialize with default API key from .env if available
    this.apiKey = 'rEmydwR0gktvX937sAYMKXLL7zvKK5yz2OPvu7hlLH43s7P2Y7pn3UfMjUlNIuAd';
  }

  async initialize(): Promise<boolean> {
    try {
      // We already have the API keys hard-coded, just mark as initialized
      console.log('Initializing Moralis service with provided API keys');
      
      // Update the API key manager with these keys for other components to use
      await apiKeyManager.initialize();
      await apiKeyManager.setApiKey('moralis', {
        key: this.apiKey,
        isValid: true,
        tier: 'premium',
        rateLimits: {
          requestsPerMinute: 60,
          requestsPerDay: 100000,
          requestsRemaining: 100000
        }
      });
      
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
  
  /**
   * Get Solana SPL tokens for a wallet address
   * @param address The wallet address
   */
  async getSolanaTokens(address: string): Promise<any[]> {
    try {
      const result = await this.request(`/${address}/spl`, { 
        chain: 'solana' 
      });
      return result || [];
    } catch (error) {
      console.error(`Error fetching Solana tokens for ${address}:`, error);
      return [];
    }
  }
  
  /**
   * Get Solana NFTs for a wallet address
   * @param address The wallet address
   */
  async getSolanaNFTs(address: string): Promise<any[]> {
    try {
      const result = await this.request(`/${address}/nft`, {
        chain: 'solana',
        format: 'decimal'
      });
      return result?.result || [];
    } catch (error) {
      console.error(`Error fetching Solana NFTs for ${address}:`, error);
      return [];
    }
  }
  
  /**
   * Get THC token balance for a wallet
   * @param address The wallet address
   * @param thcTokenAddress The THC token contract address on Solana
   */
  async getTHCBalance(address: string, thcTokenAddress: string = 'THC1466R6BzFXyJR3dQZLpyZ4WBMZBmuNFYRmQXW'): Promise<{balance: string, usdValue: number}> {
    try {
      const tokens = await this.getSolanaTokens(address);
      const thcToken = tokens.find((t: any) => 
        t.mint === thcTokenAddress || 
        t.symbol?.toUpperCase() === 'THC'
      );
      
      if (!thcToken) {
        return { balance: '0', usdValue: 0 };
      }
      
      const balance = thcToken.amount || '0';
      const decimals = thcToken.decimals || 9;
      const formattedBalance = (parseInt(balance) / Math.pow(10, decimals)).toString();
      
      // Try to get USD value
      const thcPrice = await this.getTokenCurrentPrice('THC');
      const usdValue = thcPrice 
        ? parseFloat(formattedBalance) * thcPrice 
        : 0;
      
      return { 
        balance: formattedBalance,
        usdValue 
      };
    } catch (error) {
      console.error(`Error fetching THC balance for ${address}:`, error);
      return { balance: '0', usdValue: 0 };
    }
  }
  
  /**
   * Get SOL balance for a wallet
   * @param address The wallet address
   */
  async getSOLBalance(address: string): Promise<{balance: string, usdValue: number}> {
    try {
      // Get SOL balance
      const result = await this.request(`/${address}/balance`, { 
        chain: 'solana' 
      });
      
      const balance = result?.balance || '0';
      const decimals = 9; // SOL has 9 decimals
      const formattedBalance = (parseInt(balance) / Math.pow(10, decimals)).toString();
      
      // Try to get USD value
      const solPrice = await this.getTokenCurrentPrice('SOL');
      const usdValue = solPrice 
        ? parseFloat(formattedBalance) * solPrice 
        : 0;
      
      return {
        balance: formattedBalance,
        usdValue
      };
    } catch (error) {
      console.error(`Error fetching SOL balance for ${address}:`, error);
      return { balance: '0', usdValue: 0 };
    }
  }
  
  /**
   * Get all wallet data including balances and NFTs
   * @param address The wallet address
   * @param includeNFTs Whether to include NFTs in the results
   */
  async getWalletData(address: string, includeNFTs: boolean = true): Promise<any> {
    try {
      const [solBalance, thcBalance, splTokens] = await Promise.all([
        this.getSOLBalance(address),
        this.getTHCBalance(address),
        this.getSolanaTokens(address)
      ]);
      
      let nfts = [];
      if (includeNFTs) {
        nfts = await this.getSolanaNFTs(address);
      }
      
      // Format tokens with balances and USD values
      const tokens = await Promise.all(
        splTokens.map(async (token: any) => {
          const symbol = token.symbol || 'Unknown';
          const balance = token.amount || '0';
          const decimals = token.decimals || 0;
          const formattedBalance = (parseInt(balance) / Math.pow(10, decimals)).toString();
          
          // Try to get USD value
          const price = await this.getTokenCurrentPrice(symbol);
          const usdValue = price 
            ? parseFloat(formattedBalance) * price 
            : 0;
            
          return {
            symbol,
            name: token.name || symbol,
            balance: formattedBalance,
            usdValue,
            decimals,
            mint: token.mint
          };
        })
      );
      
      return {
        address,
        sol: solBalance,
        thc: thcBalance,
        tokens,
        nfts,
        totalValue: solBalance.usdValue + thcBalance.usdValue + 
          tokens.reduce((total: number, t: any) => total + (t.usdValue || 0), 0)
      };
    } catch (error) {
      console.error(`Error fetching complete wallet data for ${address}:`, error);
      return {
        address,
        sol: { balance: '0', usdValue: 0 },
        thc: { balance: '0', usdValue: 0 },
        tokens: [],
        nfts: [],
        totalValue: 0
      };
    }
  }
}

// Export singleton instance
export const moralisService = new MoralisService();