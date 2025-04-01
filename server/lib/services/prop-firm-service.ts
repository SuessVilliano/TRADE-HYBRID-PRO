import { db } from '../../storage';
import { 
  challenges, 
  accounts,
  trades,
  metrics,
  payouts
} from '../../../shared/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

/**
 * Service for prop firm functionality
 */
export class PropFirmService {
  /**
   * Get all challenges
   */
  async getAllChallenges() {
    return db
      .select()
      .from(challenges)
      .where(eq(challenges.isActive, true))
      .orderBy(challenges.accountSize);
  }

  /**
   * Get challenge by ID
   */
  async getChallengeById(id: number) {
    const result = await db
      .select()
      .from(challenges)
      .where(eq(challenges.id, id))
      .limit(1);
    
    return result.length > 0 ? result[0] : null;
  }

  /**
   * Create a new challenge
   */
  async createChallenge(data: any) {
    const result = await db
      .insert(challenges)
      .values({
        name: data.name,
        description: data.description,
        accountSize: data.accountSize,
        targetProfitPhase1: data.targetProfitPhase1,
        targetProfitPhase2: data.targetProfitPhase2,
        maxDailyDrawdown: data.maxDailyDrawdown,
        maxTotalDrawdown: data.maxTotalDrawdown,
        durationDays: data.durationDays,
        minTradingDays: data.minTradingDays,
        brokerTypeId: data.brokerTypeId,
        isActive: data.isActive ?? true,
        createdAt: new Date()
      })
      .returning();
    
    return result[0];
  }

  /**
   * Update a challenge
   */
  async updateChallenge(id: number, data: any) {
    const result = await db
      .update(challenges)
      .set({
        name: data.name,
        description: data.description,
        accountSize: data.accountSize,
        targetProfitPhase1: data.targetProfitPhase1,
        targetProfitPhase2: data.targetProfitPhase2,
        maxDailyDrawdown: data.maxDailyDrawdown,
        maxTotalDrawdown: data.maxTotalDrawdown,
        durationDays: data.durationDays,
        minTradingDays: data.minTradingDays,
        brokerTypeId: data.brokerTypeId,
        isActive: data.isActive,
        updatedAt: new Date()
      })
      .where(eq(challenges.id, id))
      .returning();
    
    return result.length > 0 ? result[0] : null;
  }

  /**
   * Delete a challenge
   */
  async deleteChallenge(id: number) {
    const result = await db
      .delete(challenges)
      .where(eq(challenges.id, id))
      .returning({ id: challenges.id });
    
    return result.length > 0;
  }

