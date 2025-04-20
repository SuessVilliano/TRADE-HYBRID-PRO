-- Migration file to fix user ID types in various tables

-- 1. First create a backup of broker_credentials
CREATE TABLE IF NOT EXISTS broker_credentials_backup AS SELECT * FROM broker_credentials;

-- 2. Create a backup of user_webhooks
CREATE TABLE IF NOT EXISTS user_webhooks_backup AS SELECT * FROM user_webhooks;

-- 3. Drop the original tables
DROP TABLE IF EXISTS broker_credentials;
DROP TABLE IF EXISTS user_webhooks;

-- 4. Recreate broker_credentials with integer user_id
CREATE TABLE broker_credentials (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  broker TEXT NOT NULL,
  credentials JSONB NOT NULL,
  is_connected BOOLEAN DEFAULT FALSE,
  last_checked TIMESTAMP,
  status_message TEXT,
  account_info JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 5. Recreate user_webhooks with integer user_id
CREATE TABLE user_webhooks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  broker TEXT NOT NULL DEFAULT 'tradingview',
  broker_config JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMP,
  signal_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- 6. Copy data from backup tables (user will need to reconnect, since text IDs can't convert to integer directly)
-- This will be done by the users when they connect again

-- 7. Create indexes for faster lookups
CREATE INDEX broker_credentials_user_id_idx ON broker_credentials(user_id);
CREATE INDEX user_webhooks_user_id_idx ON user_webhooks(user_id);