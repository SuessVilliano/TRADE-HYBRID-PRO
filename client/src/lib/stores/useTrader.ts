import { create } from 'zustand';

interface OrderHistory {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop';
  quantity: number;
  price: number;
  status: 'filled' | 'pending' | 'canceled' | 'rejected';
  created: string;
  profit?: number;
}

interface Position {
  symbol: string;
  side: 'long' | 'short';
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  unrealizedPnL: number;
  pnlPercentage: number;
}

export interface Trade {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  entryPrice: number;
  exitPrice: number;
  timestamp: number;
  profit: number;
}

export interface TradeStats {
  winRate: number;
  netPnL: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  largestWin: number;
  largestLoss: number;
  totalTrades: number;
}

interface TraderState {
  accountBalance: number;
  equity: number;
  availableMargin: number;
  usedMargin: number;
  positions: Position[];
  orderHistory: OrderHistory[];
  isLoading: boolean;
  trades: Trade[];
  tradeStats: TradeStats;
  loading: boolean;
  
  // Actions
  placeTrade: (
    symbol: string,
    side: 'buy' | 'sell',
    quantity: number,
    orderType: 'market' | 'limit' | 'stop',
    price?: number,
    takeProfitPrice?: number,
    stopLossPrice?: number
  ) => Promise<boolean>;
  
  closePosition: (symbol: string) => Promise<boolean>;
  updateAccountInfo: () => Promise<void>;
  fetchTrades: () => Promise<void>;
}

