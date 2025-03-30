
import { prisma } from '../db';
import { BrokerService } from './broker-service';
import { SignalService } from './signal-service';

export class CopyTradeService {
  constructor(
    private brokerService: BrokerService,
    private signalService: SignalService
  ) {}

  async setupCopyTrading(followerId: string, leaderId: string) {
    return prisma.copyTrade.create({
      data: {
        followerId,
        leaderId,
        status: 'active'
      }
    });
  }

  async processCopyTrade(tradeSignal: any) {
    const followers = await prisma.copyTrade.findMany({
      where: {
        leaderId: tradeSignal.userId,
        status: 'active'
      }
    });

    for (const follower of followers) {
      await this.brokerService.executeTrade({
        userId: follower.followerId,
        symbol: tradeSignal.symbol,
        side: tradeSignal.side,
        quantity: tradeSignal.quantity,
        type: 'MARKET'
      });
    }
  }

  async getLeaderboard() {
    return prisma.user.findMany({
      where: { isLeader: true },
      select: {
        id: true,
        name: true,
        winRate: true,
        totalPnL: true,
        followers: true
      },
      orderBy: { totalPnL: 'desc' }
    });
  }
}
