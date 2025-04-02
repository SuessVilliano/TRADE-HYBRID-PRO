import { randomUUID } from 'crypto';
import { AlpacaService } from './alpaca-service';
import { BrokerCredentials } from './broker-connection-service';
import axios from 'axios';

/**
 * Mock service for prop firm functionality during development
 * This provides placeholder data to support UI elements without requiring backend database functionality
 */
export class MockPropFirmService {
  // Make alpacaService public so it can be accessed from routes
  public alpacaService: AlpacaService | null = null;

  /**
   * Initialize the connection to Alpaca broker API
   */
  async initAlpacaBroker(): Promise<boolean> {
    try {
      if (this.alpacaService) {
        // Already initialized
        return true;
      }
      
      // Use the environment variables for API credentials
      const alpacaApiKey = process.env.ALPACA_API_KEY;
      const alpacaApiSecret = process.env.ALPACA_API_SECRET;
      
      if (!alpacaApiKey || !alpacaApiSecret) {
        throw new Error('Alpaca API credentials not found in environment variables');
      }
      
      const credentials: BrokerCredentials = {
        apiKey: alpacaApiKey,
        secretKey: alpacaApiSecret,
        accountId: ''
      };

      // Create the Alpaca service
      this.alpacaService = new AlpacaService(credentials, {
        isPaper: true
      });

      // Make a real API call to test connection
      try {
        console.log('Testing Alpaca API connection with credentials:', { 
          apiKey: credentials.apiKey ? credentials.apiKey.substring(0, 4) + '...' : 'undefined',
          secretKeyLength: credentials.secretKey ? credentials.secretKey.length : 0
        });
        
        // Use the AlpacaService to validate credentials
        try {
          await this.alpacaService.validateCredentials();
          console.log('Successfully connected to Alpaca broker API');
          return true;
        } catch (validationError) {
          console.error('Alpaca API credential validation failed:', validationError);
          throw new Error('Invalid Alpaca API credentials');
        }
      } catch (err) {
        console.error('Error testing Alpaca API connection:', err);
        throw err; // Rethrow to signal connection failure
      }
    } catch (error) {
      console.error('Failed to create Alpaca broker service:', error);
      return false;
    }
  }

