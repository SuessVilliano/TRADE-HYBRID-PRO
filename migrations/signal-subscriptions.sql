-- Create signal_subscriptions table to replace the previous local storage approach
CREATE TABLE IF NOT EXISTS signal_subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  symbol TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  notifications_enabled BOOLEAN DEFAULT TRUE,
  auto_trade BOOLEAN DEFAULT FALSE,
  auto_trade_settings JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_signal_subscriptions_user_id ON signal_subscriptions(user_id);

-- Create compound index for user-provider combination lookups
CREATE INDEX IF NOT EXISTS idx_signal_subscriptions_user_provider ON signal_subscriptions(user_id, provider_id);

-- Add a comment explaining the purpose of this table
COMMENT ON TABLE signal_subscriptions IS 'Stores user subscriptions to trading signal providers';