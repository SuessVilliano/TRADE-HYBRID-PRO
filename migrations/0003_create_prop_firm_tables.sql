-- Migration: Create Prop Firm tables

-- Create prop_firm_challenges table
CREATE TABLE IF NOT EXISTS prop_firm_challenges (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  account_size REAL NOT NULL,
  target_profit_phase1 REAL NOT NULL,
  target_profit_phase2 REAL,
  max_daily_drawdown REAL NOT NULL,
  max_total_drawdown REAL NOT NULL,
  min_trading_days INTEGER,
  duration_days INTEGER NOT NULL,
  restricted_instruments JSONB,
  broker_type_id INTEGER NOT NULL REFERENCES broker_types(id) ON DELETE RESTRICT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create prop_firm_accounts table
CREATE TABLE IF NOT EXISTS prop_firm_accounts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_id INTEGER REFERENCES prop_firm_challenges(id) ON DELETE SET NULL,
  account_name VARCHAR(255) NOT NULL,
  account_type VARCHAR(50) NOT NULL, -- 'challenge_phase1', 'challenge_phase2', 'funded'
  account_size REAL NOT NULL,
  current_balance REAL NOT NULL,
  profit_target REAL,
  max_daily_drawdown REAL,
  max_total_drawdown REAL,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) NOT NULL, -- 'active', 'completed', 'failed', 'funded'
  broker_connection_id INTEGER REFERENCES broker_connections(id) ON DELETE SET NULL,
  trading_allowed BOOLEAN DEFAULT TRUE,
  profit_split REAL DEFAULT 80,
  metrics JSONB,
  assigned_api_key TEXT,
  assigned_api_secret TEXT,
  assigned_api_passphrase TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create prop_firm_trades table
CREATE TABLE IF NOT EXISTS prop_firm_trades (
  id SERIAL PRIMARY KEY,
  prop_account_id INTEGER NOT NULL REFERENCES prop_firm_accounts(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  symbol VARCHAR(50) NOT NULL,
  side VARCHAR(10) NOT NULL, -- 'buy' or 'sell'
  quantity REAL NOT NULL,
  entry_price REAL NOT NULL,
  exit_price REAL,
  profit REAL,
  profit_percent REAL,
  leverage REAL DEFAULT 1,
  entry_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  exit_timestamp TIMESTAMP WITH TIME ZONE,
  active BOOLEAN DEFAULT TRUE NOT NULL,
  broker_order_id TEXT,
  trader_notes TEXT,
  admin_notes TEXT,
  tags JSONB,
  screenshots JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create prop_firm_payouts table
CREATE TABLE IF NOT EXISTS prop_firm_payouts (
  id SERIAL PRIMARY KEY,
  prop_account_id INTEGER NOT NULL REFERENCES prop_firm_accounts(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount REAL NOT NULL,
  status VARCHAR(20) NOT NULL, -- 'pending', 'processed', 'paid', 'rejected'
  trade_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  trade_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  payment_method VARCHAR(50),
  payment_details JSONB,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create prop_firm_metrics table
CREATE TABLE IF NOT EXISTS prop_firm_metrics (
  id SERIAL PRIMARY KEY,
  prop_account_id INTEGER NOT NULL REFERENCES prop_firm_accounts(id) ON DELETE CASCADE,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  balance REAL NOT NULL,
  equity REAL NOT NULL,
  daily_pnl REAL,
  daily_pnl_percent REAL,
  drawdown REAL,
  drawdown_percent REAL,
  total_trades INTEGER,
  winning_trades INTEGER,
  losing_trades INTEGER,
  win_rate REAL,
  avg_win REAL,
  avg_loss REAL,
  largest_win REAL,
  largest_loss REAL,
  profit_factor REAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_prop_firm_accounts_user_id ON prop_firm_accounts(user_id);
CREATE INDEX idx_prop_firm_accounts_challenge_id ON prop_firm_accounts(challenge_id);
CREATE INDEX idx_prop_firm_accounts_status ON prop_firm_accounts(status);
CREATE INDEX idx_prop_firm_trades_prop_account_id ON prop_firm_trades(prop_account_id);
CREATE INDEX idx_prop_firm_trades_user_id ON prop_firm_trades(user_id);
CREATE INDEX idx_prop_firm_trades_active ON prop_firm_trades(active);
CREATE INDEX idx_prop_firm_payouts_prop_account_id ON prop_firm_payouts(prop_account_id);
CREATE INDEX idx_prop_firm_payouts_user_id ON prop_firm_payouts(user_id);
CREATE INDEX idx_prop_firm_payouts_status ON prop_firm_payouts(status);
CREATE INDEX idx_prop_firm_metrics_prop_account_id ON prop_firm_metrics(prop_account_id);
CREATE INDEX idx_prop_firm_metrics_date ON prop_firm_metrics(date);