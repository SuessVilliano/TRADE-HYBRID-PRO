-- Add columns to prop_firm_accounts table
ALTER TABLE prop_firm_accounts 
ADD COLUMN IF NOT EXISTS market_type TEXT,
ADD COLUMN IF NOT EXISTS broker_model TEXT,
ADD COLUMN IF NOT EXISTS current_equity DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS high_watermark DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS current_drawdown DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS current_drawdown_percent DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS max_daily_loss DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS current_daily_loss DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS last_traded_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS trading_days_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS trades_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS winning_trades_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS losing_trades_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS rule_violations JSONB,
ADD COLUMN IF NOT EXISTS trading_restrictions JSONB,
ADD COLUMN IF NOT EXISTS scaling_plan JSONB,
ADD COLUMN IF NOT EXISTS notifications JSONB,
ADD COLUMN IF NOT EXISTS tags JSONB,
ADD COLUMN IF NOT EXISTS custom_settings JSONB,
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Add columns to prop_firm_challenges table
ALTER TABLE prop_firm_challenges 
ADD COLUMN IF NOT EXISTS market_type TEXT,
ADD COLUMN IF NOT EXISTS broker_model TEXT,
ADD COLUMN IF NOT EXISTS max_daily_loss DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS min_trading_days INTEGER,
ADD COLUMN IF NOT EXISTS max_trading_days INTEGER,
ADD COLUMN IF NOT EXISTS rules JSONB,
ADD COLUMN IF NOT EXISTS membership_level_required TEXT DEFAULT 'yearly',
ADD COLUMN IF NOT EXISTS discounted_price DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS scaling_plan JSONB;

-- Create feature_access table for membership feature access
CREATE TABLE IF NOT EXISTS feature_access (
  id SERIAL PRIMARY KEY,
  feature_id TEXT NOT NULL,
  feature_name TEXT NOT NULL,
  feature_description TEXT,
  membership_levels JSONB NOT NULL, -- Array of membership levels that have access
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Rename isActive to active in prop_firm_challenges
ALTER TABLE prop_firm_challenges
RENAME COLUMN is_active TO active;

-- Add additional indexes for performance
CREATE INDEX IF NOT EXISTS idx_prop_firm_accounts_market_type ON prop_firm_accounts(market_type);
CREATE INDEX IF NOT EXISTS idx_prop_firm_accounts_broker_model ON prop_firm_accounts(broker_model);
CREATE INDEX IF NOT EXISTS idx_prop_firm_accounts_status ON prop_firm_accounts(status);
CREATE INDEX IF NOT EXISTS idx_prop_firm_challenges_market_type ON prop_firm_challenges(market_type);
CREATE INDEX IF NOT EXISTS idx_prop_firm_challenges_broker_model ON prop_firm_challenges(broker_model);
CREATE INDEX IF NOT EXISTS idx_prop_firm_challenges_active ON prop_firm_challenges(active);

-- Insert initial feature access records
INSERT INTO feature_access (feature_id, feature_name, feature_description, membership_levels, is_public)
VALUES
  ('basic_charts', 'Basic Chart Access', 'Access to basic charting tools', '["free", "monthly", "yearly", "lifetime"]', true),
  ('learning_center_basic', 'Learning Center Basics', 'Access to basic learning materials', '["free", "monthly", "yearly", "lifetime"]', true),
  ('advanced_charts', 'Advanced Chart Access', 'Access to advanced charting tools with all indicators', '["monthly", "yearly", "lifetime"]', false),
  ('smart_trade_panel', 'Smart Trade Panel', 'Full access to the smart trade panel', '["monthly", "yearly", "lifetime"]', false),
  ('learning_center_full', 'Full Learning Center', 'Access to all learning materials', '["monthly", "yearly", "lifetime"]', false),
  ('broker_connections', 'Broker Connections', 'Ability to connect to supported brokers', '["monthly", "yearly", "lifetime"]', false),
  ('api_access', 'API Access', 'Access to the platform API', '["monthly", "yearly", "lifetime"]', false),
  ('prop_firm_challenges', 'Prop Firm Challenges', 'Access to prop firm challenge programs', '["yearly", "lifetime"]', false),
  ('copy_trading', 'Copy Trading', 'Access to copy trading functionality', '["yearly", "lifetime"]', false),
  ('priority_support', 'Priority Support', 'Priority customer support', '["lifetime"]', false),
  ('beta_features', 'Beta Features', 'Early access to beta features', '["lifetime"]', false),
  ('custom_prop_firm_rules', 'Custom Prop Firm Rules', 'Ability to customize prop firm challenge rules', '["lifetime"]', false);

-- Update existing records
UPDATE prop_firm_accounts
SET market_type = 'forex', 
    broker_model = 'tradehybrid',
    current_equity = current_balance,
    high_watermark = current_balance,
    current_drawdown = 0,
    current_drawdown_percent = 0
WHERE market_type IS NULL;

UPDATE prop_firm_challenges
SET market_type = 'forex', 
    broker_model = 'tradehybrid',
    membership_level_required = 'yearly',
    rules = '{}'
WHERE market_type IS NULL;