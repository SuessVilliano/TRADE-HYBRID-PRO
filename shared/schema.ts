import { pgTable, text, serial, integer, boolean, timestamp, real, jsonb, pgEnum } from "drizzle-orm/pg-core";
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

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // references the user
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
  userId: text("user_id").notNull(), // references the user
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
  userId: text("user_id").notNull(), // references the user
  courseId: integer("course_id").notNull().references(() => courses.id),
  certificateId: text("certificate_id").notNull(), // unique identifier for certificate
  issueDate: timestamp("issue_date").notNull().defaultNow(),
  expiryDate: timestamp("expiry_date"), // null for non-expiring certificates
  metadata: jsonb("metadata"), // any additional certificate data
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Will be defined after journalEntries declaration

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
  whopMemberSince: text("whop_member_since"),
  // Wallet integration fields
  walletAddress: text("wallet_address").unique(),
  walletAuthEnabled: boolean("wallet_auth_enabled").default(false),
  thcTokenHolder: boolean("thc_token_holder").default(false),
  // User preferences
  dashboardOrder: jsonb("dashboard_order"), // Array of module IDs in preferred order
  // Membership and permissions
  membershipLevel: text("membership_level").default('free'), // 'free', 'monthly', 'yearly', 'lifetime'
  membershipExpirationDate: timestamp("membership_expiration_date"),
  isAdmin: boolean("is_admin").default(false),
  isPropTrader: boolean("is_prop_trader").default(false), // For users who have been approved as prop traders
  customPermissions: jsonb("custom_permissions"), // Custom permissions overrides
  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  avatar: true,
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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTrade = z.infer<typeof insertTradeSchema>;
export type Trade = typeof trades.$inferSelect;

export type InsertBot = z.infer<typeof insertBotSchema>;
export type Bot = typeof bots.$inferSelect;

export type InsertTradeHouse = z.infer<typeof insertTradeHouseSchema>;
export type TradeHouse = typeof tradeHouses.$inferSelect;

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

// Export types for all tables
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

export type UserApiKey = typeof userApiKeys.$inferSelect;

// Broker types and broker connections for trading platforms
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

