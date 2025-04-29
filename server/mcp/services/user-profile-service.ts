/**
 * User Profile Service
 * 
 * Central service for managing all user-related data:
 * - User authentication and permissions
 * - Trading preferences and settings
 * - Broker connections
 * - Wallet information
 * - Trading history
 * - Signal subscriptions
 * - Custom signals
 * - Journal entries
 */

import { MCPServer } from '../core/mcp-server';
import { BrokerConnection } from '../adapters/broker-interface';
import { TradeSignal } from '../types/trade-signal';

/**
 * User Profile Service
 */
export class UserProfileService {
  private static instance: UserProfileService;
  private mcp: MCPServer;
  private userProfiles: Map<string, UserProfile> = new Map();
  private userBrokerConnections: Map<string, Map<string, BrokerConnection>> = new Map();
  private userSignals: Map<string, TradeSignal[]> = new Map();
  private userJournalEntries: Map<string, JournalEntry[]> = new Map();
  private userWallets: Map<string, UserWallet> = new Map();
  private userTrades: Map<string, TradeRecord[]> = new Map();
  
  private constructor(mcp: MCPServer) {
    this.mcp = mcp;
    console.log('User Profile Service initialized');
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(mcp: MCPServer): UserProfileService {
    if (!UserProfileService.instance) {
      UserProfileService.instance = new UserProfileService(mcp);
    }
    return UserProfileService.instance;
  }
  
  /**
   * Initialize the service
   */
  public async initialize(): Promise<void> {
    try {
      // Load user profiles from database
      await this.loadUserProfiles();
      
      // Set up event listeners for updates
      this.setupEventListeners();
      
      console.log('User Profile Service fully initialized');
    } catch (error) {
      console.error('Error initializing User Profile Service:', error);
    }
  }
  
  /**
   * Get a user profile by ID
   */
  public async getUserProfile(userId: string): Promise<UserProfile | null> {
    // Check if profile is cached
    if (this.userProfiles.has(userId)) {
      return this.userProfiles.get(userId) || null;
    }
    
    // If not in cache, try to load from database
    try {
      const profile = await this.loadUserProfileFromDatabase(userId);
      if (profile) {
        this.userProfiles.set(userId, profile);
        return profile;
      }
    } catch (error) {
      console.error(`Error loading profile for user ${userId}:`, error);
    }
    
    return null;
  }
  
  /**
   * Create or update a user profile
   */
  public async updateUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
    // Get existing profile or create new one
    const existingProfile = await this.getUserProfile(userId) || {
      userId,
      email: '',
      displayName: '',
      avatar: '',
      dateCreated: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      membership: {
        level: 'free',
        expiresAt: ''
      },
      settings: {
        theme: 'light',
        notifications: true,
        defaultBrokerId: '',
        tradingPreferences: {}
      },
      userStats: {
        totalTrades: 0,
        winRatio: 0,
        averageProfit: 0,
        totalProfitLoss: 0,
        bestTrade: 0,
        worstTrade: 0
      }
    };
    
    // Merge updates with existing profile
    const updatedProfile: UserProfile = {
      ...existingProfile,
      ...profileData,
      lastUpdated: new Date().toISOString()
    };
    
    // Save to cache
    this.userProfiles.set(userId, updatedProfile);
    
    // Save to database
    await this.saveUserProfileToDatabase(updatedProfile);
    
    return updatedProfile;
  }
  
  /**
   * Get user broker connections
   */
  public async getUserBrokerConnections(userId: string): Promise<Map<string, BrokerConnection>> {
    // Check if connections are cached
    if (this.userBrokerConnections.has(userId)) {
      return this.userBrokerConnections.get(userId) || new Map();
    }
    
    // If not in cache, try to load from database
    try {
      await this.loadUserBrokerConnectionsFromDatabase(userId);
      return this.userBrokerConnections.get(userId) || new Map();
    } catch (error) {
      console.error(`Error loading broker connections for user ${userId}:`, error);
      return new Map();
    }
  }
  
