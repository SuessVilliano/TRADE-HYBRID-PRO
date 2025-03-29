import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type GameMode = 'single_player' | 'multiplayer';
export type GameDifficulty = 'easy' | 'medium' | 'hard';
export type MarketTrend = 'bullish' | 'bearish' | 'sideways' | 'volatile';
export type TimeFrame = '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
export type Asset = 'BTC' | 'ETH' | 'SOL' | 'FUTURES_INDEX';

export interface PlayerPosition {
  id: string;
  entryPrice: number;
  size: number; // Positive for long, negative for short
  leverage: number;
  entryTime: number; // timestamp
  exitPrice?: number;
  exitTime?: number; // timestamp
  stopLoss?: number;
  takeProfit?: number;
  pnl?: number;
  pnlPercentage?: number;
  status: 'open' | 'closed' | 'liquidated';
}

export interface PlayerState {
  id: string;
  name: string;
  balance: number;
  initialBalance: number;
  openPositions: PlayerPosition[];
  closedPositions: PlayerPosition[];
  score: number;
  rank?: number;
  avatar?: string;
  isAI: boolean;
}

export interface PricePoint {
  time: number; // timestamp
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface GameState {
  gameMode: GameMode;
  gameId: string;
  difficulty: GameDifficulty;
  asset: Asset;
  timeFrame: TimeFrame;
  currentTrend: MarketTrend;
  marketVolatility: number; // 0-100
  round: number;
  maxRounds: number;
  isGameStarted: boolean;
  isGamePaused: boolean;
  isGameOver: boolean;
  startTime?: number; // timestamp
  endTime?: number; // timestamp
  players: PlayerState[];
  priceHistory: PricePoint[];
  currentPrice: number;
  timeLeft: number; // seconds
  roundDuration: number; // seconds
  winner?: string; // player id
}

export interface BullsVsBearsState {
  // Game configuration
  gameState: GameState;
  highScores: {
    [key in GameMode]: {
      [key in GameDifficulty]: {
        playerName: string;
        score: number;
        date: number; // timestamp
      }[];
    };
  };
  
  // Game statistics
  totalGamesPlayed: number;
  winCount: number;
  lossCount: number;
  
  // THC token integration
  thcTokenBalance: number;
  thcTokenSpent: number;
  thcTokenEarned: number;
  
  // Actions
  initializeGame: (config: {
    gameMode: GameMode;
    difficulty: GameDifficulty;
    asset: Asset;
    timeFrame: TimeFrame;
    playersCount: number;
    playerName: string;
  }) => void;
  
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;
  resetGame: () => void;
  
  // Player actions
  openPosition: (position: Omit<PlayerPosition, 'id' | 'entryTime' | 'status' | 'pnl' | 'pnlPercentage'>) => string; // Returns position ID
  closePosition: (positionId: string) => void;
  updateStopLoss: (positionId: string, stopLoss: number) => void;
  updateTakeProfit: (positionId: string, takeProfit: number) => void;
  
  // Market simulation
  generateNextPrice: () => void;
  simulateAIPlayers: () => void;
  advanceRound: () => void;
  