  /**
   * Get account data from the broker
   */
  async getBrokerAccountData(brokerModel: string): Promise<any> {
    if (brokerModel === 'alpaca') {
      // Initialize broker if not already initialized
      if (!this.alpacaService) {
        await this.initAlpacaBroker();
      }

      try {
        // Try to get real account data from Alpaca API
        console.log('Fetching real account data from Alpaca broker');
        const accountInfo = await this.alpacaService?.getAccountInfo();
        
        if (!accountInfo) {
          throw new Error('Failed to get Alpaca account info');
        }
        
        // Transform the data into our format - using type assertion for the Alpaca API response
        // which may have different structure than our internal BrokerAccountInfo
        const rawInfo = accountInfo as any;
        
        return {
          accountId: rawInfo.id || 'unknown',
          balance: parseFloat(rawInfo.cash || '0'),
          equity: parseFloat(rawInfo.equity || '0'),
          unrealizedPnl: parseFloat(rawInfo.equity || '0') - parseFloat(rawInfo.cash || '0'),
          buyingPower: parseFloat(rawInfo.buying_power || '0'),
          currency: rawInfo.currency || 'USD',
          extra: {
            daytradeCount: rawInfo.daytrade_count || 0,
            daytradeLimit: rawInfo.daytrading_buying_power ? 4 : 0,
            tradeSuspendedByUser: rawInfo.trade_suspended_by_user || false,
            tradingBlocked: rawInfo.trading_blocked || false,
            transfersBlocked: rawInfo.transfers_blocked || false,
            accountBlocked: rawInfo.account_blocked || false,
            status: rawInfo.status || 'ACTIVE',
            createdAt: rawInfo.created_at || new Date().toISOString()
          }
        };
      } catch (error) {
        // Log the error but return fallback data 
        console.error('Error fetching real Alpaca account data:', error);
        console.log('Using fallback account data for Alpaca broker due to API connection error');
        
        // Return fallback data structure
        return {
          accountId: 'alpaca-account',
          balance: 25000,
          equity: 26500,
          unrealizedPnl: 1500,
          buyingPower: 50000,
          currency: 'USD',
          extra: {
            daytradeCount: 1,
            daytradeLimit: 3,
            tradeSuspendedByUser: false,
            tradingBlocked: false,
            transfersBlocked: false,
            accountBlocked: false,
            status: 'ACTIVE',
            createdAt: new Date().toISOString()
          }
        };
      }
    }

    // Return mock data for other brokers
    return {
      accountId: 'mock-account-id',
      balance: 10000,
      equity: 10000,
      margin: 0,
      buyingPower: 10000,
      currency: 'USD'
    };
  }
  private mockChallenges = [
    {
      id: 1,
      name: 'Futures Challenge - Standard',
      description: 'Trade futures with standard risk parameters. Meet the 10% profit target while keeping drawdown below 5%.',
      marketType: 'futures',
      brokerModel: 'ninjatrader',
      accountSizes: [25000, 50000, 100000],
      phases: 2,
      targetProfitPhase1: 10,
      targetProfitPhase2: 5,
      maxDailyDrawdown: 3,
      maxTotalDrawdown: 5,
      minTradingDays: 5,
      maxTradingDays: 30,
      durationDays: 30,
      profitSplit: 80,
      price: 299,
      active: true,
      customRules: {
        allowWeekendTrading: false,
        requiredSymbols: ['ES', 'NQ', 'CL'],
        disallowedSymbols: [],
        maxPositionSize: 5
      },
      createdAt: new Date('2024-01-15')
    },
    {
      id: 2,
      name: 'Forex Challenge - Pro',
      description: 'Trade forex with advanced parameters for experienced traders. Achieve 10% profit while maintaining strict risk control.',
      marketType: 'forex',
      brokerModel: 'oanda',
      accountSizes: [10000, 25000, 50000],
      phases: 2,
      targetProfitPhase1: 10,
      targetProfitPhase2: 6,
      maxDailyDrawdown: 3,
      maxTotalDrawdown: 5,
      minTradingDays: 5,
      maxTradingDays: 60,
      durationDays: 60,
      profitSplit: 80,
      price: 249,
      active: true,
      customRules: {
        allowWeekendTrading: false,
        requiredSymbols: [],
        disallowedSymbols: ['XAUUSD'],
        maxLeverage: 30
      },
      createdAt: new Date('2024-02-10')
    },
    {
      id: 3,
      name: 'Crypto Challenge - Elite',
      description: 'Trade crypto with enhanced risk parameters. Reach 10% profit target within 45 days with 5% max drawdown.',
      marketType: 'crypto',
      brokerModel: 'alpaca',
      accountSizes: [5000, 10000, 25000],
      phases: 1,
      targetProfitPhase1: 10,
      targetProfitPhase2: null,
      maxDailyDrawdown: 3,
      maxTotalDrawdown: 5,
      minTradingDays: 3,
      maxTradingDays: 45,
      durationDays: 45,
      profitSplit: 85,
      price: 199,
      active: true,
      customRules: {
        allowWeekendTrading: true,
        requiredSymbols: [],
        disallowedSymbols: [],
        maxPositionSize: 10
      },
      createdAt: new Date('2024-03-05')
    },
    {
      id: 4,
      name: 'Stock Trading Challenge',
      description: 'Trade stocks with our capital. Meet the 10% profit target while maintaining a maximum 5% drawdown.',
      marketType: 'stocks',
      brokerModel: 'tradehybrid',
      accountSizes: [10000, 25000, 50000, 100000],
      phases: 1,
      targetProfitPhase1: 10,
      targetProfitPhase2: null,
      maxDailyDrawdown: 3,
      maxTotalDrawdown: 5,
      minTradingDays: 5,
      maxTradingDays: 30,
      durationDays: 30,
      profitSplit: 85,
      price: 249,
      active: true,
      customRules: {
        allowWeekendTrading: false,
        requiredSymbols: [],
        disallowedSymbols: [],
        maxPositionSize: 10
      },
      createdAt: new Date('2024-04-01')
    }
  ];

