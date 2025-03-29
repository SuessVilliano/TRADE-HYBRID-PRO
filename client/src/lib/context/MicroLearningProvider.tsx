import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import useLocalStorage from '../../lib/hooks/useLocalStorage';
import { TradingTip } from '../../components/ui/micro-learning-tip';

// Define settings type for user preferences
export interface TipSettings {
  frequency: 'high' | 'medium' | 'low' | 'off';
  categories: {
    beginner: boolean;
    intermediate: boolean;
    advanced: boolean;
    psychology: boolean;
    'risk-management': boolean;
    technical: boolean;
    fundamental: boolean;
  };
  seenTips: string[]; // Array of tip IDs that have been seen
  lastShown: number; // Timestamp for when a tip was last shown
}

// Default settings
const DEFAULT_SETTINGS: TipSettings = {
  frequency: 'medium', // Default frequency
  categories: {
    beginner: true,
    intermediate: true,
    advanced: true,
    psychology: true,
    'risk-management': true,
    technical: true,
    fundamental: true
  },
  seenTips: [],
  lastShown: 0
};

// Time intervals for different frequencies (in milliseconds)
const FREQUENCY_INTERVALS = {
  high: 10 * 60 * 1000, // 10 minutes
  medium: 30 * 60 * 1000, // 30 minutes
  low: 60 * 60 * 1000, // 1 hour
  off: Number.MAX_SAFE_INTEGER // Effectively off
};

// Convert TradingTip category type for our enhanced system
function mapCategoryToType(cat: string): 'basic' | 'technical' | 'fundamental' | 'psychology' | 'risk' {
  switch (cat) {
    case 'risk-management': return 'risk';
    case 'technical': return 'technical';
    case 'fundamental': return 'fundamental';
    case 'psychology': return 'psychology';
    default: return 'basic';
  }
}

// Convert difficulty to our format
function mapDifficultyToType(diff: string): 'beginner' | 'intermediate' | 'advanced' {
  if (diff === 'beginner' || diff === 'intermediate' || diff === 'advanced') {
    return diff;
  }
  return 'beginner';
}

