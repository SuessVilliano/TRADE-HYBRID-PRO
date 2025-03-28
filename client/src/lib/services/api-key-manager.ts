import { check_secrets } from '../utils';

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
        'OPENAI_API_KEY'
      ];
      
      const hasSecrets = await check_secrets(keyNames);
      
      if (hasSecrets) {
        // Set up RapidAPI key if available
        if (process.env.RAPIDAPI_KEY) {
          this.apiKeys.set('rapidapi', {
            key: process.env.RAPIDAPI_KEY,
            isValid: true,
            tier: 'basic'
          });
        }
        
        // Set up Alpaca keys if available
        if (process.env.ALPACA_API_KEY && process.env.ALPACA_API_SECRET) {
          this.apiKeys.set('alpaca', {
            key: process.env.ALPACA_API_KEY,
            secret: process.env.ALPACA_API_SECRET,
            isValid: true,
            tier: 'basic'
          });
        }
        
        // Set up OANDA key if available
        if (process.env.OANDA_API_TOKEN) {
          this.apiKeys.set('oanda', {
            key: `Bearer ${process.env.OANDA_API_TOKEN}`,
            isValid: true,
            tier: 'basic'
          });
        }
        
        // Set up Binance key if available
        if (process.env.BINANCE_API_KEY && process.env.BINANCE_API_SECRET) {
          this.apiKeys.set('binance', {
            key: process.env.BINANCE_API_KEY,
            secret: process.env.BINANCE_API_SECRET,
            isValid: true,
            tier: 'basic'
          });
        }
        
        // Set up OpenAI key if available
        if (process.env.OPENAI_API_KEY) {
          this.apiKeys.set('openai', {
            key: `Bearer ${process.env.OPENAI_API_KEY}`,
            isValid: true,
            tier: 'basic'
          });
        }
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
  async setApiKey(service: string, config: Partial<ApiKeyConfig>): Promise<boolean> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    const serviceName = service.toLowerCase();
    const existingConfig = this.apiKeys.get(serviceName);
    
    if (existingConfig) {
      // Update existing config
      this.apiKeys.set(serviceName, {
        ...existingConfig,
        ...config,
        isValid: true // Assume valid until proven otherwise
      });
    } else {
      // Create new config
      if (!config.key) {
        console.error('API key is required');
        return false;
      }
      
      this.apiKeys.set(serviceName, {
        key: config.key,
        secret: config.secret,
        isValid: true,
        tier: config.tier || 'free',
        rateLimits: config.rateLimits
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
    const config = this.apiKeys.get(serviceName);
    
    if (!config) {
      return false;
    }
    
    // In a real implementation, we would make a test API call here
    // For now, we'll just check if the key exists
    const isValid = Boolean(config.key);
    
    // Update the validity status
    this.apiKeys.set(serviceName, {
      ...config,
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