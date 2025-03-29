// Application-wide constants

// API endpoints
export const API_BASE_URL = '/api';
export const API_ENDPOINTS = {
  MARKET_DATA: `${API_BASE_URL}/market`,
  NEWS: `${API_BASE_URL}/news`,
  LEADERBOARD: `${API_BASE_URL}/leaderboard`,
  SIGNALS: `${API_BASE_URL}/signals`,
  BOTS: `${API_BASE_URL}/bots`,
  GAME: `${API_BASE_URL}/game`,
};

// Supported brokers with API integration details
export const SUPPORTED_BROKERS = [
  {
    id: 'alpaca',
    name: 'Alpaca',
    logo: '/logos/alpaca.svg',
    type: 'stocks',
    url: 'https://app.alpaca.markets/signin',
    credentialFields: [
      { key: 'apiKey', label: 'API Key', type: 'password' },
      { key: 'secretKey', label: 'Secret Key', type: 'password' }
    ],
    description: 'Commission-free stock trading API for automated investing and trading algorithms'
  },
  {
    id: 'binance',
    name: 'Binance',
    logo: '/logos/binance.svg',
    type: 'crypto',
    url: 'https://www.binance.com/en/my/settings/api-management',
    credentialFields: [
      { key: 'apiKey', label: 'API Key', type: 'password' },
      { key: 'secretKey', label: 'Secret Key', type: 'password' }
    ],
    description: 'World\'s largest crypto exchange by trading volume'
  },
  {
    id: 'oanda',
    name: 'OANDA',
    logo: '/logos/oanda.svg',
    type: 'forex',
    url: 'https://www.oanda.com/account/login',
    credentialFields: [
      { key: 'apiToken', label: 'API Token', type: 'password' },
      { key: 'accountId', label: 'Account ID', type: 'text' }
    ],
    description: 'Leading forex trading and CFD platform'
  },
  {
    id: 'ironbeam',
    name: 'Ironbeam',
    logo: '/logos/ironbeam.svg',
    type: 'futures',
    url: 'https://www.ironbeam.com/login',
    credentialFields: [
      { key: 'apiKey', label: 'API Key', type: 'password' },
      { key: 'accountId', label: 'Account ID', type: 'text' }
    ],
    description: 'Futures and options brokerage firm focused on institutional and professional traders'
  },
  {
    id: 'kraken',
    name: 'Kraken',
    logo: '/logos/kraken.svg',
    type: 'crypto',
    url: 'https://www.kraken.com/sign-in',
    credentialFields: [
      { key: 'apiKey', label: 'API Key', type: 'password' },
      { key: 'secretKey', label: 'Private Key', type: 'password' }
    ],
    description: 'One of the largest and oldest cryptocurrency exchanges with advanced trading features'
  },
  {
    id: 'coinbase',
    name: 'Coinbase',
    logo: '/logos/coinbase.svg',
    type: 'crypto',
    url: 'https://www.coinbase.com/signin',
    credentialFields: [
      { key: 'apiKey', label: 'API Key', type: 'password' },
      { key: 'secretKey', label: 'API Secret', type: 'password' },
      { key: 'passphrase', label: 'Passphrase', type: 'password' }
    ],
    description: 'User-friendly cryptocurrency exchange with extensive asset listings and educational resources'
  },
  {
    id: 'interactive_brokers',
    name: 'Interactive Brokers',
    logo: '/logos/interactive_brokers.svg',
    type: 'multi-asset',
    url: 'https://www.interactivebrokers.com/en/home.php',
    credentialFields: [
      { key: 'userId', label: 'User ID', type: 'text' },
      { key: 'password', label: 'Password', type: 'password' },
      { key: 'accountId', label: 'Account ID', type: 'text' }
    ],
    description: 'Global brokerage platform supporting stocks, options, futures, forex, bonds, and more with advanced trading tools'
  },
  {
    id: 'tradingview',
    name: 'TradingView',
    logo: '/logos/tradingview.svg',
    type: 'charting',
    url: 'https://www.tradingview.com/accounts/signin/',
    credentialFields: [
      { key: 'apiKey', label: 'API Key', type: 'password' },
      { key: 'userId', label: 'User ID', type: 'text' }
    ],
    description: 'Popular charting platform with social networking features and broker integration capabilities'
  },
  {
    id: 'fidelity',
    name: 'Fidelity',
    logo: '/logos/fidelity.svg',
    type: 'stocks',
    url: 'https://digital.fidelity.com/prgw/digital/login/full-page',
    credentialFields: [
      { key: 'accessToken', label: 'Access Token', type: 'password' },
      { key: 'accountId', label: 'Account ID', type: 'text' }
    ],
    description: 'Major brokerage firm offering commission-free stock trading, retirement accounts, and wealth management services'
  },
  {
    id: 'tradelocker',
    name: 'Trade Locker',
    logo: '/logos/tradelocker.svg',
    type: 'multi-asset',
    url: 'https://www.tradelocker.com',
    credentialFields: [
      { key: 'apiKey', label: 'API Key', type: 'password' },
      { key: 'clientId', label: 'Client ID', type: 'text' }
    ],
    description: 'Unified trading API allowing access to multiple exchanges and brokers through a single integration'
  },
  {
    id: 'ninjatrader',
    name: 'NinjaTrader',
    logo: '/logos/ninjatrader.svg', 
    type: 'futures',
    url: 'https://www.ninjatrader.com/',
    credentialFields: [
      { key: 'apiKey', label: 'API Key', type: 'password' },
      { key: 'accountId', label: 'Account ID', type: 'text' },
      { key: 'isTestnet', label: 'Use Demo Account', type: 'checkbox' }
    ],
    description: 'Professional trading and market analysis platform for active traders with advanced charting and execution features'
  },
  {
    id: 'tradovate',
    name: 'Tradovate',
    logo: '/logos/tradovate.svg',
    type: 'futures',
    url: 'https://tradovate.com/',
    credentialFields: [
      { key: 'apiKey', label: 'API Key', type: 'password' },
      { key: 'userId', label: 'User ID', type: 'text' },
      { key: 'password', label: 'Password', type: 'password' },
      { key: 'isTestnet', label: 'Use Demo Account', type: 'checkbox' }
    ],
    description: 'Modern futures trading platform with commission-free trading model and cloud-based technology'
  }
];