  /**
   * Sign up for a challenge
   */
  async signUpForChallenge(userId: number, challengeId: number, accountName: string) {
    // Get the challenge
    const challenge = await this.getChallengeById(challengeId);
    
    if (!challenge) {
      throw new Error('Challenge not found');
    }
    
    if (!challenge.active) {
      throw new Error('Challenge is not active');
    }
    
    // Check if user has the required membership level
    const userResult = await db
      .select({
        id: users.id,
        membershipLevel: users.membershipLevel,
        membershipExpirationDate: users.membershipExpirationDate
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    if (!userResult.length) {
      throw new Error('User not found');
    }
    
    const user = userResult[0];
    const membershipLevel = user.membershipLevel || 'free';
    const membershipExpired = user.membershipExpirationDate && 
                              new Date(user.membershipExpirationDate) < new Date();
    
    // Get the required membership level for the challenge
    const requiredLevel = challenge.membershipLevelRequired || 'yearly';
    
    // Check membership access
    const membershipOrder = ['free', 'monthly', 'yearly', 'lifetime'];
    const requiredLevelIndex = membershipOrder.indexOf(requiredLevel);
    const userLevelIndex = membershipOrder.indexOf(membershipLevel);
    
    if (membershipExpired || userLevelIndex < requiredLevelIndex) {
      throw new Error(`This challenge requires a ${requiredLevel} membership or higher`);
    }
    
    // Create an account for the challenge based on the challenge type
    const result = await db
      .insert(accounts)
      .values({
        userId,
        challengeId,
        accountName,
        accountType: 'challenge_phase1',
        marketType: challenge.marketType,
        brokerModel: challenge.brokerModel,
        accountSize: challenge.accountSize,
        currentBalance: challenge.accountSize,
        currentEquity: challenge.accountSize,
        highWatermark: challenge.accountSize,
        profitTarget: challenge.targetProfitPhase1,
        maxDailyDrawdown: challenge.maxDailyDrawdown,
        maxTotalDrawdown: challenge.maxTotalDrawdown,
        maxDailyLoss: challenge.maxDailyLoss,
        startDate: new Date(),
        status: 'active',
        tradingAllowed: true,
        tradingDaysCount: 0,
        tradesCount: 0,
        winningTradesCount: 0,
        losingTradesCount: 0,
        profitSplit: 0, // No profit split during challenge
        tags: [challenge.marketType, challenge.brokerModel, `${challenge.accountSize}`],
        createdAt: new Date()
      })
      .returning();
    
    // Update user status to indicate they're participating in a prop firm challenge
    await db
      .update(users)
      .set({
        isPropTrader: true,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
    
    return result[0];
  }

  /**
   * Get user's accounts
   */
  async getUserAccounts(userId: number) {
    return db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, userId))
      .orderBy(desc(accounts.createdAt));
  }

  /**
   * Get all accounts (admin only)
   */
  async getAllAccounts() {
    return db
      .select()
      .from(accounts)
      .orderBy(desc(accounts.createdAt));
  }

  /**
   * Get account by ID
   */
  async getAccountById(id: number) {
    const result = await db
      .select()
      .from(accounts)
      .where(eq(accounts.id, id))
      .limit(1);
    
    if (result.length === 0) {
      return null;
    }
    
    const account = result[0];
    
    // If account has a challenge, load it
    if (account.challengeId) {
      const challenge = await this.getChallengeById(account.challengeId);
      if (challenge) {
        account.challenge = challenge;
      }
    }
    
    return account;
  }

  /**
   * Update an account
   */
  async updateAccount(id: number, data: any) {
    const result = await db
      .update(accounts)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(accounts.id, id))
      .returning();
    
    return result.length > 0 ? result[0] : null;
  }

  /**
   * Get account trades
   */
  async getAccountTrades(accountId: number) {
    return db
      .select()
      .from(trades)
      .where(eq(trades.accountId, accountId))
      .orderBy(desc(trades.entryTimestamp));
  }

  /**
   * Get trade by ID
   */
  async getTradeById(id: number) {
    const result = await db
      .select()
      .from(trades)
      .where(eq(trades.id, id))
      .limit(1);
    
    return result.length > 0 ? result[0] : null;
  }

  /**
   * Add a trade to an account
   */
  async addTrade(accountId: number, data: any) {
    // Get the account to verify it exists
    const account = await this.getAccountById(accountId);
    
    if (!account) {
      throw new Error('Account not found');
    }
    
    // Create the trade
    const result = await db
      .insert(trades)
      .values({
        accountId,
        symbol: data.symbol,
        direction: data.direction,
        entryPrice: data.entryPrice,
        exitPrice: data.exitPrice,
        quantity: data.quantity,
        profit: data.profit,
        active: data.active ?? true,
        entryTimestamp: data.entryTimestamp ? new Date(data.entryTimestamp) : new Date(),
        exitTimestamp: data.exitTimestamp ? new Date(data.exitTimestamp) : null,
        createdAt: new Date()
      })
      .returning();
    
    const trade = result[0];
    
    // If the trade is closed (has profit info), update the account balance
    if (!trade.active && trade.profit !== null && trade.profit !== undefined) {
      await this.updateAccount(accountId, {
        currentBalance: account.currentBalance + trade.profit
      });
    }
    
    return trade;
  }

  /**
   * Update a trade
   */
  async updateTrade(id: number, data: any) {
    // First get the original trade
    const originalTrade = await this.getTradeById(id);
    
    if (!originalTrade) {
      throw new Error('Trade not found');
    }
    
    // Get the account
    const account = await this.getAccountById(originalTrade.accountId);
    
    if (!account) {
      throw new Error('Account not found');
    }
    
    // Update the trade
    const result = await db
      .update(trades)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(trades.id, id))
      .returning();
    
    const updatedTrade = result[0];
    
    // If the trade status changed from active to closed, update account balance
    if (originalTrade.active && !updatedTrade.active && 
        updatedTrade.profit !== null && updatedTrade.profit !== undefined) {
      await this.updateAccount(updatedTrade.accountId, {
        currentBalance: account.currentBalance + updatedTrade.profit
      });
    }
    
    // If profit was updated for a closed trade, adjust the account balance
    if (!originalTrade.active && !updatedTrade.active && 
        originalTrade.profit !== updatedTrade.profit &&
        updatedTrade.profit !== null && updatedTrade.profit !== undefined && 
        originalTrade.profit !== null && originalTrade.profit !== undefined) {
      const profitDifference = updatedTrade.profit - originalTrade.profit;
      await this.updateAccount(updatedTrade.accountId, {
        currentBalance: account.currentBalance + profitDifference
      });
    }
    
    return updatedTrade;
  }

