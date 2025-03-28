import { create } from 'zustand';
import { TRADING_TIP_CATEGORIES, TRADING_TIP_LEVELS } from '@/lib/constants';

interface TradingTip {
  id: string;
  title: string;
  content: string;
  category: string;
  level: string;
  source?: string;
  link?: string;
}

interface TradingTipsStore {
  tips: TradingTip[];
  currentTipIndex: number;
  showTipModal: boolean;
  tipHistory: string[]; // IDs of tips that have been shown
  selectedCategory: string | null;
  selectedLevel: string | null;
  
  // Actions
  showTip: (category?: string, level?: string) => void;
  hideTip: () => void;
  nextTip: () => void;
  previousTip: () => void;
  setCategory: (category: string | null) => void;
  setLevel: (level: string | null) => void;
  resetHistory: () => void;
}

// Sample trading tips
const tradingTips: TradingTip[] = [
  // General tips
  {
    id: 'general-risk-1',
    title: 'Risk Management',
    content: 'Never risk more than 1-2% of your trading capital on a single trade. This helps protect your account from significant drawdowns.',
    category: 'general',
    level: 'beginner'
  },
  {
    id: 'general-plan-1',
    title: 'Trading Plan',
    content: 'Always have a trading plan before entering a trade. Know your entry, exit, and stop loss levels before executing.',
    category: 'general',
    level: 'beginner'
  },
  {
    id: 'general-emotion-1',
    title: 'Emotional Control',
    content: 'Keep emotions in check while trading. Fear and greed are two primary emotions that can lead to poor trading decisions.',
    category: 'general',
    level: 'beginner'
  },
  
  // Technical analysis tips
  {
    id: 'technical-support-1',
    title: 'Support and Resistance',
    content: 'Price tends to bounce off support and resistance levels. Look for multiple touches of these levels for higher probability trades.',
    category: 'technical',
    level: 'beginner'
  },
  {
    id: 'technical-trend-1',
    title: 'Trend Following',
    content: 'The trend is your friend. Trading in the direction of the overall trend typically increases your probability of success.',
    category: 'technical',
    level: 'beginner'
  },
  {
    id: 'technical-indicators-1',
    title: 'Indicator Confluence',
    content: "Don't rely on a single indicator for trading decisions. Look for confluence between multiple indicators and price action.",
    category: 'technical',
    level: 'intermediate'
  },
  
  // Psychology tips
  {
    id: 'psychology-loss-1',
    title: 'Accept Losses',
    content: 'Accept that losses are part of trading. Even the best traders have losing trades. What matters is your overall profitability.',
    category: 'psychology',
    level: 'beginner'
  },
  {
    id: 'psychology-fomo-1',
    title: 'Avoid FOMO',
    content: "Don't enter trades due to Fear Of Missing Out (FOMO). There will always be another trading opportunity.",
    category: 'psychology',
    level: 'beginner'
  },
  {
    id: 'psychology-journal-1',
    title: 'Trading Journal',
    content: 'Keep a trading journal to record your trades, emotions, and thought process. Review regularly to identify patterns and areas for improvement.',
    category: 'psychology',
    level: 'intermediate'
  },
  
  // Crypto-specific tips
  {
    id: 'crypto-volatility-1',
    title: 'Crypto Volatility',
    content: 'Cryptocurrencies are highly volatile. Use smaller position sizes and wider stop losses compared to traditional markets.',
    category: 'crypto',
    level: 'beginner'
  },
  {
    id: 'crypto-correlation-1',
    title: 'Bitcoin Correlation',
    content: 'Most altcoins have a high correlation with Bitcoin. Be aware of BTC movements even when trading other cryptocurrencies.',
    category: 'crypto',
    level: 'intermediate'
  },
  {
    id: 'crypto-security-1',
    title: 'Security First',
    content: 'When trading crypto, security should be your top priority. Use hardware wallets for long-term storage and enable 2FA on all exchange accounts.',
    category: 'crypto',
    level: 'beginner'
  },
  
  // Advanced trading tips
  {
    id: 'risk-advanced-1',
    title: 'Position Sizing',
    content: 'Adjust position sizes based on volatility. Use the Average True Range (ATR) to determine appropriate stop loss levels and position sizes.',
    category: 'risk',
    level: 'advanced'
  },
  {
    id: 'technical-advanced-1',
    title: 'Market Structure',
    content: 'Focus on market structure (higher highs, lower lows) rather than indicators. Price action is the ultimate indicator.',
    category: 'technical',
    level: 'advanced'
  },
  {
    id: 'psychology-advanced-1',
    title: 'Cognitive Biases',
    content: 'Be aware of cognitive biases like confirmation bias. Seek out information that contradicts your trading thesis to make more balanced decisions.',
    category: 'psychology',
    level: 'advanced'
  }
];