  public mockAccounts = [
    {
      id: 1,
      userId: 1,
      challengeId: 1,
      accountName: 'Futures Challenge Account - Phase 1',
      accountType: 'challenge_phase1',
      marketType: 'futures',
      brokerModel: 'ninjatrader',
      accountSize: 50000,
      currentBalance: 52500,
      currentEquity: 52700,
      profitTarget: 10,
      maxDailyDrawdown: 3,
      maxTotalDrawdown: 5,
      minTradingDays: 5,
      maxTradingDays: 30,
      tradingAllowed: true,
      status: 'active',
      startDate: new Date('2024-03-20'),
      endDate: new Date('2024-04-20'),
      createdAt: new Date('2024-03-20')
    },
    {
      id: 2,
      userId: 1,
      challengeId: 2,
      accountName: 'Forex Challenge Account - Phase 2',
      accountType: 'challenge_phase2',
      marketType: 'forex',
      brokerModel: 'oanda',
      accountSize: 25000,
      currentBalance: 26200,
      currentEquity: 26300,
      profitTarget: 6,
      maxDailyDrawdown: 5,
      maxTotalDrawdown: 5,
      minTradingDays: 5,
      maxTradingDays: 60,
      tradingAllowed: true,
      status: 'active',
      startDate: new Date('2024-03-10'),
      endDate: new Date('2024-05-10'),
      createdAt: new Date('2024-02-10')
    },
    {
      id: 3,
      userId: 1,
      challengeId: 3,
      accountName: 'Crypto Funded Account',
      accountType: 'funded',
      marketType: 'crypto',
      brokerModel: 'alpaca',
      accountSize: 10000,
      currentBalance: 12500,
      currentEquity: 12700,
      profitTarget: null,
      profitSplit: 85,
      maxDailyDrawdown: 8,
      maxTotalDrawdown: 5,
      minTradingDays: null,
      maxTradingDays: null,
      tradingAllowed: true,
      status: 'funded',
      startDate: new Date('2024-02-15'),
      endDate: null,
      createdAt: new Date('2024-01-15')
    }
  ];

  private mockTrades = [
    {
      id: 1,
      propAccountId: 1,
      userId: 1,
      symbol: 'ES',
      side: 'buy',
      quantity: 2,
      entryPrice: 5200.50,
      exitPrice: 5230.75,
      profit: 60.50,
      profitPercent: 0.58,
      active: false,
      entryTimestamp: new Date('2024-03-25T09:30:00'),
      exitTimestamp: new Date('2024-03-25T11:45:00'),
      createdAt: new Date('2024-03-25T09:30:00')
    },
    {
      id: 2,
      propAccountId: 1,
      userId: 1,
      symbol: 'NQ',
      side: 'sell',
      quantity: 1,
      entryPrice: 18750.25,
      exitPrice: 18700.50,
      profit: 49.75,
      profitPercent: 0.27,
      active: false,
      entryTimestamp: new Date('2024-03-26T10:15:00'),
      exitTimestamp: new Date('2024-03-26T14:30:00'),
      createdAt: new Date('2024-03-26T10:15:00')
    },
    {
      id: 3,
      propAccountId: 2,
      userId: 1,
      symbol: 'EUR/USD',
      side: 'buy',
      quantity: 10000,
      entryPrice: 1.0850,
      exitPrice: 1.0875,
      profit: 25.00,
      profitPercent: 0.23,
      active: false,
      entryTimestamp: new Date('2024-03-15T08:00:00'),
      exitTimestamp: new Date('2024-03-15T16:30:00'),
      createdAt: new Date('2024-03-15T08:00:00')
    },
    {
      id: 4,
      propAccountId: 3,
      userId: 1,
      symbol: 'BTC/USD',
      side: 'buy',
      quantity: 0.25,
      entryPrice: 64500.00,
      exitPrice: 66200.00,
      profit: 425.00,
      profitPercent: 2.64,
      active: false,
      entryTimestamp: new Date('2024-03-10T12:00:00'),
      exitTimestamp: new Date('2024-03-12T09:15:00'),
      createdAt: new Date('2024-03-10T12:00:00')
    },
    {
      id: 5,
      propAccountId: 1,
      userId: 1,
      symbol: 'CL',
      side: 'sell',
      quantity: 1,
      entryPrice: 82.50,
      exitPrice: null,
      profit: null,
      profitPercent: null,
      active: true,
      entryTimestamp: new Date('2024-03-28T11:00:00'),
      exitTimestamp: null,
      createdAt: new Date('2024-03-28T11:00:00')
    }
  ];

