-- Create broker types table
CREATE TABLE IF NOT EXISTS broker_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  logo_url VARCHAR(255),
  requires_key BOOLEAN DEFAULT TRUE,
  requires_secret BOOLEAN DEFAULT TRUE,
  requires_passphrase BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create broker connections table
CREATE TABLE IF NOT EXISTS broker_connections (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  broker_type_id INTEGER NOT NULL REFERENCES broker_types(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  is_demo BOOLEAN DEFAULT FALSE,
  encrypted_key TEXT,
  encrypted_secret TEXT, 
  encrypted_passphrase TEXT,
  additional_config JSONB DEFAULT '{}'::jsonb,
  last_connected_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create copy trade relationships table
CREATE TABLE IF NOT EXISTS copy_trade_relationships (
  id SERIAL PRIMARY KEY,
  follower_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  leader_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  follower_connection_id INTEGER NOT NULL REFERENCES broker_connections(id) ON DELETE CASCADE,
  leader_connection_id INTEGER NOT NULL REFERENCES broker_connections(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT TRUE,
  position_sizing_type VARCHAR(50) DEFAULT 'fixed',
  position_sizing_value FLOAT DEFAULT 1.0,
  max_risk_per_trade FLOAT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate relationships
  UNIQUE(follower_user_id, leader_user_id, follower_connection_id, leader_connection_id)
);

-- Create copy trade history table
CREATE TABLE IF NOT EXISTS copy_trade_history (
  id SERIAL PRIMARY KEY,
  relationship_id INTEGER NOT NULL REFERENCES copy_trade_relationships(id) ON DELETE CASCADE,
  leader_order_id VARCHAR(255),
  follower_order_id VARCHAR(255),
  symbol VARCHAR(50) NOT NULL,
  quantity FLOAT NOT NULL,
  price FLOAT,
  side VARCHAR(10) NOT NULL,
  order_type VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial broker types
INSERT INTO broker_types (name, description, logo_url, requires_key, requires_secret, requires_passphrase) 
VALUES 
  ('Alpaca', 'Alpaca Markets stock trading API', 'https://alpaca.markets/logo.png', TRUE, TRUE, FALSE),
  ('OANDA', 'OANDA forex trading API', 'https://oanda.com/logo.png', TRUE, TRUE, FALSE),
  ('Tradovate', 'Tradovate futures trading API', 'https://tradovate.com/logo.png', TRUE, TRUE, FALSE),
  ('Binance', 'Binance cryptocurrency exchange API', 'https://binance.com/logo.png', TRUE, TRUE, TRUE),
  ('Binance US', 'Binance US cryptocurrency exchange API', 'https://binance.us/logo.png', TRUE, TRUE, TRUE),
  ('Kraken', 'Kraken cryptocurrency exchange API', 'https://kraken.com/logo.png', TRUE, TRUE, TRUE)
ON CONFLICT (id) DO NOTHING;