  /**
   * Get account metrics
   */
  async getAccountMetrics(accountId: number, startDate?: Date, endDate?: Date) {
    let query = db
      .select()
      .from(metrics)
      .where(eq(metrics.accountId, accountId));
    
    if (startDate && endDate) {
      query = query.where(
        and(
          gte(metrics.date, startDate),
          lte(metrics.date, endDate)
        )
      );
    }
    
    return query.orderBy(metrics.date);
  }

  /**
   * Add a daily metric
   */
  async addMetric(accountId: number, data: any) {
    // Check if metric already exists for this date
    const existingMetrics = await db
      .select()
      .from(metrics)
      .where(
        and(
          eq(metrics.accountId, accountId),
          eq(metrics.date, new Date(data.date))
        )
      );
    
    if (existingMetrics.length > 0) {
      // Update existing metric
      const result = await db
        .update(metrics)
        .set({
          ...data,
          updatedAt: new Date()
        })
        .where(
          and(
            eq(metrics.accountId, accountId),
            eq(metrics.date, new Date(data.date))
          )
        )
        .returning();
      
      return result[0];
    } else {
      // Create new metric
      const result = await db
        .insert(metrics)
        .values({
          accountId,
          date: new Date(data.date),
          balance: data.balance,
          equity: data.equity,
          dailyPnl: data.dailyPnl,
          dailyPnlPercent: data.dailyPnlPercent,
          drawdown: data.drawdown,
          drawdownPercent: data.drawdownPercent,
          totalTrades: data.totalTrades,
          winningTrades: data.winningTrades,
          losingTrades: data.losingTrades,
          winRate: data.winRate,
          createdAt: new Date()
        })
        .returning();
      
      return result[0];
    }
  }

  /**
   * Get account payouts
   */
  async getAccountPayouts(accountId: number) {
    return db
      .select()
      .from(payouts)
      .where(eq(payouts.accountId, accountId))
      .orderBy(desc(payouts.requestedAt));
  }

  /**
   * Request a payout
   */
  async requestPayout(accountId: number, amount: number, paymentMethod: string) {
    const account = await this.getAccountById(accountId);
    
    if (!account) {
      throw new Error('Account not found');
    }
    
    // Determine trade period (last month)
    const now = new Date();
    const tradePeriodEnd = new Date(now);
    const tradePeriodStart = new Date(now);
    tradePeriodStart.setMonth(tradePeriodStart.getMonth() - 1);
    
    // Create the payout request
    const result = await db
      .insert(payouts)
      .values({
        accountId,
        amount,
        status: 'pending',
        tradePeriodStart,
        tradePeriodEnd,
        paymentMethod,
        requestedAt: now,
        createdAt: now
      })
      .returning();
    
    return result[0];
  }

  /**
   * Update payout status
   */
  async updatePayoutStatus(payoutId: number, status: string) {
    const result = await db
      .update(payouts)
      .set({
        status,
        processedAt: status !== 'pending' ? new Date() : undefined,
        updatedAt: new Date()
      })
      .where(eq(payouts.id, payoutId))
      .returning();
    
    return result.length > 0 ? result[0] : null;
  }

