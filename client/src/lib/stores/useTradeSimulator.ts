import { create } from 'zustand';

type Position = {
  asset: string;
  type: 'buy' | 'sell';
  size: number;
  entryPrice: number;
  openedAt: Date;
};

type TradeHistory = {
  asset: string;
  type: 'buy' | 'sell';
  size: number;
  entryPrice: number;
  exitPrice: number;
  profit: number;
  profitPercentage: number;
  openedAt: Date;
  closedAt: Date;
};

type PricePoint = {
  timestamp: number;
  price: number;
};

interface TradeSimulatorState {
  // Account state
  balance: number;
  initialBalance: number;
  
  // Selected asset
  selectedAsset: string | null;
  setSelectedAsset: (asset: string) => void;
  
  // Price data
  currentPrice: number | null;
  priceHistory: PricePoint[];
  updatePriceData: () => void;
  
  // Position management
  positionSize: number;
  setPositionSize: (size: number) => void;
  positionType: 'buy' | 'sell';
  setPositionType: (type: 'buy' | 'sell') => void;
  activePosition: Position | null;
  openPosition: () => void;
  closePosition: () => TradeHistory;
  
  // Trading history
  tradingHistory: TradeHistory[];
  
  // Reset simulator
  resetSimulator: () => void;
}

// Generate random price movements
const generateRandomPriceMovement = (
  basePrice: number,
  volatility: number,
  trend: number
): number => {
  const randomFactor = (Math.random() - 0.5) * volatility;
  const trendFactor = trend * (Math.random() * 0.01);
  return basePrice * (1 + randomFactor + trendFactor);
};

// Generate price history for a specific asset
const generatePriceHistory = (
  asset: string,
  dataPoints: number = 100
): PricePoint[] => {
  const now = Date.now();
  const history: PricePoint[] = [];
  let price;
  
  // Set initial price based on asset
  switch (asset) {
    case 'BTC':
      price = 60000 + Math.random() * 5000;
      break;
    case 'AAPL':
      price = 180 + Math.random() * 20;
      break;
    case 'COIN':
      price = 200 + Math.random() * 30;
      break;
    case 'MCD':
      price = 270 + Math.random() * 15;
      break;
    case 'AMZN':
      price = 180 + Math.random() * 20;
      break;
    default:
      price = 100 + Math.random() * 10;
  }
  
  // Asset-specific volatility and trend
  let volatility = 0.002; // Default
  let trend = 0; // No trend by default
  
  switch (asset) {
    case 'BTC':
      volatility = 0.01; // Higher volatility for crypto
      trend = Math.random() > 0.5 ? 0.5 : -0.5; // Random trend
      break;
    case 'AAPL':
      volatility = 0.005;
      trend = 0.2; // Slight upward trend
      break;
    case 'COIN':
      volatility = 0.008;
      trend = Math.random() > 0.6 ? 0.3 : -0.4; // More likely to go up
      break;
    case 'MCD':
      volatility = 0.003;
      trend = 0.1; // Very slight upward trend
      break;
    case 'AMZN':
      volatility = 0.006;
      trend = Math.random() > 0.5 ? 0.3 : -0.2;
      break;
  }
  
  // Generate price points
  for (let i = 0; i < dataPoints; i++) {
    // Add random noise to trend based on position in the array
    const adjustedTrend = trend * (Math.sin(i / (dataPoints / Math.PI)) * 0.5 + 0.5);
    
    if (i > 0) {
      price = generateRandomPriceMovement(price, volatility, adjustedTrend);
    }
    
    history.push({
      timestamp: now - (dataPoints - i) * 60000, // 1 minute intervals
      price: price
    });
  }
  
  return history;
};

export const useTradeSimulator = create<TradeSimulatorState>((set, get) => ({
  // Initial account state
  balance: 10000, // Starting with $10,000
  initialBalance: 10000,
  
  // Selected asset
  selectedAsset: null,
  setSelectedAsset: (asset) => {
    set({ selectedAsset: asset });
    get().updatePriceData();
  },
  
  // Price data
  currentPrice: null,
  priceHistory: [],
  updatePriceData: () => {
    const { selectedAsset } = get();
    if (!selectedAsset) {
      set({ priceHistory: [], currentPrice: null });
      return;
    }
    
    const newPriceHistory = generatePriceHistory(selectedAsset);
    const newCurrentPrice = newPriceHistory[newPriceHistory.length - 1].price;
    
    set({
      priceHistory: newPriceHistory,
      currentPrice: newCurrentPrice
    });
  },
  
  // Position management
  positionSize: 1000, // Default position size (10% of balance)
  setPositionSize: (size) => set({ positionSize: size }),
  positionType: 'buy', // Default to 'buy'
  setPositionType: (type) => set({ positionType: type }),
  activePosition: null,
  
  openPosition: () => {
    const { selectedAsset, currentPrice, positionSize, positionType, balance } = get();
    
    if (!selectedAsset || !currentPrice || positionSize <= 0 || positionSize > balance) {
      console.error("Cannot open position: invalid parameters");
      return;
    }
    
    // Deduct position size from balance
    set({
      balance: balance - positionSize,
      activePosition: {
        asset: selectedAsset,
        type: positionType,
        size: positionSize,
        entryPrice: currentPrice,
        openedAt: new Date()
      }
    });
  },
  
  closePosition: () => {
    const { activePosition, currentPrice, balance } = get();
    
    if (!activePosition || !currentPrice) {
      throw new Error("No active position to close");
    }
    
    // Calculate profit/loss
    const { type, entryPrice, size, asset, openedAt } = activePosition;
    let profit = 0;
    
    if (type === 'buy') {
      // For long positions: profit = (current price - entry price) * size
      profit = (currentPrice - entryPrice) * (size / entryPrice);
    } else {
      // For short positions: profit = (entry price - current price) * size
      profit = (entryPrice - currentPrice) * (size / entryPrice);
    }
    
    // Calculate profit percentage
    const profitPercentage = (profit / size) * 100;
    
    // Create trade history record
    const tradeResult = {
      asset,
      type,
      size,
      entryPrice,
      exitPrice: currentPrice,
      profit,
      profitPercentage,
      openedAt,
      closedAt: new Date()
    };
    
    // Update state
    set((state) => ({
      balance: state.balance + size + profit,
      activePosition: null,
      tradingHistory: [...state.tradingHistory, tradeResult]
    }));
    
    return tradeResult;
  },
  
  // Trading history
  tradingHistory: [],
  
  // Reset simulator
  resetSimulator: () => {
    set({
      balance: 10000,
      initialBalance: 10000,
      selectedAsset: null,
      currentPrice: null,
      priceHistory: [],
      positionSize: 1000,
      positionType: 'buy',
      activePosition: null,
      tradingHistory: []
    });
  }
}));