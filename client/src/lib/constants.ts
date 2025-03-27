// News Sources
export const NEWS_SOURCES = [
  "TradingView",
  "Bloomberg",
  "Wall Street Journal",
  "CNBC",
  "Reuters",
  "Financial Times",
  "MarketWatch",
  "Coindesk",
  "The Economist",
  "Trade Hybrid Insights",
  "Barron's",
  "Seeking Alpha"
];

// Trading Symbols
export const TRADING_SYMBOLS = {
  CRYPTO: [
    'BTCUSD',
    'ETHUSD',
    'THCUSD', // Trade Hybrid Coin
    'SOLUSD',
    'DOTUSD',
    'ADAUSD',
    'XRPUSD',
    'LINKUSD',
    'UNIUSD',
    'DOGEUSD'
  ],
  FOREX: [
    'EURUSD',
    'GBPUSD',
    'USDJPY',
    'AUDUSD',
    'USDCHF',
    'USDCAD',
    'NZDUSD',
    'EURGBP',
    'EURJPY',
    'GBPJPY'
  ],
  STOCKS: [
    'AAPL',
    'MSFT',
    'GOOGL',
    'AMZN',
    'META',
    'TSLA',
    'NVDA',
    'NFLX',
    'JPM',
    'V'
  ],
  INDICES: [
    'SPX500',
    'NASDAQ',
    'DJI',
    'DAX',
    'FTSE100',
    'CAC40',
    'NIKKEI',
    'HSI',
    'ASX200',
    'IBEX35'
  ],
  COMMODITIES: [
    'XAUUSD', // Gold
    'XAGUSD', // Silver
    'WTICOUSD', // Oil
    'NATGASUSD', // Natural Gas
    'COPPERUSD',
    'CORNUSD',
    'WHETUSD',
    'SOYUSD',
    'COALUSD',
    'COTTOUSD'
  ]
};

// Flatten all symbols into a single array
export const ALL_TRADING_SYMBOLS = Object.values(TRADING_SYMBOLS).flat();

// THC Token Details
export const THC_TOKEN = {
  name: 'Trade Hybrid Coin',
  symbol: 'THC',
  address: '4Th5syNiCf4jfxBzfLZJLFkFrcmJmw4UoNGCTY1EXdHo', // Solana blockchain address
  contractAddress: '4Th5syNiCf4jfxBzfLZJLFkFrcmJmw4UoNGCTY1EXdHo', // Alias for components
  decimals: 9,
  logo: '/images/thc-logo.png',
  explorer: 'https://solscan.io/token/4Th5syNiCf4jfxBzfLZJLFkFrcmJmw4UoNGCTY1EXdHo',
  price: 3.75, // Current price in USD
  priceChange24h: 2.5, // 24h price change in percentage
  marketCap: 37500000, // Market cap in USD
  totalSupply: 10000000, // Total supply of tokens
  circulatingSupply: 5000000, // Circulating supply of tokens
  holderCount: 2850, // Number of token holders
  stakingApy: 15.75, // Annual percentage yield for staking
  tradingVolume24h: 1250000 // 24h trading volume in USD
};

// Trading Chart Timeframes
export const CHART_TIMEFRAMES = [
  { value: '1m', label: '1 Minute' },
  { value: '5m', label: '5 Minutes' },
  { value: '15m', label: '15 Minutes' },
  { value: '30m', label: '30 Minutes' },
  { value: '1h', label: '1 Hour' },
  { value: '4h', label: '4 Hours' },
  { value: '1d', label: '1 Day' },
  { value: '1w', label: '1 Week' },
  { value: '1M', label: '1 Month' }
];

// Smart Trade Panel Settings
export const SMART_TRADE_PANEL_DEFAULT_SETTINGS = {
  useABATEV: true,
  defaultBroker: 'alpaca',
  defaultRiskPercentage: 1,
  defaultOrder: 'market',
  defaultSymbol: 'BTCUSD'
};

// Risk Management Settings
export const RISK_MANAGEMENT_SETTINGS = {
  maxRiskPerTrade: 3, // Percent of account
  defaultStopLoss: 1, // Percent from entry
  defaultTakeProfit: 2, // Percent from entry
  suggestedRiskReward: 1.5, // Minimum risk/reward ratio
  maxDailyDrawdown: 5, // Percent of account
  maxOpenPositions: 5 // Maximum number of open positions at once
};

// AI Assistant Settings
export const AI_ASSISTANT_SETTINGS = {
  defaultModel: 'gpt-3.5-turbo',
  suggestedPrompts: [
    'Analyze BTCUSD on the 4h timeframe',
    'Generate a trading plan for a bullish EURUSD',
    'What are the key support and resistance levels for AAPL?',
    'Suggest entry and exit points for a THCUSD swing trade',
    'Explain the current market conditions for crude oil'
  ],
  maxOutputTokens: 500,
  temperature: 0.3
};

// Market Hours
export const MARKET_HOURS = {
  FOREX: {
    open: true, // Forex markets are open 24/5
    note: 'Open 24 hours, Sunday 5pm ET to Friday 5pm ET'
  },
  CRYPTO: {
    open: true, // Crypto markets are open 24/7
    note: 'Open 24/7'
  },
  US_STOCKS: {
    open: true, // This would be determined by current time
    note: 'Open Monday-Friday, 9:30am to 4:00pm ET'
  },
  US_FUTURES: {
    open: true,
    note: 'Main session: Sunday-Friday 6:00pm to 5:00pm ET'
  }
};