  private mockMetrics = [
    {
      id: 1,
      propAccountId: 1,
      date: new Date('2024-03-24'),
      balance: 50000,
      equity: 50000,
      dailyPnl: 0,
      dailyPnlPercent: 0,
      drawdown: 0,
      drawdownPercent: 0,
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
      createdAt: new Date('2024-03-24')
    },
    {
      id: 2,
      propAccountId: 1,
      date: new Date('2024-03-25'),
      balance: 50060.50,
      equity: 50060.50,
      dailyPnl: 60.50,
      dailyPnlPercent: 0.12,
      drawdown: 0,
      drawdownPercent: 0,
      totalTrades: 1,
      winningTrades: 1,
      losingTrades: 0,
      winRate: 100,
      createdAt: new Date('2024-03-25')
    },
    {
      id: 3,
      propAccountId: 1,
      date: new Date('2024-03-26'),
      balance: 50110.25,
      equity: 50110.25,
      dailyPnl: 49.75,
      dailyPnlPercent: 0.10,
      drawdown: 0,
      drawdownPercent: 0,
      totalTrades: 1,
      winningTrades: 1,
      losingTrades: 0,
      winRate: 100,
      createdAt: new Date('2024-03-26')
    },
    {
      id: 4,
      propAccountId: 1,
      date: new Date('2024-03-27'),
      balance: 50110.25,
      equity: 50110.25,
      dailyPnl: 0,
      dailyPnlPercent: 0,
      drawdown: 0,
      drawdownPercent: 0,
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
      createdAt: new Date('2024-03-27')
    },
    {
      id: 5,
      propAccountId: 1,
      date: new Date('2024-03-28'),
      balance: 50110.25,
      equity: 49985.25,
      dailyPnl: -125,
      dailyPnlPercent: -0.25,
      drawdown: 125,
      drawdownPercent: 0.25,
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
      createdAt: new Date('2024-03-28')
    }
  ];

  private mockPayouts = [
    {
      id: 1,
      propAccountId: 3,
      userId: 1,
      amount: 850.00,
      status: 'completed',
      paymentMethod: 'crypto',
      tradePeriodStart: new Date('2024-02-15'),
      tradePeriodEnd: new Date('2024-03-15'),
      requestedAt: new Date('2024-03-16'),
      processedAt: new Date('2024-03-18'),
      createdAt: new Date('2024-03-16')
    },
    {
      id: 2,
      propAccountId: 3,
      userId: 1,
      amount: 400.00,
      status: 'pending',
      paymentMethod: 'bank_transfer',
      tradePeriodStart: new Date('2024-03-15'),
      tradePeriodEnd: new Date('2024-04-15'),
      requestedAt: new Date('2024-04-16'),
      processedAt: null,
      createdAt: new Date('2024-04-16')
    }
  ];

  /**
   * Get all challenges
   */
  async getAllChallenges() {
    return [...this.mockChallenges];
  }

  /**
   * Get challenge by ID
   */
  async getChallengeById(id: number) {
    return this.mockChallenges.find(challenge => challenge.id === id) || null;
  }

  /**
   * Create a new challenge
   */
  async createChallenge(data: any) {
    const newId = Math.max(...this.mockChallenges.map(c => c.id)) + 1;
    const newChallenge = {
      id: newId,
      ...data,
      createdAt: new Date()
    };
    this.mockChallenges.push(newChallenge);
    return newChallenge;
  }

  /**
   * Update a challenge
   */
  async updateChallenge(id: number, data: any) {
    const index = this.mockChallenges.findIndex(challenge => challenge.id === id);
    if (index === -1) {
      throw new Error('Challenge not found');
    }
    
    const updatedChallenge = {
      ...this.mockChallenges[index],
      ...data,
      id
    };
    
    this.mockChallenges[index] = updatedChallenge;
    return updatedChallenge;
  }

  /**
   * Delete a challenge
   */
  async deleteChallenge(id: number) {
    const index = this.mockChallenges.findIndex(challenge => challenge.id === id);
    if (index === -1) {
      throw new Error('Challenge not found');
    }
    
    const deletedChallenge = this.mockChallenges[index];
    this.mockChallenges.splice(index, 1);
    return deletedChallenge;
  }