export const useTradingTips = create<TradingTipsStore>((set, get) => ({
  tips: tradingTips,
  currentTipIndex: 0,
  showTipModal: false,
  tipHistory: [],
  selectedCategory: null,
  selectedLevel: null,
  
  showTip: (category?: string, level?: string) => {
    const { tips, tipHistory } = get();
    
    // Filter tips based on category and level if provided
    let eligibleTips = [...tips];
    if (category) {
      eligibleTips = eligibleTips.filter(tip => tip.category === category);
    }
    if (level) {
      eligibleTips = eligibleTips.filter(tip => tip.level === level);
    }
    
    // Filter out tips that have been shown recently unless we've seen them all
    const unseenTips = eligibleTips.filter(tip => !tipHistory.includes(tip.id));
    const tipPool = unseenTips.length > 0 ? unseenTips : eligibleTips;
    
    if (tipPool.length === 0) return; // No eligible tips
    
    // Select a random tip
    const randomIndex = Math.floor(Math.random() * tipPool.length);
    const selectedTip = tipPool[randomIndex];
    
    // Find the index of this tip in the full tips array
    const fullIndex = tips.findIndex(tip => tip.id === selectedTip.id);
    
    // Update state
    set(state => ({ 
      currentTipIndex: fullIndex, 
      showTipModal: true,
      tipHistory: [...state.tipHistory, selectedTip.id].slice(-15) // Keep last 15 tips
    }));
  },
  
  hideTip: () => {
    set({ showTipModal: false });
  },
  
  nextTip: () => {
    const { tips, currentTipIndex, selectedCategory, selectedLevel } = get();
    
    // Filter tips if category or level is selected
    let eligibleTips = [...tips];
    if (selectedCategory) {
      eligibleTips = eligibleTips.filter(tip => tip.category === selectedCategory);
    }
    if (selectedLevel) {
      eligibleTips = eligibleTips.filter(tip => tip.level === selectedLevel);
    }
    
    if (eligibleTips.length === 0) return; // No eligible tips
    
    // Find the current tip in filtered list
    const currentTip = tips[currentTipIndex];
    const filteredIndex = eligibleTips.findIndex(tip => tip.id === currentTip.id);
    
    // Get next index, wrapping around if needed
    const nextFilteredIndex = (filteredIndex + 1) % eligibleTips.length;
    const nextTip = eligibleTips[nextFilteredIndex];
    
    // Find this tip in the full list
    const fullIndex = tips.findIndex(tip => tip.id === nextTip.id);
    
    set(state => ({ 
      currentTipIndex: fullIndex,
      tipHistory: [...state.tipHistory, nextTip.id].slice(-15) // Keep last 15 tips
    }));
  },
  
  previousTip: () => {
    const { tips, currentTipIndex, selectedCategory, selectedLevel } = get();
    
    // Filter tips if category or level is selected
    let eligibleTips = [...tips];
    if (selectedCategory) {
      eligibleTips = eligibleTips.filter(tip => tip.category === selectedCategory);
    }
    if (selectedLevel) {
      eligibleTips = eligibleTips.filter(tip => tip.level === selectedLevel);
    }
    
    if (eligibleTips.length === 0) return; // No eligible tips
    
    // Find the current tip in filtered list
    const currentTip = tips[currentTipIndex];
    const filteredIndex = eligibleTips.findIndex(tip => tip.id === currentTip.id);
    
    // Get previous index, wrapping around if needed
    const prevFilteredIndex = (filteredIndex - 1 + eligibleTips.length) % eligibleTips.length;
    const prevTip = eligibleTips[prevFilteredIndex];
    
    // Find this tip in the full list
    const fullIndex = tips.findIndex(tip => tip.id === prevTip.id);
    
    set({ currentTipIndex: fullIndex });
  },
  
  setCategory: (category) => {
    set({ selectedCategory: category });
  },
  
  setLevel: (level) => {
    set({ selectedLevel: level });
  },
  
  resetHistory: () => {
    set({ tipHistory: [] });
  }
}));