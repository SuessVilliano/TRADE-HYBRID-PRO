import { pgTable, text, serial, integer, boolean, timestamp, real, jsonb, pgEnum, uuid, bigint } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Learning Center Tables
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // crypto, forex, stocks, futures
  level: text("level").notNull(), // beginner, intermediate, advanced
  duration: integer("duration").notNull(), // in minutes
  points: integer("points").notNull(),
  imageUrl: text("image_url"),
  featured: boolean("featured").default(false),
  prerequisites: jsonb("prerequisites"), // array of prerequisite course IDs
  learningOutcomes: jsonb("learning_outcomes"), // array of outcomes
  certification: boolean("certification").default(false),
  certificateImageUrl: text("certificate_image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const modules = pgTable("modules", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull().references(() => courses.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  orderNum: integer("order_num").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  moduleId: integer("module_id").notNull().references(() => modules.id),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content").notNull(),
  videoUrl: text("video_url"),
  interactiveContent: jsonb("interactive_content"), // interactive elements
  resources: jsonb("resources"), // additional learning resources
  orderNum: integer("order_num").notNull(),
  duration: integer("duration").notNull(), // in minutes
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  lessonId: integer("lesson_id").notNull().references(() => lessons.id),
  title: text("title").notNull(),
  description: text("description"),
  questions: jsonb("questions").notNull(),
  passingScore: integer("passing_score").notNull(),
  timeLimit: integer("time_limit"), // in minutes, null for unlimited
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  avatar: text("avatar"),
  balance: real("balance").notNull().default(10000),
  hasConnectedApis: boolean("has_connected_apis").default(false),
  // Whop membership fields
  whopId: text("whop_id").unique(),
  whopPlanId: text("whop_plan_id"),
  whopProductId: text("whop_product_id"),
  whopAccessPassId: text("whop_access_pass_id"),
  whopCustomerId: text("whop_customer_id"),
  whopMemberSince: text("whop_member_since"),
  whopMembershipExpiresAt: text("whop_membership_expires_at"),
  discord: text("discord"),
  profileImage: text("profile_image"),
  // Wallet integration fields
  walletAddress: text("wallet_address").unique(),
  walletAuthEnabled: boolean("wallet_auth_enabled").default(false),
  thcTokenHolder: boolean("thc_token_holder").default(false),
  // User preferences
  dashboardOrder: jsonb("dashboard_order"), // Array of module IDs in preferred order
  favoriteSymbols: jsonb("favorite_symbols").default(['BTC/USD', 'ETH/USD', 'SOL/USD']),
  // Membership and permissions
  membershipLevel: text("membership_level").default('free'), // 'free', 'basic', 'premium', 'institutional'
  membershipExpirationDate: timestamp("membership_expiration_date"),
  isAdmin: boolean("is_admin").default(false),
  isPropTrader: boolean("is_prop_trader").default(false), // For users who have been approved as prop traders
  customPermissions: jsonb("custom_permissions"), // Custom permissions overrides
  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  lastLogin: timestamp("last_login"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  avatar: true,
});

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  courseId: integer("course_id").notNull().references(() => courses.id),
  moduleId: integer("module_id").references(() => modules.id),
  lessonId: integer("lesson_id").references(() => lessons.id),
  completed: boolean("completed").default(false),
  percentageComplete: real("percentage_complete").default(0),
  lastAccessedAt: timestamp("last_accessed_at").notNull().defaultNow(),
  notes: text("notes"), // user's personal notes for this course
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const quizAttempts = pgTable("quiz_attempts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  quizId: integer("quiz_id").notNull().references(() => quizzes.id),
  score: integer("score").notNull(),
  passed: boolean("passed").notNull(),
  answers: jsonb("answers").notNull(), // user's answers
  timeSpent: integer("time_spent"), // in seconds
  completedAt: timestamp("completed_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const certificates = pgTable("certificates", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  courseId: integer("course_id").notNull().references(() => courses.id),
  certificateId: text("certificate_id").notNull(), // unique identifier for certificate
  issueDate: timestamp("issue_date").notNull().defaultNow(),
  expiryDate: timestamp("expiry_date"), // null for non-expiring certificates
  metadata: jsonb("metadata"), // any additional certificate data
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Trades table
export const trades = pgTable("trades", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  symbol: text("symbol").notNull(),
  side: text("side").notNull(), // 'buy' or 'sell'
  quantity: real("quantity").notNull(),
  entryPrice: real("entry_price").notNull(),
  exitPrice: real("exit_price"),
  profit: real("profit"),
  leverage: real("leverage").default(1),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  closedAt: timestamp("closed_at"),
});

export const insertTradeSchema = createInsertSchema(trades).pick({
  userId: true,
  symbol: true,
  side: true,
  quantity: true,
  entryPrice: true,
  leverage: true,
});

// Bots table
export const bots = pgTable("bots", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  type: text("type").notNull(),
  symbol: text("symbol").notNull(),
  code: text("code").notNull(),
  active: boolean("active").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertBotSchema = createInsertSchema(bots).pick({
  userId: true,
  name: true,
  type: true,
  symbol: true,
  code: true,
});

// TradeHouses table (for customizing trading spaces)
export const tradeHouses = pgTable("trade_houses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  theme: text("theme").default("default"),
  layout: jsonb("layout").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertTradeHouseSchema = createInsertSchema(tradeHouses).pick({
  userId: true,
  name: true,
  description: true,
  theme: true,
  layout: true,
});

// Leaderboard entries
export const leaderboardEntries = pgTable("leaderboard_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  period: text("period").notNull(), // 'daily', 'weekly', 'monthly', 'all-time'
  rank: integer("rank").notNull(),
  pnl: real("pnl").notNull(),
  winRate: real("win_rate").notNull(),
  tradeCount: integer("trade_count").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Journal entries table
export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  audioUrl: text("audio_url"),
  sentiment: text("sentiment"),
  aiAnalysis: text("ai_analysis"),
  hybridScore: real("hybrid_score"),
  tradeIds: integer("trade_ids").array(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const tradePerformance = pgTable("trade_performance", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  period: text("period").notNull(),
  hybridScore: real("hybrid_score").notNull(),
  winRate: real("win_rate").notNull(),
  profitFactor: real("profit_factor").notNull(),
  sharpeRatio: real("sharpe_ratio").notNull(),
  totalTrades: integer("total_trades").notNull(),
  averageWin: real("average_win"),
  averageLoss: real("average_loss"),
  largestWin: real("largest_win"),
  largestLoss: real("largest_loss"),
  averageHoldingTime: integer("average_holding_time"),
  bestPerformingSetup: text("best_performing_setup"),
  worstPerformingSetup: text("worst_performing_setup"),
  riskRewardRatio: real("risk_reward_ratio"),
  expectancy: real("expectancy"),
  drawdown: real("drawdown"),
  bestTradingDay: timestamp("best_trading_day"),
  worstTradingDay: timestamp("worst_trading_day"),
  profitByTimeOfDay: jsonb("profit_by_time_of_day"),
  profitByDayOfWeek: jsonb("profit_by_day_of_week"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// User learning journal that connects to journal entries
export const userLearningJournal = pgTable("user_learning_journal", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  courseId: integer("course_id").references(() => courses.id),
  lessonId: integer("lesson_id").references(() => lessons.id),
  tags: jsonb("tags"),
  relatedToTradeEntry: integer("related_to_trade_entry").references(() => journalEntries.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Trade Signals table for storing trading signals
// Trading Signals system
// Trade signals status enum
export const tradeSignalStatusEnum = pgEnum('trade_signal_status', ['active', 'closed', 'cancelled']);
export const tradeSignalSideEnum = pgEnum('trade_signal_side', ['buy', 'sell']);
export const signalProviderEnum = pgEnum('signal_provider', ['paradox', 'solaris', 'hybrid', 'custom']);

// Matrix Currency Enum
export const matrixCurrencyEnum = pgEnum('matrix_currency', ['THC', 'SOL', 'USDC']);

// Matrix Referrals table
export const matrixReferrals = pgTable("matrix_referrals", {
  id: serial("id").primaryKey(),
  wallet: text("wallet").notNull(), // The wallet address
  referrer: text("referrer").notNull(), // The referrer's wallet address
  timestamp: text("timestamp").notNull().default(String(Date.now())), // When the referral relationship was established
  confirmed: boolean("confirmed").default(true),
  blockHeight: integer("block_height"), // The block height when this referral was set
  transactionHash: text("transaction_hash"), // The transaction hash that established this referral
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Matrix Slots table
export const matrixSlots = pgTable("matrix_slots", {
  id: serial("id").primaryKey(),
  slotId: text("slot_id").notNull(), // A unique ID for the slot
  wallet: text("wallet").notNull(), // The wallet address that owns this slot
  slotNumber: integer("slot_number").notNull(), // Slot number (1-12)
  price: real("price").notNull(), // Price paid for slot
  currency: matrixCurrencyEnum("currency").notNull().default('THC'), // Currency used for purchase
  purchaseDate: text("purchase_date").notNull().default(String(Date.now())), // When the slot was purchased
  isActive: boolean("is_active").notNull().default(true), // Whether the slot is active
  earningsFromSlot: real("earnings_from_slot").notNull().default(0), // Total earnings from this slot
  referrals: jsonb("referrals").default([]), // Array of referrals attached to this slot
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Matrix Registration Times table
export const matrixRegistrationTimes = pgTable("matrix_registration_times", {
  id: serial("id").primaryKey(),
  wallet: text("wallet").notNull().unique(), // The wallet address
  timestamp: text("timestamp").notNull().default(String(Date.now())), // The registration timestamp
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Matrix Direct Referrals table (for caching purposes)
export const matrixDirectReferrals = pgTable("matrix_direct_referrals", {
  id: serial("id").primaryKey(),
  wallet: text("wallet").notNull(), // The referrer's wallet address
  referredWallet: text("referred_wallet").notNull(), // The wallet that was referred
  timestamp: text("timestamp").notNull().default(String(Date.now())), // When the referral relationship was established
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Trade signals table
export const tradeSignals = pgTable("trade_signals", {
  id: text('id').primaryKey(),
  providerId: text("provider_id").notNull(), // Signal provider ID or source
  symbol: text("symbol").notNull(),
  side: tradeSignalSideEnum("side").notNull(), // 'buy' or 'sell'
  entryPrice: real("entry_price"),
  stopLoss: real("stop_loss"),
  takeProfit: real("take_profit"),
  description: text("description"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  status: tradeSignalStatusEnum("status").notNull().default('active'), // 'active', 'closed', 'cancelled'
  closePrice: real("close_price"),
  pnl: real("pnl"),
  closedAt: timestamp("closed_at"),
  metadata: jsonb("metadata"), // Additional signal data
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Copy trade logs table
export const copyTradeLogs = pgTable('copy_trade_logs', {
  id: text('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  signalId: text('signal_id').notNull().references(() => tradeSignals.id),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  autoExecute: boolean('auto_execute').default(false),
  executionStatus: text('execution_status').notNull(), // 'pending', 'executed', 'failed', 'manual'
  brokerResponse: jsonb('broker_response'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Relations for copy trade logs
export const copyTradeLogsRelations = relations(copyTradeLogs, ({ one }) => ({
  signal: one(tradeSignals, {
    fields: [copyTradeLogs.signalId],
    references: [tradeSignals.id],
  }),
}));

// Signal subscriptions table for users subscribing to trading signals
export const signalSubscriptions = pgTable("signal_subscriptions", {
  id: text('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  providerId: text('provider_id').notNull(), // Signal provider ID or source
  symbol: text('symbol'), // Optional: subscribe to specific symbol only
  status: text('status').notNull().default('active'), // 'active', 'paused', 'cancelled'
  notificationsEnabled: boolean('notifications_enabled').default(true),
  autoTrade: boolean('auto_trade').default(false), // Execute trades automatically 
  autoTradeSettings: jsonb('auto_trade_settings'), // Position size, risk limits, etc.
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// API Keys table for storing user API keys
export const userApiKeys = pgTable("user_api_keys", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // 'google', 'openai', etc.
  name: text("name").notNull(), // Display name for the key
  value: text("value").notNull(), // Encrypted key value
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Extended Tables for Unified User Data Integration

// Wallets table for connecting to cryptocurrency wallets
export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  address: text("address").notNull().unique(),
  provider: text("provider").notNull(), // 'phantom', 'web3auth', etc.
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Wallet transactions table
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  walletAddress: text("wallet_address").notNull().references(() => wallets.address),
  hash: text("hash").notNull().unique(),
  type: text("type").notNull(), // 'send', 'receive', 'swap', 'stake', 'unstake', 'claim'
  amount: real("amount").notNull(),
  token: text("token").notNull(),
  fromAddress: text("from_address"),
  toAddress: text("to_address"),
  fee: real("fee"),
  status: text("status").notNull(), // 'confirmed', 'pending', 'failed'
  blockNumber: integer("block_number"),
  blockExplorerUrl: text("block_explorer_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// NFTs table
export const nfts = pgTable("nfts", {
  id: serial("id").primaryKey(),
  mint: text("mint").notNull().unique(),
  owner: text("owner").notNull(),
  name: text("name").notNull(),
  symbol: text("symbol"),
  image: text("image"),
  collection: text("collection"),
  attributes: jsonb("attributes"),
  floorPrice: real("floor_price"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Broker connections table
export const brokerConnections = pgTable("broker_connections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  brokerId: text("broker_id").notNull(), // 'alpaca', 'oanda', etc.
  name: text("name").notNull(),
  isDemo: boolean("is_demo").default(false),
  status: text("status").notNull(), // 'connected', 'disconnected', 'error'
  accountIds: jsonb("account_ids"), // Array of account IDs
  lastSynced: timestamp("last_synced").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Broker API credentials (encrypted)
export const brokerCredentials = pgTable("broker_credentials", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  brokerId: text("broker_id").notNull(),
  key: text("key").notNull(), // Credential key name (e.g., 'apiKey', 'apiSecret')
  value: text("value").notNull(), // Encrypted credential value
  isDemo: boolean("is_demo").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Enhanced journal entries with more metadata
export const enhancedJournalEntries = pgTable("enhanced_journal_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  mood: text("mood").notNull(), // 'positive', 'neutral', 'negative'
  tags: jsonb("tags"), // Array of tags
  tradeIds: jsonb("trade_ids"), // Associated trades
  attachments: jsonb("attachments"), // Array of attachment URLs
  isPrivate: boolean("is_private").default(true),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Webhooks table
export const webhooks = pgTable("webhooks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  url: text("url").notNull(),
  brokerTarget: text("broker_target"), // Target broker for webhook
  signalTarget: text("signal_target"), // Target signal provider
  journalTarget: boolean("journal_target").default(false), // Send to journal
  active: boolean("active").default(true),
  secret: text("secret"), // Secret for webhook verification
  lastTriggered: timestamp("last_triggered"),
  customFields: jsonb("custom_fields"), // Custom webhook fields
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// AI analysis data
export const aiAnalysis = pgTable("ai_analysis", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  timeframe: text("timeframe").notNull(), // '1h', '4h', '1d', etc.
  direction: text("direction").notNull(), // 'bullish', 'bearish', 'neutral'
  confidence: real("confidence").notNull(), // 0-1 scale
  signals: jsonb("signals"), // Array of technical signals
  supportLevels: jsonb("support_levels"), // Array of support levels
  resistanceLevels: jsonb("resistance_levels"), // Array of resistance levels
  keyMetrics: jsonb("key_metrics"), // Key market metrics
  summary: text("summary").notNull(),
  prediction: jsonb("prediction"), // Price prediction data
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Market data cache
export const marketData = pgTable("market_data", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull().unique(),
  source: text("source").notNull(), // 'birdeye', 'raydium', etc.
  data: jsonb("data").notNull(), // Cached market data
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// User preferences
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  preferences: jsonb("preferences").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// User broker connections table for storing encrypted credentials - new version
export const brokerTypes = pgTable("broker_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  logo_url: text("logo_url"),
  requires_key: boolean("requires_key").default(true),
  requires_secret: boolean("requires_secret").default(true),
  requires_passphrase: boolean("requires_passphrase").default(false),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

// Export types for all tables
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTrade = z.infer<typeof insertTradeSchema>;
export type Trade = typeof trades.$inferSelect;

export type InsertBot = z.infer<typeof insertBotSchema>;
export type Bot = typeof bots.$inferSelect;

export type InsertTradeHouse = z.infer<typeof insertTradeHouseSchema>;
export type TradeHouse = typeof tradeHouses.$inferSelect;

export type LeaderboardEntry = typeof leaderboardEntries.$inferSelect;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type TradePerformance = typeof tradePerformance.$inferSelect;
export type UserLearningJournal = typeof userLearningJournal.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type Module = typeof modules.$inferSelect;
export type Lesson = typeof lessons.$inferSelect;
export type Quiz = typeof quizzes.$inferSelect;
export type UserProgress = typeof userProgress.$inferSelect;
export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type Certificate = typeof certificates.$inferSelect;

export type TradeSignal = typeof tradeSignals.$inferSelect;
export type CopyTradeLog = typeof copyTradeLogs.$inferSelect;
export type SignalSubscription = typeof signalSubscriptions.$inferSelect;
export type UserApiKey = typeof userApiKeys.$inferSelect;

// Enhanced types for new tables
export type Wallet = typeof wallets.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type NFT = typeof nfts.$inferSelect;
export type BrokerConnection = typeof brokerConnections.$inferSelect;
export type BrokerCredential = typeof brokerCredentials.$inferSelect;
export type EnhancedJournalEntry = typeof enhancedJournalEntries.$inferSelect;
export type Webhook = typeof webhooks.$inferSelect;
export type AIAnalysis = typeof aiAnalysis.$inferSelect;
export type MarketData = typeof marketData.$inferSelect;
export type UserPreference = typeof userPreferences.$inferSelect;
export type BrokerType = typeof brokerTypes.$inferSelect;

// Investors and investments tables
export const investors = pgTable("investors", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  investmentGoal: text("investment_goal"),
  riskTolerance: text("risk_tolerance").notNull(), // low, medium, high
  investmentHorizon: text("investment_horizon"), // short-term, medium-term, long-term
  preferredCommunication: text("preferred_communication").default("email"), // email, phone, app
  status: text("status").default("active"), // active, inactive, pending
  joinDate: timestamp("join_date").notNull().defaultNow(),
  kyc: boolean("kyc").default(false), // Know Your Customer verification
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const investments = pgTable("investments", {
  id: serial("id").primaryKey(),
  investorId: integer("investor_id").notNull().references(() => investors.id),
  name: text("name").notNull(),
  type: text("type").notNull(), // stock, bond, crypto, real estate, etc.
  initialDeposit: real("initial_deposit").notNull(),
  currentValue: real("current_value"),
  currency: text("currency").default("USD"),
  startDate: timestamp("start_date").notNull().defaultNow(),
  endDate: timestamp("end_date"),
  status: text("status").default("active"), // active, closed, pending
  roi: real("roi"), // Return on Investment (percentage)
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertInvestorSchema = createInsertSchema(investors).pick({
  userId: true,
  name: true,
  email: true,
  phone: true,
  investmentGoal: true,
  riskTolerance: true,
  investmentHorizon: true,
  preferredCommunication: true,
  status: true,
  joinDate: true,
  kyc: true,
  notes: true,
});

export const insertInvestmentSchema = createInsertSchema(investments).pick({
  investorId: true,
  name: true,
  type: true,
  initialDeposit: true,
  currentValue: true,
  currency: true,
  startDate: true,
  endDate: true,
  status: true,
  roi: true,
  notes: true,
});

export type Investor = typeof investors.$inferSelect;
export type Investment = typeof investments.$inferSelect;

// Investment performance tracking tables
export const investmentPerformance = pgTable("investment_performance", {
  id: serial("id").primaryKey(),
  investmentId: integer("investment_id").notNull().references(() => investments.id),
  period: text("period").notNull(), // YYYY-MM format
  startBalance: real("start_balance").notNull(),
  endBalance: real("end_balance").notNull(),
  percentReturn: real("percent_return").notNull(),
  grossProfit: real("gross_profit").notNull(),
  performanceFee: real("performance_fee").notNull(),
  setupFee: real("setup_fee").default(0),
  brokerProcessingFee: real("broker_processing_fee").default(0),
  otherFees: real("other_fees").default(0),
  netProfit: real("net_profit").notNull(),
  reportGenerated: boolean("report_generated").default(false),
  reportUrl: text("report_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Company revenue tracking
export const companyRevenue = pgTable("company_revenue", {
  id: serial("id").primaryKey(),
  period: text("period").notNull().unique(), // YYYY-MM format
  performanceFeeRevenue: real("performance_fee_revenue").default(0),
  setupFeeRevenue: real("setup_fee_revenue").default(0),
  brokerProcessingFeeRevenue: real("broker_processing_fee_revenue").default(0),
  totalRevenue: real("total_revenue").default(0),
  totalInvestorCount: integer("total_investor_count").default(0),
  totalAssetsUnderManagement: real("total_assets_under_management").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Fee settings configuration
export const feeSettings = pgTable("fee_settings", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  defaultPerformanceFeePercent: real("default_performance_fee_percent").default(20),
  defaultSetupFeePercent: real("default_setup_fee_percent").default(0),
  defaultSetupFeeFlat: real("default_setup_fee_flat").default(0),
  defaultBrokerProcessingFeePercent: real("default_broker_processing_fee_percent").default(0.5),
  defaultBrokerProcessingFeeFlat: real("default_broker_processing_fee_flat").default(0),
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertInvestmentPerformanceSchema = createInsertSchema(investmentPerformance).pick({
  investmentId: true,
  period: true,
  startBalance: true,
  endBalance: true,
  percentReturn: true,
  grossProfit: true,
  performanceFee: true,
  setupFee: true,
  brokerProcessingFee: true,
  otherFees: true,
  netProfit: true,
  reportGenerated: true,
  reportUrl: true,
});

export type InvestmentPerformance = typeof investmentPerformance.$inferSelect;
export type CompanyRevenue = typeof companyRevenue.$inferSelect;
export type FeeSetting = typeof feeSettings.$inferSelect;

// User webhooks table (for user-created webhooks)
export const userWebhooks = pgTable("user_webhooks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  token: text("token").notNull().unique(), // Unique webhook token
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastUsedAt: timestamp("last_used_at"),
  signalCount: integer("signal_count").default(0),
  isActive: boolean("is_active").default(true),
});

export type UserWebhook = typeof userWebhooks.$inferSelect;
export const insertUserWebhookSchema = createInsertSchema(userWebhooks).pick({
  userId: true,
  name: true,
  token: true,
  isActive: true,
});

// Import wallet-related schemas to ensure they're included in the DB
import "./wallet-schema";