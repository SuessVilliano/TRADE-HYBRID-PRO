/**
 * Types for the Bulls vs Bears Trading Game
 */

export enum GameMode {
  SINGLE_PLAYER = 'single_player',
  MULTIPLAYER = 'multiplayer', 
  PRACTICE = 'practice'
}

export enum MarketMovement {
  BULLISH = 'bullish',
  BEARISH = 'bearish',
  SIDEWAYS = 'sideways'
}

export enum TradingSide {
  BUY = 'buy',
  SELL = 'sell'
}

export enum GameState {
  IDLE = 'idle',
  STARTING = 'starting',
  ACTIVE = 'active',
  ROUND_ENDING = 'round_ending',
  GAME_OVER = 'game_over',
  PAUSED = 'paused'
}

export interface GameSettings {
  rounds: number;
  difficultyLevel: number;
  startingBalance: number;
  marketVolatility: number;
  aiAggressiveness: number;
  enableTutorial: boolean;
  selectedMarket: string;
  gameMode: GameMode;
}

export interface Player {
  id: string;
  name: string;
  balance: number;
  position: {
    size: number;
    side: TradingSide;
    entryPrice: number;
  } | null;
  score: number;
  winRate: number;
  roundsWon: number;
}

export interface MarketData {
  symbol: string;
  price: number;
  previousPrice: number;
  high: number;
  low: number;
  volume: number;
  trend: MarketMovement;
  momentum: number;
  volatility: number;
  priceHistory: number[];
}

export interface GameRound {
  roundNumber: number;
  startTime: number;
  endTime: number | null;
  winner: string | null;
  marketData: MarketData;
  playerPositions: Record<string, Player['position']>;
  roundScore: Record<string, number>;
}

export interface BullsVsBearsGameState {
  gameId: string;
  gameState: GameState;
  settings: GameSettings;
  players: Record<string, Player>;
  currentRound: GameRound | null;
  rounds: GameRound[];
  startTime: number | null;
  endTime: number | null;
  winner: string | null;
}

export interface GameAction {
  playerId: string;
  actionType: 'open_position' | 'close_position' | 'adjust_position';
  data: {
    side?: TradingSide;
    size?: number;
    price?: number;
  };
  timestamp: number;
}

// AI Personality types for the game
export enum AIPersonality {
  AGGRESSIVE = 'aggressive',  // Takes bigger risks, trades frequently
  CONSERVATIVE = 'conservative', // Risk-averse, waits for clear signals
  TECHNICAL = 'technical', // Relies heavily on technical indicators
  MOMENTUM = 'momentum', // Follows market trends
  RANDOM = 'random' // Unpredictable trading style
}

// Default game settings
export const DEFAULT_GAME_SETTINGS: GameSettings = {
  rounds: 5,
  difficultyLevel: 1,
  startingBalance: 10000,
  marketVolatility: 0.5,
  aiAggressiveness: 0.5,
  enableTutorial: true,
  selectedMarket: 'BTCUSD',
  gameMode: GameMode.SINGLE_PLAYER
};