  /**
   * Sign up for a challenge
   */
  async signUpForChallenge(userId: number, challengeId: number, accountName: string) {
    const challenge = await this.getChallengeById(challengeId);
    
    if (!challenge) {
      throw new Error('Challenge not found');
    }
    
    if (!challenge.active) {
      throw new Error('This challenge is not currently active');
    }
    
    // Use the first account size as default
    const accountSize = challenge.accountSizes[0];
    
    const newId = Math.max(...this.mockAccounts.map(a => a.id)) + 1;
    const newAccount = {
      id: newId,
      userId,
      challengeId,
      accountName,
      accountType: 'challenge_phase1',
      marketType: challenge.marketType,
      brokerModel: challenge.brokerModel,
      accountSize,
      currentBalance: accountSize,
      currentEquity: accountSize,
      profitTarget: challenge.targetProfitPhase1,
      maxDailyDrawdown: challenge.maxDailyDrawdown,
      maxTotalDrawdown: challenge.maxTotalDrawdown,
      minTradingDays: challenge.minTradingDays,
      maxTradingDays: challenge.maxTradingDays,
      tradingAllowed: true,
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + challenge.maxTradingDays * 24 * 60 * 60 * 1000),
      createdAt: new Date()
    };
    
    this.mockAccounts.push(newAccount);
    return newAccount;
  }

  /**
   * Get user's accounts
   */
  async getUserAccounts(userId: number) {
    return this.mockAccounts.filter(account => account.userId === userId);
  }

  /**
   * Get all accounts (admin only)
   */
  async getAllAccounts() {
    return [...this.mockAccounts];
  }

  /**
   * Get account by ID
   */
  async getAccountById(id: number) {
    const account = this.mockAccounts.find(account => account.id === id) || null;
    
    // If account is found and is an Alpaca account, try to get real data
    if (account && account.brokerModel === 'alpaca') {
      try {
        // Get real data from broker if available
        const brokerData = await this.getBrokerAccountData('alpaca');
        // Merge with mock data but preserve the account ID and structure
        if (brokerData) {
          return {
            ...account,
            brokerInfo: brokerData,
            currentBalance: brokerData.balance || account.currentBalance,
            currentEquity: brokerData.equity || account.currentEquity
          };
        }
      } catch (error) {
        console.error('Error fetching real broker data:', error);
        // Continue with mock data if error occurs
      }
    }
    
    return account;
  }

  /**
   * Update an account
   */
  async updateAccount(id: number, data: any) {
    const index = this.mockAccounts.findIndex(account => account.id === id);
    if (index === -1) {
      throw new Error('Account not found');
    }
    
    const updatedAccount = {
      ...this.mockAccounts[index],
      ...data,
      id
    };
    
    this.mockAccounts[index] = updatedAccount;
    return updatedAccount;
  }

  /**
   * Get account trades
   */
  async getAccountTrades(accountId: number) {
    // Return mock trades for all account types for now
    // Later we can enable connecting to real broker API when API credentials are fixed
    console.log('Using mock trades data for all broker types');
    
    // For now we'll always use mock data instead of trying to connect to the broker
    return this.mockTrades.filter(trade => trade.propAccountId === accountId);
  }

  /**
   * Get trade by ID
   */
  async getTradeById(id: number) {
    return this.mockTrades.find(trade => trade.id === id) || null;
  }

  /**
   * Add a trade to an account
   */
  async addTrade(accountId: number, data: any) {
    const account = await this.getAccountById(accountId);
    
    if (!account) {
      throw new Error('Account not found');
    }
    
    if (!account.tradingAllowed) {
      throw new Error('Trading is not allowed on this account');
    }
    
    // For Alpaca accounts, we'll use mock data for now
    // Later we can enable real broker integration when API credentials are fixed
    if (account.brokerModel === 'alpaca') {
      console.log('Using mock data for Alpaca order placement');
    }
    
    // Create the mock trade if not using broker or if broker order failed
    const newId = Math.max(...this.mockTrades.map(t => t.id)) + 1;
    const newTrade = {
      id: newId,
      propAccountId: accountId,
      userId: data.userId,
      symbol: data.symbol,
      side: data.direction || data.side,
      quantity: data.quantity,
      entryPrice: data.entryPrice,
      exitPrice: data.exitPrice,
      profit: data.profit,
      profitPercent: data.profitPercent,
      active: data.active ?? true,
      entryTimestamp: data.entryTimestamp ? new Date(data.entryTimestamp) : new Date(),
      exitTimestamp: data.exitTimestamp ? new Date(data.exitTimestamp) : null,
      createdAt: new Date(),
      brokerSource: false
    };
    
    this.mockTrades.push(newTrade);
    
    // If the trade is closed (has profit info), update the account balance
    if (!newTrade.active && newTrade.profit !== null && newTrade.profit !== undefined) {
      await this.updateAccount(accountId, {
        currentBalance: account.currentBalance + newTrade.profit
      });
    }
    
    return newTrade;
  }

  /**
   * Update a trade
   */
  async updateTrade(id: number, data: any) {
    // Get the original trade
    const originalTrade = await this.getTradeById(id);
    
    if (!originalTrade) {
      throw new Error('Trade not found');
    }
    
    // Get the account
    const account = await this.getAccountById(originalTrade.propAccountId);
    
    if (!account) {
      throw new Error('Account not found');
    }
    
    // Update the trade
    const index = this.mockTrades.findIndex(trade => trade.id === id);
    const updatedTrade = {
      ...this.mockTrades[index],
      ...data,
      id
    };
    
    this.mockTrades[index] = updatedTrade;
    
    // If the trade status changed from active to closed, update account balance
    if (originalTrade.active && !updatedTrade.active && 
        updatedTrade.profit !== null && updatedTrade.profit !== undefined) {
      await this.updateAccount(updatedTrade.propAccountId, {
        currentBalance: account.currentBalance + updatedTrade.profit
      });
    }
    
    // If profit was updated for a closed trade, adjust the account balance
    if (!originalTrade.active && !updatedTrade.active && 
        originalTrade.profit !== updatedTrade.profit &&
        updatedTrade.profit !== null && updatedTrade.profit !== undefined && 
        originalTrade.profit !== null && originalTrade.profit !== undefined) {
      const profitDifference = updatedTrade.profit - originalTrade.profit;
      await this.updateAccount(updatedTrade.propAccountId, {
        currentBalance: account.currentBalance + profitDifference
      });
    }
    
    return updatedTrade;
  }

  /**
   * Get account metrics
   */
  async getAccountMetrics(accountId: number, startDate?: Date, endDate?: Date) {
    let metrics = this.mockMetrics.filter(metric => metric.propAccountId === accountId);
    
    if (startDate && endDate) {
      metrics = metrics.filter(metric => 
        metric.date >= startDate && metric.date <= endDate
      );
    }
    
    return metrics.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  /**
   * Add a daily metric
   */
  async addMetric(accountId: number, data: any) {
    const metricDate = new Date(data.date);
    const existingIndex = this.mockMetrics.findIndex(metric => 
      metric.propAccountId === accountId && 
      metric.date.toDateString() === metricDate.toDateString()
    );
    
    if (existingIndex !== -1) {
      // Update existing metric
      const updatedMetric = {
        ...this.mockMetrics[existingIndex],
        ...data,
        updatedAt: new Date()
      };
      
      this.mockMetrics[existingIndex] = updatedMetric;
      return updatedMetric;
    } else {
      // Create new metric
      const newId = Math.max(...this.mockMetrics.map(m => m.id)) + 1;
      const newMetric = {
        id: newId,
        propAccountId: accountId,
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
      };
      
      this.mockMetrics.push(newMetric);
      return newMetric;
    }
  }

  /**
   * Get account payouts
   */
  async getAccountPayouts(accountId: number) {
    return this.mockPayouts
      .filter(payout => payout.propAccountId === accountId)
      .sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime());
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
    const newId = Math.max(...this.mockPayouts.map(p => p.id)) + 1;
    const newPayout = {
      id: newId,
      propAccountId: accountId,
      userId: account.userId,
      amount,
      status: 'pending',
      paymentMethod,
      tradePeriodStart,
      tradePeriodEnd,
      requestedAt: now,
      processedAt: null,
      createdAt: now
    };
    
    this.mockPayouts.push(newPayout);
    return newPayout;
  }

  /**
   * Update payout status
   */
  async updatePayoutStatus(payoutId: number, status: string) {
    const index = this.mockPayouts.findIndex(payout => payout.id === payoutId);
    
    if (index === -1) {
      return null;
    }
    
    const updatedPayout = {
      ...this.mockPayouts[index],
      status,
      processedAt: status !== 'pending' ? new Date() : null,
      updatedAt: new Date()
    };
    
    this.mockPayouts[index] = updatedPayout;
    return updatedPayout;
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
            currentBalance: account.accountSize, // Reset balance using the account's size
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