export const useTrader = create<TraderState>((set, get) => ({
  accountBalance: 100000,
  equity: 105200,
  availableMargin: 90000,
  usedMargin: 10000,
  isLoading: false,
  loading: false,
  positions: [
    {
      symbol: 'BTCUSD',
      side: 'long',
      quantity: 0.5,
      entryPrice: 68500,
      currentPrice: 72500,
      unrealizedPnL: 2000,
      pnlPercentage: 5.84
    },
    {
      symbol: 'ETHUSD',
      side: 'long',
      quantity: 3,
      entryPrice: 3230,
      currentPrice: 3570,
      unrealizedPnL: 1020,
      pnlPercentage: 10.53
    },
    {
      symbol: 'EURUSD',
      side: 'short',
      quantity: 10000,
      entryPrice: 1.10,
      currentPrice: 1.083,
      unrealizedPnL: 170,
      pnlPercentage: 1.55
    }
  ],
  orderHistory: [
    {
      id: 'ord-123456',
      symbol: 'BTCUSD',
      side: 'buy',
      type: 'market',
      quantity: 0.5,
      price: 68500,
      status: 'filled',
      created: '2025-03-25T10:30:00Z'
    },
    {
      id: 'ord-123457',
      symbol: 'ETHUSD',
      side: 'buy',
      type: 'limit',
      quantity: 3,
      price: 3230,
      status: 'filled',
      created: '2025-03-25T11:15:00Z'
    },
    {
      id: 'ord-123458',
      symbol: 'EURUSD',
      side: 'sell',
      type: 'market',
      quantity: 10000,
      price: 1.10,
      status: 'filled',
      created: '2025-03-25T14:20:00Z'
    },
    {
      id: 'ord-123459',
      symbol: 'XAUUSD',
      side: 'buy',
      type: 'stop',
      quantity: 1,
      price: 2150,
      status: 'canceled',
      created: '2025-03-26T09:45:00Z'
    }
  ],
  trades: [
    {
      id: 'trade-1',
      symbol: 'BTCUSD',
      side: 'buy',
      quantity: 0.5,
      entryPrice: 68500,
      exitPrice: 72800,
      timestamp: Date.now() - 86400000 * 3, // 3 days ago
      profit: 2150
    },
    {
      id: 'trade-2',
      symbol: 'ETHUSD',
      side: 'buy',
      quantity: 5,
      entryPrice: 3100,
      exitPrice: 3300,
      timestamp: Date.now() - 86400000 * 2, // 2 days ago
      profit: 1000
    },
    {
      id: 'trade-3',
      symbol: 'EURUSD',
      side: 'sell',
      quantity: 20000,
      entryPrice: 1.112,
      exitPrice: 1.095,
      timestamp: Date.now() - 86400000, // 1 day ago
      profit: 340
    },
    {
      id: 'trade-4',
      symbol: 'XAUUSD',
      side: 'buy',
      quantity: 2,
      entryPrice: 2160,
      exitPrice: 2140,
      timestamp: Date.now() - 43200000, // 12 hours ago
      profit: -40
    }
  ],
  tradeStats: {
    winRate: 75,
    netPnL: 3450,
    profitFactor: 3.8,
    avgWin: 1163.33,
    avgLoss: -40,
    largestWin: 2150,
    largestLoss: -40,
    totalTrades: 4
  },
  
  placeTrade: async (symbol, side, quantity, orderType, price, takeProfitPrice, stopLossPrice) => {
    set({ isLoading: true });
    
    try {
      // In a real implementation, this would call to an API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate a trade placement
      const orderId = `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const currentPrice = price || (Math.random() * 1000 + 100); // Simulated price
      
      const newOrder: OrderHistory = {
        id: orderId,
        symbol,
        side,
        type: orderType,
        quantity,
        price: currentPrice,
        status: 'filled',
        created: new Date().toISOString()
      };
      
      // Update order history
      set(state => ({
        orderHistory: [newOrder, ...state.orderHistory]
      }));
      
      // If the order is filled, update positions
      if (side === 'buy') {
        // Check if we already have a position
        const existingPosition = get().positions.find(p => p.symbol === symbol);
        
        if (existingPosition && existingPosition.side === 'long') {
          // Add to existing position
          set(state => ({
            positions: state.positions.map(p => 
              p.symbol === symbol
                ? {
                    ...p,
                    quantity: p.quantity + quantity,
                    entryPrice: (p.entryPrice * p.quantity + currentPrice * quantity) / (p.quantity + quantity)
                  }
                : p
            )
          }));
        } else if (existingPosition && existingPosition.side === 'short') {
          // Close or reduce short position
          if (quantity >= existingPosition.quantity) {
            // Close the short position completely and possibly open a long
            const remainingQuantity = quantity - existingPosition.quantity;
            
            if (remainingQuantity > 0) {
              // Open a new long position with the remaining quantity
              set(state => ({
                positions: [
                  ...state.positions.filter(p => p.symbol !== symbol),
                  {
                    symbol,
                    side: 'long',
                    quantity: remainingQuantity,
                    entryPrice: currentPrice,
                    currentPrice,
                    unrealizedPnL: 0,
                    pnlPercentage: 0
                  }
                ]
              }));
            } else {
              // Just remove the short position
              set(state => ({
                positions: state.positions.filter(p => p.symbol !== symbol)
              }));
            }
          } else {
            // Reduce the short position
            set(state => ({
              positions: state.positions.map(p => 
                p.symbol === symbol
                  ? {
                      ...p,
                      quantity: p.quantity - quantity
                    }
                  : p
              )
            }));
          }
        } else {
          // Create a new long position
          set(state => ({
            positions: [
              ...state.positions,
              {
                symbol,
                side: 'long',
                quantity,
                entryPrice: currentPrice,
                currentPrice,
                unrealizedPnL: 0,
                pnlPercentage: 0
              }
            ]
          }));
        }
      } else { // side === 'sell'
        // Check if we already have a position
        const existingPosition = get().positions.find(p => p.symbol === symbol);
        
        if (existingPosition && existingPosition.side === 'short') {
          // Add to existing short position
          set(state => ({
            positions: state.positions.map(p => 
              p.symbol === symbol
                ? {
                    ...p,
                    quantity: p.quantity + quantity,
                    entryPrice: (p.entryPrice * p.quantity + currentPrice * quantity) / (p.quantity + quantity)
                  }
                : p
            )
          }));
        } else if (existingPosition && existingPosition.side === 'long') {
          // Close or reduce long position
          if (quantity >= existingPosition.quantity) {
            // Close the long position completely and possibly open a short
            const remainingQuantity = quantity - existingPosition.quantity;
            
            if (remainingQuantity > 0) {
              // Open a new short position with the remaining quantity
              set(state => ({
                positions: [
                  ...state.positions.filter(p => p.symbol !== symbol),
                  {
                    symbol,
                    side: 'short',
                    quantity: remainingQuantity,
                    entryPrice: currentPrice,
                    currentPrice,
                    unrealizedPnL: 0,
                    pnlPercentage: 0
                  }
                ]
              }));
            } else {
              // Just remove the long position
              set(state => ({
                positions: state.positions.filter(p => p.symbol !== symbol)
              }));
            }
          } else {
            // Reduce the long position
            set(state => ({
              positions: state.positions.map(p => 
                p.symbol === symbol
                  ? {
                      ...p,
                      quantity: p.quantity - quantity
                    }
                  : p
              )
            }));
          }
        } else {
          // Create a new short position
          set(state => ({
            positions: [
              ...state.positions,
              {
                symbol,
                side: 'short',
                quantity,
                entryPrice: currentPrice,
                currentPrice,
                unrealizedPnL: 0,
                pnlPercentage: 0
              }
            ]
          }));
        }
      }
      
      // Update account balances (simplified for demo)
      set(state => ({
        accountBalance: state.accountBalance - (side === 'buy' ? 1 : -1) * quantity * currentPrice * 0.05, // Simulate margin usage
        usedMargin: state.usedMargin + quantity * currentPrice * 0.05
      }));
      
      return true;
    } catch (error) {
      console.error('Error placing trade:', error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
  
  closePosition: async (symbol: string) => {
    set({ isLoading: true });
    
    try {
      // In a real implementation, this would call to an API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const position = get().positions.find(p => p.symbol === symbol);
      
      if (!position) {
        console.error(`No position found for ${symbol}`);
        return false;
      }
      
      // Create a closing order
      const closingOrder: OrderHistory = {
        id: `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        symbol,
        side: position.side === 'long' ? 'sell' : 'buy',
        type: 'market',
        quantity: position.quantity,
        price: position.currentPrice,
        status: 'filled',
        created: new Date().toISOString(),
        profit: position.unrealizedPnL
      };
      
      // Update order history
      set(state => ({
        orderHistory: [closingOrder, ...state.orderHistory]
      }));
      
      // Remove the position
      set(state => ({
        positions: state.positions.filter(p => p.symbol !== symbol)
      }));
      
      // Update account balances
      set(state => ({
        accountBalance: state.accountBalance + position.unrealizedPnL,
        usedMargin: state.usedMargin - position.quantity * position.currentPrice * 0.05,
        equity: state.equity + position.unrealizedPnL
      }));
      
      return true;
    } catch (error) {
      console.error('Error closing position:', error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
  
  updateAccountInfo: async () => {
    set({ isLoading: true });
    
    try {
      // In a real implementation, this would call to an API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update positions with current market prices
      const updatedPositions = get().positions.map(position => {
        // Simulate price changes
        const priceChange = (Math.random() * 0.02 - 0.01) * position.currentPrice;
        const newPrice = position.currentPrice + priceChange;
        
        // Calculate new P&L
        const priceDiff = position.side === 'long' 
          ? newPrice - position.entryPrice 
          : position.entryPrice - newPrice;
        
        const unrealizedPnL = priceDiff * position.quantity;
        const pnlPercentage = (priceDiff / position.entryPrice) * 100;
        
        return {
          ...position,
          currentPrice: newPrice,
          unrealizedPnL,
          pnlPercentage
        };
      });
      
      // Calculate total unrealized P&L
      const totalUnrealizedPnL = updatedPositions.reduce((total, position) => 
        total + position.unrealizedPnL, 0
      );
      
      // Update state
      set(state => ({
        positions: updatedPositions,
        equity: state.accountBalance + totalUnrealizedPnL
      }));
    } catch (error) {
      console.error('Error updating account info:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  
  fetchTrades: async () => {
    set({ isLoading: true });
    
    try {
      // In a real implementation, this would call to an API
      await new Promise(resolve => setTimeout(resolve, 700));
      
      // For demo purposes, we're not changing the trades
      // In a real implementation, this would fetch the latest trades from the server
      console.log("Fetched latest trades");
      
    } catch (error) {
      console.error('Error fetching trades:', error);
    } finally {
      set({ isLoading: false });
    }
  }
}));