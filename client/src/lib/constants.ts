// Trading symbols by category
export const TRADING_SYMBOLS = {
  crypto: ['BTC/USD', 'ETH/USD', 'SOL/USD', 'ADA/USD', 'XRP/USD', 'DOT/USD', 'AVAX/USD', 'MATIC/USD', 'LINK/USD', 'UNI/USD', 'THC/USD'],
  forex: ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CAD', 'AUD/USD', 'NZD/USD', 'USD/CHF', 'EUR/GBP', 'EUR/JPY', 'GBP/JPY'],
  stocks: ['AAPL', 'MSFT', 'AMZN', 'GOOGL', 'META', 'TSLA', 'NVDA', 'JPM', 'V', 'WMT', 'DIS', 'NFLX'],
  indices: ['SPX500', 'NASDAQ', 'DJ30', 'VIX', 'UK100', 'GER40', 'JPN225', 'AUS200'],
  commodities: ['XAUUSD', 'XAGUSD', 'USOIL', 'UKOIL', 'NATGAS', 'COPPER', 'CORN', 'WHEAT', 'COTTON', 'SUGAR']
};

// All trading symbols combined in one array for convenience
export const ALL_TRADING_SYMBOLS = [
  ...TRADING_SYMBOLS.crypto,
  ...TRADING_SYMBOLS.forex,
  ...TRADING_SYMBOLS.stocks,
  ...TRADING_SYMBOLS.indices,
  ...TRADING_SYMBOLS.commodities
];

// Supported brokers
export const SUPPORTED_BROKERS = [
  {
    id: 'alpaca',
    name: 'Alpaca',
    description: 'Commission-free stock trading API',
    url: 'https://alpaca.markets',
    assets: ['stocks', 'crypto'],
    logoUrl: '/images/brokers/alpaca.svg',
    apiKeyFields: [
      { id: 'apiKey', label: 'API Key', type: 'password' },
      { id: 'apiSecret', label: 'API Secret', type: 'password' }
    ],
    testnetSupported: true
  },
  {
    id: 'oanda',
    name: 'OANDA',
    description: 'Forex and CFD trading platform',
    url: 'https://www.oanda.com',
    assets: ['forex', 'indices', 'commodities'],
    logoUrl: '/images/brokers/oanda.svg',
    apiKeyFields: [
      { id: 'accountId', label: 'Account ID', type: 'text' },
      { id: 'apiToken', label: 'API Token', type: 'password' }
    ],
    testnetSupported: true
  },
  {
    id: 'binance',
    name: 'Binance',
    description: 'Cryptocurrency exchange',
    url: 'https://www.binance.com',
    assets: ['crypto'],
    logoUrl: '/images/brokers/binance.svg',
    apiKeyFields: [
      { id: 'apiKey', label: 'API Key', type: 'password' },
      { id: 'apiSecret', label: 'API Secret', type: 'password' }
    ],
    testnetSupported: true
  },
  {
    id: 'tradehybrid',
    name: 'Trade Hybrid',
    description: 'All-in-one trading solution',
    url: 'https://tradehybrid.io',
    assets: ['stocks', 'forex', 'crypto', 'indices', 'commodities'],
    logoUrl: '/images/brokers/tradehybrid.svg',
    apiKeyFields: [
      { id: 'apiKey', label: 'API Key', type: 'password' },
      { id: 'accountId', label: 'Account ID', type: 'text' }
    ],
    testnetSupported: true,
    isBrokerAggregator: true
  }
];

// Game settings
export const GAME_SETTINGS = {
  // Bulls vs Bears game settings
  bullsVsBears: {
    difficultyLevels: ['beginner', 'intermediate', 'advanced', 'expert'],
    defaultDifficulty: 'intermediate',
    roundDuration: 180, // seconds
    initialBalance: 10000,
    scoreMultipliers: {
      beginner: 1,
      intermediate: 1.5,
      advanced: 2,
      expert: 3
    },
    aiStrategies: ['trend_follower', 'contrarian', 'swing_trader', 'day_trader', 'scalper'],
    marketVolatility: {
      beginner: 0.5,
      intermediate: 1,
      advanced: 1.5,
      expert: 2
    }
  },
  
  // Avatar customization options
  avatar: {
    skins: ['default', 'bronze', 'silver', 'gold', 'diamond', 'dark', 'cyborg'],
    outfits: ['suit', 'casual', 'formal', 'streetwear', 'futuristic', 'vintage', 'sporty'],
    accessories: ['none', 'glasses', 'hat', 'tie', 'watch', 'backpack', 'briefcase'],
    badges: ['none', 'beginner', 'intermediate', 'expert', 'master', 'diamond_hands', 'early_adopter']
  },
  
  // Trade House zones and features
  tradeHouse: {
    floors: ['lobby', 'trading_floor', 'education_center', 'vip_lounge', 'social_hub', 'marketplace'],
    specialEvents: ['market_crash', 'bull_run', 'earnings_season', 'economic_report', 'crypto_halving'],
    npcTypes: ['broker', 'analyst', 'mentor', 'trader', 'market_maker', 'influencer', 'regulator']
  }
};

