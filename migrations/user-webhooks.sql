-- Create user_webhooks table
CREATE TABLE IF NOT EXISTS user_webhooks (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP,
  signal_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- Create an index on the token field for faster lookup
CREATE INDEX IF NOT EXISTS user_webhooks_token_idx ON user_webhooks(token);

-- Create an index on the user_id field for faster user-specific webhook lookups
CREATE INDEX IF NOT EXISTS user_webhooks_user_id_idx ON user_webhooks(user_id);