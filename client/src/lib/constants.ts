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