  /**
   * Add broker connection for a user
   */
  public async addUserBrokerConnection(
    userId: string, 
    brokerId: string, 
    brokerConnection: BrokerConnection
  ): Promise<boolean> {
    try {
      // Initialize map if not exists
      if (!this.userBrokerConnections.has(userId)) {
        this.userBrokerConnections.set(userId, new Map());
      }
      
      // Add connection
      this.userBrokerConnections.get(userId)?.set(brokerId, brokerConnection);
      
      // Save to database
      await this.saveUserBrokerConnectionToDatabase(userId, brokerId, brokerConnection);
      
      return true;
    } catch (error) {
      console.error(`Error adding broker connection for user ${userId}:`, error);
      return false;
    }
  }
  
  /**
   * Remove broker connection for a user
   */
  public async removeUserBrokerConnection(userId: string, brokerId: string): Promise<boolean> {
    try {
      // Check if map exists
      if (!this.userBrokerConnections.has(userId)) {
        return false;
      }
      
      // Remove connection
      const connections = this.userBrokerConnections.get(userId);
      if (!connections) return false;
      
      const result = connections.delete(brokerId);
      
      // Update database
      if (result) {
        await this.deleteUserBrokerConnectionFromDatabase(userId, brokerId);
      }
      
      return result;
    } catch (error) {
      console.error(`Error removing broker connection for user ${userId}:`, error);
      return false;
    }
  }
  
  /**
   * Get user custom signals
   */
  public async getUserSignals(userId: string): Promise<TradeSignal[]> {
    // Check if signals are cached
    if (this.userSignals.has(userId)) {
      return this.userSignals.get(userId) || [];
    }
    
    // If not in cache, try to load from database
    try {
      const signals = await this.loadUserSignalsFromDatabase(userId);
      this.userSignals.set(userId, signals);
      return signals;
    } catch (error) {
      console.error(`Error loading signals for user ${userId}:`, error);
      return [];
    }
  }
  
  /**
   * Add custom signal for a user
   */
  public async addUserSignal(userId: string, signal: TradeSignal): Promise<boolean> {
    try {
      // Initialize array if not exists
      if (!this.userSignals.has(userId)) {
        this.userSignals.set(userId, []);
      }
      
      // Add signal
      const signals = this.userSignals.get(userId) || [];
      signals.push({
        ...signal,
        id: signal.id || `${userId}_${Date.now()}`
      });
      this.userSignals.set(userId, signals);
      
      // Save to database
      await this.saveUserSignalToDatabase(userId, signal);
      
      return true;
    } catch (error) {
      console.error(`Error adding signal for user ${userId}:`, error);
      return false;
    }
  }
  
  /**
   * Remove custom signal for a user
   */
  public async removeUserSignal(userId: string, signalId: string): Promise<boolean> {
    try {
      // Check if array exists
      if (!this.userSignals.has(userId)) {
        return false;
      }
      
      // Remove signal
      const signals = this.userSignals.get(userId) || [];
      const updatedSignals = signals.filter(s => s.id !== signalId);
      
      if (updatedSignals.length === signals.length) {
        return false; // Signal not found
      }
      
      this.userSignals.set(userId, updatedSignals);
      
      // Update database
      await this.deleteUserSignalFromDatabase(userId, signalId);
      
      return true;
    } catch (error) {
      console.error(`Error removing signal for user ${userId}:`, error);
      return false;
    }
  }
  
  /**
   * Get user journal entries
   */
  public async getUserJournalEntries(userId: string): Promise<JournalEntry[]> {
    // Check if entries are cached
    if (this.userJournalEntries.has(userId)) {
      return this.userJournalEntries.get(userId) || [];
    }
    
    // If not in cache, try to load from database
    try {
      const entries = await this.loadUserJournalEntriesFromDatabase(userId);
      this.userJournalEntries.set(userId, entries);
      return entries;
    } catch (error) {
      console.error(`Error loading journal entries for user ${userId}:`, error);
      return [];
    }
  }
  
