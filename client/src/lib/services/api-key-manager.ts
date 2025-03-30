import { check_secrets } from '../utils';
import { config } from '../config';

export interface ApiKeyConfig {
  key: string;
  secret?: string;
  isValid: boolean;
  expiresAt?: number; // Unix timestamp
  refreshToken?: string;
  tier?: 'free' | 'basic' | 'premium' | 'enterprise';
  rateLimits?: {
    requestsPerMinute?: number;
    requestsPerDay?: number;
    requestsRemaining?: number;
  };
}

export interface ApiServiceConfig {
  name: string;
  description: string;
  baseUrl: string;
  authType: 'header' | 'query' | 'oauth';
  keyParam: string; // Header name or query param name
  secretParam?: string; // For services requiring key + secret
  docsUrl: string;
  logoUrl?: string;
  endpoints: string[];
  status: 'operational' | 'degraded' | 'offline' | 'unknown';
}

class ApiKeyManager {
  private apiKeys: Map<string, ApiKeyConfig> = new Map();
  private serviceConfigs: Map<string, ApiServiceConfig> = new Map();
  private initialized: boolean = false;
  
  constructor() {
    // Define available service configs
    this.serviceConfigs.set('rapidapi', {
      name: 'RapidAPI',
      description: 'Gateway to thousands of APIs',
      baseUrl: 'https://rapidapi.com',
      authType: 'header',
      keyParam: 'x-rapidapi-key',
      docsUrl: 'https://docs.rapidapi.com/',
      logoUrl: '/images/api/rapidapi.png',
      endpoints: ['Various based on specific API'],
      status: 'operational'
    });
    
    this.serviceConfigs.set('alpaca', {
      name: 'Alpaca',
      description: 'Commission-free stock trading API',
      baseUrl: 'https://paper-api.alpaca.markets',
      authType: 'header',
      keyParam: 'APCA-API-KEY-ID',
      secretParam: 'APCA-API-SECRET-KEY',
      docsUrl: 'https://alpaca.markets/docs/',
      logoUrl: '/images/brokers/alpaca.svg',
      endpoints: ['/v2/account', '/v2/orders', '/v2/positions'],
      status: 'operational'
    });
    
    this.serviceConfigs.set('oanda', {
      name: 'OANDA',
      description: 'Forex and CFD trading',
      baseUrl: 'https://api-fxpractice.oanda.com',
      authType: 'header',
      keyParam: 'Authorization',
      docsUrl: 'https://developer.oanda.com/rest-live-v20/introduction/',
      logoUrl: '/images/brokers/oanda.svg',
      endpoints: ['/v3/accounts', '/v3/instruments', '/v3/orders'],
      status: 'operational'
    });
    
    this.serviceConfigs.set('binance', {
      name: 'Binance',
      description: 'Cryptocurrency exchange API',
      baseUrl: 'https://api.binance.com',
      authType: 'query',
      keyParam: 'api_key',
      secretParam: 'signature',
      docsUrl: 'https://binance-docs.github.io/apidocs/',
      logoUrl: '/images/brokers/binance.svg',
      endpoints: ['/api/v3/ticker/24hr', '/api/v3/klines', '/api/v3/order'],
      status: 'operational'
    });
    
    this.serviceConfigs.set('openai', {
      name: 'OpenAI',
      description: 'AI language and image generation',
      baseUrl: 'https://api.openai.com',
      authType: 'header',
      keyParam: 'Authorization',
      docsUrl: 'https://platform.openai.com/docs/api-reference',
      logoUrl: '/images/api/openai.png',
      endpoints: ['/v1/chat/completions', '/v1/completions', '/v1/embeddings'],
      status: 'operational'
    });
    
    this.serviceConfigs.set('gemini', {
      name: 'Gemini',
      description: 'Google AI language model',
      baseUrl: 'https://generativelanguage.googleapis.com',
      authType: 'header',
      keyParam: 'x-goog-api-key',
      docsUrl: 'https://ai.google.dev/docs',
      logoUrl: '/images/api/gemini.png',
      endpoints: ['/v1beta/models/gemini-pro:generateContent'],
      status: 'operational'
    });
    
    this.serviceConfigs.set('moralis', {
      name: 'Moralis',
      description: 'Web3 and blockchain data provider',
      baseUrl: 'https://deep-index.moralis.io/api/v2',
      authType: 'header',
      keyParam: 'X-API-Key',
      docsUrl: 'https://docs.moralis.io/web3-data-api',
      logoUrl: '/images/api/moralis.png',
      endpoints: ['/erc20/', '/nft/', '/block/', '/transaction/'],
      status: 'operational'
    });
  }
  
