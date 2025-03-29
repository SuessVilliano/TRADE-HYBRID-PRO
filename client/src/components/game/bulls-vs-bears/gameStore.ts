import { create } from 'zustand';

// Define types for the game state
interface Player {
  id: string;
  character: 'bull' | 'bear';
  score: number;
  balance: number;
  inventory: {
    coins: number;
  };
  position: [number, number, number];
}

interface AITrader {
  id: string;
  type: 'bull' | 'bear';
  aggressiveness: number;
  strategy: 'trend_follower' | 'contrarian' | 'random';
  position: [number, number, number];
  balance: number;
  inventory: {
    coins: number;
  };
}

type GameMode = 'singleplayer' | 'multiplayer';

interface GameState {
  gameActive: boolean;
  gameMode: GameMode | null;
  player: Player;
  aiTraders: AITrader[];
  gameTime: number;
  
  // Actions
  startGame: (mode: GameMode, character: 'bull' | 'bear') => void;
  endGame: () => void;
  makeTrade: (type: 'buy' | 'sell', amount: number, price: number) => void;
  updateGameTime: (time: number) => void;
  generateAITraders: (count: number) => void;
}

// Create the game store
export const useGameStore = create<GameState>()((set, get) => ({
  gameActive: false,
  gameMode: null,
  player: {
    id: 'player1',
    character: 'bull',
    score: 0,
    balance: 1000, // Starting cash
    inventory: {
      coins: 0,
    },
    position: [0, 0, 0],
  },
  aiTraders: [],
  gameTime: 0,
  
  // Start a new game
  startGame: (mode: GameMode, character: 'bull' | 'bear') => {
    set({
      gameActive: true,
      gameMode: mode,
      gameTime: 0,
      player: {
        ...get().player,
        character,
        score: 0,
        balance: 1000,
        inventory: {
          coins: 0,
        },
      }
    });
  },
  
  // End the current game
  endGame: () => {
    set({
      gameActive: false,
      gameMode: null,
    });
  },
  
  // Handle buying/selling
  makeTrade: (type: 'buy' | 'sell', amount: number, price: number) => {
    const { player } = get();
    
    if (type === 'buy') {
      const cost = amount * price;
      
      // Check if player has enough funds
      if (player.balance < cost) {
        console.error('Not enough funds for trade');
        return;
      }
      
      // Execute buy
      set({
        player: {
          ...player,
          balance: player.balance - cost,
          inventory: {
            ...player.inventory,
            coins: player.inventory.coins + amount,
          },
          score: player.score + 10, // Points for trading
        }
      });
      
      console.log(`Bought ${amount} coins at $${price} each`);
    } else {
      // Check if player has enough coins
      if (player.inventory.coins < amount) {
        console.error('Not enough coins to sell');
        return;
      }
      
      // Execute sell
      const revenue = amount * price;
      const profit = player.character === 'bull' 
        ? revenue > amount * price // Bulls profit when price rises
        : revenue < amount * price; // Bears profit when price falls
        
      set({
        player: {
          ...player,
          balance: player.balance + revenue,
          inventory: {
            ...player.inventory,
            coins: player.inventory.coins - amount,
          },
          score: player.score + (profit ? 25 : 5), // More points for profitable trades
        }
      });
      
      console.log(`Sold ${amount} coins at $${price} each`);
    }
  },
  
  // Update game time
  updateGameTime: (time: number) => {
    set({ gameTime: time });
  },
  
  // Generate AI traders
  generateAITraders: (count: number) => {
    const aiTraders: AITrader[] = [];
    
    // AI trader strategies
    const strategies: ('trend_follower' | 'contrarian' | 'random')[] = [
      'trend_follower', 'contrarian', 'random'
    ];
    
    for (let i = 0; i < count; i++) {
      // Randomly distribute AI traders around the scene
      const xPos = Math.random() * 40 - 20; // -20 to 20
      const zPos = Math.random() * 40 - 20; // -20 to 20
      
      // Randomly assign bull or bear
      const type: 'bull' | 'bear' = Math.random() > 0.5 ? 'bull' : 'bear';
      
      // Create AI trader
      aiTraders.push({
        id: `ai-${i}`,
        type,
        aggressiveness: Math.random() * 0.8 + 0.2, // 0.2 to 1.0
        strategy: strategies[Math.floor(Math.random() * strategies.length)],
        position: [xPos, 1, zPos],
        balance: 500 + Math.random() * 1000, // 500 to 1500
        inventory: {
          coins: Math.floor(Math.random() * 10), // 0 to 10 coins
        },
      });
    }
    
    set({ aiTraders });
  },
}));