  /**
   * Add journal entry for a user
   */
  public async addUserJournalEntry(userId: string, entry: JournalEntry): Promise<boolean> {
    try {
      // Initialize array if not exists
      if (!this.userJournalEntries.has(userId)) {
        this.userJournalEntries.set(userId, []);
      }
      
      // Add entry
      const entries = this.userJournalEntries.get(userId) || [];
      entries.push({
        ...entry,
        id: entry.id || `${userId}_journal_${Date.now()}`
      });
      this.userJournalEntries.set(userId, entries);
      
      // Save to database
      await this.saveUserJournalEntryToDatabase(userId, entry);
      
      return true;
    } catch (error) {
      console.error(`Error adding journal entry for user ${userId}:`, error);
      return false;
    }
  }
  
  /**
   * Update journal entry for a user
   */
  public async updateUserJournalEntry(userId: string, entryId: string, updates: Partial<JournalEntry>): Promise<boolean> {
    try {
      // Check if array exists
      if (!this.userJournalEntries.has(userId)) {
        return false;
      }
      
      // Update entry
      const entries = this.userJournalEntries.get(userId) || [];
      const entryIndex = entries.findIndex(e => e.id === entryId);
      
      if (entryIndex === -1) {
        return false; // Entry not found
      }
      
      entries[entryIndex] = {
        ...entries[entryIndex],
        ...updates,
        lastUpdated: new Date().toISOString()
      };
      
      this.userJournalEntries.set(userId, entries);
      
      // Update database
      await this.updateUserJournalEntryInDatabase(userId, entryId, entries[entryIndex]);
      
      return true;
    } catch (error) {
      console.error(`Error updating journal entry for user ${userId}:`, error);
      return false;
    }
  }
  
  /**
   * Get user wallet info
   */
  public async getUserWallet(userId: string): Promise<UserWallet | null> {
    // Check if wallet is cached
    if (this.userWallets.has(userId)) {
      return this.userWallets.get(userId) || null;
    }
    
    // If not in cache, try to load from database
    try {
      const wallet = await this.loadUserWalletFromDatabase(userId);
      if (wallet) {
        this.userWallets.set(userId, wallet);
        return wallet;
      }
    } catch (error) {
      console.error(`Error loading wallet for user ${userId}:`, error);
    }
    
    return null;
  }
  
  /**
   * Update user wallet info
   */
  public async updateUserWallet(userId: string, walletData: Partial<UserWallet>): Promise<UserWallet> {
    // Get existing wallet or create new one
    const existingWallet = await this.getUserWallet(userId) || {
      userId,
      tradingCapital: 0,
      thcBalance: 0,
      stakedThc: 0,
      walletConnected: false,
      walletAddress: '',
      walletType: '',
      lastUpdated: new Date().toISOString()
    };
    
    // Merge updates with existing wallet
    const updatedWallet: UserWallet = {
      ...existingWallet,
      ...walletData,
      lastUpdated: new Date().toISOString()
    };
    
    // Save to cache
    this.userWallets.set(userId, updatedWallet);
    
    // Save to database
    await this.saveUserWalletToDatabase(updatedWallet);
    
    return updatedWallet;
  }
  
  /**
   * Get user trade history
   */
  public async getUserTrades(userId: string): Promise<TradeRecord[]> {
    // Check if trades are cached
    if (this.userTrades.has(userId)) {
      return this.userTrades.get(userId) || [];
    }
    
    // If not in cache, try to load from database
    try {
      const trades = await this.loadUserTradesFromDatabase(userId);
      this.userTrades.set(userId, trades);
      return trades;
    } catch (error) {
      console.error(`Error loading trades for user ${userId}:`, error);
      return [];
    }
  }
  
