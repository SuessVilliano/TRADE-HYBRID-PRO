import { pgTable, serial, varchar, text, timestamp, boolean, jsonb, integer } from 'drizzle-orm/pg-core';

export const tradingPlatforms = pgTable('trading_platforms', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  platformType: varchar('platform_type', { length: 50 }).notNull(), // 'dxtrade', 'matchtrader', 'ctrader', 'rithmic'
  apiBaseUrl: varchar('api_base_url', { length: 255 }).notNull(),
  webTradeUrl: varchar('web_trade_url', { length: 255 }),
  authType: varchar('auth_type', { length: 50 }).notNull(), // 'oauth', 'api_key', 'credentials'
  isActive: boolean('is_active').default(true),
  configuration: jsonb('configuration'), // Platform-specific config
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const userPlatformConnections = pgTable('user_platform_connections', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  platformId: integer('platform_id').notNull().references(() => tradingPlatforms.id),
  accountId: varchar('account_id', { length: 100 }).notNull(),
  credentials: jsonb('credentials'), // Encrypted credentials
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  tokenExpiry: timestamp('token_expiry'),
  isConnected: boolean('is_connected').default(false),
  lastSyncAt: timestamp('last_sync_at'),
  connectionData: jsonb('connection_data'), // Platform-specific connection info
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const tradingPlatformAccounts = pgTable('trading_platform_accounts', {
  id: serial('id').primaryKey(),
  connectionId: integer('connection_id').notNull().references(() => userPlatformConnections.id),
  accountNumber: varchar('account_number', { length: 100 }).notNull(),
  accountName: varchar('account_name', { length: 255 }),
  accountType: varchar('account_type', { length: 50 }), // 'demo', 'live', 'prop'
  currency: varchar('currency', { length: 10 }).default('USD'),
  balance: varchar('balance', { length: 50 }).default('0'),
  equity: varchar('equity', { length: 50 }).default('0'),
  margin: varchar('margin', { length: 50 }).default('0'),
  freeMargin: varchar('free_margin', { length: 50 }).default('0'),
  isActive: boolean('is_active').default(true),
  lastUpdated: timestamp('last_updated').defaultNow(),
  accountData: jsonb('account_data'), // Platform-specific account data
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const platformTrades = pgTable('platform_trades', {
  id: serial('id').primaryKey(),
  accountId: integer('account_id').notNull().references(() => tradingPlatformAccounts.id),
  platformTradeId: varchar('platform_trade_id', { length: 100 }).notNull(),
  symbol: varchar('symbol', { length: 20 }).notNull(),
  side: varchar('side', { length: 10 }).notNull(), // 'buy', 'sell'
  quantity: varchar('quantity', { length: 50 }).notNull(),
  price: varchar('price', { length: 50 }),
  stopLoss: varchar('stop_loss', { length: 50 }),
  takeProfit: varchar('take_profit', { length: 50 }),
  status: varchar('status', { length: 20 }).notNull(), // 'pending', 'filled', 'cancelled', 'rejected'
  orderType: varchar('order_type', { length: 20 }), // 'market', 'limit', 'stop'
  commission: varchar('commission', { length: 50 }).default('0'),
  swap: varchar('swap', { length: 50 }).default('0'),
  profit: varchar('profit', { length: 50 }).default('0'),
  openTime: timestamp('open_time'),
  closeTime: timestamp('close_time'),
  platformData: jsonb('platform_data'), // Raw platform trade data
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export type TradingPlatform = typeof tradingPlatforms.$inferSelect;
export type InsertTradingPlatform = typeof tradingPlatforms.$inferInsert;
export type UserPlatformConnection = typeof userPlatformConnections.$inferSelect;
export type InsertUserPlatformConnection = typeof userPlatformConnections.$inferInsert;
export type TradingPlatformAccount = typeof tradingPlatformAccounts.$inferSelect;
export type InsertTradingPlatformAccount = typeof tradingPlatformAccounts.$inferInsert;
export type PlatformTrade = typeof platformTrades.$inferSelect;
export type InsertPlatformTrade = typeof platformTrades.$inferInsert;