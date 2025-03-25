// Market data type
export interface MarketData {
  time: number; // Unix timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// News item type
export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  published: string; // ISO date string
  url: string;
  tags: string[];
  impact: "low" | "medium" | "high";
  sentiment: "bullish" | "bearish" | "neutral";
}

// Trade types
export interface Trade {
  id: string;
  symbol: string;
  side: "buy" | "sell";
  quantity: number;
  entryPrice: number;
  exitPrice: number;
  profit: number;
  timestamp: string; // ISO date string
}

export interface TradeRequest {
  symbol: string;
  side: "buy" | "sell";
  quantity: number;
  leverage?: number;
  type: "market" | "limit";
  limitPrice?: number;
}

export interface TradeStats {
  winRate: number;
  profitFactor: number;
  totalProfit: number;
  totalLoss: number;
  netPnL: number;
  avgWin: number;
  avgLoss: number;
  largestWin: number;
  largestLoss: number;
}

// Trader type for leaderboard
export interface Trader {
  id: string;
  username: string;
  avatar: string;
  pnl: number;
  winRate: number;
  tradeCount: number;
}

// Trading bot type
export interface Bot {
  id: string;
  name: string;
  type: string;
  symbol: string;
  code: string;
  active: boolean;
}

// Trading house customization
export interface TradeHouseCustomization {
  id: string;
  name: string;
  color: string;
  items: TradeHouseItem[];
}

export interface TradeHouseItem {
  id: string;
  type: "desk" | "screen" | "chair" | "decoration";
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color?: string;
}