  /**
   * Add trade record for a user
   */
  public async addUserTrade(userId: string, trade: TradeRecord): Promise<boolean> {
    try {
      // Initialize array if not exists
      if (!this.userTrades.has(userId)) {
        this.userTrades.set(userId, []);
      }
      
      // Add trade
      const trades = this.userTrades.get(userId) || [];
      trades.push({
        ...trade,
        id: trade.id || `${userId}_trade_${Date.now()}`
      });
      this.userTrades.set(userId, trades);
      
      // Save to database
      await this.saveUserTradeToDatabase(userId, trade);
      
      // Update user stats
      await this.updateUserTradingStats(userId);
      
      return true;
    } catch (error) {
      console.error(`Error adding trade for user ${userId}:`, error);
      return false;
    }
  }
  
  /**
   * Update trade record for a user
   */
  public async updateUserTrade(userId: string, tradeId: string, updates: Partial<TradeRecord>): Promise<boolean> {
    try {
      // Check if array exists
      if (!this.userTrades.has(userId)) {
        return false;
      }
      
      // Update trade
      const trades = this.userTrades.get(userId) || [];
      const tradeIndex = trades.findIndex(t => t.id === tradeId);
      
      if (tradeIndex === -1) {
        return false; // Trade not found
      }
      
      trades[tradeIndex] = {
        ...trades[tradeIndex],
        ...updates,
        lastUpdated: new Date().toISOString()
      };
      
      this.userTrades.set(userId, trades);
      
      // Update database
      await this.updateUserTradeInDatabase(userId, tradeId, trades[tradeIndex]);
      
      // Update user stats
      await this.updateUserTradingStats(userId);
      
      return true;
    } catch (error) {
      console.error(`Error updating trade for user ${userId}:`, error);
      return false;
    }
  }
  
  /**
   * Update user trading statistics
   */
  private async updateUserTradingStats(userId: string): Promise<void> {
    try {
      const trades = await this.getUserTrades(userId);
      if (trades.length === 0) return;
      
      // Calculate stats
      const closedTrades = trades.filter(t => t.status === 'closed');
      const winningTrades = closedTrades.filter(t => t.profitLoss > 0);
      
      const totalProfitLoss = closedTrades.reduce((sum, t) => sum + t.profitLoss, 0);
      const bestTrade = Math.max(...closedTrades.map(t => t.profitLoss));
      const worstTrade = Math.min(...closedTrades.map(t => t.profitLoss));
      
      const userStats: UserTradingStats = {
        totalTrades: trades.length,
        winRatio: closedTrades.length > 0 ? winningTrades.length / closedTrades.length : 0,
        averageProfit: closedTrades.length > 0 ? totalProfitLoss / closedTrades.length : 0,
        totalProfitLoss,
        bestTrade,
        worstTrade
      };
      
      // Update profile
      const profile = await this.getUserProfile(userId);
      if (profile) {
        await this.updateUserProfile(userId, { userStats });
      }
    } catch (error) {
      console.error(`Error updating trading stats for user ${userId}:`, error);
    }
  }
  
  /**
   * Load all user profiles from database
   */
  private async loadUserProfiles(): Promise<void> {
    try {
      // TODO: Implement database loading
      // For now, use a sample profile for testing
      const sampleProfile: UserProfile = {
        userId: 'system',
        email: 'system@tradehybrid.club',
        displayName: 'System User',
        avatar: '',
        dateCreated: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        membership: {
          level: 'admin',
          expiresAt: ''
        },
        settings: {
          theme: 'dark',
          notifications: true,
          defaultBrokerId: 'alpaca',
          tradingPreferences: {}
        },
        userStats: {
          totalTrades: 0,
          winRatio: 0,
          averageProfit: 0,
          totalProfitLoss: 0,
          bestTrade: 0,
          worstTrade: 0
        }
      };
      
      this.userProfiles.set('system', sampleProfile);
    } catch (error) {
      console.error('Error loading user profiles:', error);
    }
  }
  
  /**
   * Set up event listeners for profile updates
   */
  private setupEventListeners(): void {
    // TODO: Set up WebSocket or event listeners for real-time updates
  }
  
  // Database interaction methods (to be implemented with actual DB)
  
  private async loadUserProfileFromDatabase(userId: string): Promise<UserProfile | null> {
    // TODO: Implement database loading
    return null;
  }
  
