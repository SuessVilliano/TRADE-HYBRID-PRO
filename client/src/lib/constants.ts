// Broker definitions
export const SUPPORTED_BROKERS = [
  {
    id: 'alpaca',
    name: 'Alpaca',
    description: 'Commission-free stock trading API',
    type: 'stocks',
    category: 'stocks',
    icon: '/assets/icons/alpaca-logo.svg',
    documentationUrl: 'https://alpaca.markets/docs/api-documentation/'
  },
  {
    id: 'oanda',
    name: 'Oanda',
    description: 'Forex trading platform with advanced API access',
    type: 'forex',
    category: 'forex',
    icon: '/assets/icons/oanda-logo.svg',
    documentationUrl: 'https://developer.oanda.com/rest-live-v20/introduction/'
  },
  {
    id: 'ninjatrader',
    name: 'NinjaTrader',
    description: 'Advanced trading platform for futures and forex',
    type: 'futures',
    category: 'futures',
    icon: '/assets/icons/ninjatrader-logo.svg',
    documentationUrl: 'https://ninjatrader.com/support/helpGuides/nt8/'
  },
  {
    id: 'kraken',
    name: 'Kraken',
    description: 'Cryptocurrency exchange with advanced API features',
    type: 'crypto',
    category: 'crypto',
    icon: '/assets/icons/kraken-logo.svg',
    documentationUrl: 'https://docs.kraken.com/rest/'
  },
  {
    id: 'binance',
    name: 'Binance',
    description: 'Leading cryptocurrency exchange with extensive API',
    type: 'crypto',
    category: 'crypto',
    icon: '/assets/icons/binance-logo.svg',
    documentationUrl: 'https://binance-docs.github.io/apidocs/'
  },
  {
    id: 'tradingview',
    name: 'TradingView',
    description: 'Chart and analysis platform with webhook alerts',
    type: 'signals',
    category: 'signals',
    icon: '/assets/icons/tradingview-logo.svg',
    documentationUrl: 'https://www.tradingview.com/support/solutions/43000529348-about-webhooks/'
  }
];

// Trading timeframes
export const TRADING_TIMEFRAMES = [
  { value: '1m', label: '1 Minute' },
  { value: '5m', label: '5 Minutes' },
  { value: '15m', label: '15 Minutes' },
  { value: '30m', label: '30 Minutes' },
  { value: '1h', label: '1 Hour' },
  { value: '4h', label: '4 Hours' },
  { value: 'D', label: 'Daily' },
  { value: 'W', label: 'Weekly' },
  { value: 'M', label: 'Monthly' }
];

// Market types
export const MARKET_TYPES = [
  { value: 'stocks', label: 'Stocks' },
  { value: 'forex', label: 'Forex' },
  { value: 'crypto', label: 'Crypto' },
  { value: 'futures', label: 'Futures' },
  { value: 'options', label: 'Options' }
];

// Trade types
export const TRADE_TYPES = [
  { value: 'market', label: 'Market Order' },
  { value: 'limit', label: 'Limit Order' },
  { value: 'stop', label: 'Stop Order' },
  { value: 'stop_limit', label: 'Stop Limit' },
];

// Order sides
export const ORDER_SIDES = [
  { value: 'buy', label: 'Buy' },
  { value: 'sell', label: 'Sell' }
];

// Popular symbols by market type (expanded to include more options for each broker)
export const POPULAR_SYMBOLS = {
  stocks: [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'JPM', 'BAC', 'WMT', 
    'NFLX', 'DIS', 'PYPL', 'ADBE', 'INTC', 'CRM', 'AMD', 'COST', 'PEP', 'KO',
    'PFE', 'T', 'CSCO', 'VZ', 'NKE', 'CMCSA', 'ABT', 'PG', 'TMO', 'AVGO',
    'ACN', 'DHR', 'QCOM', 'TXN', 'UNH', 'HON', 'NEE', 'LIN', 'ORCL', 'PM',
    'IBM', 'RTX', 'BA', 'GS', 'MS', 'C', 'BLK', 'AXP', 'V', 'MA'
  ],
  forex: [
    'EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 'USD/CHF', 'NZD/USD', 'EUR/GBP', 'EUR/JPY', 'GBP/JPY',
    'AUD/JPY', 'EUR/AUD', 'EUR/CAD', 'EUR/CHF', 'USD/MXN', 'USD/ZAR', 'USD/TRY', 'USD/CNH', 'USD/SGD', 'USD/HKD',
    'EUR/NZD', 'GBP/AUD', 'GBP/CAD', 'GBP/CHF', 'GBP/NZD', 'AUD/CAD', 'AUD/CHF', 'AUD/NZD', 'CAD/JPY', 'CHF/JPY'
  ],
  crypto: [
    'BTC/USD', 'ETH/USD', 'SOL/USD', 'XRP/USD', 'ADA/USD', 'DOT/USD', 'DOGE/USD', 'AVAX/USD', 'LINK/USD', 'MATIC/USD',
    'BNB/USD', 'UNI/USD', 'LTC/USD', 'SHIB/USD', 'XLM/USD', 'BCH/USD', 'ALGO/USD', 'ATOM/USD', 'XTZ/USD', 'EOS/USD',
    'FIL/USD', 'AAVE/USD', 'GRT/USD', 'MKR/USD', 'YFI/USD', 'COMP/USD', 'SNX/USD', 'CRV/USD', 'SUSHI/USD', 'BAT/USD',
    'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'XRPUSDT', 'ADAUSDT', 'DOTUSDT', 'DOGEUSDT', 'AVAXUSDT', 'LINKUSDT', 'MATICUSDT'
  ],
  futures: [
    'ES', 'NQ', 'YM', 'RTY', 'CL', 'GC', 'SI', 'ZB', 'ZN', 'ZS',
    'ZC', 'ZW', 'LE', 'HE', 'ZL', 'ZM', 'KC', 'CT', 'CC', 'SB',
    'NG', 'HO', 'RB', 'HG', 'PA', 'PL', 'BTC', 'ETH', '6E', '6J'
  ],
  options: [
    'SPY', 'QQQ', 'IWM', 'GLD', 'SLV', 'USO', 'XLF', 'XLE', 'EEM', 'FXI',
    'VXX', 'TLT', 'HYG', 'XLU', 'XLK', 'XLV', 'XLP', 'XLI', 'XLC', 'XLB',
    'UVXY', 'EWZ', 'EFA', 'TQQQ', 'SPXU', 'SQQQ', 'TNA', 'TZA', 'ARKK', 'ARKG'
  ]
};

