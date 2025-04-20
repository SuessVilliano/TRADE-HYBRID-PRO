import { create } from 'zustand';
import { usePriceStore } from './priceStore';

// Define types for our game
export type GameMode = 'single_player' | 'multiplayer';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type TradingPosition = 'buy' | 'sell' | 'neutral';

interface Player {
  id: string;
  name: string;
  type: 'bull' | 'bear';
  position: [number, number, number];
  balance: number;
  score: number;
  tradingPosition: TradingPosition;
  isAI: boolean;
}

export interface GameState {
  // Game settings
  gameMode: GameMode;
  difficulty: Difficulty;
  asset: string;
  timeFrame: string;
  
  // Game status
  isGameStarted: boolean;
  isGamePaused: boolean;
  isGameOver: boolean;
  round: number;
  roundDuration: number;
  timeRemaining: number;
  
  // Players
  humanPlayer: Player | null;
  aiTraders: Player[];
  
  // Game metrics
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
}

interface GameStore extends GameState {
  // Game initialization and control
  initializeGame: (options: {
    mode: GameMode,
    difficulty: Difficulty,
    playerName: string,
    playerType: 'bull' | 'bear',
    aiCount: number
  }) => void;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;
  resetGame: () => void;
  
  // Game actions
  placeTrade: (position: TradingPosition) => void;
  updateAITraders: () => void;
  advanceRound: () => void;
  
  // Helper functions
  calculateScore: () => number;
  getRandomPosition: () => [number, number, number];
}

// Generate a random ID
const generateId = () => {
  return Math.random().toString(36).substring(2, 9);
};

// Initial state
const initialState: GameState = {
  // Game settings
  gameMode: 'single_player',
  difficulty: 'medium',
  asset: 'BTC',
  timeFrame: '5m',
  
  // Game status
  isGameStarted: false,
  isGamePaused: false,
  isGameOver: false,
  round: 0,
  roundDuration: 30, // seconds per round
  timeRemaining: 30,
  
  // Players
  humanPlayer: null,
  aiTraders: [],
  
  // Game metrics
  totalTrades: 0,
  winningTrades: 0,
  losingTrades: 0,
};

