// Server-side constants

// Trading symbols for the market API
export const TRADING_SYMBOLS = [
  {
    id: 'BTCUSD',
    name: 'Bitcoin',
    baseCurrency: 'BTC',
    quoteCurrency: 'USD',
    minPrice: 20000,
    maxPrice: 80000,
    volatility: 0.05
  },
  {
    id: 'ETHUSD',
    name: 'Ethereum',
    baseCurrency: 'ETH',
    quoteCurrency: 'USD',
    minPrice: 1500,
    maxPrice: 5000,
    volatility: 0.06
  },
  {
    id: 'SOLUSDT',
    name: 'Solana',
    baseCurrency: 'SOL',
    quoteCurrency: 'USDT',
    minPrice: 50,
    maxPrice: 300,
    volatility: 0.08
  },
  {
    id: 'BNBUSD',
    name: 'Binance Coin',
    baseCurrency: 'BNB',
    quoteCurrency: 'USD',
    minPrice: 200,
    maxPrice: 500,
    volatility: 0.04
  },
  {
    id: 'ADAUSDT',
    name: 'Cardano',
    baseCurrency: 'ADA',
    quoteCurrency: 'USDT',
    minPrice: 0.25,
    maxPrice: 2,
    volatility: 0.07
  },
  {
    id: 'DOGEUSDT',
    name: 'Dogecoin',
    baseCurrency: 'DOGE',
    quoteCurrency: 'USDT',
    minPrice: 0.05,
    maxPrice: 0.3,
    volatility: 0.1
  }
];

// News topics for generating random news
export const NEWS_TOPICS = [
  'cryptocurrency',
  'stocks',
  'forex',
  'commodities',
  'economy',
  'technology',
  'regulations'
];

// Trading signal providers
export const SIGNAL_PROVIDERS = [
  'TradingView',
  'CoinBase',
  'MetaTrader',
  'TradingHybrid AI',
  'MarketPulse',
  'CryptoSignals',
  'ForexMasters'
];

// Leaderboard categories
export const LEADERBOARD_CATEGORIES = [
  'daily',
  'weekly',
  'monthly',
  'all-time'
];

// Game types
export const GAME_TYPES = [
  'bulls-vs-bears',
  'trading-competition',
  'price-prediction',
  'portfolio-challenge'
];

// Bot types for the bots API
export const BOT_TYPES = [
  'trend-following',
  'mean-reversion',
  'breakout',
  'scalping',
  'arbitrage',
  'dca'
];

// Market data time frames
export const TIMEFRAMES = [
  '1m',
  '5m',
  '15m',
  '30m',
  '1h',
  '4h',
  '1d',
  '1w'
];