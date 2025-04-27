import { Connection, PublicKey } from '@solana/web3.js';

export interface BrokerCredentials {
  brokerId: string;
  useDemo?: boolean;
  apiKey?: string;
  apiSecret?: string;
  apiPassphrase?: string;
  accessToken?: string;
  refreshToken?: string;
  accountId?: string;
  [key: string]: any; // For any other broker-specific credentials
}

export interface WalletData {
  address: string;
  balances: {
    sol: number;
    thc: number;
    usdc: number;
  };
  transactions: WalletTransaction[];
  nfts: NFTData[];
  stakedAmount?: number;
  affiliateEarnings?: number;
  referredUsers?: number;
}

export interface WalletTransaction {
  id: string;
  timestamp: Date;
  type: 'send' | 'receive' | 'swap' | 'stake' | 'unstake' | 'claim';
  amount: number;
  token: string;
  fromAddress?: string;
  toAddress?: string;
  fee?: number;
  status: 'confirmed' | 'pending' | 'failed';
  blockExplorerUrl?: string;
}

export interface NFTData {
  mint: string;
  name: string;
  symbol: string;
  image: string;
  collection?: string;
  attributes?: Record<string, string>;
  floorPrice?: number;
}

export interface ConnectedBroker {
  id: string;
  name: string;
  isDemo: boolean;
  lastSynced: Date;
  status: 'connected' | 'disconnected' | 'error';
  accountIds: string[];
  credentials: BrokerCredentials;
}

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
  notes?: string;
  timeframe: string;
  status: 'active' | 'closed' | 'canceled';
  confidence?: number; // 0-1 scale
  result?: {
    exitPrice?: number;
    pnl?: number;
    pnlPercentage?: number;
    exitTimestamp?: Date;
    exitReason?: string;
  };
}

export interface JournalEntry {
  id: string;
  timestamp: Date;
  tradeIds?: string[]; // Associated trades
  title: string;
  content: string;
  mood: 'positive' | 'neutral' | 'negative';
  tags: string[];
  attachments?: string[];
  isPrivate: boolean;
}

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  brokerTarget?: string;
  signalTarget?: string;
  journalTarget?: boolean;
  active: boolean;
  secret?: string;
  lastTriggered?: Date;
  createdAt: Date;
  customFields?: Record<string, string>;
}

export interface AIAnalysis {
  id: string;
  timestamp: Date;
  symbol: string;
  timeframe: string;
  direction: 'bullish' | 'bearish' | 'neutral';
  confidence: number; // 0-1 scale
  signals: string[];
  supportLevels: number[];
  resistanceLevels: number[];
  keyMetrics: Record<string, number>;
  summary: string;
  prediction?: {
    targetPrice: number;
    targetDate: Date;
    probability: number;
  };
}

// Central user context that combines all data sources
export interface UserContext {
  userId?: string;
  authenticated: boolean;
  membershipLevel: 'free' | 'basic' | 'premium' | 'institutional';
  walletConnected: boolean;
  walletProvider?: 'phantom' | 'web3auth' | 'slope' | 'solflare' | 'other';
  walletData?: WalletData;
  connectedBrokers: ConnectedBroker[];
  savedTradingSignals: TradingSignal[];
  journalEntries: JournalEntry[];
  webhooks: WebhookConfig[];
  aiAnalysis: Record<string, AIAnalysis>; // Keyed by symbol
  favoriteSymbols: string[];
  preferences: {
    darkMode: boolean;
    defaultBroker?: string;
    defaultMarket?: string;
    notificationsEnabled: boolean;
    riskPerTrade?: number;
    defaultLeverage?: number;
    chartSettings?: Record<string, any>;
    aiEnabled: boolean;
  };
  lastSynced?: Date;
}

// Initial state for new or unauthenticated users
export const initialUserContext: UserContext = {
  authenticated: false,
  membershipLevel: 'free',
  walletConnected: false,
  connectedBrokers: [],
  savedTradingSignals: [],
  journalEntries: [],
  webhooks: [],
  aiAnalysis: {},
  favoriteSymbols: ['BTC/USD', 'ETH/USD', 'SOL/USD'],
  preferences: {
    darkMode: true,
    notificationsEnabled: true,
    aiEnabled: true
  }
};

// Helper function to get appropriate data access based on membership level
export function getMembershipAccess(level: UserContext['membershipLevel']) {
  switch (level) {
    case 'free':
      return {
        maxBrokers: 1,
        maxSignals: 10,
        maxJournalEntries: 20,
        maxWebhooks: 1,
        aiAccess: false,
        tradingFeatures: ['basic'],
      };
    case 'basic':
      return {
        maxBrokers: 2,
        maxSignals: 50,
        maxJournalEntries: 100,
        maxWebhooks: 3,
        aiAccess: true,
        tradingFeatures: ['basic', 'intermediate'],
      };
    case 'premium':
      return {
        maxBrokers: 5,
        maxSignals: 'unlimited',
        maxJournalEntries: 'unlimited',
        maxWebhooks: 10,
        aiAccess: true,
        tradingFeatures: ['basic', 'intermediate', 'advanced'],
      };
    case 'institutional':
      return {
        maxBrokers: 'unlimited',
        maxSignals: 'unlimited',
        maxJournalEntries: 'unlimited',
        maxWebhooks: 'unlimited',
        aiAccess: true,
        tradingFeatures: ['basic', 'intermediate', 'advanced', 'institutional'],
      };
  }
}