// Trading symbols by category
export const TRADING_SYMBOLS = {
  crypto: ['BTC/USD', 'ETH/USD', 'SOL/USD', 'BNB/USD', 'ADA/USD', 'DOT/USD', 'XRP/USD'],
  stocks: ['AAPL', 'MSFT', 'AMZN', 'GOOGL', 'META', 'TSLA', 'NVDA', 'JPM', 'V', 'DIS'],
  forex: ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 'USD/CHF', 'NZD/USD'],
  futures: ['ES', 'NQ', 'MNQ', 'YM', 'RTY', 'CL', 'GC', 'SI', 'ZB', 'ZN', 'ZF']
};

// Combined list of all trading symbols
export const ALL_TRADING_SYMBOLS = Object.values(TRADING_SYMBOLS).flat();

// Websocket configuration
export const WS_CONFIG = {
  ENDPOINT: window.location.origin.replace(/^http/, 'ws') + '/ws',
  RECONNECT_INTERVAL: 3000,
  MAX_RECONNECT_ATTEMPTS: 10,
};

// UI theme configuration
export const THEME = {
  COLORS: {
    PRIMARY: '#6D28D9', // Cyberpunk purple
    SECONDARY: '#06B6D4', // Turquoise blue
    BACKGROUND: {
      DARK: '#0F172A',
      LIGHT: '#F8FAFC',
    },
    TEXT: {
      DARK: '#F8FAFC', 
      LIGHT: '#1E293B',
    },
    ACCENT: {
      BULL: '#22C55E', // Green for bullish moves
      BEAR: '#EF4444', // Red for bearish moves
    },
    CHART: {
      UP: 'rgba(34, 197, 94, 0.2)',
      DOWN: 'rgba(239, 68, 68, 0.2)',
      LINE_UP: '#22C55E',
      LINE_DOWN: '#EF4444',
    },
  },
  FONTS: {
    PRIMARY: 'Inter, system-ui, sans-serif',
    MONOSPACE: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
  ANIMATION: {
    DURATION: {
      FAST: 150,
      NORMAL: 300,
      SLOW: 500,
    },
  },
};

// Asset paths for media files
export const ASSETS = {
  MODELS: {
    TRADER: '/models/trader_character.glb',
    BUILDING: '/models/trade_house.glb',
    BULL: '/models/bull_mascot.glb',
    BEAR: '/models/bear_mascot.glb',
  },
  TEXTURES: {
    FLOOR: '/textures/grid_floor.jpg',
    SKYBOX: '/textures/skybox.jpg',
  },
  SOUNDS: {
    NOTIFICATION: '/sounds/notification.mp3',
    BUTTON_CLICK: '/sounds/button_click.mp3',
    TRADE_SUCCESS: '/sounds/trade_success.mp3',
    TRADE_FAIL: '/sounds/trade_fail.mp3',
    BACKGROUND_MUSIC: '/sounds/background_music.mp3',
    TRADING_SIGNAL: '/sounds/trading-signal.mp3',
    PRICE_ALERT: '/sounds/price-alert.mp3',
    MESSAGE: '/sounds/message.mp3',
  },
  ICONS: {
    LOGO: '/icons/logo.svg',
    FAVICON: '/favicon.ico',
  },
};

// Game configuration
export const GAME_CONFIG = {
  SCENE: {
    FOG_NEAR: 10,
    FOG_FAR: 100,
    GRAVITY: -9.8,
  },
  PLAYER: {
    MOVEMENT_SPEED: 5,
    JUMP_FORCE: 5,
    CAMERA_HEIGHT: 1.8,
    INTERACT_DISTANCE: 3,
  },
  PHYSICS: {
    TIMESTEP: 1 / 60,
    SOLVER_ITERATIONS: 10,
  },
};

// NFT Marketplace configuration
export const NFT_CONFIG = {
  CHAIN_ID: '8899',  // Solana devnet
  TOKEN_NAME: 'Trade Hybrid Coin',
  TOKEN_SYMBOL: 'THC',
  CONTRACT_ADDRESS: '0xTHC123456789...', // Example address
  MARKETPLACE_FEE: 0.025, // 2.5%
  MIN_LISTING_PRICE: 10, // 10 THC
  MAX_LISTING_PRICE: 100000, // 100,000 THC
};

// Trading platform configuration
export const TRADING_CONFIG = {
  DEFAULT_LEVERAGE: 10,
  MAX_LEVERAGE: 100,
  DEFAULT_SYMBOL: 'BTCUSD',
  CHART_TIMEFRAMES: ['1m', '5m', '15m', '1h', '4h', '1d', '1w'],
  ORDER_TYPES: ['MARKET', 'LIMIT', 'STOP', 'TAKE_PROFIT'],
  DEFAULT_TAKE_PROFIT_PERCENTAGE: 0.05, // 5%
  DEFAULT_STOP_LOSS_PERCENTAGE: 0.03, // 3%
};

// Smart Trade Panel default settings
export const SMART_TRADE_PANEL_DEFAULT_SETTINGS = {
  autoFetchPrices: true,
  priceRefreshInterval: 5000, // 5 seconds
  enablePriceAlerts: true,
  enableNotifications: true,
  defaultOrderType: 'MARKET',
  defaultBroker: 'binance',
  showSpreadComparison: true,
  enableAITradeAnalysis: true,
  showTHCTokenInfo: true,
  defaultLeverage: 10,
  riskLevel: 'medium', // low, medium, high
  defaultTimeframe: '1h',
  tradeSizePercentage: 0.05, // 5% of account
  enableTrailingStopLoss: false,
  aiAnalysisLevel: 'standard', // basic, standard, advanced
};

// THC Token settings
export const THC_TOKEN = {
  name: 'Trade Hybrid Coin',
  symbol: 'THC',
  decimals: 6,
  initialSupply: 1000000000, // 1 billion
  contractAddress: '2tQXeJtmzEqMvvMYwb6ZKJ2RXWfrbnzg3fUX1e8GuAUD', // Real token address on Solana
  networkId: 101, // Solana mainnet
  explorerUrl: 'https://solscan.io/token/',
  pumpFunUrl: 'https://pump.fun/coin/2tQXeJtmzEqMvvMYwb6ZKJ2RXWfrbnzg3fUX1e8GuAUD',
  price: 0.000175, // Current price in USD
  priceChange24h: 2.5, // 24h price change percentage
  marketCap: 175000, // Market cap in USD
  tradingVolume24h: 32500, // 24h trading volume in USD
  volume24h: 32500, // 24h trading volume in USD (duplicated for UI display)
  circulatingSupply: 250000000, // Current circulating supply
  totalSupply: 1000000000, // Total supply
  maxSupply: 1000000000, // Maximum supply (same as total supply for THC)
  rank: 3421, // Market cap rank
  holderCount: 1250, // Number of token holders
  stakingApy: 12, // Current base APY percentage for staking
  features: {
    staking: true,
    governance: true,
    reducedFees: true,
    exclusiveContent: true,
    tradingDiscounts: true,
    affiliateProgram: true,
  },
  distribution: {
    team: 0.15, // 15%
    publicSale: 0.40, // 40%
    ecosystem: 0.20, // 20%
    marketing: 0.10, // 10%
    rewards: 0.15, // 15%
  },
  // Membership tiers based on token holdings
  membership: {
    basic: {
      minTokens: 0, 
      feeDiscount: 0.05, // 5% fee discount
      features: ['Basic Trading', 'Basic Charts', 'Public Streams']
    },
    advanced: {
      minTokens: 1000,
      feeDiscount: 0.25, // 25% fee discount  
      features: ['Advanced Trading', 'All Charting Tools', 'Education Resources']
    },
    premium: {
      minTokens: 10000,
      feeDiscount: 0.35, // 35% fee discount
      features: ['Premium Support', 'AI Trading Signals', 'Trading Automation', 'Copy Trading']
    },
    elite: {
      minTokens: 50000, 
      feeDiscount: 0.50, // 50% fee discount
      features: ['VIP Support', 'Priority Access', 'Exclusive Events', 'Enhanced Rewards']
    }
  },
  // Access control based on token ownership
  accessControl: {
    enabled: true,
    requireTokenOwnership: true,
    publicFeatures: ['Home', 'About', 'Token Info'], // Features available without tokens
    tokenGatedFeatures: ['Trading', 'NFT Marketplace', 'Metaverse', 'AI Tools'] // Requires token ownership
  }
};

// Price history data for the THC token with 3 months of data - timestamps and prices
export const THC_TOKEN_PRICE_HISTORY = (() => {
  const data = [];
  const now = new Date();
  const startDate = new Date(now);
  startDate.setMonth(now.getMonth() - 3); // 3 months ago
  
  // Starting price and some randomization parameters
  let price = 0.000110; // Starting price
  const volatility = 0.04; // Daily volatility factor
  const uptrend = 0.0005; // Slight uptrend factor
  
  // Generate daily price points for 3 months (90 days)
  for (let i = 0; i < 90; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    
    // Add some random price movement with slight uptrend and some volatility
    const change = (Math.random() - 0.45) * volatility * price; // Slight bias toward positive moves
    price = Math.max(0.000001, price + change + uptrend); // Ensure price doesn't go below 0.000001
    
    // Create 24 hourly entries for each day with smaller random fluctuations
    for (let hour = 0; hour < 24; hour++) {
      const hourlyDate = new Date(date);
      hourlyDate.setHours(hour);
      
      const hourlyChange = (Math.random() - 0.5) * volatility * price * 0.2; // Smaller hourly fluctuations
      const hourlyPrice = Math.max(0.000001, price + hourlyChange);
      
      data.push({
        timestamp: hourlyDate.getTime(),
        price: hourlyPrice,
      });
    }
  }
  
  return data;
})();

// Trading volume data for the THC token
export const THC_TOKEN_TRADING_VOLUME = (() => {
  const data = [];
  const now = new Date();
  const startDate = new Date(now);
  startDate.setMonth(now.getMonth() - 3); // 3 months ago
  
  // Base daily volume and randomization parameters
  const baseVolume = 1500000; // Base daily trading volume
  const volatilityFactor = 0.5; // Volume volatility factor
  
  // Generate daily volume points for 3 months (90 days)
  for (let i = 0; i < 90; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    
    // Add some random volume movement
    const randomFactor = 1 + (Math.random() - 0.5) * volatilityFactor;
    const volume = Math.round(baseVolume * randomFactor);
    
    // Create occasional volume spikes for more realistic data
    const isVolumeSpike = Math.random() < 0.1; // 10% chance of a volume spike
    const volumeMultiplier = isVolumeSpike ? 2 + Math.random() * 3 : 1; // 2-5x spike
    
    data.push({
      date: date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      volume: Math.round(volume * volumeMultiplier),
    });
  }
  
  return data;
})();

// ABATEV configuration (Advanced Broker Aggregation & Trade Execution View)
export const ABATEV_CONFIG = {
  enabled: true,
  supportedBrokers: ['alpaca', 'binance', 'oanda', 'ironbeam', 'ninjatrader', 'tradovate'],
  features: {
    priceComparison: true,
    smartRouting: true,
    multibrokerExecution: true,
    crossMarginTrading: true,
    bestExecutionAlgorithms: true,
    customStrategySupport: true
  },
  executionPresets: [
    { id: 'bestPrice', name: 'Best Price', description: 'Route orders to the broker offering the best price' },
    { id: 'lowestFees', name: 'Lowest Fees', description: 'Route orders to minimize trading fees' },
    { id: 'splitOrder', name: 'Split Order', description: 'Distribute large orders across multiple brokers to reduce market impact' },
    { id: 'instantExecution', name: 'Instant Execution', description: 'Prioritize execution speed over price optimization' }
  ],
  defaultExecutionPreset: 'bestPrice',
  refreshInterval: 2000, // 2 seconds
  // Scoring metrics for broker evaluation
  MAX_PRICE_SCORE: 100,
  MAX_LATENCY_SCORE: 100,
  MAX_RELIABILITY_SCORE: 100,
  // Broker reliability scores (0-100)
  BROKER_RELIABILITY_SCORES: {
    'alpaca': 88,
    'binance': 92,
    'oanda': 90,
    'ironbeam': 85,
    'kraken': 87,
    'coinbase': 89,
    'ninjatrader': 91,
    'tradovate': 86
  }
};