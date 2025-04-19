import { config } from '../config';
import { AlpacaService } from './alpaca-service';
import { AlpacaBrokerService } from './alpaca-broker-service';
import { BrokerService } from './broker-service';
import { MockBrokerService } from './mock-broker-service';

// Flag to control using mock service
const USE_MOCK_SERVICE = config.USE_MOCK_SERVICE === 'true';

/**
 * Factory for creating broker service instances on the client
 */
export class BrokerFactory {
  /**
   * Create a broker service instance based on type
   */
  static createBrokerService(brokerType: 'alpaca' | 'alpaca-broker' | 'mock'): BrokerService {
    // If mock flag is enabled, always use mock service
    if (USE_MOCK_SERVICE) {
      console.log('Using mock broker service (forced by configuration flag)');
      return new MockBrokerService();
    }

    try {
      switch (brokerType) {
        case 'alpaca':
          return new AlpacaService(
            config.ALPACA_API_KEY,
            config.ALPACA_API_SECRET,
            true
          );
          
        case 'alpaca-broker':
          // Note: AlpacaBrokerService doesn't fully implement BrokerService interface
          // So we need to use a wrapper or adapter
          return new MockBrokerService(); // Temporary while we implement proper adapter
          
        case 'mock':
        default:
          return new MockBrokerService();
      }
    } catch (error) {
      console.error(`Error creating ${brokerType} service:`, error);
      console.log('Falling back to mock broker service due to error');
      
      // Fallback to mock service when an error occurs
      return new MockBrokerService();
    }
  }
}