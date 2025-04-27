/**
 * UserContext - Central user data model for the Trade Hybrid platform
 * 
 * This model represents all user-related data across the application, providing a single
 * source of truth for user state between client and server components.
 */

// Basic membership levels available on the platform
export type MembershipLevel = 'free' | 'basic' | 'premium' | 'institutional';

// Broker credentials type for connecting to external trading platforms
export interface BrokerCredentials {
  brokerId: string;       // ID of the broker (alpaca, interactive_brokers, etc.)
  apiKey?: string;        // API key for authentication
  secretKey?: string;     // Secret key for authentication
  passphrase?: string;    // Optional passphrase for some brokers
  useDemo?: boolean;      // Whether to use demo/paper trading account
  isSaved?: boolean;      // Whether credentials are saved in the database
  accountId?: string;     // Broker-specific account ID
  [key: string]: any;     // Allow for broker-specific custom fields
}

// Trading signal representation for storing user signals
export interface TradingSignal {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  entry: number;
  stopLoss: number;
  takeProfit: number;
  timestamp: Date;
  source: string;
  risk: number;
  notes: string;
  timeframe: string;
  status: 'active' | 'closed' | 'cancelled';
  confidence: number;
  profit?: number;
  pnl?: number;
}

// User's journal entry for trade journaling feature
export interface JournalEntry {
  id: string;
  timestamp: Date;
  title: string;
  content: string;
  mood: 'positive' | 'neutral' | 'negative';
  tags: string[];
  tradeIds: string[];
  attachments: string[];
  isPrivate: boolean;
}

// Connected broker representation
export interface ConnectedBroker {
  id: string;
  name: string;
  isDemo: boolean;
  lastSynced: Date;
  status: 'connected' | 'disconnected' | 'error';
  accountIds: string[];
  credentials: BrokerCredentials;
  error?: string;
}

// Webhook configuration for external integrations
export interface Webhook {
  id: string;
  name: string;
  url: string;
  active: boolean;
  brokerTarget: boolean;
  signalTarget: boolean;
  journalTarget: boolean;
  secret: string;
  lastTriggered?: Date;
  createdAt: Date;
  customFields: Record<string, any>;
}

// AI Analysis for market data
export interface AIAnalysis {
  id: string;
  timestamp: Date;
  symbol: string;
  timeframe: string;
  direction: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  signals: string[];
  supportLevels: number[];
  resistanceLevels: number[];
  keyMetrics: Record<string, any>;
  summary: string;
  prediction: string;
}

// Token data for wallet
export interface TokenData {
  mint: string;
  symbol: string;
  name?: string;
  amount: number;
  decimals: number;
  usdValue?: number;
  price?: number;
  logoURI?: string;
  change24h?: number;
  source?: string; // 'birdeye', 'raydium', etc.
}

// NFT data for wallet
export interface NFTData {
  mint: string;
  name: string;
  symbol?: string;
  image?: string;
  collection?: string;
  attributes?: Record<string, any>[];
  lastSalePrice?: number; 
  rarity?: string;
  floorPrice?: number;
}

// Transaction data for wallet history
export interface TransactionData {
  signature: string;
  blockTime: number;
  slot: number;
  type: 'transfer' | 'swap' | 'stake' | 'unstake' | 'mint' | 'burn' | 'unknown';
  status: 'confirmed' | 'failed';
  tokenAmount?: number;
  tokenSymbol?: string;
  tokenMint?: string;
  fee?: number;
  from?: string;
  to?: string;
  usdValue?: number;
}

// Wallet data from blockchain
export interface WalletData {
  walletConnected: boolean;
  address?: string;
  provider?: string; // 'phantom', 'web3auth', etc.
  balanceUsd?: number; // Total wallet balance in USD
  solBalance?: number; // SOL balance
  thcBalance?: number; // THC token balance
  tokens?: TokenData[]; // All tokens in wallet
  nfts?: NFTData[]; // All NFTs in wallet
  transactions?: TransactionData[]; // Recent transactions
  isStaking?: boolean; // Whether user is staking
  stakedAmount?: number; // Total staked amount
  stakedSince?: string; // Date when staking started
  stakingRewards?: number; // Accrued staking rewards
  lastRefreshed?: string; // Last time wallet data was refreshed
}

// User preferences for platform customization
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    webhook: boolean;
  };
  defaultTimeframe: string;
  defaultRiskLevel: number;
  signalSources: string[];
  autoSync: boolean;
  showPnl: boolean;
  showConfidenceScores: boolean;
  sidebar: {
    expanded: boolean;
    favorites: string[];
  };
}

// Complete user context type that represents all user data
export interface UserContext {
  userId?: string;
  authenticated: boolean;
  membershipLevel?: MembershipLevel;
  username?: string;
  email?: string;
  walletConnected: boolean;
  walletProvider?: string;
  walletData?: WalletData;
  connectedBrokers: ConnectedBroker[];
  savedTradingSignals: TradingSignal[];
  journalEntries: JournalEntry[];
  webhooks: Webhook[];
  aiAnalysis: Record<string, AIAnalysis>;
  favoriteSymbols: string[];
  preferences?: UserPreferences;
  lastSynced?: Date;
}

// Initial user context state
export const initialUserContext: UserContext = {
  authenticated: false,
  walletConnected: false,
  connectedBrokers: [],
  savedTradingSignals: [],
  journalEntries: [],
  webhooks: [],
  aiAnalysis: {},
  favoriteSymbols: [],
};