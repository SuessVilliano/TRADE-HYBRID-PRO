
import { BrokerService } from './broker-service';
import { InternalBankService } from './internal-bank-service';
import { TradeLockerService } from './tradelocker-service';
import { AlpacaService } from './alpaca-service';

export class BrokerOrchestrator {
  private brokers: Map<string, BrokerService>;
  private internalBank: InternalBankService;

  constructor() {
    this.brokers = new Map();
    this.internalBank = new InternalBankService();
  }

  // Execute trade across selected broker
  async executeTrade(userId: string, order: any, preferredBroker?: string) {
    // Validate internal funds first
    const hasBalance = await this.internalBank.validateFunds(userId, order.amount);
    if (!hasBalance) {
      throw new Error('Insufficient funds in internal account');
    }

    // Select best broker if none specified
    const broker = preferredBroker ? 
      this.brokers.get(preferredBroker) : 
      await this.selectBestBroker(order);

    // Execute trade through broker
    const result = await broker.submitOrder(order);
    
    // Update internal balance
    if (result.success) {
      await this.internalBank.updateBalance(
        userId, 
        result.newBalance
      );
    }

    return result;
  }

  // Select best broker based on scoring
  private async selectBestBroker(order: any) {
    let bestScore = -1;
    let bestBroker: BrokerService | null = null;

    for (const broker of this.brokers.values()) {
      const score = await this.scoreBroker(broker, order);
      if (score > bestScore) {
        bestScore = score;
        bestBroker = broker;
      }
    }

    if (!bestBroker) {
      throw new Error('No suitable broker found');
    }

    return bestBroker;
  }

  private async scoreBroker(broker: BrokerService, order: any) {
    const metrics = await broker.getMetrics();
    
    // Score based on:
    // - Execution speed
    // - Success rate
    // - Fees
    // - Liquidity
    return (
      metrics.executionSpeed * 0.3 +
      metrics.successRate * 0.3 +
      metrics.feeScore * 0.2 +
      metrics.liquidity * 0.2
    );
  }
}
