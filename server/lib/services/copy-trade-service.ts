
import { db } from '../db';
import { eq, and } from 'drizzle-orm';
import { users, trades, copyTradeSettings } from '../../../shared/schema';
import type { Trade } from '../../../shared/schema';

export class CopyTradeService {
  // Add a trader to available copy traders list
  async addCopyTrader(userId: number, settings: any) {
    return await db.insert(copyTradeSettings).values({
      userId,
      isAvailable: true,
      maxFollowers: settings.maxFollowers || 100,
      profitShare: settings.profitShare || 0,
      riskLevel: settings.riskLevel || 'medium',
      minCopyAmount: settings.minCopyAmount || 100,
      description: settings.description || ''
    });
  }

  // Get list of available traders
  async getAvailableCopyTraders() {
    return await db
      .select({
        id: users.id,
        username: users.username,
        avatar: users.avatar,
        settings: copyTradeSettings
      })
      .from(users)
      .innerJoin(copyTradeSettings, eq(users.id, copyTradeSettings.userId))
      .where(eq(copyTradeSettings.isAvailable, true));
  }

  // Copy a trade for followers
  async copyTradeForFollowers(trade: Trade) {
    // Get all followers of the trader
    const followers = await db
      .select()
      .from(copyTradeSettings)
      .where(eq(copyTradeSettings.followingId, trade.userId));

    // Copy trade for each follower based on their settings
    for (const follower of followers) {
      const scaledQuantity = trade.quantity * (follower.riskMultiplier || 1);
      
      await db.insert(trades).values({
        userId: follower.userId,
        symbol: trade.symbol,
        side: trade.side,
        quantity: scaledQuantity,
        entryPrice: trade.entryPrice,
        leverage: trade.leverage,
        copiedFromId: trade.id
      });
    }
  }
}

export const copyTradeService = new CopyTradeService();
