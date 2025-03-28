import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { TradingTip } from '../../components/ui/micro-learning-tip';

// Trading tips data
const tradingTips: TradingTip[] = [
  {
    id: '1',
    title: 'Always Use Stop Losses',
    content: 'Stop losses are essential risk management tools that protect your capital from significant losses. Set them at levels that give your trade room to breathe while limiting potential losses.',
    category: 'risk',
    difficulty: 'beginner',
    tags: ['risk-management', 'trading-basics']
  },
  {
    id: '2',
    title: 'The 1% Rule',
    content: 'Never risk more than 1% of your total account value on a single trade. This approach ensures that even a series of losses won\'t significantly deplete your capital.',
    category: 'risk',
    difficulty: 'beginner',
    tags: ['risk-management', 'capital-preservation']
  },
  {
    id: '3',
    title: 'Identify Key Support and Resistance',
    content: 'Support and resistance levels are price points where a market has historically reversed. These levels often act as psychological barriers and can be powerful indicators for entry and exit points.',
    category: 'technical',
    difficulty: 'intermediate',
    tags: ['chart-patterns', 'price-action']
  },
  {
    id: '4',
    title: 'Trading Journal Importance',
    content: 'Keep a detailed trading journal to track all your trades, including entry/exit points, rationale, and emotions. Regularly review it to identify patterns and improve your strategy.',
    category: 'psychology',
    difficulty: 'beginner',
    tags: ['self-improvement', 'documentation']
  },
  {
    id: '5',
    title: 'Relative Strength Index (RSI)',
    content: 'RSI is a momentum oscillator that measures the speed and change of price movements. Values above 70 typically indicate overbought conditions, while values below 30 suggest oversold conditions.',
    category: 'technical',
    difficulty: 'intermediate',
    tags: ['indicators', 'oscillators']
  },
  {
    id: '6',
    title: 'MACD Crossovers',
    content: 'The Moving Average Convergence Divergence (MACD) indicator generates signals when the MACD line crosses above (bullish) or below (bearish) the signal line, potentially indicating trend changes.',
    category: 'technical',
    difficulty: 'intermediate',
    tags: ['indicators', 'trend-following']
  },
  {
    id: '7',
    title: 'Trading With the Trend',
    content: '"The trend is your friend" is a common trading adage for good reason. Trading in the direction of the established trend typically offers higher probability setups with better risk-reward ratios.',
    category: 'basic',
    difficulty: 'beginner',
    tags: ['trend-following', 'strategy']
  },
  {
    id: '8',
    title: 'Economic Calendar Awareness',
    content: 'Always be aware of upcoming economic releases and central bank announcements that could impact your trades. Markets often become volatile around these events, potentially triggering stop losses.',
    category: 'fundamental',
    difficulty: 'beginner',
    tags: ['news-trading', 'market-awareness']
  },
  {
    id: '9',
    title: 'Managing Emotions',
    content: 'Fear and greed are a trader\'s worst enemies. Develop a trading plan and stick to it, regardless of emotional impulses. Consider using predetermined entry and exit points to minimize emotional decision-making.',
    category: 'psychology',
    difficulty: 'advanced',
    tags: ['discipline', 'emotional-control']
  },
  {
    id: '10',
    title: 'Volume Confirmation',
    content: 'Price movements accompanied by high volume typically indicate stronger, more reliable signals. Look for volume confirmation when identifying potential trend reversals or breakouts.',
    category: 'technical',
    difficulty: 'intermediate',
    tags: ['volume-analysis', 'confirmation']
  }
];

