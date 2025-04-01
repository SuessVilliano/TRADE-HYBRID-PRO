import { create } from 'zustand';

interface MarketDataState {
  symbol: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  updateSymbol: (symbol: string) => void;
  updatePrice: (price: number) => void;
}

export const useMarketData = create<MarketDataState>((set) => ({
  symbol: 'BINANCE:BTCUSDT',
  price: 41250.75,
  change24h: 2.35,
  high24h: 42100.50,
  low24h: 40800.25,
  volume24h: 1428500000,
  
  updateSymbol: (symbol: string) => set({ symbol }),
  updatePrice: (price: number) => set({ price }),
}));