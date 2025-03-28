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
    id: 'gemini',
    name: 'Gemini AI',
    logo: '/logos/gemini.svg',
    type: 'ai',
    url: 'https://aistudio.google.com/app/apikey',
    credentialFields: [
      { key: 'apiKey', label: 'API Key', type: 'password' }
    ],
    description: 'Google\'s advanced AI model for natural language understanding and generation'
  },
  {
    id: 'openai',
    name: 'OpenAI',
    logo: '/logos/openai.svg',
    type: 'ai',
    url: 'https://platform.openai.com/api-keys',
    credentialFields: [
      { key: 'apiKey', label: 'API Key', type: 'password' }
    ],
    description: 'Advanced language model capable of understanding and generating human-like text'
  },
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
  }
];

// Trading symbols by category
export const TRADING_SYMBOLS = {
  crypto: ['BTC/USD', 'ETH/USD', 'SOL/USD', 'BNB/USD', 'ADA/USD', 'DOT/USD', 'XRP/USD'],
  stocks: ['AAPL', 'MSFT', 'AMZN', 'GOOGL', 'META', 'TSLA', 'NVDA', 'JPM', 'V', 'DIS'],
  forex: ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 'USD/CHF', 'NZD/USD'],
  futures: ['ES', 'NQ', 'YM', 'RTY', 'CL', 'GC', 'SI', 'ZB', 'ZN', 'ZF']
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
  decimals: 18,
  initialSupply: 1000000000, // 1 billion
  contractAddress: '0xTHC123456789...', // Will be replaced with real address
  networkId: 8899, // Solana devnet
  explorerUrl: 'https://explorer.solana.com/address/',
  features: {
    staking: true,
    governance: true,
    reducedFees: true,
    exclusiveContent: true,
    tradingDiscounts: true,
  },
  distibution: {
    team: 0.15, // 15%
    publicSale: 0.40, // 40%
    ecosystem: 0.20, // 20%
    marketing: 0.10, // 10%
    rewards: 0.15, // 15%
  }
};

// ABATEV configuration (Advanced Broker Aggregation & Trade Execution View)
export const ABATEV_CONFIG = {
  enabled: true,
  supportedBrokers: ['alpaca', 'binance', 'oanda', 'ironbeam'],
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
    'coinbase': 89
  }
};