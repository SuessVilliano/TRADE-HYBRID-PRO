import { create } from "zustand";
import { Trade, TradeStats, TradeRequest } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";
import { OrderHistory } from "@/lib/services/broker-service";

interface TraderState {
  trades: Trade[];
  tradeStats: TradeStats;
  accountBalance: number;
  loading: boolean;
  orderHistory: OrderHistory[];
  
  fetchTrades: () => Promise<void>;
  placeTrade: (tradeRequest: TradeRequest) => Promise<void>;
  updateOrderHistory: (orders: OrderHistory[]) => void;
}

export const useTrader = create<TraderState>((set, get) => ({
  trades: [],
  tradeStats: {
    winRate: 0,
    profitFactor: 0,
    totalProfit: 0,
    totalLoss: 0,
    netPnL: 0,
    avgWin: 0,
    avgLoss: 0,
    largestWin: 0,
    largestLoss: 0
  },
  accountBalance: 10000, // Default starting balance
  loading: false,
  orderHistory: [],
  
  updateOrderHistory: (orders: OrderHistory[]) => {
    set({ orderHistory: orders });
  },
  
  fetchTrades: async () => {
    set({ loading: true });
    
    try {
      const response = await apiRequest("GET", "/api/trader/trades");
      const data = await response.json();
      
      set({ 
        trades: data.trades,
        tradeStats: data.stats,
        accountBalance: data.balance,
        loading: false 
      });
    } catch (error) {
      console.error("Failed to fetch trades:", error);
      
      // Fallback to mock data for development
      const mockTrades: Trade[] = [
        {
          id: "1",
          symbol: "BTCUSD",
          side: "buy",
          quantity: 0.1,
          entryPrice: 35000,
          exitPrice: 36500,
          profit: 150,
          timestamp: new Date().toISOString(),
        },
        {
          id: "2",
          symbol: "ETHUSD",
          side: "sell",
          quantity: 0.5,
          entryPrice: 2000,
          exitPrice: 1800,
          profit: 100,
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: "3",
          symbol: "EURUSD",
          side: "buy",
          quantity: 1000,
          entryPrice: 1.08,
          exitPrice: 1.075,
          profit: -50,
          timestamp: new Date(Date.now() - 7200000).toISOString(),
        },
      ];
      
      const mockStats: TradeStats = {
        winRate: 66.7,
        profitFactor: 5,
        totalProfit: 250,
        totalLoss: 50,
        netPnL: 200,
        avgWin: 125,
        avgLoss: 50,
        largestWin: 150,
        largestLoss: 50
      };
      
      set({ 
        trades: mockTrades, 
        tradeStats: mockStats,
        accountBalance: 10200,
        loading: false 
      });
    }
  },
  
  placeTrade: async (tradeRequest: TradeRequest) => {
    try {
      const response = await apiRequest("POST", "/api/trader/trade", tradeRequest);
      const data = await response.json();
      
      // Update trades and balance with server response
      set((state) => ({
        trades: [data.trade, ...state.trades],
        accountBalance: data.newBalance,
      }));
      
      // Refetch trade stats after placing a trade
      get().fetchTrades();
      
      return data;
    } catch (error) {
      console.error("Failed to place trade:", error);
      
      // Fallback to mock data for development
      // Create a mock trade based on the request
      
      const side = tradeRequest.side;
      const symbol = tradeRequest.symbol;
      const quantity = tradeRequest.quantity;
      const leverage = tradeRequest.leverage || 1;
      
      // Simulate a random price movement (-2% to +2%)
      const priceChange = Math.random() * 0.04 - 0.02;
      
      const mockEntryPrice = side === "buy" ? 100 : 100;
      const mockExitPrice = mockEntryPrice * (1 + (side === "buy" ? priceChange : -priceChange));
      
      // Calculate profit/loss
      const priceDifference = side === "buy" 
        ? mockExitPrice - mockEntryPrice 
        : mockEntryPrice - mockExitPrice;
      const profit = priceDifference * quantity * leverage;
      
      const mockTrade: Trade = {
        id: Date.now().toString(),
        symbol,
        side,
        quantity,
        entryPrice: mockEntryPrice,
        exitPrice: mockExitPrice,
        profit,
        timestamp: new Date().toISOString(),
      };
      
      // Update state
      set((state) => {
        const newBalance = state.accountBalance + profit;
        
        return {
          trades: [mockTrade, ...state.trades],
          accountBalance: newBalance,
        };
      });
    }
  },
}));