interface MicroLearningContextType {
  currentTip: TradingTip | null;
  isVisible: boolean;
  position: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left' | 'center';
  showTip: (position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left' | 'center') => void;
  hideTip: () => void;
  nextTip: () => void;
  previousTip: () => void;
  likeTip: (tipId: string) => void;
  dislikeTip: (tipId: string) => void;
  saveForLater: (tipId: string) => void;
  likedTips: string[];
  dislikedTips: string[];
  savedTips: string[];
}

const MicroLearningContext = createContext<MicroLearningContextType | undefined>(undefined);

interface MicroLearningProviderProps {
  children: ReactNode;
  autoShowInterval?: number | null; // In milliseconds, null for no auto-show
  initialDelay?: number; // Delay before showing the first tip
}

export const MicroLearningProvider: React.FC<MicroLearningProviderProps> = ({ 
  children, 
  autoShowInterval = 300000, // Default: 5 minutes
  initialDelay = 60000 // Default: 1 minute
}) => {
  const [currentTipIndex, setCurrentTipIndex] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [position, setPosition] = useState<'top-right' | 'bottom-right' | 'top-left' | 'bottom-left' | 'center'>('bottom-right');
  const [likedTips, setLikedTips] = useState<string[]>([]);
  const [dislikedTips, setDislikedTips] = useState<string[]>([]);
  const [savedTips, setSavedTips] = useState<string[]>([]);
  const [autoShowTimer, setAutoShowTimer] = useState<NodeJS.Timeout | null>(null);

  // Load saved preferences from localStorage
  useEffect(() => {
    const loadPreferences = () => {
      try {
        const savedLikedTips = localStorage.getItem('likedTips');
        const savedDislikedTips = localStorage.getItem('dislikedTips');
        const savedForLaterTips = localStorage.getItem('savedForLaterTips');
        
        if (savedLikedTips) setLikedTips(JSON.parse(savedLikedTips));
        if (savedDislikedTips) setDislikedTips(JSON.parse(savedDislikedTips));
        if (savedForLaterTips) setSavedTips(JSON.parse(savedForLaterTips));
      } catch (error) {
        console.error('Error loading micro-learning preferences:', error);
      }
    };
    
    loadPreferences();
  }, []);

  // Set up auto-show timer
  useEffect(() => {
    // Initial delay for the first tip
    const initialTimer = setTimeout(() => {
      if (autoShowInterval !== null) {
        showTip();
        
        // Set up recurring timer
        const timer = setInterval(() => {
          if (!isVisible) {
            showTip();
          }
        }, autoShowInterval);
        
        setAutoShowTimer(timer);
      }
    }, initialDelay);
    
    return () => {
      clearTimeout(initialTimer);
      if (autoShowTimer) clearInterval(autoShowTimer);
    };
  }, [autoShowInterval, initialDelay]);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('likedTips', JSON.stringify(likedTips));
    localStorage.setItem('dislikedTips', JSON.stringify(dislikedTips));
    localStorage.setItem('savedForLaterTips', JSON.stringify(savedTips));
  }, [likedTips, dislikedTips, savedTips]);

  const showTip = (pos?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left' | 'center') => {
    if (pos) setPosition(pos);
    setIsVisible(true);
  };

  const hideTip = () => {
    setIsVisible(false);
  };

  const nextTip = () => {
    setCurrentTipIndex((prevIndex) => 
      prevIndex < tradingTips.length - 1 ? prevIndex + 1 : 0
    );
  };

  const previousTip = () => {
    setCurrentTipIndex((prevIndex) => 
      prevIndex > 0 ? prevIndex - 1 : tradingTips.length - 1
    );
  };

  const likeTip = (tipId: string) => {
    // Remove from disliked if it's there
    setDislikedTips(prev => prev.filter(id => id !== tipId));
    
    // Add to liked if not already there
    setLikedTips(prev => 
      prev.includes(tipId) ? prev : [...prev, tipId]
    );
  };

  const dislikeTip = (tipId: string) => {
    // Remove from liked if it's there
    setLikedTips(prev => prev.filter(id => id !== tipId));
    
    // Add to disliked if not already there
    setDislikedTips(prev => 
      prev.includes(tipId) ? prev : [...prev, tipId]
    );
  };

  const saveForLater = (tipId: string) => {
    setSavedTips(prev => 
      prev.includes(tipId) ? prev : [...prev, tipId]
    );
  };

  const currentTip = tradingTips[currentTipIndex] || null;

  const value = {
    currentTip,
    isVisible,
    position,
    showTip,
    hideTip,
    nextTip,
    previousTip,
    likeTip,
    dislikeTip,
    saveForLater,
    likedTips,
    dislikedTips,
    savedTips
  };

  return (
    <MicroLearningContext.Provider value={value}>
      {children}
    </MicroLearningContext.Provider>
  );
};

// Hook for consuming the context
export const useMicroLearning = () => {
  const context = useContext(MicroLearningContext);
  if (context === undefined) {
    throw new Error('useMicroLearning must be used within a MicroLearningProvider');
  }
  return context;
};