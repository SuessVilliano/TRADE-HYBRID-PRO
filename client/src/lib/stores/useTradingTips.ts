import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';

interface TradingTip {
  id: string;
  title: string;
  content: string;
  category: 'crypto' | 'forex' | 'stocks' | 'general' | 'technical' | 'fundamental';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
}

interface TradingTipsState {
  tips: TradingTip[];
  viewedTips: string[];
  currentTip: TradingTip | null;
  showingTip: boolean;
  isLoading: boolean;
  isFirstLoad: boolean;
  // Actions
  showTip: (category?: string, difficulty?: string, forceShow?: boolean) => void;
  closeTip: () => void;
  markTipAsViewed: (tipId: string) => void;
  fetchTips: () => Promise<void>;
  setFirstLoadComplete: () => void;
}

export const useTradingTips = create<TradingTipsState>()(
  persist(
    (set, get) => ({
      tips: [],
      viewedTips: [],
      currentTip: null,
      showingTip: false,
      isLoading: false,
      isFirstLoad: true,
      
      showTip: (category?: string, difficulty?: string, forceShow: boolean = false) => {
        const { tips, viewedTips, isFirstLoad } = get();
        
        // Only show tips on first load or when explicitly requested
        if (!isFirstLoad && !forceShow) {
          console.log('Skipping trading tip: not first load and not forced');
          return;
        }
        
        if (tips.length === 0) return;
        
        // First apply category and difficulty filters if provided
        let filteredTips = [...tips];
        
        if (category) {
          filteredTips = filteredTips.filter(
            tip => tip.category === category
          );
        }
        
        if (difficulty) {
          filteredTips = filteredTips.filter(
            tip => tip.difficulty === difficulty
          );
        }
        
        // If no tips match the filters, use all tips
        if (filteredTips.length === 0) {
          filteredTips = [...tips];
        }
        
        // Prioritize unviewed tips
        const unviewedTips = filteredTips.filter(
          tip => !viewedTips.includes(tip.id)
        );
        
        // Select a random tip, preferring unviewed ones
        const tipsToSelectFrom = unviewedTips.length > 0 ? unviewedTips : filteredTips;
        const randomIndex = Math.floor(Math.random() * tipsToSelectFrom.length);
        const selectedTip = tipsToSelectFrom[randomIndex];
        
        set({
          currentTip: selectedTip,
          showingTip: true
        });
        
        // Mark tip as viewed
        get().markTipAsViewed(selectedTip.id);
        
        // Mark first load as complete after showing the tip
        if (isFirstLoad) {
          get().setFirstLoadComplete();
        }
      },
      
      closeTip: () => {
        set({ showingTip: false });
      },
      
      markTipAsViewed: (tipId: string) => {
        const { viewedTips } = get();
        if (!viewedTips.includes(tipId)) {
          set({ viewedTips: [...viewedTips, tipId] });
        }
      },
      
      setFirstLoadComplete: () => {
        set({ isFirstLoad: false });
      },
      
      fetchTips: async () => {
        set({ isLoading: true });
        
        try {
          // In a real app, this would fetch from an API
          // For now, we'll use mock data
          const mockTips: TradingTip[] = [
            {
              id: nanoid(),
              title: "Understanding Candlestick Patterns",
              content: "Candlestick patterns offer valuable insights into market sentiment. Doji patterns indicate indecision, while engulfing patterns suggest potential reversals. Learn to identify these patterns for better trade timing.",
              category: "technical",
              difficulty: "beginner",
              tags: ["charting", "patterns", "price action"]
            },
            {
              id: nanoid(),
              title: "Effective Risk Management",
              content: "Never risk more than 1-2% of your account on a single trade. This approach ensures you can survive a series of losing trades without significant damage to your account.",
              category: "general",
              difficulty: "beginner",
              tags: ["risk", "account management", "trading rules"]
            },
            {
              id: nanoid(),
              title: "Using Multiple Timeframes",
              content: "Analyze multiple timeframes for a complete market view. Higher timeframes show the overall trend, while lower timeframes help identify optimal entry and exit points.",
              category: "technical",
              difficulty: "intermediate",
              tags: ["analysis", "timeframes", "strategy"]
            },
            {
              id: nanoid(),
              title: "Understanding Bitcoin Halving",
              content: "Bitcoin halving events, occurring approximately every four years, reduce mining rewards by 50%. Historically, these events have preceded significant bull runs due to reduced supply inflation.",
              category: "crypto",
              difficulty: "beginner",
              tags: ["bitcoin", "fundamentals", "market cycles"]
            },
            {
              id: nanoid(),
              title: "How Interest Rates Affect Forex",
              content: "Central bank interest rate decisions significantly impact currency values. Higher rates typically strengthen a currency as they attract foreign capital seeking better returns.",
              category: "forex",
              difficulty: "intermediate",
              tags: ["fundamentals", "central banks", "economic indicators"]
            },
            {
              id: nanoid(),
              title: "Earnings Reports Impact",
              content: "Quarterly earnings reports can create significant stock price volatility. Stocks often move based not just on current performance but on whether results exceeded or missed market expectations.",
              category: "stocks",
              difficulty: "beginner",
              tags: ["fundamentals", "earnings", "volatility"]
            },
            {
              id: nanoid(),
              title: "Understanding Market Sentiment",
              content: "Market sentiment indicators like the VIX (fear index) or put/call ratios can provide valuable contrarian signals. Extreme readings often indicate potential market reversals.",
              category: "general",
              difficulty: "intermediate",
              tags: ["psychology", "indicators", "contrarian"]
            },
            {
              id: nanoid(),
              title: "Trading With Fibonacci Retracements",
              content: "Fibonacci retracement levels (38.2%, 50%, 61.8%) often act as support or resistance zones. Look for confluence with other technical indicators to improve reliability.",
              category: "technical",
              difficulty: "intermediate",
              tags: ["fibonacci", "levels", "support resistance"]
            },
            {
              id: nanoid(),
              title: "Price Action Trading",
              content: "Price action trading focuses on analyzing raw price movements without relying heavily on indicators. Key concepts include support/resistance, chart patterns, and candlestick formations.",
              category: "technical",
              difficulty: "advanced",
              tags: ["price action", "naked trading", "charts"]
            },
            {
              id: nanoid(),
              title: "Understanding DeFi Protocols",
              content: "Decentralized Finance (DeFi) protocols enable lending, borrowing, and trading without centralized intermediaries. Always research protocol security and audit status before committing significant funds.",
              category: "crypto",
              difficulty: "advanced",
              tags: ["defi", "ethereum", "yield farming"]
            },
            {
              id: nanoid(),
              title: "Reading Economic Calendars",
              content: "Economic calendars highlight upcoming data releases and their expected impact. High-impact events like non-farm payrolls, GDP, or central bank decisions can create significant market volatility.",
              category: "fundamental",
              difficulty: "beginner",
              tags: ["economic data", "news trading", "planning"]
            },
            {
              id: nanoid(),
              title: "Hedging Strategies",
              content: "Hedging involves opening positions that offset potential losses in existing trades. Common methods include options, futures, or simply taking opposing positions in correlated instruments.",
              category: "general",
              difficulty: "advanced",
              tags: ["risk management", "portfolio", "protection"]
            },
            {
              id: nanoid(),
              title: "Correlation Between Markets",
              content: "Understanding correlations between markets can improve your trading strategy. For example, USD strength typically has an inverse relationship with gold and commodity prices.",
              category: "general",
              difficulty: "intermediate",
              tags: ["intermarket", "relationships", "diversification"]
            },
            {
              id: nanoid(),
              title: "Options Trading Basics",
              content: "Options give the right, but not obligation, to buy or sell an asset at a specified price. Calls increase in value when prices rise, while puts increase in value when prices fall.",
              category: "stocks",
              difficulty: "intermediate",
              tags: ["options", "derivatives", "leverage"]
            },
            {
              id: nanoid(),
              title: "Setting Stop Losses",
              content: "Place stop losses at logical price levels, not arbitrary percentages. Good locations include just below support levels, beyond recent swing lows, or below key moving averages.",
              category: "technical",
              difficulty: "beginner",
              tags: ["risk management", "trade planning", "execution"]
            },
            {
              id: nanoid(),
              title: "Understanding Market Phases",
              content: "Markets cycle through accumulation, markup, distribution, and markdown phases. Each phase requires different trading strategies and position management approaches.",
              category: "technical",
              difficulty: "advanced",
              tags: ["market cycles", "wyckoff", "smart money"]
            },
            {
              id: nanoid(),
              title: "Sector Rotation Strategy",
              content: "Sector rotation involves moving investments between different market sectors based on economic cycles. Defensive sectors often outperform in downturns, while cyclicals lead during expansions.",
              category: "stocks",
              difficulty: "advanced",
              tags: ["sectors", "business cycle", "portfolio"]
            },
            {
              id: nanoid(),
              title: "Cryptocurrency Security",
              content: "Secure your crypto assets using hardware wallets, two-factor authentication, and unique passwords. Never share private keys and be vigilant against phishing attempts.",
              category: "crypto",
              difficulty: "beginner",
              tags: ["security", "wallet", "private keys"]
            },
            {
              id: nanoid(),
              title: "Trading Journal Importance",
              content: "Maintain a detailed trading journal recording entry/exit reasons, emotional state, and market conditions. Regular review helps identify strengths, weaknesses, and improvement opportunities.",
              category: "general",
              difficulty: "beginner",
              tags: ["psychology", "improvement", "discipline"]
            },
            {
              id: nanoid(),
              title: "Understanding Leverage",
              content: "Leverage amplifies both gains and losses. While 100x leverage might seem attractive, it significantly increases liquidation risk. Consider using lower leverage with wider stop losses for better survivability.",
              category: "general",
              difficulty: "intermediate",
              tags: ["leverage", "margin", "risk"]
            }
          ];
          
          set({ tips: mockTips, isLoading: false });
        } catch (error) {
          console.error('Error fetching trading tips:', error);
          set({ isLoading: false });
        }
      }
    }),
    {
      name: 'trading-tips-storage',
      // Persist viewed tips and first load status
      partialize: (state) => ({ 
        viewedTips: state.viewedTips,
        isFirstLoad: state.isFirstLoad 
      }),
    }
  )
);