-- Migration file to fix user ID types in trade signals related tables

-- 1. First create backups of affected tables
CREATE TABLE IF NOT EXISTS copy_trade_logs_backup AS SELECT * FROM copy_trade_logs;
CREATE TABLE IF NOT EXISTS signal_subscriptions_backup AS SELECT * FROM signal_subscriptions;

-- 2. Drop the original tables
DROP TABLE IF EXISTS copy_trade_logs;
DROP TABLE IF EXISTS signal_subscriptions;

-- 3. Recreate copy_trade_logs with integer user_id
CREATE TABLE copy_trade_logs (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  signal_id TEXT NOT NULL REFERENCES trade_signals(id),
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  auto_execute BOOLEAN DEFAULT FALSE,
  execution_status TEXT NOT NULL,
  broker_response JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 4. Recreate signal_subscriptions with integer user_id
CREATE TABLE signal_subscriptions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  provider_id TEXT NOT NULL,
  symbol TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  notifications_enabled BOOLEAN DEFAULT TRUE,
  auto_trade BOOLEAN DEFAULT FALSE,
  auto_trade_settings JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 5. Update the schema.ts file to match these changes (already done in the code)
-- Table schemas have been updated to use integer for user_id fields with references to users