  /**
   * Evaluate a challenge
   */
  async evaluateChallenge(accountId: number) {
    const account = await this.getAccountById(accountId);
    
    if (!account) {
      throw new Error('Account not found');
    }
    
    // Get challenge details if this is a challenge account
    if (!account.accountType.startsWith('challenge_') || !account.challengeId) {
      throw new Error('This account is not a challenge');
    }
    
    const challenge = await this.getChallengeById(account.challengeId);
    
    if (!challenge) {
      throw new Error('Challenge details not found');
    }
    
    // Get all trades
    const accountTrades = await this.getAccountTrades(accountId);
    
    // Calculate performance metrics
    const currentProfit = account.currentBalance - account.accountSize;
    const profitPercent = (currentProfit / account.accountSize) * 100;
    const requiredProfit = account.profitTarget || 0;
    
    // Check if account is in drawdown
    const drawdownPercent = ((account.accountSize - account.currentBalance) / account.accountSize) * 100;
    const isInDrawdown = account.currentBalance < account.accountSize;
    
    // Check phase 1 requirements
    if (account.accountType === 'challenge_phase1') {
      // Check if profit target is reached
      if (profitPercent >= requiredProfit) {
        // If this is a two-phase challenge and phase 2 is defined
        if (challenge.targetProfitPhase2) {
          // Promote to phase 2
          await this.updateAccount(accountId, {
            accountType: 'challenge_phase2',
            currentBalance: challenge.accountSize, // Reset balance for phase 2
            profitTarget: challenge.targetProfitPhase2,
            startDate: new Date() // Reset start date
          });
          
          return { 
            passed: true, 
            message: `Congratulations! You've completed Phase 1 of the challenge. You've been moved to Phase 2 with a new profit target of ${challenge.targetProfitPhase2}%.`,
            newPhase: 'challenge_phase2'
          };
        } else {
          // One-phase challenge, promote directly to funded
          await this.updateAccount(accountId, {
            accountType: 'funded',
            profitTarget: null, // No profit target for funded accounts
            profitSplit: 80, // 80% profit split
            status: 'funded'
          });
          
          return { 
            passed: true, 
            message: `Congratulations! You've completed the challenge. Your account is now a funded account with an 80% profit split.`,
            newPhase: 'funded'
          };
        }
      } else if (isInDrawdown && drawdownPercent > (account.maxTotalDrawdown || 0)) {
        // Failed due to drawdown
        await this.updateAccount(accountId, {
          status: 'failed',
          tradingAllowed: false
        });
        
        return {
          passed: false,
          message: `Challenge failed due to exceeding maximum drawdown. Your drawdown: ${drawdownPercent.toFixed(2)}%, Maximum allowed: ${account.maxTotalDrawdown}%.`
        };
      } else {
        // Still in progress
        return {
          passed: false,
          message: `Challenge in progress. Current profit: ${profitPercent.toFixed(2)}%, Target: ${requiredProfit}%.`
        };
      }
    } 
    // Check phase 2 requirements
    else if (account.accountType === 'challenge_phase2') {
      // Check if profit target is reached
      if (profitPercent >= requiredProfit) {
        // Promote to funded
        await this.updateAccount(accountId, {
          accountType: 'funded',
          profitTarget: null, // No profit target for funded accounts
          profitSplit: 80, // 80% profit split
          status: 'funded'
        });
        
        return { 
          passed: true, 
          message: `Congratulations! You've completed both phases of the challenge. Your account is now a funded account with an 80% profit split.`,
          newPhase: 'funded'
        };
      } else if (isInDrawdown && drawdownPercent > (account.maxTotalDrawdown || 0)) {
        // Failed due to drawdown
        await this.updateAccount(accountId, {
          status: 'failed',
          tradingAllowed: false
        });
        
        return {
          passed: false,
          message: `Challenge failed due to exceeding maximum drawdown. Your drawdown: ${drawdownPercent.toFixed(2)}%, Maximum allowed: ${account.maxTotalDrawdown}%.`
        };
      } else {
        // Still in progress
        return {
          passed: false,
          message: `Phase 2 in progress. Current profit: ${profitPercent.toFixed(2)}%, Target: ${requiredProfit}%.`
        };
      }
    }
    
    // Should not get here
    return {
      passed: false,
      message: 'Invalid account type for evaluation.'
    };
  }
}