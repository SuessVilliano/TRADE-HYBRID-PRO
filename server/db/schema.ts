import { pgTable, text, serial, integer, boolean, timestamp, real, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

// User Webhooks table for webhook URLs to receive trading signals
export const userWebhooks = pgTable("user_webhooks", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // References user ID
  name: text("name").notNull(), // Display name for the webhook
  token: text("token").notNull().unique(), // Unique token for webhook URL
  broker: text("broker").notNull().default('tradingview'), // The broker type this webhook connects to
  brokerConfig: jsonb("broker_config"), // Configuration specific to the broker
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  lastUsedAt: timestamp("last_used_at"),
  signalCount: integer("signal_count").default(0),
  isActive: boolean("is_active").default(true),
});

// Broker Credentials table for storing encrypted API keys
export const brokerCredentials = pgTable("broker_credentials", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // References user ID
  broker: text("broker").notNull(), // 'alpaca', 'oanda', 'ninjaTrader', etc.
  credentials: jsonb("credentials").notNull(), // Encrypted credentials
  isConnected: boolean("is_connected").default(false),
  lastChecked: timestamp("last_checked"),
  statusMessage: text("status_message"),
  accountInfo: jsonb("account_info"), // Account information from last connection
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Webhook Execution Records table for audit trail
export const webhookExecutions = pgTable("webhook_executions", {
  id: serial("id").primaryKey(),
  webhookId: text("webhook_id").notNull(), // References webhook ID
  userId: text("user_id").notNull(), // References user ID
  broker: text("broker").notNull(), // 'alpaca', 'oanda', 'ninjaTrader', etc.
  brokerAccountId: text("broker_account_id"), // The specific broker account used
  payload: jsonb("payload").notNull(), // The payload that was received
  result: jsonb("result").notNull(), // The result of the webhook execution
  timestamp: timestamp("timestamp").notNull().default(sql`CURRENT_TIMESTAMP`),
  responseTime: integer("response_time"), // in milliseconds
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
});

// Performance Metrics table
export const webhookPerformanceMetrics = pgTable("webhook_performance_metrics", {
  id: serial("id").primaryKey(),
  webhookId: text("webhook_id").notNull(), // References webhook ID
  responseTime: integer("response_time").notNull(), // in milliseconds
  success: boolean("success").notNull(),
  timestamp: timestamp("timestamp").notNull().default(sql`CURRENT_TIMESTAMP`),
  endpoint: text("endpoint").notNull(),
  errorMessage: text("error_message"),
});

// Error Insights table
export const errorInsights = pgTable("error_insights", {
  id: serial("id").primaryKey(),
  webhookId: text("webhook_id").notNull(), // References webhook ID
  errorPattern: text("error_pattern").notNull(),
  suggestedFix: text("suggested_fix").notNull(),
  severity: text("severity").notNull(), // 'low', 'medium', 'high'
  timestamp: timestamp("timestamp").notNull().default(sql`CURRENT_TIMESTAMP`),
  frequency: integer("frequency").notNull().default(1),
});