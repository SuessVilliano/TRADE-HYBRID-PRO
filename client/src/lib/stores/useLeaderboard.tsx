import { create } from "zustand";
import { Trader } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";

interface LeaderboardState {
  traders: Trader[];
  loading: boolean;
  
  fetchLeaderboard: () => Promise<void>;
}

export const useLeaderboard = create<LeaderboardState>((set) => ({
  traders: [],
  loading: false,
  
  fetchLeaderboard: async () => {
    set({ loading: true });
    
    try {
      const response = await apiRequest("GET", "/api/leaderboard");
      const data = await response.json();
      
      set({ traders: data, loading: false });
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
      
      // Fallback to mock data for development
      const mockTraders: Trader[] = [
        {
          id: "1",
          username: "AlphaTrader",
          avatar: "",
          pnl: 15780.42,
          winRate: 78.3,
          tradeCount: 142
        },
        {
          id: "2",
          username: "CryptoKing",
          avatar: "",
          pnl: 12450.88,
          winRate: 65.2,
          tradeCount: 89
        },
        {
          id: "3",
          username: "ForexMaster",
          avatar: "",
          pnl: 8920.15,
          winRate: 72.1,
          tradeCount: 215
        },
        {
          id: "4",
          username: "DayTrader99",
          avatar: "",
          pnl: 6540.32,
          winRate: 58.7,
          tradeCount: 97
        },
        {
          id: "5",
          username: "SwingTrader",
          avatar: "",
          pnl: 4320.76,
          winRate: 61.9,
          tradeCount: 114
        },
        {
          id: "6",
          username: "TechnicalPro",
          avatar: "",
          pnl: 3870.25,
          winRate: 59.8,
          tradeCount: 132
        },
        {
          id: "7",
          username: "BullishBaron",
          avatar: "",
          pnl: 2980.51,
          winRate: 56.4,
          tradeCount: 78
        },
        {
          id: "8",
          username: "BearMarketBet",
          avatar: "",
          pnl: -1240.33,
          winRate: 42.1,
          tradeCount: 65
        },
        {
          id: "9",
          username: "AITrader",
          avatar: "",
          pnl: 7650.29,
          winRate: 68.5,
          tradeCount: 185
        },
        {
          id: "10",
          username: "PatternScanner",
          avatar: "",
          pnl: 5430.18,
          winRate: 63.7,
          tradeCount: 152
        }
      ];
      
      set({ traders: mockTraders, loading: false });
    }
  },
}));