// Create the game store
export const useGameStore = create<GameStore>()((set, get) => ({
  ...initialState,
  
  // Initialize the game with settings
  initializeGame: (options) => {
    const { mode, difficulty, playerName, playerType, aiCount } = options;
    
    // Set up human player
    const humanPlayer: Player = {
      id: generateId(),
      name: playerName || 'Player',
      type: playerType,
      position: [0, 0, 5], // Start position
      balance: 10000, // Starting balance
      score: 0,
      tradingPosition: 'neutral',
      isAI: false,
    };
    
    // Create AI traders
    const aiTraders: Player[] = [];
    for (let i = 0; i < aiCount; i++) {
      aiTraders.push({
        id: generateId(),
        name: `AI Trader ${i + 1}`,
        type: Math.random() > 0.5 ? 'bull' : 'bear',
        position: get().getRandomPosition(),
        balance: 10000,
        score: 0,
        tradingPosition: 'neutral',
        isAI: true,
      });
    }
    
    // Determine round duration based on difficulty
    const roundDuration = difficulty === 'easy' ? 45 : 
                          difficulty === 'medium' ? 30 : 20;
    
    // Set initial game state
    set({
      gameMode: mode,
      difficulty,
      humanPlayer,
      aiTraders,
      round: 0,
      roundDuration,
      timeRemaining: roundDuration,
      isGameStarted: false,
      isGamePaused: false,
      isGameOver: false,
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
    });
    
    // Initialize price store
    const priceStore = usePriceStore.getState();
    priceStore.resetPriceStore();
    priceStore.generatePrices(20, 50000); // Generate initial price history
    
    // Start price simulation
    const interval = difficulty === 'easy' ? 2000 : 
                     difficulty === 'medium' ? 1000 : 500;
    priceStore.simulateMarketCycle(interval);
  },
  
  // Start the game
  startGame: () => {
    if (get().isGameStarted) return;
    
    set({
      isGameStarted: true,
      isGamePaused: false,
    });
    
    // Schedule the first round
    setTimeout(() => {
      get().advanceRound();
    }, 1000);
  },
  
  // Pause the game
  pauseGame: () => {
    if (!get().isGameStarted || get().isGamePaused) return;
    
    set({ isGamePaused: true });
    
    // Pause price simulation
    usePriceStore.getState().stopSimulation();
  },
  
  // Resume the game
  resumeGame: () => {
    if (!get().isGameStarted || !get().isGamePaused) return;
    
    set({ isGamePaused: false });
    
    // Resume price simulation
    const { difficulty } = get();
    const interval = difficulty === 'easy' ? 2000 : 
                     difficulty === 'medium' ? 1000 : 500;
    usePriceStore.getState().simulateMarketCycle(interval);
  },
  
  // End the game
  endGame: () => {
    if (get().isGameOver) return;
    
    // Stop price simulation
    usePriceStore.getState().stopSimulation();
    
    // Calculate final score
    const finalScore = get().calculateScore();
    
    // Update player score
    const humanPlayer = get().humanPlayer;
    if (humanPlayer) {
      humanPlayer.score = finalScore;
      set({ humanPlayer });
    }
    
    set({
      isGameOver: true,
      isGamePaused: true,
    });
  },
  
  // Reset the game to initial state
  resetGame: () => {
    // Stop price simulation
    usePriceStore.getState().stopSimulation();
    
    // Reset to initial state
    set(initialState);
  },
  
  // Place a trade for the human player
  placeTrade: (position) => {
    if (!get().isGameStarted || get().isGamePaused || get().isGameOver) return;
    
    const { humanPlayer, totalTrades } = get();
    if (!humanPlayer) return;
    
    // Record the current price for reference
    const currentPrice = usePriceStore.getState().currentPrice;
    
    // Update the player's trading position
    const updatedPlayer = {
      ...humanPlayer,
      tradingPosition: position,
    };
    
    set({
      humanPlayer: updatedPlayer,
      totalTrades: totalTrades + 1,
    });
    
    // Log trade for debugging
    console.log(`Player placed a ${position} trade at ${currentPrice}`);
  },
  
  // Update AI traders' positions and trades
  updateAITraders: () => {
    if (!get().isGameStarted || get().isGamePaused || get().isGameOver) return;
    
    const { aiTraders, difficulty } = get();
    const priceStore = usePriceStore.getState();
    const marketTrend = priceStore.marketTrend;
    
    // Update each AI trader's position
    const updatedTraders = aiTraders.map(trader => {
      // Random movements
      const randomX = (Math.random() - 0.5) * 2;
      const randomZ = (Math.random() - 0.5) * 2;
      
      // Calculate new position
      const newPosition: [number, number, number] = [
        trader.position[0] + randomX,
        trader.position[1],
        trader.position[2] + randomZ,
      ];
      
      // Determine trading position based on AI type and market trend
      // Bulls are more likely to buy in bullish markets
      // Bears are more likely to sell in bearish markets
      let tradingProbability;
      
      if (trader.type === 'bull') {
        tradingProbability = {
          buy: marketTrend === 'bullish' ? 0.7 : marketTrend === 'bearish' ? 0.2 : 0.4,
          sell: marketTrend === 'bullish' ? 0.1 : marketTrend === 'bearish' ? 0.5 : 0.2,
          neutral: marketTrend === 'bullish' ? 0.2 : marketTrend === 'bearish' ? 0.3 : 0.4,
        };
      } else {
        tradingProbability = {
          buy: marketTrend === 'bullish' ? 0.3 : marketTrend === 'bearish' ? 0.1 : 0.2,
          sell: marketTrend === 'bullish' ? 0.2 : marketTrend === 'bearish' ? 0.7 : 0.4,
          neutral: marketTrend === 'bullish' ? 0.5 : marketTrend === 'bearish' ? 0.2 : 0.4,
        };
      }
      
      // AI makes smarter decisions based on difficulty
      const randomValue = Math.random();
      let tradePosition: TradingPosition;
      
      if (randomValue < tradingProbability.buy) {
        tradePosition = 'buy';
      } else if (randomValue < tradingProbability.buy + tradingProbability.sell) {
        tradePosition = 'sell';
      } else {
        tradePosition = 'neutral';
      }
      
      // Random movements
      const randomX = (Math.random() - 0.5) * 2;
      const randomZ = (Math.random() - 0.5) * 2;
      
      // Calculate new physical position
      const newPhysicalPosition: [number, number, number] = [
        trader.position[0] + randomX,
        trader.position[1],
        trader.position[2] + randomZ,
      ];
      
      return {
        ...trader,
        position: newPhysicalPosition,
        tradingPosition: tradePosition,
      };
    });
    
    set({ aiTraders: updatedTraders });
  },
  
  // Advance to the next round
  advanceRound: () => {
    if (!get().isGameStarted || get().isGamePaused || get().isGameOver) return;
    
    const { round, roundDuration, timeRemaining, humanPlayer, aiTraders } = get();
    
    // If time remaining > 0, just update the timer
    if (timeRemaining > 0) {
      set({ timeRemaining: timeRemaining - 1 });
      
      // Schedule next timer update
      setTimeout(() => {
        get().advanceRound();
      }, 1000);
      
      return;
    }
    
    // End of round processing
    const currentPrice = usePriceStore.getState().currentPrice;
    const marketTrend = usePriceStore.getState().marketTrend;
    
    // Update AI traders
    get().updateAITraders();
    
    // Process human player's trade
    let winningTrades = get().winningTrades;
    let losingTrades = get().losingTrades;
    
    if (humanPlayer) {
      let tradeOutcome = 0;
      
      // Determine if the trade was successful
      if (humanPlayer.tradingPosition === 'buy' && marketTrend === 'bullish') {
        tradeOutcome = 100; // Win for buying in bullish market
        winningTrades += 1;
      } else if (humanPlayer.tradingPosition === 'sell' && marketTrend === 'bearish') {
        tradeOutcome = 100; // Win for selling in bearish market
        winningTrades += 1;
      } else if (humanPlayer.tradingPosition !== 'neutral') {
        tradeOutcome = -50; // Loss for wrong position
        losingTrades += 1;
      }
      
      // Update player balance and score
      const updatedPlayer = {
        ...humanPlayer,
        balance: humanPlayer.balance + tradeOutcome,
        score: humanPlayer.score + (tradeOutcome > 0 ? 10 : tradeOutcome < 0 ? -5 : 0),
        tradingPosition: 'neutral', // Reset position for next round
      };
      
      set({ humanPlayer: updatedPlayer });
    }
    
    // Start next round or end game
    const maxRounds = 10;
    
    if (round >= maxRounds) {
      get().endGame();
    } else {
      // Increment round and reset timer
      set({
        round: round + 1,
        timeRemaining: roundDuration,
        winningTrades,
        losingTrades,
      });
      
      // Schedule next round timer
      setTimeout(() => {
        get().advanceRound();
      }, 1000);
    }
  },
  
  // Calculate current score
  calculateScore: () => {
    const { humanPlayer, winningTrades, losingTrades, totalTrades } = get();
    
    if (!humanPlayer) return 0;
    
    // Base score is the player's balance
    let score = humanPlayer.balance - 10000; // Profit/loss
    
    // Bonus for win rate
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
    score += Math.floor(winRate) * 10;
    
    return score;
  },
  
  // Helper function to get a random position in the game world
  getRandomPosition: (): [number, number, number] => {
    const x = (Math.random() - 0.5) * 30;
    const y = 0; // On the ground
    const z = (Math.random() - 0.5) * 30;
    
    return [x, y, z];
  },
}));