  private async saveUserProfileToDatabase(profile: UserProfile): Promise<void> {
    // TODO: Implement database saving
  }
  
  private async loadUserBrokerConnectionsFromDatabase(userId: string): Promise<void> {
    // TODO: Implement database loading
  }
  
  private async saveUserBrokerConnectionToDatabase(
    userId: string, 
    brokerId: string, 
    connection: BrokerConnection
  ): Promise<void> {
    // TODO: Implement database saving
  }
  
  private async deleteUserBrokerConnectionFromDatabase(userId: string, brokerId: string): Promise<void> {
    // TODO: Implement database deletion
  }
  
  private async loadUserSignalsFromDatabase(userId: string): Promise<TradeSignal[]> {
    // TODO: Implement database loading
    return [];
  }
  
  private async saveUserSignalToDatabase(userId: string, signal: TradeSignal): Promise<void> {
    // TODO: Implement database saving
  }
  
  private async deleteUserSignalFromDatabase(userId: string, signalId: string): Promise<void> {
    // TODO: Implement database deletion
  }
  
  private async loadUserJournalEntriesFromDatabase(userId: string): Promise<JournalEntry[]> {
    // TODO: Implement database loading
    return [];
  }
  
  private async saveUserJournalEntryToDatabase(userId: string, entry: JournalEntry): Promise<void> {
    // TODO: Implement database saving
  }
  
  private async updateUserJournalEntryInDatabase(
    userId: string, 
    entryId: string, 
    entry: JournalEntry
  ): Promise<void> {
    // TODO: Implement database update
  }
  
  private async loadUserWalletFromDatabase(userId: string): Promise<UserWallet | null> {
    // TODO: Implement database loading
    return null;
  }
  
  private async saveUserWalletToDatabase(wallet: UserWallet): Promise<void> {
    // TODO: Implement database saving
  }
  
  private async loadUserTradesFromDatabase(userId: string): Promise<TradeRecord[]> {
    // TODO: Implement database loading
    return [];
  }
  
  private async saveUserTradeToDatabase(userId: string, trade: TradeRecord): Promise<void> {
    // TODO: Implement database saving
  }
  
  private async updateUserTradeInDatabase(
    userId: string, 
    tradeId: string, 
    trade: TradeRecord
  ): Promise<void> {
    // TODO: Implement database update
  }
}

/**
 * Initialize the user profile service
 */
export function initializeUserProfileService(mcp: MCPServer): UserProfileService {
  const service = UserProfileService.getInstance(mcp);
  service.initialize().catch(err => 
    console.error('Error initializing user profile service:', err)
  );
  return service;
}

// Types

export interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  avatar: string;
  dateCreated: string;
  lastUpdated: string;
  membership: {
    level: 'free' | 'premium' | 'pro' | 'enterprise' | 'admin';
    expiresAt: string;
  };
  settings: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    defaultBrokerId: string;
    tradingPreferences: Record<string, any>;
  };
  userStats: UserTradingStats;
}

export interface UserTradingStats {
  totalTrades: number;
  winRatio: number;
  averageProfit: number;
  totalProfitLoss: number;
  bestTrade: number;
  worstTrade: number;
}

export interface UserWallet {
  userId: string;
  tradingCapital: number;
  thcBalance: number;
  stakedThc: number;
  walletConnected: boolean;
  walletAddress: string;
  walletType: string;
  lastUpdated: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  tradeIds?: string[];
  tags?: string[];
  emotionalState?: string;
  marketConditions?: string;
  lessonLearned?: string;
  dateCreated: string;
  lastUpdated?: string;
}

export interface TradeRecord {
  id: string;
  userId: string;
  brokerId: string;
  symbol: string;
  type: 'buy' | 'sell';
  status: 'open' | 'closed' | 'cancelled';
  quantity: number;
  entryPrice: number;
  exitPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  entryDate: string;
  exitDate?: string;
  profitLoss: number;
  notes?: string;
  strategy?: string;
  signalId?: string;
  riskRewardRatio?: number;
  fees?: number;
  lastUpdated?: string;
}