import { pgTable, text, serial, integer, boolean, timestamp, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
  order: integer("order").notNull(),
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
  order: integer("order").notNull(),
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
  content: text("content").notNull(),
  courseId: integer("course_id").references(() => courses.id),
  lessonId: integer("lesson_id").references(() => lessons.id),
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