  // Helper methods
  getCurrentPlayer: () => PlayerState | undefined;
  getAIPlayers: () => PlayerState[];
  calculatePnL: (position: PlayerPosition) => { pnl: number; pnlPercentage: number };
  checkLiquidations: () => void;
  isPositionLiquidated: (position: PlayerPosition) => boolean;
}

// Initialize default market data generator
const generateInitialPriceHistory = (
  asset: Asset, 
  timeFrame: TimeFrame, 
  trend: MarketTrend, 
  volatility: number, 
  bars: number = 100
): PricePoint[] => {
  // Set starting price based on asset
  let basePrice = 0;
  switch(asset) {
    case 'BTC':
      basePrice = 50000;
      break;
    case 'ETH':
      basePrice = 3000;
      break;
    case 'SOL':
      basePrice = 100;
      break;
    case 'FUTURES_INDEX':
      basePrice = 1000;
      break;
  }
  
  // Volatility scaling factor (1-10)
  const volatilityFactor = Math.max(0.5, Math.min(10, volatility / 10));
  
  // Trend factor determines the general direction of the market
  let trendFactor = 0;
  switch(trend) {
    case 'bullish':
      trendFactor = 0.1 * volatilityFactor;
      break;
    case 'bearish':
      trendFactor = -0.1 * volatilityFactor;
      break;
    case 'sideways':
      trendFactor = 0;
      break;
    case 'volatile':
      trendFactor = 0; // Direction will vary more randomly
      break;
  }
  
  // Generate initial synthetic price history
  const now = Date.now();
  const timeFrameMilliseconds = getTimeFrameMilliseconds(timeFrame);
  const priceHistory: PricePoint[] = [];
  
  let currentPrice = basePrice;
  
  for (let i = 0; i < bars; i++) {
    // Time for this bar (going back from now)
    const time = now - ((bars - i) * timeFrameMilliseconds);
    
    // Base movement is influenced by trend
    let movement = trendFactor;
    
    // Add randomness based on volatility
    movement += (Math.random() - 0.5) * volatilityFactor * 0.02;
    
    // Apply movement
    currentPrice = currentPrice * (1 + movement);
    
    // Generate OHLC data
    const open = currentPrice;
    const changePercent = volatilityFactor * 0.01; // Max 1% change in volatile markets
    const high = open * (1 + (Math.random() * changePercent));
    const low = open * (1 - (Math.random() * changePercent));
    const close = open * (1 + ((Math.random() * 2 - 1) * changePercent));
    
    // Generate volume data
    const baseVolume = basePrice * 10; // Base volume is proportional to price
    const volumeVariation = Math.random() * 0.5 + 0.75; // 0.75 to 1.25
    const volume = baseVolume * volumeVariation;
    
    priceHistory.push({
      time,
      open,
      high,
      low,
      close,
      volume
    });
  }
  
  return priceHistory;
};

// Helper function to convert timeframe to milliseconds
const getTimeFrameMilliseconds = (timeFrame: TimeFrame): number => {
  switch(timeFrame) {
    case '1m': return 60 * 1000;
    case '5m': return 5 * 60 * 1000;
    case '15m': return 15 * 60 * 1000;
    case '1h': return 60 * 60 * 1000;
    case '4h': return 4 * 60 * 60 * 1000;
    case '1d': return 24 * 60 * 60 * 1000;
  }
};

// Generate a unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
};

// Default game state
const createDefaultGameState = (): GameState => ({
  gameMode: 'single_player',
  gameId: generateId(),
  difficulty: 'medium',
  asset: 'BTC',
  timeFrame: '5m',
  currentTrend: 'sideways',
  marketVolatility: 50,
  round: 0,
  maxRounds: 20,
  isGameStarted: false,
  isGamePaused: false,
  isGameOver: false,
  players: [],
  priceHistory: [],
  currentPrice: 0,
  timeLeft: 0,
  roundDuration: 30
});