// User broker connections table for storing encrypted credentials
export const brokerConnections = pgTable("broker_connections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  brokerTypeId: integer("broker_type_id").notNull().references(() => brokerTypes.id),
  name: text("name").notNull(),
  // All sensitive data is encrypted before storage
  encryptedKey: text("encrypted_key"),
  encryptedSecret: text("encrypted_secret"),
  encryptedPassphrase: text("encrypted_passphrase"),
  additionalConfig: jsonb("additional_config"),
  isActive: boolean("is_active").default(true),
  isDemo: boolean("is_demo").default(false),
  lastConnectedAt: timestamp("last_connected_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Copy Trade relationships (for signal providers and followers)
export const copyTradeRelationships = pgTable("copy_trade_relationships", {
  id: serial("id").primaryKey(),
  followerUserId: integer("follower_user_id").notNull().references(() => users.id),
  providerUserId: integer("provider_user_id").notNull().references(() => users.id),
  followerBrokerConnectionId: integer("follower_broker_connection_id").notNull().references(() => brokerConnections.id),
  providerBrokerConnectionId: integer("provider_broker_connection_id").notNull().references(() => brokerConnections.id),
  isActive: boolean("is_active").default(true),
  positionSizePercentage: real("position_size_percentage").default(100), // % of provider's position to copy
  maxRiskPerTrade: real("max_risk_per_trade"), // max risk per trade in %
  maxDailyLoss: real("max_daily_loss"), // max daily loss in %
  customSettings: jsonb("custom_settings"), // custom settings for this relationship
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Trade history for copy trades
export const copyTradeHistory = pgTable("copy_trade_history", {
  id: serial("id").primaryKey(),
  relationshipId: integer("relationship_id").notNull().references(() => copyTradeRelationships.id),
  originalTradeId: integer("original_trade_id").references(() => trades.id),
  copiedTradeId: integer("copied_trade_id").references(() => trades.id),
  status: text("status").notNull(), // 'pending', 'executed', 'failed', 'cancelled'
  statusMessage: text("status_message"),
  providerDetails: jsonb("provider_details"), // details about the original trade
  modifiedParameters: jsonb("modified_parameters"), // any modifications made
  createdAt: timestamp("created_at").notNull().defaultNow(),
  executedAt: timestamp("executed_at"),
});

export type BrokerType = typeof brokerTypes.$inferSelect;
export type BrokerConnection = typeof brokerConnections.$inferSelect;
export type CopyTradeRelationship = typeof copyTradeRelationships.$inferSelect;
export type CopyTradeHistory = typeof copyTradeHistory.$inferSelect;

// Prop Firm tables
export const propFirmChallenges = pgTable("prop_firm_challenges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  marketType: text("market_type").notNull(), // 'futures', 'crypto', 'forex', 'stocks'
  brokerModel: text("broker_model").notNull(), // 'apex', 'topstep', 'ftmo', 'the5ers', 'tradehybrid'
  accountSize: real("account_size").notNull(), // e.g., 10000, 25000, 50000
  targetProfitPhase1: real("target_profit_phase1").notNull(), // e.g., 8% for Phase 1
  targetProfitPhase2: real("target_profit_phase2"), // e.g., 5% for Phase 2 (if applicable)
  maxDailyDrawdown: real("max_daily_drawdown").notNull(), // e.g., 5%
  maxTotalDrawdown: real("max_total_drawdown").notNull(), // e.g., 10%
  minTradingDays: integer("min_trading_days"), // Minimum number of trading days required
  maxTradingDays: integer("max_trading_days"), // Maximum days to complete the challenge
  durationDays: integer("duration_days").notNull(), // Duration in days for the challenge
  minTradesRequired: integer("min_trades_required"), // Minimum number of trades required
  maxDailyLoss: real("max_daily_loss"), // Maximum daily loss allowed in dollars
  maxPositionSize: real("max_position_size"), // Maximum position size as % of account
  minHoldingTime: integer("min_holding_time"), // Minimum holding time in minutes
  maxHoldingTime: integer("max_holding_time"), // Maximum holding time in minutes
  allowedTradingHours: jsonb("allowed_trading_hours"), // Time windows when trading is allowed
  restrictedInstruments: jsonb("restricted_instruments"), // Instruments that cannot be traded
  requiredInstruments: jsonb("required_instruments"), // Instruments that must be traded
  brokerTypeId: integer("broker_type_id").notNull().references(() => brokerTypes.id),
  membershipLevelRequired: text("membership_level_required").default('yearly'), // Minimum membership level required
  price: real("price"), // Price of the challenge (if directly purchased)
  isCustom: boolean("is_custom").default(false), // If this is a custom challenge for a specific trader
  customTraderId: integer("custom_trader_id").references(() => users.id), // If this is a custom challenge for a trader
  customRules: jsonb("custom_rules"), // Any custom rules specific to this challenge
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const propFirmAccounts = pgTable("prop_firm_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  challengeId: integer("challenge_id").references(() => propFirmChallenges.id), // If account started as a challenge
  accountName: text("account_name").notNull(),
  accountType: text("account_type").notNull(), // 'challenge_phase1', 'challenge_phase2', 'funded'
  marketType: text("market_type").notNull(), // 'futures', 'crypto', 'forex', 'stocks'
  brokerModel: text("broker_model").notNull(), // 'apex', 'topstep', 'ftmo', 'the5ers', 'tradehybrid'
  accountSize: real("account_size").notNull(),
  currentBalance: real("current_balance").notNull(),
  currentEquity: real("current_equity"), // Current balance + unrealized P&L
  highWatermark: real("high_watermark"), // Highest account balance reached
  profitTarget: real("profit_target"),
  maxDailyDrawdown: real("max_daily_drawdown"),
  maxTotalDrawdown: real("max_total_drawdown"),
  currentDrawdown: real("current_drawdown"), // Current drawdown amount
  currentDrawdownPercent: real("current_drawdown_percent"), // Current drawdown percentage
  maxDailyLoss: real("max_daily_loss"), // Max daily loss in dollars
  currentDailyLoss: real("current_daily_loss"), // Current day's loss amount
  startDate: timestamp("start_date").notNull().defaultNow(),
  endDate: timestamp("end_date"), // When challenge ends or account closed
  lastTradedDate: timestamp("last_traded_date"), // Last date a trade was made
  tradingDaysCount: integer("trading_days_count").default(0), // Count of days with trading activity
  tradesCount: integer("trades_count").default(0), // Total number of trades executed
  winningTradesCount: integer("winning_trades_count").default(0), // Number of winning trades
  losingTradesCount: integer("losing_trades_count").default(0), // Number of losing trades
  status: text("status").notNull(), // 'active', 'completed', 'failed', 'funded'
  brokerConnectionId: integer("broker_connection_id").references(() => brokerConnections.id), // Company-owned broker connection
  tradingAllowed: boolean("trading_allowed").default(true),
  ruleViolations: jsonb("rule_violations"), // Any rule violations by the trader
  tradingRestrictions: jsonb("trading_restrictions"), // Any restrictions on the trader
  profitSplit: real("profit_split").default(80), // Percentage of profits trader receives (e.g., 80%)
  scalingPlan: jsonb("scaling_plan"), // Plan for scaling account size based on performance
  metrics: jsonb("metrics"), // Store metrics like current drawdown, best day, etc.
  notifications: jsonb("notifications"), // Account-related notifications
  tags: jsonb("tags"), // Admin-defined tags for categorizing accounts
  // API credentials assigned to this trader (managed by the prop firm)
  assignedApiKey: text("assigned_api_key"),
  assignedApiSecret: text("assigned_api_secret"),
  assignedApiPassphrase: text("assigned_api_passphrase"),
  // Custom account settings
  customSettings: jsonb("custom_settings"), // Custom settings for this account
  adminNotes: text("admin_notes"), // Admin notes about this account
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const propFirmTrades = pgTable("prop_firm_trades", {
  id: serial("id").primaryKey(),
  propAccountId: integer("prop_account_id").notNull().references(() => propFirmAccounts.id),
  userId: integer("user_id").notNull().references(() => users.id),
  symbol: text("symbol").notNull(),
  side: text("side").notNull(), // 'buy' or 'sell'
  quantity: real("quantity").notNull(),
  entryPrice: real("entry_price").notNull(),
  exitPrice: real("exit_price"),
  profit: real("profit"),
  profitPercent: real("profit_percent"),
  leverage: real("leverage").default(1),
  entryTimestamp: timestamp("entry_timestamp").notNull(),
  exitTimestamp: timestamp("exit_timestamp"),
  active: boolean("active").notNull().default(true),
  brokerOrderId: text("broker_order_id"),
  traderNotes: text("trader_notes"),
  adminNotes: text("admin_notes"),
  tags: jsonb("tags"), // For categorizing trades
  screenshots: jsonb("screenshots"), // URLs to trade screenshots
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const propFirmPayouts = pgTable("prop_firm_payouts", {
  id: serial("id").primaryKey(),
  propAccountId: integer("prop_account_id").notNull().references(() => propFirmAccounts.id),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: real("amount").notNull(),
  status: text("status").notNull(), // 'pending', 'processed', 'paid', 'rejected'
  tradePeriodStart: timestamp("trade_period_start").notNull(),
  tradePeriodEnd: timestamp("trade_period_end").notNull(),
  paymentMethod: text("payment_method"), // 'crypto', 'bank', 'paypal', etc.
  paymentDetails: jsonb("payment_details"), // Wallet address, transaction ID, etc.
  requestedAt: timestamp("requested_at").notNull().defaultNow(),
  processedAt: timestamp("processed_at"),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const propFirmMetrics = pgTable("prop_firm_metrics", {
  id: serial("id").primaryKey(),
  propAccountId: integer("prop_account_id").notNull().references(() => propFirmAccounts.id),
  date: timestamp("date").notNull(),
  balance: real("balance").notNull(),
  equity: real("equity").notNull(),
  dailyPnl: real("daily_pnl"),
  dailyPnlPercent: real("daily_pnl_percent"),
  drawdown: real("drawdown"),
  drawdownPercent: real("drawdown_percent"),
  totalTrades: integer("total_trades"),
  winningTrades: integer("winning_trades"),
  losingTrades: integer("losing_trades"),
  winRate: real("win_rate"),
  avgWin: real("avg_win"),
  avgLoss: real("avg_loss"),
  largestWin: real("largest_win"),
  largestLoss: real("largest_loss"),
  profitFactor: real("profit_factor"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert schemas for validation
export const insertBrokerTypeSchema = createInsertSchema(brokerTypes);
export const insertBrokerConnectionSchema = createInsertSchema(brokerConnections);
export const insertCopyTradeRelationshipSchema = createInsertSchema(copyTradeRelationships);

// Export prop firm types
export type PropFirmChallenge = typeof propFirmChallenges.$inferSelect;
export type PropFirmAccount = typeof propFirmAccounts.$inferSelect;
export type PropFirmTrade = typeof propFirmTrades.$inferSelect;
export type PropFirmPayout = typeof propFirmPayouts.$inferSelect;
export type PropFirmMetric = typeof propFirmMetrics.$inferSelect;

export const insertPropFirmChallengeSchema = createInsertSchema(propFirmChallenges);
export const insertPropFirmAccountSchema = createInsertSchema(propFirmAccounts);
export const insertPropFirmTradeSchema = createInsertSchema(propFirmTrades);

// Chat system - Social networking features
// Chat room types enum
export const chatRoomTypeEnum = pgEnum('chat_room_type', ['public', 'private', 'group', 'trading']);

// Chat rooms table
export const chatRooms = pgTable('chat_rooms', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  type: chatRoomTypeEnum('type').notNull().default('public'),
  createdById: integer('created_by_id').references(() => users.id),
  icon: text('icon'),
  isActive: boolean('is_active').default(true).notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Chat room relations
export const chatRoomsRelations = relations(chatRooms, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [chatRooms.createdById],
    references: [users.id],
  }),
  messages: many(chatMessages),
  members: many(chatRoomMembers)
}));

// Chat messages table
export const chatMessages = pgTable('chat_messages', {
  id: serial('id').primaryKey(),
  roomId: integer('room_id').notNull().references(() => chatRooms.id),
  senderId: integer('sender_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  attachments: jsonb('attachments'),
  tradeSignal: jsonb('trade_signal'),
  reactionCount: jsonb('reaction_count'),
  replyToId: integer('reply_to_id').references(() => chatMessages.id),
  isDeleted: boolean('is_deleted').default(false).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Chat message relations
export const chatMessagesRelations = relations(chatMessages, ({ one, many }) => ({
  room: one(chatRooms, {
    fields: [chatMessages.roomId],
    references: [chatRooms.id],
  }),
  sender: one(users, {
    fields: [chatMessages.senderId],
    references: [users.id],
  }),
  replyTo: one(chatMessages, {
    fields: [chatMessages.replyToId],
    references: [chatMessages.id],
  }),
  reactions: many(messageReactions)
}));

// Message reactions table
export const messageReactions = pgTable('message_reactions', {
  id: serial('id').primaryKey(),
  messageId: integer('message_id').notNull().references(() => chatMessages.id),
  userId: integer('user_id').notNull().references(() => users.id),
  reaction: text('reaction').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Message reactions relations
export const messageReactionsRelations = relations(messageReactions, ({ one }) => ({
  message: one(chatMessages, {
    fields: [messageReactions.messageId],
    references: [chatMessages.id],
  }),
  user: one(users, {
    fields: [messageReactions.userId],
    references: [users.id],
  }),
}));

// Chat room members table
export const chatRoomMembers = pgTable('chat_room_members', {
  id: serial('id').primaryKey(),
  roomId: integer('room_id').notNull().references(() => chatRooms.id),
  userId: integer('user_id').notNull().references(() => users.id),
  isAdmin: boolean('is_admin').default(false).notNull(),
  isMuted: boolean('is_muted').default(false).notNull(),
  lastReadMessageId: integer('last_read_message_id').references(() => chatMessages.id),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Chat room members relations
export const chatRoomMembersRelations = relations(chatRoomMembers, ({ one }) => ({
  room: one(chatRooms, {
    fields: [chatRoomMembers.roomId],
    references: [chatRooms.id],
  }),
  user: one(users, {
    fields: [chatRoomMembers.userId],
    references: [users.id],
  }),
  lastReadMessage: one(chatMessages, {
    fields: [chatRoomMembers.lastReadMessageId],
    references: [chatMessages.id],
  }),
}));

// Direct messages conversations (for private chats)
export const directMessageConversations = pgTable('direct_message_conversations', {
  id: serial('id').primaryKey(),
  user1Id: integer('user1_id').notNull().references(() => users.id),
  user2Id: integer('user2_id').notNull().references(() => users.id),
  lastMessageAt: timestamp('last_message_at').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Direct message conversations relations
export const directMessageConversationsRelations = relations(directMessageConversations, ({ one, many }) => ({
  user1: one(users, {
    fields: [directMessageConversations.user1Id],
    references: [users.id],
  }),
  user2: one(users, {
    fields: [directMessageConversations.user2Id],
    references: [users.id],
  }),
  messages: many(directMessages)
}));

// Direct messages table
export const directMessages = pgTable('direct_messages', {
  id: serial('id').primaryKey(),
  conversationId: integer('conversation_id').notNull().references(() => directMessageConversations.id),
  senderId: integer('sender_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  attachments: jsonb('attachments'),
  tradeSignal: jsonb('trade_signal'),
  reactionCount: jsonb('reaction_count'),
  isRead: boolean('is_read').default(false).notNull(),
  isDeleted: boolean('is_deleted').default(false).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Direct messages relations
export const directMessagesRelations = relations(directMessages, ({ one, many }) => ({
  conversation: one(directMessageConversations, {
    fields: [directMessages.conversationId],
    references: [directMessageConversations.id],
  }),
  sender: one(users, {
    fields: [directMessages.senderId],
    references: [users.id],
  }),
  reactions: many(directMessageReactions)
}));

// Direct message reactions table
export const directMessageReactions = pgTable('direct_message_reactions', {
  id: serial('id').primaryKey(),
  messageId: integer('message_id').notNull().references(() => directMessages.id),
  userId: integer('user_id').notNull().references(() => users.id),
  reaction: text('reaction').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Direct message reactions relations
export const directMessageReactionsRelations = relations(directMessageReactions, ({ one }) => ({
  message: one(directMessages, {
    fields: [directMessageReactions.messageId],
    references: [directMessages.id],
  }),
  user: one(users, {
    fields: [directMessageReactions.userId],
    references: [users.id],
  }),
}));

// Export chat system types
export type ChatRoom = typeof chatRooms.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type MessageReaction = typeof messageReactions.$inferSelect;
export type ChatRoomMember = typeof chatRoomMembers.$inferSelect;
export type DirectMessageConversation = typeof directMessageConversations.$inferSelect;
export type DirectMessage = typeof directMessages.$inferSelect;
export type DirectMessageReaction = typeof directMessageReactions.$inferSelect;

// Create insert schemas for chat system
export const insertChatRoomSchema = createInsertSchema(chatRooms);
export const insertChatMessageSchema = createInsertSchema(chatMessages);
export const insertMessageReactionSchema = createInsertSchema(messageReactions);
export const insertChatRoomMemberSchema = createInsertSchema(chatRoomMembers);
export const insertDirectMessageConversationSchema = createInsertSchema(directMessageConversations);
export const insertDirectMessageSchema = createInsertSchema(directMessages);
export const insertDirectMessageReactionSchema = createInsertSchema(directMessageReactions);