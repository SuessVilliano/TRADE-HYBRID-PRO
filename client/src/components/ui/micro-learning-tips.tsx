import React, { useState, useEffect } from 'react';
import { LightbulbIcon, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { Button } from './button';
import useLocalStorage from '../../lib/hooks/useLocalStorage';
import { useMicroLearning } from '../../lib/context/MicroLearningProvider';

// Importing TradingTip component directly
import { TradingTip } from './micro-learning-tip';

// Sample trading tips data
const TRADING_TIPS: TradingTip[] = [
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

// Import the TipSettings from the MicroLearningProvider
import { TipSettings } from '../../lib/context/MicroLearningProvider';

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

interface MicroLearningTipsProps {
  className?: string;
}

export function MicroLearningTips({ className }: MicroLearningTipsProps) {
  // State for currently shown tip
  const [currentTip, setCurrentTip] = useState<TradingTip | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [settings, setSettings] = useLocalStorage<TipSettings>(
    'trading-tips-settings',
    DEFAULT_SETTINGS
  );

  // Function to get a random tip that hasn't been seen yet (or least recently seen)
  const getRandomTip = () => {
    // Filter tips by selected categories
    const filteredTips = TRADING_TIPS.filter(tip => 
      settings.categories[tip.category as keyof typeof settings.categories]
    );
    
    if (filteredTips.length === 0) return null;
    
    // If all tips have been seen, reset the seen tips
    if (settings.seenTips.length >= filteredTips.length) {
      setSettings({
        ...settings,
        seenTips: []
      });
    }
    
    // Get tips that haven't been seen yet
    const unseenTips = filteredTips.filter(tip => !settings.seenTips.includes(tip.id));
    
    // If all tips have been seen, return a random tip
    if (unseenTips.length === 0) {
      const randomIndex = Math.floor(Math.random() * filteredTips.length);
      return filteredTips[randomIndex];
    }
    
    // Return a random unseen tip
    const randomIndex = Math.floor(Math.random() * unseenTips.length);
    return unseenTips[randomIndex];
  };

  // Function to show a random tip
  const showRandomTip = () => {
    const tip = getRandomTip();
    if (tip) {
      setCurrentTip(tip);
      setIsVisible(true);
      
      // Mark tip as seen
      setSettings({
        ...settings,
        seenTips: [...settings.seenTips, tip.id],
        lastShown: Date.now()
      });
    }
  };

  // Function to close the tip
  const closeTip = () => {
    setIsVisible(false);
  };

  // Set up the timer for showing tips based on frequency
  useEffect(() => {
    if (settings.frequency === 'off') return;
    
    const interval = FREQUENCY_INTERVALS[settings.frequency];
    const timeSinceLastShown = Date.now() - settings.lastShown;
    
    // If it's been long enough since the last tip was shown, show a new one
    if (timeSinceLastShown >= interval) {
      // Show the tip after a small delay to not interrupt initial page load
      const timer = setTimeout(() => {
        showRandomTip();
      }, 5000); // 5 second delay
      
      return () => clearTimeout(timer);
    } else {
      // Set a timer to show the next tip
      const timer = setTimeout(() => {
        showRandomTip();
      }, interval - timeSinceLastShown);
      
      return () => clearTimeout(timer);
    }
  }, [settings.frequency, settings.lastShown]);

  // Return null if no tip is visible
  if (!isVisible || !currentTip) return null;

  // Define category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'intermediate': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'advanced': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'psychology': return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400';
      case 'risk': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'risk-management': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'technical': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'fundamental': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400';
      case 'basic': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 max-w-sm transition-all duration-300 ${className}`}>
      <Card className="shadow-lg border-slate-700 dark:border-slate-600 animate-in fade-in slide-in-from-bottom-5">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-full">
                <LightbulbIcon size={16} className="text-blue-500" />
              </div>
              <CardTitle className="text-base font-medium">{currentTip.title}</CardTitle>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 w-7 p-0 rounded-full" 
              onClick={closeTip}
            >
              <X size={14} />
            </Button>
          </div>
          <div className="flex gap-2 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(currentTip.category)}`}>
              {currentTip.category.charAt(0).toUpperCase() + currentTip.category.slice(1).replace('-', ' ')}
            </span>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-sm text-slate-700 dark:text-slate-300">{currentTip.content}</p>
        </CardContent>
        <CardFooter className="pt-0 flex justify-between">
          <div className="flex gap-1.5">
            {currentTip.tags.map((tag, index) => (
              <span key={index} className="text-xs text-slate-500 dark:text-slate-400">
                #{tag}
              </span>
            ))}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2 text-xs text-blue-500" 
            onClick={showRandomTip}
          >
            Next Tip
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// Settings component for configuring tips
export function TradingTipsSettings() {
  // Use the micro-learning context instead of direct localStorage access
  const { settings, updateSettings } = useMicroLearning();

  // Function to toggle a category
  const toggleCategory = (category: keyof TipSettings['categories']) => {
    updateSettings({
      ...settings,
      categories: {
        ...settings.categories,
        [category]: !settings.categories[category]
      }
    });
  };

  // Function to change frequency
  const changeFrequency = (frequency: TipSettings['frequency']) => {
    updateSettings({
      ...settings,
      frequency
    });
  };

  // Function to show a tip immediately
  const showTipNow = () => {
    // Reset the lastShown time to trigger a tip immediately
    updateSettings({
      ...settings,
      lastShown: 0
    });
  };

  return (
    <Card className="w-full border-slate-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Trading Tips Settings</CardTitle>
        <CardDescription>Configure how trading tips appear in the platform</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Tip Frequency</h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={settings.frequency === 'high' ? 'default' : 'outline'}
              size="sm"
              onClick={() => changeFrequency('high')}
            >
              High (10 min)
            </Button>
            <Button
              variant={settings.frequency === 'medium' ? 'default' : 'outline'}
              size="sm"
              onClick={() => changeFrequency('medium')}
            >
              Medium (30 min)
            </Button>
            <Button
              variant={settings.frequency === 'low' ? 'default' : 'outline'}
              size="sm"
              onClick={() => changeFrequency('low')}
            >
              Low (60 min)
            </Button>
            <Button
              variant={settings.frequency === 'off' ? 'default' : 'outline'}
              size="sm"
              onClick={() => changeFrequency('off')}
            >
              Off
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-medium">Categories</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Object.entries(settings.categories).map(([category, isEnabled]) => (
              <Button
                key={category}
                variant={isEnabled ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleCategory(category as keyof TipSettings['categories'])}
                className="justify-start"
              >
                <span className={`w-3 h-3 rounded-full mr-2 ${getCategoryColor(category)}`}></span>
                {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Reset Seen Tips</h3>
          <p className="text-xs text-slate-400">If you want to see tips you've already seen, you can reset your history.</p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => updateSettings({
              ...settings,
              seenTips: []
            })}
          >
            Reset History
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={showTipNow}>
          Show Tip Now
        </Button>
        <Button
          variant={settings.frequency !== 'off' ? 'default' : 'outline'}
          onClick={() => changeFrequency(settings.frequency === 'off' ? 'medium' : 'off')}
        >
          {settings.frequency === 'off' ? 'Enable Tips' : 'Disable Tips'}
        </Button>
      </CardFooter>
    </Card>
  );
}

// Helper function to get category color for reuse
function getCategoryColor(category: string) {
  switch (category) {
    case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'intermediate': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'advanced': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
    case 'psychology': return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400';
    case 'risk-management': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    case 'technical': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
    case 'fundamental': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  }
}