// All trading symbols - flattened list of popular symbols
export const ALL_TRADING_SYMBOLS = [
  ...POPULAR_SYMBOLS.stocks,
  ...POPULAR_SYMBOLS.forex,
  ...POPULAR_SYMBOLS.crypto,
  ...POPULAR_SYMBOLS.futures,
  ...POPULAR_SYMBOLS.options
];

// Trading symbols with additional metadata
export const TRADING_SYMBOLS = [
  // Stocks
  ...POPULAR_SYMBOLS.stocks.map(symbol => ({ 
    symbol, 
    name: symbol, 
    market: 'stocks',
    description: `${symbol} Stock`,
    exchange: 'NASDAQ'
  })),
  
  // Forex
  ...POPULAR_SYMBOLS.forex.map(symbol => ({ 
    symbol, 
    name: symbol, 
    market: 'forex',
    description: `${symbol} Currency Pair`,
    exchange: 'FOREX'
  })),
  
  // Crypto
  ...POPULAR_SYMBOLS.crypto.map(symbol => ({ 
    symbol, 
    name: symbol, 
    market: 'crypto',
    description: `${symbol} Cryptocurrency`,
    exchange: 'Binance'
  })),
  
  // Futures
  ...POPULAR_SYMBOLS.futures.map(symbol => ({ 
    symbol, 
    name: symbol, 
    market: 'futures',
    description: `${symbol} Futures Contract`,
    exchange: 'CME'
  })),
  
  // Options
  ...POPULAR_SYMBOLS.options.map(symbol => ({ 
    symbol, 
    name: symbol, 
    market: 'options',
    description: `${symbol} Options`,
    exchange: 'CBOE'
  }))
];

// Popular trading strategies
export const TRADING_STRATEGIES = [
  { value: 'breakout', label: 'Breakout' },
  { value: 'pullback', label: 'Pullback' },
  { value: 'trend_following', label: 'Trend Following' },
  { value: 'mean_reversion', label: 'Mean Reversion' },
  { value: 'momentum', label: 'Momentum' },
  { value: 'scalping', label: 'Scalping' },
  { value: 'day_trading', label: 'Day Trading' },
  { value: 'swing_trading', label: 'Swing Trading' },
  { value: 'position_trading', label: 'Position Trading' },
  { value: 'range_trading', label: 'Range Trading' }
];

// API Endpoints
export const API_ENDPOINTS = {
  // Core API endpoints
  base: '/api',
  auth: '/api/auth',
  users: '/api/users',
  trading: '/api/trading',
  signals: '/api/signals',
  journal: '/api/journal',
  webhooks: '/api/webhooks',
  brokers: '/api/brokers',
  markets: '/api/markets',
  
  // Broker connections
  brokerConnections: '/api/brokers/connections',
  alpaca: '/api/brokers/alpaca',
  oanda: '/api/brokers/oanda',
  ninjaTrader: '/api/brokers/ninjatrader',
  tradingView: '/api/webhooks/tradingview',
  
  // Advanced services
  abatev: '/api/services/abatev',
  marketData: '/api/market-data',
  sentiment: '/api/analysis/sentiment',
  predictions: '/api/analysis/predictions',
  
  // User data
  profile: '/api/users/profile',
  settings: '/api/users/settings',
  notifications: '/api/users/notifications',
  
  // Crypto and tokens
  crypto: '/api/crypto',
  thcToken: '/api/crypto/thc',
  staking: '/api/crypto/staking',
  
  // WebSockets
  ws: '/ws'
};

// THC Token configuration
export const THC_TOKEN = {
  name: 'Trade Hybrid Coin',
  symbol: 'THC',
  decimals: 18,
  totalSupply: 100000000, // 100 million
  contractAddress: '2tQXeJtmzEqMvvMYwb6ZKJ2RXWfrbnzg3fUX1e8GuAUD',
  pumpFunUrl: 'https://pump.fun/coin/2tQXeJtmzEqMvvMYwb6ZKJ2RXWfrbnzg3fUX1e8GuAUD',
  network: 'Solana',
  icon: '/assets/icons/thc-token-logo.svg',
  explorerUrl: 'https://explorer.solana.com/address/{{address}}',
  whitepaper: '/docs/THC_Whitepaper.pdf',
  tokenomics: {
    trading: 35,
    staking: 20,
    liquidity: 15,
    team: 10,
    marketing: 10,
    reserve: 5,
    community: 5
  },
  price: 0.002500,
  priceChange24h: 3.5,
  stakingAPY: 12.5,
  minimumStakingAmount: 100,
  stakingTiers: [
    { tier: 1, label: 'Bronze', minAmount: 100, apy: 8 },
    { tier: 2, label: 'Silver', minAmount: 1000, apy: 10 },
    { tier: 3, label: 'Gold', minAmount: 10000, apy: 12 },
    { tier: 4, label: 'Platinum', minAmount: 50000, apy: 15 }
  ]
};