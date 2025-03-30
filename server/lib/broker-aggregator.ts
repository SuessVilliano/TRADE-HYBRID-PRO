
import { BrokerConfig, OrderRequest, OrderResponse } from '../../shared/schema';

export class BrokerAggregator {
  private brokers: BrokerConfig[] = [];
  private static instance: BrokerAggregator;

  constructor() {
    // Initialize with empty broker list
  }

  static getInstance(): BrokerAggregator {
    if (!BrokerAggregator.instance) {
      BrokerAggregator.instance = new BrokerAggregator();
    }
    return BrokerAggregator.instance;
  }

  addBroker(broker: BrokerConfig) {
    this.brokers.push(broker);
  }

  getBrokers() {
    return this.brokers;
  }

  async executeTrade(order: OrderRequest): Promise<OrderResponse> {
    // Implement trade execution logic here
    return {
      orderId: 'simulated-order-id',
      status: 'filled',
      message: 'Order filled successfully'
    };
  }
}

// Export both the class and a singleton instance
export const brokerAggregator = BrokerAggregator.getInstance();
export default brokerAggregator;
