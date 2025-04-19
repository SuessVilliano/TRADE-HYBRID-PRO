import { BrokerService, BrokerCredentials } from './broker-connection-service';
import { AlpacaService } from './alpaca-service';
import { AlpacaBrokerService } from './alpaca-broker-service';
import { MockTradingService } from './mock-trading-service';

// Environment flag to control using mock service (can be set in .env)
const USE_MOCK_SERVICE = process.env.USE_MOCK_SERVICE === 'true';

/**
 * Factory for creating broker service instances
 */
export class BrokerFactory {
  /**
   * Create a broker service instance based on type and credentials
   */
  static createBrokerService(
    brokerType: 'alpaca' | 'alpaca-broker' | 'mock',
    credentials?: BrokerCredentials,
    options?: any
  ): BrokerService {
    // If mock flag is set, always use mock service
    if (USE_MOCK_SERVICE) {
      console.log('Using mock trading service (forced by environment flag)');
      return new MockTradingService(credentials?.accountId);
    }

    try {
      switch (brokerType) {
        case 'alpaca':
          const alpacaService = new AlpacaService(credentials || {
            apiKey: process.env.ALPACA_API_KEY || '',
            secretKey: process.env.ALPACA_API_SECRET || '',
            accountId: ''
          }, {
            isPaper: options?.isPaper !== false
          });
          return alpacaService;
          
        case 'alpaca-broker':
          // Note: AlpacaBrokerService doesn't fully implement BrokerService interface yet
          // We would need to create an adapter class
          const mockBrokerService = new MockTradingService(credentials?.accountId);
          return mockBrokerService;
          
        case 'mock':
        default:
          return new MockTradingService(credentials?.accountId);
      }
    } catch (error) {
      console.error(`Error creating ${brokerType} service:`, error);
      console.log(`Falling back to mock trading service due to error`);
      
      // Fallback to mock service when an error occurs
      return new MockTradingService(credentials?.accountId);
    }
  }

  /**
   * Attempt to connect to broker service
   */
  static async testConnection(
    brokerType: 'alpaca' | 'alpaca-broker' | 'mock',
    credentials?: BrokerCredentials,
    options?: any
  ): Promise<boolean> {
    try {
      const service = this.createBrokerService(brokerType, credentials, options);
      
      if (typeof service.validateCredentials === 'function') {
        return await service.validateCredentials();
      } else {
        return await service.initialize().then(() => true).catch(() => false);
      }
    } catch (error) {
      console.error(`Error testing connection to ${brokerType}:`, error);
      return false;
    }
  }
}