  /**
   * Initialize the API key manager by checking for environment secrets
   */
  async initialize(): Promise<boolean> {
    if (this.initialized) {
      return true;
    }
    
    try {
      // Check for existing environment keys
      const keyNames = [
        'RAPIDAPI_KEY',
        'ALPACA_API_KEY',
        'ALPACA_API_SECRET',
        'OANDA_API_TOKEN',
        'BINANCE_API_KEY',
        'BINANCE_API_SECRET',
        'OPENAI_API_KEY',
        'GEMINI_API_KEY',
        'MORALIS_API_KEY'
      ];
      
      const hasSecrets = await check_secrets(keyNames);
      
      // Use our client-side config instead of process.env
      // These will typically be empty in client-side code unless explicitly set
      
      // Set up RapidAPI key if available
      if (config.RAPIDAPI_KEY) {
        this.apiKeys.set('rapidapi', {
          key: config.RAPIDAPI_KEY,
          isValid: true,
          tier: 'basic'
        });
      }
      
      // Set up Alpaca keys if available
      if (config.ALPACA_API_KEY && config.ALPACA_API_SECRET) {
        this.apiKeys.set('alpaca', {
          key: config.ALPACA_API_KEY,
          secret: config.ALPACA_API_SECRET,
          isValid: true,
          tier: 'basic'
        });
      }
      
      // Set up OANDA key if available
      if (config.OANDA_API_TOKEN) {
        this.apiKeys.set('oanda', {
          key: `Bearer ${config.OANDA_API_TOKEN}`,
          isValid: true,
          tier: 'basic'
        });
      }
      
      // Set up Binance key if available
      if (config.BINANCE_API_KEY && config.BINANCE_API_SECRET) {
        this.apiKeys.set('binance', {
          key: config.BINANCE_API_KEY,
          secret: config.BINANCE_API_SECRET,
          isValid: true,
          tier: 'basic'
        });
      }
      
      // Set up OpenAI key if available
      if (config.OPENAI_API_KEY) {
        this.apiKeys.set('openai', {
          key: `Bearer ${config.OPENAI_API_KEY}`,
          isValid: true,
          tier: 'basic'
        });
      }
      
      // Set up Gemini key if available
      if (config.GEMINI_API_KEY) {
        this.apiKeys.set('gemini', {
          key: config.GEMINI_API_KEY,
          isValid: true,
          tier: 'basic'
        });
      }
      
      // Set up Moralis key if available
      if (config.MORALIS_API_KEY) {
        this.apiKeys.set('moralis', {
          key: config.MORALIS_API_KEY,
          isValid: true,
          tier: 'premium',
          rateLimits: {
            requestsPerMinute: 60,
            requestsPerDay: 100000,
            requestsRemaining: 100000
          }
        });
      }
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize API Key Manager:', error);
      return false;
    }
  }
  
  /**
   * Get an API key configuration for a specific service
   */
  async getApiKey(service: string): Promise<ApiKeyConfig | null> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    return this.apiKeys.get(service.toLowerCase()) || null;
  }
  
  /**
   * Get information about a specific API service
   */
  getServiceConfig(service: string): ApiServiceConfig | null {
    return this.serviceConfigs.get(service.toLowerCase()) || null;
  }
  
  /**
   * Get all available service configurations
   */
  getAllServiceConfigs(): ApiServiceConfig[] {
    return Array.from(this.serviceConfigs.values());
  }
  
  /**
   * Get all services that have valid API keys
   */
  async getAvailableServices(): Promise<string[]> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    const availableServices: string[] = [];
    this.apiKeys.forEach((config, service) => {
      if (config.isValid) {
        availableServices.push(service);
      }
    });
    
    return availableServices;
  }
  
  /**
   * Set an API key for a specific service
   */
  async setApiKey(service: string, keyConfig: Partial<ApiKeyConfig>): Promise<boolean> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    const serviceName = service.toLowerCase();
    const existingConfig = this.apiKeys.get(serviceName);
    
    if (existingConfig) {
      // Update existing config
      this.apiKeys.set(serviceName, {
        ...existingConfig,
        ...keyConfig,
        isValid: true // Assume valid until proven otherwise
      });
    } else {
      // Create new config
      if (!keyConfig.key) {
        console.error('API key is required');
        return false;
      }
      
      this.apiKeys.set(serviceName, {
        key: keyConfig.key,
        secret: keyConfig.secret,
        isValid: true,
        tier: keyConfig.tier || 'free',
        rateLimits: keyConfig.rateLimits
      });
    }
    
    return true;
  }
  
  /**
   * Validate an API key for a specific service
   * This would actually call the API to validate in a real implementation
   */
  async validateApiKey(service: string): Promise<boolean> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    const serviceName = service.toLowerCase();
    const keyConfig = this.apiKeys.get(serviceName);
    
    if (!keyConfig) {
      return false;
    }
    
    // In a real implementation, we would make a test API call here
    // For now, we'll just check if the key exists
    const isValid = Boolean(keyConfig.key);
    
    // Update the validity status
    this.apiKeys.set(serviceName, {
      ...keyConfig,
      isValid
    });
    
    return isValid;
  }
  
  /**
   * Remove an API key for a specific service
   */
  async removeApiKey(service: string): Promise<boolean> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    const serviceName = service.toLowerCase();
    
    if (this.apiKeys.has(serviceName)) {
      this.apiKeys.delete(serviceName);
      return true;
    }
    
    return false;
  }
}

// Export singleton instance
export const apiKeyManager = new ApiKeyManager();