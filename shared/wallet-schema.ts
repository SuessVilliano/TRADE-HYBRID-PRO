import { pgTable, serial, text, timestamp, real, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { users } from "./schema";

/**
 * Wallets connected to user accounts
 */
export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  address: text("address").notNull().unique(),
  provider: text("provider").notNull(), // 'phantom', 'web3auth', etc.
  balanceUsd: real("balance_usd"),     // Cached balance in USD
  solBalance: real("sol_balance"),     // Cached SOL balance
  thcBalance: real("thc_balance"),     // Cached THC balance
  tokens: jsonb("tokens"),             // Cached token data
  isStaking: boolean("is_staking").default(false),
  stakedAmount: real("staked_amount").default(0),
  stakedSince: timestamp("staked_since"),
  lastRefreshed: timestamp("last_refreshed"),
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * NFTs associated with wallets
 */
export const nfts = pgTable("nfts", {
  id: serial("id").primaryKey(),
  walletId: integer("wallet_id").notNull().references(() => wallets.id),
  tokenAddress: text("token_address").notNull(),
  mintAddress: text("mint_address").notNull(),
  name: text("name"),
  symbol: text("symbol"),
  image: text("image"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * Wallet transactions
 */
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  walletId: integer("wallet_id").notNull().references(() => wallets.id),
  txHash: text("tx_hash").notNull().unique(),
  txType: text("tx_type").notNull(), // 'send', 'receive', 'swap', 'stake', etc.
  amount: real("amount"),
  tokenAddress: text("token_address"),
  timestamp: timestamp("timestamp").notNull(),
  status: text("status").notNull(), // 'confirmed', 'pending', 'failed'
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/**
 * THC staking records
 */
export const staking = pgTable("staking", {
  id: serial("id").primaryKey(),
  walletId: integer("wallet_id").notNull().references(() => wallets.id),
  amount: real("amount").notNull(),
  stakedAt: timestamp("staked_at").notNull(),
  unstakeDate: timestamp("unstake_date"), // If null, still staking
  validatorAddress: text("validator_address").notNull(),
  rewards: real("rewards").default(0),
  status: text("status").notNull(), // 'active', 'unstaked', 'pending', etc.
  lastRewardCalculation: timestamp("last_reward_calculation"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * Token price tracking
 */
export const tokenPrices = pgTable("token_prices", {
  id: serial("id").primaryKey(),
  tokenAddress: text("token_address").notNull(),
  symbol: text("symbol").notNull(),
  price: real("price").notNull(),
  source: text("source").notNull(), // 'birdeye', 'raydium', etc.
  timestamp: timestamp("timestamp").notNull(),
  percentChange24h: real("percent_change_24h"),
  volume24h: real("volume_24h"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});