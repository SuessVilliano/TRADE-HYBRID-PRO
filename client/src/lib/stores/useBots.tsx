import { create } from "zustand";
import { Bot } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";

interface BotsState {
  bots: Bot[];
  loading: boolean;
  
  fetchBots: () => Promise<void>;
  createBot: (bot: Omit<Bot, "id">) => Promise<void>;
  updateBot: (id: string, updates: Partial<Bot>) => Promise<void>;
  deleteBot: (id: string) => Promise<void>;
  runBot: (id: string) => Promise<void>;
  stopBot: (id: string) => Promise<void>;
}

export const useBots = create<BotsState>((set, get) => ({
  bots: [],
  loading: false,
  
  fetchBots: async () => {
    set({ loading: true });
    
    try {
      const response = await apiRequest("GET", "/api/bots");
      const data = await response.json();
      
      set({ bots: data, loading: false });
    } catch (error) {
      console.error("Failed to fetch bots:", error);
      
      // Fallback to mock data for development
      const mockBots: Bot[] = [
        {
          id: "1",
          name: "BTC Trend Follower",
          type: "trend",
          symbol: "BTCUSD",
          code: `function onNewBar(bar) {
  if (bar.close > bar.sma(50)) {
    return "BUY";
  } else if (bar.close < bar.sma(50)) {
    return "SELL";
  }
  return "HOLD";
}`,
          active: true,
        },
        {
          id: "2",
          name: "ETH Breakout",
          type: "breakout",
          symbol: "ETHUSD",
          code: `function onNewBar(bar) {
  const upperBand = bar.highest(20);
  const lowerBand = bar.lowest(20);
  
  if (bar.close > upperBand) {
    return "BUY";
  } else if (bar.close < lowerBand) {
    return "SELL";
  }
  return "HOLD";
}`,
          active: false,
        }
      ];
      
      set({ bots: mockBots, loading: false });
    }
  },
  
  createBot: async (bot) => {
    try {
      const response = await apiRequest("POST", "/api/bots", bot);
      const newBot = await response.json();
      
      set((state) => ({
        bots: [...state.bots, newBot]
      }));
    } catch (error) {
      console.error("Failed to create bot:", error);
      
      // Fallback mock implementation
      const mockBot: Bot = {
        ...bot,
        id: Date.now().toString(),
      };
      
      set((state) => ({
        bots: [...state.bots, mockBot]
      }));
    }
  },
  
  updateBot: async (id, updates) => {
    try {
      await apiRequest("PUT", `/api/bots/${id}`, updates);
      
      set((state) => ({
        bots: state.bots.map((bot) => 
          bot.id === id ? { ...bot, ...updates } : bot
        )
      }));
    } catch (error) {
      console.error("Failed to update bot:", error);
      
      // Fallback mock implementation
      set((state) => ({
        bots: state.bots.map((bot) => 
          bot.id === id ? { ...bot, ...updates } : bot
        )
      }));
    }
  },
  
  deleteBot: async (id) => {
    try {
      await apiRequest("DELETE", `/api/bots/${id}`);
      
      set((state) => ({
        bots: state.bots.filter((bot) => bot.id !== id)
      }));
    } catch (error) {
      console.error("Failed to delete bot:", error);
      
      // Fallback mock implementation
      set((state) => ({
        bots: state.bots.filter((bot) => bot.id !== id)
      }));
    }
  },
  
  runBot: async (id) => {
    try {
      await apiRequest("POST", `/api/bots/${id}/run`);
      
      set((state) => ({
        bots: state.bots.map((bot) => 
          bot.id === id ? { ...bot, active: true } : bot
        )
      }));
    } catch (error) {
      console.error("Failed to run bot:", error);
      
      // Fallback mock implementation
      set((state) => ({
        bots: state.bots.map((bot) => 
          bot.id === id ? { ...bot, active: true } : bot
        )
      }));
    }
  },
  
  stopBot: async (id) => {
    try {
      await apiRequest("POST", `/api/bots/${id}/stop`);
      
      set((state) => ({
        bots: state.bots.map((bot) => 
          bot.id === id ? { ...bot, active: false } : bot
        )
      }));
    } catch (error) {
      console.error("Failed to stop bot:", error);
      
      // Fallback mock implementation
      set((state) => ({
        bots: state.bots.map((bot) => 
          bot.id === id ? { ...bot, active: false } : bot
        )
      }));
    }
  },
}));
