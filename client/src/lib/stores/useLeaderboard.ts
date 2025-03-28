import { create } from 'zustand';

interface LeaderboardEntry {
  id: string;
  name: string;
  profit: string;
  lastTrade: string;
}

interface LeaderboardState {
  entries: LeaderboardEntry[];
  loading: boolean;
  error: string | null;
  
  fetchLeaderboard: () => Promise<LeaderboardEntry[]>;
  submitScore: (playerName: string, score: number, difficulty: string) => Promise<boolean>;
}

export const useLeaderboard = create<LeaderboardState>((set, get) => ({
  entries: [],
  loading: false,
  error: null,
  
  fetchLeaderboard: async () => {
    set({ loading: true, error: null });
    
    try {
      // Simulate API call with mock data
      // In a real app, fetch from server: const response = await fetch('/api/leaderboard');
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      
      const mockEntries: LeaderboardEntry[] = [
        { id: '1', name: 'TraderBull', profit: '18500', lastTrade: '2025-03-20T10:30:00Z' },
        { id: '2', name: 'CryptoQueen', profit: '15200', lastTrade: '2025-03-21T14:20:00Z' },
        { id: '3', name: 'MarketMaster', profit: '12750', lastTrade: '2025-03-19T16:45:00Z' },
        { id: '4', name: 'WallStreetWizard', profit: '9800', lastTrade: '2025-03-22T09:15:00Z' },
        { id: '5', name: 'TradingTiger', profit: '8400', lastTrade: '2025-03-18T11:10:00Z' },
        { id: '6', name: 'ChartChampion', profit: '7200', lastTrade: '2025-03-17T15:30:00Z' },
        { id: '7', name: 'ProfitPundit', profit: '6100', lastTrade: '2025-03-16T13:45:00Z' },
        { id: '8', name: 'SwingTrader', profit: '5000', lastTrade: '2025-03-15T10:20:00Z' },
        { id: '9', name: 'BearHunter', profit: '4300', lastTrade: '2025-03-14T16:00:00Z' },
        { id: '10', name: 'AlgoAce', profit: '3200', lastTrade: '2025-03-13T11:30:00Z' },
      ];
      
      set({ entries: mockEntries, loading: false });
      return mockEntries;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      set({ error: 'Failed to load leaderboard data', loading: false });
      return [];
    }
  },
  
  submitScore: async (playerName: string, score: number, difficulty: string) => {
    set({ loading: true, error: null });
    
    try {
      // Simulate API call
      // In a real app, post to server: await fetch('/api/leaderboard', { method: 'POST', body: JSON.stringify({...}) });
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newEntry: LeaderboardEntry = {
        id: Date.now().toString(),
        name: playerName,
        profit: score.toString(),
        lastTrade: new Date().toISOString()
      };
      
      // Add to local state
      set(state => ({
        entries: [...state.entries, newEntry].sort((a, b) => parseInt(b.profit) - parseInt(a.profit)),
        loading: false
      }));
      
      return true;
    } catch (error) {
      console.error('Error submitting score:', error);
      set({ error: 'Failed to submit score', loading: false });
      return false;
    }
  }
}));