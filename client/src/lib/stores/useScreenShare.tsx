import { create } from 'zustand';
import { MarketData } from '../types';

export interface ScreenShareData {
  id: string;
  userId: string;
  username: string;
  symbol: string;
  marketData: MarketData[];
  timestamp: Date;
  viewport: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface ScreenShareState {
  activeShares: ScreenShareData[];
  myActiveShare: ScreenShareData | null;
  isSharing: boolean;
  selectedShareId: string | null;
  
  // Actions
  startSharing: (data: Omit<ScreenShareData, 'id' | 'timestamp'>) => void;
  stopSharing: () => void;
  updateShareData: (marketData: MarketData[]) => void;
  selectShare: (id: string | null) => void;
  
  // Simulated network functions (would be replaced with actual WebSocket calls in production)
  loadShares: () => Promise<void>;
}

export const useScreenShare = create<ScreenShareState>((set, get) => ({
  activeShares: [],
  myActiveShare: null,
  isSharing: false,
  selectedShareId: null,
  
  startSharing: (data) => {
    const id = `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newShare: ScreenShareData = {
      ...data,
      id,
      timestamp: new Date(),
    };
    
    set({
      myActiveShare: newShare,
      isSharing: true,
      activeShares: [...get().activeShares, newShare]
    });
    
    console.log(`Started sharing screen for ${data.symbol}`);
  },
  
  stopSharing: () => {
    const { myActiveShare, activeShares } = get();
    
    if (myActiveShare) {
      // Remove my share from active shares
      set({
        activeShares: activeShares.filter(share => share.id !== myActiveShare.id),
        myActiveShare: null,
        isSharing: false
      });
      
      console.log('Stopped sharing screen');
    }
  },
  
  updateShareData: (marketData) => {
    const { myActiveShare } = get();
    
    if (myActiveShare) {
      const updatedShare = {
        ...myActiveShare,
        marketData,
        timestamp: new Date()
      };
      
      set({
        myActiveShare: updatedShare,
        activeShares: get().activeShares.map(share => 
          share.id === myActiveShare.id ? updatedShare : share
        )
      });
    }
  },
  
  selectShare: (id) => {
    set({ selectedShareId: id });
  },
  
  // This would fetch data from the server in a real implementation
  loadShares: async () => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Generate some mock shares for testing purposes
    const mockShares: ScreenShareData[] = [
      {
        id: 'share1',
        userId: 'user1',
        username: 'CryptoKing',
        symbol: 'BTC/USD',
        marketData: generateMockMarketData('BTC/USD', 20),
        timestamp: new Date(),
        viewport: { x: 0, y: 0, width: 800, height: 600 }
      },
      {
        id: 'share2',
        userId: 'user2',
        username: 'StockMaster',
        symbol: 'AAPL',
        marketData: generateMockMarketData('AAPL', 20),
        timestamp: new Date(),
        viewport: { x: 0, y: 0, width: 800, height: 600 }
      }
    ];
    
    set({ activeShares: mockShares });
  }
}));

// Helper function to generate mock market data for testing
function generateMockMarketData(symbol: string, count: number): MarketData[] {
  const basePrice = getBasePrice(symbol);
  const volatility = symbol.includes('BTC') ? 0.03 : 0.01;
  const data: MarketData[] = [];
  
  for (let i = 0; i < count; i++) {
    const time = Date.now() - (count - i) * 60000;
    const randomFactor = 1 + (Math.random() * 2 - 1) * volatility;
    const close = basePrice * randomFactor;
    const open = close * (1 + (Math.random() * 0.02 - 0.01));
    const high = Math.max(open, close) * (1 + Math.random() * 0.01);
    const low = Math.min(open, close) * (1 - Math.random() * 0.01);
    
    data.push({
      time: Math.floor(time / 1000),
      open,
      high,
      low,
      close,
      volume: Math.floor(Math.random() * 1000000)
    });
  }
  
  return data;
}

function getBasePrice(symbol: string): number {
  switch (symbol) {
    case 'BTC/USD':
      return 40000;
    case 'ETH/USD':
      return 2500;
    case 'AAPL':
      return 180;
    case 'MSFT':
      return 320;
    case 'GOOGL':
      return 140;
    default:
      return 100;
  }
}