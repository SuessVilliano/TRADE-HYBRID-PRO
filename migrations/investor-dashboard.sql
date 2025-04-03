-- Create investment type enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'investment_type') THEN
        CREATE TYPE investment_type AS ENUM ('personal', 'prop_firm_management', 'hybrid_fund');
    END IF;
END$$;

-- Create investors table
CREATE TABLE IF NOT EXISTS investors (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  user_id INTEGER REFERENCES users(id),
  join_date TIMESTAMP NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  tags JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create investments table
CREATE TABLE IF NOT EXISTS investments (
  id SERIAL PRIMARY KEY,
  investor_id INTEGER NOT NULL REFERENCES investors(id),
  type investment_type NOT NULL,
  name TEXT NOT NULL,
  initial_deposit REAL NOT NULL,
  current_balance REAL NOT NULL,
  deposit_date TIMESTAMP NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  prop_firm_account_id INTEGER REFERENCES prop_firm_accounts(id),
  monthly_fee REAL DEFAULT 0,
  performance_fee_percent REAL DEFAULT 20,
  setup_fee REAL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create investment_performance table
CREATE TABLE IF NOT EXISTS investment_performance (
  id SERIAL PRIMARY KEY,
  investment_id INTEGER NOT NULL REFERENCES investments(id),
  period TEXT NOT NULL,
  start_balance REAL NOT NULL,
  end_balance REAL NOT NULL,
  percent_return REAL NOT NULL,
  gross_profit REAL NOT NULL,
  performance_fee REAL NOT NULL,
  setup_fee REAL NOT NULL,
  broker_processing_fee REAL NOT NULL,
  other_fees REAL DEFAULT 0,
  net_profit REAL NOT NULL,
  notes TEXT,
  report_generated BOOLEAN DEFAULT FALSE,
  report_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create company_revenue table
CREATE TABLE IF NOT EXISTS company_revenue (
  id SERIAL PRIMARY KEY,
  period TEXT NOT NULL,
  performance_fee_revenue REAL NOT NULL DEFAULT 0,
  setup_fee_revenue REAL NOT NULL DEFAULT 0,
  broker_processing_fee_revenue REAL NOT NULL DEFAULT 0,
  other_fee_revenue REAL NOT NULL DEFAULT 0,
  total_revenue REAL NOT NULL DEFAULT 0,
  total_investor_count INTEGER NOT NULL DEFAULT 0,
  total_assets_under_management REAL NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create fee_settings table
CREATE TABLE IF NOT EXISTS fee_settings (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  default_performance_fee_percent REAL NOT NULL DEFAULT 20,
  default_setup_fee REAL NOT NULL DEFAULT 0,
  default_monthly_fee REAL NOT NULL DEFAULT 0,
  default_broker_processing_fee_percent REAL NOT NULL DEFAULT 0,
  default_broker_processing_fee_flat REAL NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  effective_date TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Insert default fee settings
INSERT INTO fee_settings (
  name,
  default_performance_fee_percent,
  default_setup_fee,
  default_monthly_fee,
  default_broker_processing_fee_percent,
  default_broker_processing_fee_flat
) VALUES (
  'Default',
  20,
  100,
  0,
  0.5,
  10
);