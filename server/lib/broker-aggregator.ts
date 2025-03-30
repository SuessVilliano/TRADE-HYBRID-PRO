
import { BrokerConfig } from '../../shared/schema';

export class BrokerAggregator {
  private brokers: BrokerConfig[] = [];

  constructor() {
    // Initialize with empty broker list
  }

  addBroker(broker: BrokerConfig) {
    this.brokers.push(broker);
  }

  getBrokers() {
    return this.brokers;
  }
}

export default new BrokerAggregator();
