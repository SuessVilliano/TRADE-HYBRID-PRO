import { pgTable, text, serial, integer, boolean, timestamp, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  avatar: text("avatar"),
  balance: real("balance").notNull().default(10000),
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

export type LeaderboardEntry = typeof leaderboardEntries.$inferSelect;