// Initialize the store
export const useBullsVsBearsStore = create<BullsVsBearsState>()(
  persist(
    (set, get) => ({
      // Initial state
      gameState: createDefaultGameState(),
      highScores: {
        single_player: {
          easy: [],
          medium: [],
          hard: [],
        },
        multiplayer: {
          easy: [],
          medium: [],
          hard: [],
        },
      },
      totalGamesPlayed: 0,
      winCount: 0,
      lossCount: 0,
      thcTokenBalance: 0,
      thcTokenSpent: 0,
      thcTokenEarned: 0,
      
      // Game initialization
      initializeGame: (config) => {
        const {
          gameMode,
          difficulty,
          asset,
          timeFrame,
          playersCount,
          playerName,
        } = config;
        
        // Determine AI behavior based on difficulty
        const aiBalanceMultiplier = {
          easy: 0.8,
          medium: 1,
          hard: 1.2,
        }[difficulty];
        
        // Determine market conditions
        let trend: MarketTrend;
        let volatility: number;
        
        switch(difficulty) {
          case 'easy':
            trend = 'bullish';
            volatility = 30;
            break;
          case 'medium':
            trend = Math.random() > 0.5 ? 'bullish' : 'bearish';
            volatility = 50;
            break;
          case 'hard':
            trend = Math.random() > 0.7 ? 'volatile' : 'bearish';
            volatility = 80;
            break;
          default:
            trend = 'sideways';
            volatility = 50;
        }
        
        // Initialize player starting balance based on difficulty
        const playerStartingBalance = {
          easy: 10000,
          medium: 5000,
          hard: 2500,
        }[difficulty];
        
        // Create human player
        const humanPlayer: PlayerState = {
          id: generateId(),
          name: playerName || 'Player',
          balance: playerStartingBalance,
          initialBalance: playerStartingBalance,
          openPositions: [],
          closedPositions: [],
          score: 0,
          isAI: false,
        };
        
        // Create AI players
        const aiPlayers: PlayerState[] = [];
        for (let i = 0; i < playersCount - 1; i++) {
          aiPlayers.push({
            id: generateId(),
            name: `AI Trader ${i + 1}`,
            balance: playerStartingBalance * aiBalanceMultiplier,
            initialBalance: playerStartingBalance * aiBalanceMultiplier,
            openPositions: [],
            closedPositions: [],
            score: 0,
            isAI: true,
          });
        }
        
        // Generate price history
        const priceHistory = generateInitialPriceHistory(asset, timeFrame, trend, volatility);
        const currentPrice = priceHistory[priceHistory.length - 1].close;
        
        // Determine round duration based on timeframe
        const roundDuration = {
          '1m': 15,
          '5m': 30,
          '15m': 45,
          '1h': 60,
          '4h': 90,
          '1d': 120,
        }[timeFrame];
        
        // Initialize game state
        set({
          gameState: {
            gameMode,
            gameId: generateId(),
            difficulty,
            asset,
            timeFrame,
            currentTrend: trend,
            marketVolatility: volatility,
            round: 0,
            maxRounds: difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 30,
            isGameStarted: false,
            isGamePaused: false,
            isGameOver: false,
            players: [humanPlayer, ...aiPlayers],
            priceHistory,
            currentPrice,
            timeLeft: roundDuration,
            roundDuration,
          }
        });
      },
      
      // Game actions
      startGame: () => set((state) => {
        if (state.gameState.isGameStarted) return state;
        
        return {
          gameState: {
            ...state.gameState,
            isGameStarted: true,
            startTime: Date.now(),
          }
        };
      }),
      
      pauseGame: () => set((state) => {
        if (!state.gameState.isGameStarted || state.gameState.isGamePaused) return state;
        
        return {
          gameState: {
            ...state.gameState,
            isGamePaused: true,
          }
        };
      }),
      
      resumeGame: () => set((state) => {
        if (!state.gameState.isGameStarted || !state.gameState.isGamePaused) return state;
        
        return {
          gameState: {
            ...state.gameState,
            isGamePaused: false,
          }
        };
      }),
      
      endGame: () => set((state) => {
        if (state.gameState.isGameOver) return state;
        
        // Calculate final player positions
        const players = state.gameState.players.map(player => {
          // Close all open positions
          let updatedPlayer = { ...player };
          const currentPrice = state.gameState.currentPrice;
          
          const openPositions = [...player.openPositions];
          const closedPositions = [...player.closedPositions];
          
          openPositions.forEach(position => {
            const { pnl, pnlPercentage } = get().calculatePnL({
              ...position,
              exitPrice: currentPrice,
              exitTime: Date.now(),
            });
            
            closedPositions.push({
              ...position,
              exitPrice: currentPrice,
              exitTime: Date.now(),
              status: 'closed',
              pnl,
              pnlPercentage,
            });
            
            updatedPlayer.balance += pnl;
          });
          
          // Calculate score based on final balance relative to initial balance
          const profitPercent = (updatedPlayer.balance / updatedPlayer.initialBalance - 1) * 100;
          const score = Math.round(profitPercent * 10); // Simple scoring formula
          
          return {
            ...updatedPlayer,
            openPositions: [],
            closedPositions,
            score,
          };
        });
        
        // Determine winner (player with highest score)
        const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
        const winner = sortedPlayers[0].id;
        
        // Update high scores if player won
        const humanPlayer = players.find(p => !p.isAI);
        const didPlayerWin = humanPlayer && humanPlayer.id === winner;
        
        const newHighScores = { ...state.highScores };
        if (humanPlayer && humanPlayer.score > 0) {
          const { gameMode, difficulty } = state.gameState;
          const currentHighScores = newHighScores[gameMode][difficulty];
          
          currentHighScores.push({
            playerName: humanPlayer.name,
            score: humanPlayer.score,
            date: Date.now(),
          });
          
          // Sort and keep only top 10
          newHighScores[gameMode][difficulty] = currentHighScores
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);
        }
        
        // Update game statistics
        return {
          gameState: {
            ...state.gameState,
            isGameOver: true,
            endTime: Date.now(),
            players,
            winner,
          },
          highScores: newHighScores,
          totalGamesPlayed: state.totalGamesPlayed + 1,
          winCount: didPlayerWin ? state.winCount + 1 : state.winCount,
          lossCount: !didPlayerWin ? state.lossCount + 1 : state.lossCount,
          thcTokenEarned: didPlayerWin 
            ? state.thcTokenEarned + (state.gameState.difficulty === 'easy' ? 5 : state.gameState.difficulty === 'medium' ? 10 : 20) 
            : state.thcTokenEarned,
        };
      }),
      
      resetGame: () => set((state) => ({
        gameState: createDefaultGameState(),
      })),
      
      // Player actions
      openPosition: (positionData) => {
        const { getCurrentPlayer } = get();
        const { gameState } = get();
        const player = getCurrentPlayer();
        
        if (!player || gameState.isGameOver) return '';
        
        const positionCost = Math.abs(positionData.size) * positionData.entryPrice / positionData.leverage;
        
        // Check if player has enough balance
        if (player.balance < positionCost) return '';
        
        const positionId = generateId();
        const newPosition: PlayerPosition = {
          id: positionId,
          entryPrice: positionData.entryPrice,
          size: positionData.size,
          leverage: positionData.leverage,
          entryTime: Date.now(),
          stopLoss: positionData.stopLoss,
          takeProfit: positionData.takeProfit,
          status: 'open',
        };
        
        set((state) => {
          const updatedPlayers = state.gameState.players.map(p => {
            if (p.id === player.id) {
              return {
                ...p,
                balance: p.balance - positionCost,
                openPositions: [...p.openPositions, newPosition],
              };
            }
            return p;
          });
          
          return {
            gameState: {
              ...state.gameState,
              players: updatedPlayers,
            }
          };
        });
        
        return positionId;
      },
      
      closePosition: (positionId) => {
        const { getCurrentPlayer, calculatePnL } = get();
        const { gameState } = get();
        const player = getCurrentPlayer();
        
        if (!player || gameState.isGameOver) return;
        
        const position = player.openPositions.find(p => p.id === positionId);
        if (!position) return;
        
        const { pnl, pnlPercentage } = calculatePnL({
          ...position,
          exitPrice: gameState.currentPrice,
          exitTime: Date.now(),
        });
        
        const closedPosition: PlayerPosition = {
          ...position,
          exitPrice: gameState.currentPrice,
          exitTime: Date.now(),
          status: 'closed',
          pnl,
          pnlPercentage,
        };
        
        set((state) => {
          const updatedPlayers = state.gameState.players.map(p => {
            if (p.id === player.id) {
              return {
                ...p,
                balance: p.balance + pnl + (Math.abs(position.size) * position.entryPrice / position.leverage),
                openPositions: p.openPositions.filter(p => p.id !== positionId),
                closedPositions: [...p.closedPositions, closedPosition],
              };
            }
            return p;
          });
          
          return {
            gameState: {
              ...state.gameState,
              players: updatedPlayers,
            }
          };
        });
      },
      
      updateStopLoss: (positionId, stopLoss) => {
        const { getCurrentPlayer } = get();
        const player = getCurrentPlayer();
        
        if (!player) return;
        
        set((state) => {
          const updatedPlayers = state.gameState.players.map(p => {
            if (p.id === player.id) {
              return {
                ...p,
                openPositions: p.openPositions.map(pos => {
                  if (pos.id === positionId) {
                    return {
                      ...pos,
                      stopLoss,
                    };
                  }
                  return pos;
                }),
              };
            }
            return p;
          });
          
          return {
            gameState: {
              ...state.gameState,
              players: updatedPlayers,
            }
          };
        });
      },
      
      updateTakeProfit: (positionId, takeProfit) => {
        const { getCurrentPlayer } = get();
        const player = getCurrentPlayer();
        
        if (!player) return;
        
        set((state) => {
          const updatedPlayers = state.gameState.players.map(p => {
            if (p.id === player.id) {
              return {
                ...p,
                openPositions: p.openPositions.map(pos => {
                  if (pos.id === positionId) {
                    return {
                      ...pos,
                      takeProfit,
                    };
                  }
                  return pos;
                }),
              };
            }
            return p;
          });
          
          return {
            gameState: {
              ...state.gameState,
              players: updatedPlayers,
            }
          };
        });
      },
      
      // Market simulation
      generateNextPrice: () => {
        const { gameState } = get();
        const { 
          currentPrice, 
          currentTrend, 
          marketVolatility, 
          timeFrame, 
          priceHistory 
        } = gameState;
        
        if (!currentPrice) return;
        
        // Base movement is influenced by trend
        let trendFactor = 0;
        switch(currentTrend) {
          case 'bullish':
            trendFactor = 0.001;
            break;
          case 'bearish':
            trendFactor = -0.001;
            break;
          case 'sideways':
            trendFactor = 0;
            break;
          case 'volatile':
            trendFactor = (Math.random() > 0.5 ? 1 : -1) * 0.001;
            break;
        }
        
        // Volatility scaling factor (1-10)
        const volatilityFactor = Math.max(0.5, Math.min(10, marketVolatility / 10));
        
        // Apply trend and randomness
        const movement = trendFactor + (Math.random() - 0.5) * 0.002 * volatilityFactor;
        
        // Calculate new price
        const newPrice = currentPrice * (1 + movement);
        
        // Create a new price point
        const time = Date.now();
        const open = currentPrice;
        const close = newPrice;
        const changePercent = volatilityFactor * 0.005; // Max 0.5% change in volatile markets
        const high = Math.max(open, close) * (1 + (Math.random() * changePercent));
        const low = Math.min(open, close) * (1 - (Math.random() * changePercent));
        
        // Generate volume data
        const baseVolume = currentPrice * 10; // Base volume is proportional to price
        const volumeVariation = Math.random() * 0.5 + 0.75; // 0.75 to 1.25
        const volume = baseVolume * volumeVariation;
        
        const newPricePoint: PricePoint = {
          time,
          open,
          high,
          low,
          close,
          volume
        };
        
        set((state) => ({
          gameState: {
            ...state.gameState,
            priceHistory: [...state.gameState.priceHistory, newPricePoint],
            currentPrice: newPrice,
          }
        }));
        
        // Check for stop losses and take profits
        get().checkLiquidations();
      },
      
      simulateAIPlayers: () => {
        const { getAIPlayers, gameState } = get();
        const aiPlayers = getAIPlayers();
        
        if (aiPlayers.length === 0 || gameState.isGameOver) return;
        
        // For each AI player, make trading decisions
        aiPlayers.forEach(aiPlayer => {
          // AI strategy based on difficulty
          const aggressiveness = {
            easy: 0.3,
            medium: 0.5,
            hard: 0.8,
          }[gameState.difficulty];
          
          // Probability of taking action this round
          const actionProbability = Math.random();
          if (actionProbability > 0.7) { // 30% chance to take action
            // Decide whether to open or close positions
            if (aiPlayer.openPositions.length < 2 && Math.random() < aggressiveness) {
              // Open a new position
              const leverageOptions = [1, 2, 5, 10, 20];
              const leverage = leverageOptions[Math.floor(Math.random() * (gameState.difficulty === 'easy' ? 2 : gameState.difficulty === 'medium' ? 3 : 5))];
              
              // Determine position size (% of balance)
              const positionSizePercent = Math.random() * 0.5 + 0.1; // 10-60% of balance
              const maxPositionSize = aiPlayer.balance * positionSizePercent * leverage;
              
              // Determine position direction (long/short)
              const isLong = Math.random() > 0.4; // Slightly favor long positions
              const size = isLong ? maxPositionSize : -maxPositionSize;
              
              // Set stop loss and take profit
              const stopLossPercent = Math.random() * 0.02 + 0.01; // 1-3%
              const takeProfitPercent = Math.random() * 0.03 + 0.02; // 2-5%
              
              const stopLoss = isLong 
                ? gameState.currentPrice * (1 - stopLossPercent) 
                : gameState.currentPrice * (1 + stopLossPercent);
                
              const takeProfit = isLong 
                ? gameState.currentPrice * (1 + takeProfitPercent) 
                : gameState.currentPrice * (1 - takeProfitPercent);
              
              // Open the position
              set((state) => {
                const positionId = generateId();
                const newPosition: PlayerPosition = {
                  id: positionId,
                  entryPrice: state.gameState.currentPrice,
                  size,
                  leverage,
                  entryTime: Date.now(),
                  stopLoss,
                  takeProfit,
                  status: 'open',
                };
                
                const positionCost = Math.abs(size) * state.gameState.currentPrice / leverage;
                
                // Only open if AI has enough balance
                if (aiPlayer.balance < positionCost) return state;
                
                const updatedPlayers = state.gameState.players.map(p => {
                  if (p.id === aiPlayer.id) {
                    return {
                      ...p,
                      balance: p.balance - positionCost,
                      openPositions: [...p.openPositions, newPosition],
                    };
                  }
                  return p;
                });
                
                return {
                  gameState: {
                    ...state.gameState,
                    players: updatedPlayers,
                  }
                };
              });
            } else if (aiPlayer.openPositions.length > 0) {
              // Possibly close a position
              const positionToClose = aiPlayer.openPositions[Math.floor(Math.random() * aiPlayer.openPositions.length)];
              
              // Decide whether to close based on current PnL
              const { pnl, pnlPercentage } = get().calculatePnL({
                ...positionToClose,
                exitPrice: gameState.currentPrice,
                exitTime: Date.now(),
              });
              
              // More likely to close if profitable or very unprofitable
              const shouldClose = 
                (pnlPercentage > 0 && Math.random() < 0.4) || // 40% chance if profitable
                (pnlPercentage < -5 && Math.random() < 0.7) || // 70% chance if down >5%
                Math.random() < 0.1; // 10% random chance anyway
              
              if (shouldClose) {
                // Close the position
                set((state) => {
                  const closedPosition: PlayerPosition = {
                    ...positionToClose,
                    exitPrice: state.gameState.currentPrice,
                    exitTime: Date.now(),
                    status: 'closed',
                    pnl,
                    pnlPercentage,
                  };
                  
                  const updatedPlayers = state.gameState.players.map(p => {
                    if (p.id === aiPlayer.id) {
                      return {
                        ...p,
                        balance: p.balance + pnl + (Math.abs(positionToClose.size) * positionToClose.entryPrice / positionToClose.leverage),
                        openPositions: p.openPositions.filter(pos => pos.id !== positionToClose.id),
                        closedPositions: [...p.closedPositions, closedPosition],
                      };
                    }
                    return p;
                  });
                  
                  return {
                    gameState: {
                      ...state.gameState,
                      players: updatedPlayers,
                    }
                  };
                });
              }
            }
          }
        });
      },
      
      advanceRound: () => {
        const { gameState, generateNextPrice, simulateAIPlayers } = get();
        
        if (!gameState.isGameStarted || gameState.isGamePaused || gameState.isGameOver) return;
        
        // Generate next price
        generateNextPrice();
        
        // Simulate AI players
        simulateAIPlayers();
        
        // Advance round
        set((state) => {
          const newRound = state.gameState.round + 1;
          const isGameOver = newRound >= state.gameState.maxRounds;
          
          if (isGameOver) {
            // End the game if max rounds reached
            get().endGame();
            return state;
          }
          
          return {
            gameState: {
              ...state.gameState,
              round: newRound,
              timeLeft: state.gameState.roundDuration,
            }
          };
        });
      },
      
      // Helper methods
      getCurrentPlayer: () => {
        const { gameState } = get();
        return gameState.players.find(p => !p.isAI);
      },
      
      getAIPlayers: () => {
        const { gameState } = get();
        return gameState.players.filter(p => p.isAI);
      },
      
      calculatePnL: (position) => {
        const { entryPrice, exitPrice = get().gameState.currentPrice, size, leverage } = position;
        
        if (!exitPrice) return { pnl: 0, pnlPercentage: 0 };
        
        // Calculate price difference percentage
        const priceDiffPercent = (exitPrice - entryPrice) / entryPrice;
        
        // Calculate PnL (positive for profit, negative for loss)
        // For longs: profit when exit > entry, For shorts: profit when exit < entry
        const isLong = size > 0;
        const direction = isLong ? 1 : -1;
        
        // PnL = Position Size * Leverage * Price Difference Percentage * Direction
        const positionValue = Math.abs(size) * entryPrice / leverage;
        const pnl = positionValue * leverage * priceDiffPercent * direction;
        
        // PnL percentage relative to position value
        const pnlPercentage = pnl / positionValue * 100;
        
        return { pnl, pnlPercentage };
      },
      
      checkLiquidations: () => {
        const { gameState, calculatePnL } = get();
        const { currentPrice } = gameState;
        
        // Check all players' open positions
        let updatedPlayers = false;
        
        const newPlayers = gameState.players.map(player => {
          // Check each open position
          const { openPositions, closedPositions } = player;
          let playerUpdated = false;
          let newBalance = player.balance;
          
          const newOpenPositions = [...openPositions];
          const newClosedPositions = [...closedPositions];
          
          // Check for liquidations, stop losses, and take profits
          for (let i = newOpenPositions.length - 1; i >= 0; i--) {
            const position = newOpenPositions[i];
            const { pnl, pnlPercentage } = calculatePnL({
              ...position,
              exitPrice: currentPrice,
            });
            
            // Check liquidation (when losses exceed margin)
            const isLiquidated = get().isPositionLiquidated(position);
            
            // Check stop loss
            const isStopLossTriggered = position.stopLoss && (
              (position.size > 0 && currentPrice <= position.stopLoss) || // Long position
              (position.size < 0 && currentPrice >= position.stopLoss)    // Short position
            );
            
            // Check take profit
            const isTakeProfitTriggered = position.takeProfit && (
              (position.size > 0 && currentPrice >= position.takeProfit) || // Long position
              (position.size < 0 && currentPrice <= position.takeProfit)    // Short position
            );
            
            if (isLiquidated || isStopLossTriggered || isTakeProfitTriggered) {
              // Close the position
              const closedPosition: PlayerPosition = {
                ...position,
                exitPrice: currentPrice,
                exitTime: Date.now(),
                status: isLiquidated ? 'liquidated' : 'closed',
                pnl: isLiquidated ? -(Math.abs(position.size) * position.entryPrice / position.leverage) : pnl,
                pnlPercentage: isLiquidated ? -100 : pnlPercentage,
              };
              
              newClosedPositions.push(closedPosition);
              newOpenPositions.splice(i, 1);
              
              // Update balance (if not liquidated, return initial margin + PnL)
              if (!isLiquidated) {
                newBalance += pnl + (Math.abs(position.size) * position.entryPrice / position.leverage);
              }
              
              playerUpdated = true;
            }
          }
          
          if (playerUpdated) {
            updatedPlayers = true;
            return {
              ...player,
              balance: newBalance,
              openPositions: newOpenPositions,
              closedPositions: newClosedPositions,
            };
          }
          
          return player;
        });
        
        // Update state if any positions were closed
        if (updatedPlayers) {
          set((state) => ({
            gameState: {
              ...state.gameState,
              players: newPlayers,
            }
          }));
        }
      },
      
      isPositionLiquidated: (position) => {
        const { gameState, calculatePnL } = get();
        const { currentPrice } = gameState;
        
        // Liquidation occurs when losses exceed the margin
        const { pnl, pnlPercentage } = calculatePnL({
          ...position,
          exitPrice: currentPrice,
        });
        
        // Position is liquidated when loss exceeds margin (effectively -100% PnL)
        // Include some buffer for liquidation (e.g., at -95% PnL)
        return pnlPercentage <= -95;
      },
    }),
    {
      name: 'bulls-vs-bears-game',
    }
  )
);