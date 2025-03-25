export const TRADING_SYMBOLS = {
  CRYPTO: ["BTCUSD", "ETHUSD", "LTCUSD", "XRPUSD", "ADAUSD"],
  FOREX: ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD"],
  STOCKS: ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA"],
  INDICES: ["SPX500", "NASDAQ", "DJI", "FTSE100", "DAX30"],
  COMMODITIES: ["XAUUSD", "XAGUSD", "WTIUSD", "BRENTUSD"]
};

export const NEWS_SOURCES = [
  "Bloomberg",
  "Reuters",
  "CNBC",
  "Financial Times",
  "Wall Street Journal",
  "CoinDesk",
  "MarketWatch",
  "Investing.com",
  "ForexLive"
];

export const BOT_STRATEGY_TYPES = [
  {
    id: "trend",
    name: "Trend Following",
    description: "Follows market trends based on moving averages and momentum indicators"
  },
  {
    id: "breakout",
    name: "Breakout",
    description: "Trades when price breaks through resistance or support levels"
  },
  {
    id: "mean",
    name: "Mean Reversion",
    description: "Buys low and sells high based on the assumption that prices revert to the mean"
  },
  {
    id: "grid",
    name: "Grid Trading",
    description: "Places buy and sell orders at predetermined intervals"
  },
  {
    id: "arbitrage",
    name: "Arbitrage",
    description: "Exploits price differences across different exchanges or assets"
  },
  {
    id: "volume",
    name: "Volume Analysis",
    description: "Makes decisions based on trading volume and volume profiles"
  },
  {
    id: "custom",
    name: "Custom",
    description: "Write your own custom strategy with full access to the bot API"
  }
];

export const TIMEFRAMES = [
  { id: "1m", name: "1 Minute" },
  { id: "5m", name: "5 Minutes" },
  { id: "15m", name: "15 Minutes" },
  { id: "30m", name: "30 Minutes" },
  { id: "1h", name: "1 Hour" },
  { id: "4h", name: "4 Hours" },
  { id: "1d", name: "1 Day" },
  { id: "1w", name: "1 Week" }
];

export const TECHNICAL_INDICATORS = [
  { id: "sma", name: "Simple Moving Average" },
  { id: "ema", name: "Exponential Moving Average" },
  { id: "rsi", name: "Relative Strength Index" },
  { id: "macd", name: "MACD" },
  { id: "bollinger", name: "Bollinger Bands" },
  { id: "stochastic", name: "Stochastic Oscillator" },
  { id: "atr", name: "Average True Range" },
  { id: "adx", name: "Average Directional Index" }
];