// Enhanced trading tips data
const tradingTips: TradingTip[] = [
  {
    id: 'tip-001',
    title: 'Always Use Stop Losses',
    content: 'Protect your capital by setting stop losses on every trade. This defines your risk before entering a position and prevents catastrophic losses.',
    category: 'risk',
    difficulty: 'beginner',
    tags: ['stop-loss', 'risk-management', 'beginner']
  },
  {
    id: 'tip-002',
    title: 'The 1% Rule',
    content: 'Never risk more than 1-2% of your trading capital on a single trade. This ensures you can withstand a series of losses without depleting your account.',
    category: 'risk',
    difficulty: 'beginner',
    tags: ['position-sizing', 'risk-management', 'beginner']
  },
  {
    id: 'tip-003',
    title: 'Trade with the Trend',
    content: 'Align your trades with the overall market trend. Remember: "The trend is your friend." Trading against the trend significantly reduces your probability of success.',
    category: 'technical',
    difficulty: 'beginner',
    tags: ['trend-following', 'technical-analysis', 'beginner']
  },
  {
    id: 'tip-004',
    title: 'Keep a Trading Journal',
    content: 'Document your trades with entry reasons, exit strategies, and outcomes. Review regularly to identify patterns and improve your strategy.',
    category: 'psychology',
    difficulty: 'beginner',
    tags: ['journaling', 'improvement', 'beginner']
  },
  {
    id: 'tip-005',
    title: 'Trade the Plan, Plan the Trade',
    content: 'Develop a trading plan before entering a position. Know your entry, target, stop loss, and risk-reward ratio ahead of time.',
    category: 'psychology',
    difficulty: 'intermediate',
    tags: ['planning', 'discipline', 'intermediate']
  },
  {
    id: 'tip-006',
    title: 'Mind the Spread',
    content: 'The bid-ask spread impacts your profitability, especially for short-term traders. Consider these costs when planning your trades.',
    category: 'technical',
    difficulty: 'intermediate',
    tags: ['costs', 'liquidity', 'intermediate']
  },
  {
    id: 'tip-007',
    title: 'Confluence of Factors',
    content: 'Look for multiple signals confirming a trade idea. When technical indicators, price action, and fundamental factors align, your edge increases.',
    category: 'technical',
    difficulty: 'intermediate',
    tags: ['confluence', 'technical-analysis', 'intermediate']
  },
  {
    id: 'tip-008',
    title: 'Manage Emotions',
    content: 'FOMO (Fear of Missing Out) and revenge trading lead to poor decisions. Step away when emotionally charged.',
    category: 'psychology',
    difficulty: 'intermediate',
    tags: ['emotions', 'discipline', 'intermediate']
  },
  {
    id: 'tip-009',
    title: 'Volume Confirms Movement',
    content: 'Significant price movements should be accompanied by strong volume. Low volume moves are less reliable and often reverse.',
    category: 'technical',
    difficulty: 'intermediate',
    tags: ['volume', 'technical-analysis', 'intermediate']
  },
  {
    id: 'tip-010',
    title: 'Key Level Reaction',
    content: 'Watch how price reacts at key support/resistance levels. The reaction often reveals more than the break itself.',
    category: 'technical',
    difficulty: 'advanced',
    tags: ['support-resistance', 'price-action', 'advanced']
  },
  {
    id: 'tip-011',
    title: 'Correlation Awareness',
    content: 'Understand correlated assets to avoid overexposure to the same market forces. Diversify your positions across uncorrelated markets.',
    category: 'fundamental',
    difficulty: 'advanced',
    tags: ['correlation', 'diversification', 'advanced']
  },
  {
    id: 'tip-012',
    title: 'Scale Out of Positions',
    content: 'Consider taking partial profits at different levels instead of exiting a position all at once.',
    category: 'risk',
    difficulty: 'advanced',
    tags: ['position-management', 'profit-taking', 'advanced']
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
  // Enhanced settings
  settings: TipSettings;
  updateSettings: (settings: TipSettings) => void;
}

const MicroLearningContext = createContext<MicroLearningContextType | undefined>(undefined);

interface MicroLearningProviderProps {
  children: ReactNode;
  autoShowInterval?: number | null; // In milliseconds, null for no auto-show
  initialDelay?: number; // Delay before showing the first tip
}

export const MicroLearningProvider: React.FC<MicroLearningProviderProps> = ({ 
  children, 
  autoShowInterval = 900000, // Default: 15 minutes
  initialDelay = 180000 // Default: 3 minutes
}) => {
  const [currentTipIndex, setCurrentTipIndex] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [position, setPosition] = useState<'top-right' | 'bottom-right' | 'top-left' | 'bottom-left' | 'center'>('bottom-right');
  const [likedTips, setLikedTips] = useState<string[]>([]);
  const [dislikedTips, setDislikedTips] = useState<string[]>([]);
  const [savedTips, setSavedTips] = useState<string[]>([]);
  const [autoShowTimer, setAutoShowTimer] = useState<NodeJS.Timeout | null>(null);
  
  // Use enhanced settings from localStorage
  const [settings, setSettings] = useLocalStorage<TipSettings>(
    'trading-tips-settings',
    DEFAULT_SETTINGS
  );

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

  // Set up auto-show timer based on user frequency settings
  useEffect(() => {
    if (settings.frequency === 'off') {
      // Clear any existing timers if tips are turned off
      if (autoShowTimer) {
        clearInterval(autoShowTimer);
        setAutoShowTimer(null);
      }
      return;
    }
    
    // Get interval from settings
    const interval = FREQUENCY_INTERVALS[settings.frequency];
    const timeSinceLastShown = Date.now() - settings.lastShown;
    
    // Initial delay calculation
    const initialWait = Math.max(0, Math.min(interval, initialDelay, interval - timeSinceLastShown));
    
    // Initial delay for the first tip
    const initialTimer = setTimeout(() => {
      showTip();
      
      // Set up recurring timer
      const timer = setInterval(() => {
        if (!isVisible) {
          showTip();
        }
      }, interval);
      
      setAutoShowTimer(timer);
    }, initialWait);
    
    return () => {
      clearTimeout(initialTimer);
      if (autoShowTimer) clearInterval(autoShowTimer);
    };
  }, [settings.frequency, settings.lastShown]);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('likedTips', JSON.stringify(likedTips));
    localStorage.setItem('dislikedTips', JSON.stringify(dislikedTips));
    localStorage.setItem('savedForLaterTips', JSON.stringify(savedTips));
  }, [likedTips, dislikedTips, savedTips]);

  const showTip = (pos?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left' | 'center') => {
    if (pos) setPosition(pos);
    setIsVisible(true);
    
    // Update lastShown timestamp in settings
    setSettings({
      ...settings,
      lastShown: Date.now()
    });
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

  // Function to update settings
  const updateSettings = (newSettings: TipSettings) => {
    setSettings(newSettings);
  };

  // Filter eligible tips based on settings
  const getFilteredTips = () => {
    return tradingTips.filter(tip => {
      // Map categories from our enhanced system to the original system
      let categoryMatches = false;
      
      if (tip.category === 'risk' && settings.categories['risk-management']) {
        categoryMatches = true;
      } else if (tip.category === 'technical' && settings.categories['technical']) {
        categoryMatches = true;
      } else if (tip.category === 'fundamental' && settings.categories['fundamental']) {
        categoryMatches = true;
      } else if (tip.category === 'psychology' && settings.categories['psychology']) {
        categoryMatches = true;
      } else if (tip.category === 'basic' && settings.categories['beginner']) {
        categoryMatches = true;
      }
      
      if (!categoryMatches) return false;
      
      // Check difficulty level
      if (tip.difficulty === 'beginner' && !settings.categories['beginner']) return false;
      if (tip.difficulty === 'intermediate' && !settings.categories['intermediate']) return false;
      if (tip.difficulty === 'advanced' && !settings.categories['advanced']) return false;
      
      return true;
    });
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
    savedTips,
    // Add settings to context
    settings,
    updateSettings
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