// Chart timeframes
export const CHART_TIMEFRAMES = [
  { id: '1m', label: '1 minute' },
  { id: '5m', label: '5 minutes' },
  { id: '15m', label: '15 minutes' },
  { id: '30m', label: '30 minutes' },
  { id: '1h', label: '1 hour' },
  { id: '4h', label: '4 hours' },
  { id: 'D', label: 'Daily' },
  { id: 'W', label: 'Weekly' },
  { id: 'M', label: 'Monthly' }
];

// Trading tips categories
export const TRADING_TIP_CATEGORIES = [
  { id: 'general', label: 'General Trading' },
  { id: 'technical', label: 'Technical Analysis' },
  { id: 'fundamental', label: 'Fundamental Analysis' },
  { id: 'psychology', label: 'Trading Psychology' },
  { id: 'risk', label: 'Risk Management' },
  { id: 'crypto', label: 'Cryptocurrency' },
  { id: 'forex', label: 'Forex Trading' },
  { id: 'stocks', label: 'Stock Market' }
];

// Trading tips experience levels
export const TRADING_TIP_LEVELS = [
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
  { id: 'expert', label: 'Expert' }
];

// WebSocket event types
export const WS_EVENT_TYPES = {
  // Player events
  PLAYER_JOIN: 'player_join',
  PLAYER_LEAVE: 'player_leave',
  PLAYER_UPDATE: 'player_update',
  PLAYER_CHAT: 'player_chat',
  
  // Trading events
  TRADE_EXECUTED: 'trade_executed',
  PRICE_UPDATE: 'price_update',
  MARKET_ALERT: 'market_alert',
  
  // Social events
  FRIEND_REQUEST: 'friend_request',
  FRIEND_RESPONSE: 'friend_response',
  SOCIAL_ACTIVITY: 'social_activity',
  
  // Voice chat events
  VOICE_STATUS: 'voice_status',
  VOICE_DATA: 'voice_data',
  
  // System events
  SERVER_ANNOUNCEMENT: 'server_announcement',
  PING: 'ping',
  PONG: 'pong'
};

// Default avatar options for new users
export const DEFAULT_AVATAR_OPTIONS = {
  skin: 'default',
  outfit: 'casual',
  accessories: 'none',
  badges: ['beginner']
};

// NFT categories for marketplace
export const NFT_CATEGORIES = [
  { id: 'avatar', label: 'Avatar Items' },
  { id: 'badge', label: 'Achievement Badges' },
  { id: 'property', label: 'Virtual Property' },
  { id: 'tools', label: 'Trading Tools' },
  { id: 'art', label: 'Digital Art' },
  { id: 'collectible', label: 'Collectibles' }
];

// THC Token details
export const THC_TOKEN = {
  name: 'Trade Hybrid Coin',
  symbol: 'THC',
  decimals: 8,
  totalSupply: 100000000,
  contract: {
    solana: 'THC1nJ4vgBBNV8uFZ7ZjnQwX9FMbL3JCbL9KzYZhX7Bj',
    ethereum: '0xTHC1nJ4vgBBNV8uFZ7ZjnQwX9FMbL3JCbL9K'
  },
  logo: '/images/thc-logo.svg',
  useCases: ['marketplace', 'tips', 'premium-features', 'governance', 'staking']
};

// Smart Trade Panel default settings
export const SMART_TRADE_PANEL_DEFAULT_SETTINGS = {
  defaultSymbol: 'BTC/USD',
  defaultTimeframe: '1h',
  orderTypes: ['market', 'limit', 'stop', 'stop_limit'],
  defaultOrderType: 'market',
  defaultLeverage: 1,
  maxLeverage: 10,
  fees: {
    maker: 0.001, // 0.1%
    taker: 0.002, // 0.2%
  },
  riskLevels: {
    low: 0.01, // 1% of account
    medium: 0.02, // 2% of account
    high: 0.05, // 5% of account
  },
  defaultRiskLevel: 'medium',
  autoTakeProfit: {
    conservative: 0.03, // 3%
    moderate: 0.05, // 5%
    aggressive: 0.1, // 10%
  },
  autoStopLoss: {
    tight: 0.02, // 2%
    medium: 0.05, // 5%
    wide: 0.1, // 10%
  },
  chartIndicators: ['MA', 'EMA', 'RSI', 'MACD', 'Bollinger Bands'],
  defaultTradeBroker: 'tradehybrid'
};