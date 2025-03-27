import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Lightbulb } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { Separator } from './separator';

interface TradingTip {
  id: number;
  title: string;
  content: string;
  category: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
}

const tradingTips: TradingTip[] = [
  {
    id: 1,
    title: 'Understanding Risk Management',
    content: 'Never risk more than 1-2% of your trading capital on a single trade. This helps protect your account from significant drawdowns and allows you to stay in the game longer.',
    category: 'beginner',
    tags: ['risk management', 'capital preservation']
  },
  {
    id: 2,
    title: 'Market Structure Analysis',
    content: 'Learn to identify key market structure elements: higher highs/higher lows (uptrend) and lower highs/lower lows (downtrend). These patterns help determine the overall market direction.',
    category: 'beginner',
    tags: ['technical analysis', 'trends']
  },
  {
    id: 3,
    title: 'Finding Confluence',
    content: 'The most reliable trading setups occur when multiple factors align (confluence). Look for trades where support/resistance, trend direction, and indicator signals all point to the same outcome.',
    category: 'intermediate',
    tags: ['strategy', 'confluence']
  },
  {
    id: 4,
    title: 'Trading Psychology',
    content: 'Keep a trading journal to track not just your trades but your emotions. Understanding your psychological patterns is as important as technical analysis.',
    category: 'intermediate',
    tags: ['psychology', 'journaling']
  },
  {
    id: 5,
    title: 'Volume Analysis',
    content: 'Price moves with conviction when accompanied by high volume. Low volume price movements are more likely to reverse. Use volume to confirm breakouts and trend strength.',
    category: 'intermediate',
    tags: ['volume', 'technical analysis']
  },
  {
    id: 6,
    title: 'Trading the THY Token',
    content: 'When trading the Trade Hybrid token (THY), monitor liquidity pools on Raydium to determine optimal entry and exit points. Higher liquidity typically means less slippage.',
    category: 'advanced',
    tags: ['THY token', 'Solana', 'liquidity']
  },
  {
    id: 7,
    title: 'Advanced Order Types',
    content: 'Use OCO (One-Cancels-Other) orders to set both a take profit and stop loss simultaneously. This ensures your position is closed automatically regardless of which price is hit first.',
    category: 'advanced',
    tags: ['order types', 'risk management']
  },
  {
    id: 8,
    title: 'Market Correlations',
    content: 'Understanding market correlations can improve your trading. For example, when the US dollar strengthens, commodities often weaken. Use these relationships to validate your trade ideas.',
    category: 'advanced',
    tags: ['correlations', 'macro analysis']
  },
  {
    id: 9,
    title: 'Swing Trading vs. Day Trading',
    content: 'Day trading requires more time and attention while swing trading allows for a more relaxed approach. Choose your style based on your availability and personality, not just potential returns.',
    category: 'beginner',
    tags: ['trading styles', 'time management']
  },
  {
    id: 10,
    title: 'Using Multiple Timeframes',
    content: 'Always analyze at least three timeframes before entering a trade: higher for trend direction, middle for entry, and lower for precise timing. This multi-timeframe approach improves accuracy.',
    category: 'intermediate',
    tags: ['timeframes', 'technical analysis']
  }
];

interface TradingTipPopupProps {
  isOpen: boolean;
  onClose: () => void;
  userLevel?: 'beginner' | 'intermediate' | 'advanced';
}

export function TradingTipPopup({ isOpen, onClose, userLevel = 'beginner' }: TradingTipPopupProps) {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [animation, setAnimation] = useState('fade-in');
  
  // Filter tips based on user level
  const eligibleTips = tradingTips.filter(tip => {
    if (userLevel === 'advanced') return true; // Show all tips for advanced users
    if (userLevel === 'intermediate') return tip.category !== 'advanced'; // No advanced tips for intermediate
    return tip.category === 'beginner'; // Only beginner tips for beginners
  });
  
  const currentTip = eligibleTips[currentTipIndex];
  
  useEffect(() => {
    // Show tips randomly every 5-10 minutes if not manually closed
    const showTipsInterval = setInterval(() => {
      // 20% chance to show a tip
      if (Math.random() < 0.2) {
        setCurrentTipIndex(Math.floor(Math.random() * eligibleTips.length));
        setAnimation('fade-in');
      }
    }, 300000 + Math.random() * 300000); // Random interval between 5-10 minutes
    
    return () => clearInterval(showTipsInterval);
  }, [eligibleTips.length]);
  
  const nextTip = () => {
    setAnimation('fade-out');
    setTimeout(() => {
      setCurrentTipIndex((prevIndex) => (prevIndex + 1) % eligibleTips.length);
      setAnimation('fade-in');
    }, 300);
  };
  
  if (!isOpen || !currentTip) return null;
  
  return (
    <div className={`fixed bottom-20 right-8 max-w-md z-50 ${animation}`}>
      <Card className="border shadow-lg bg-background">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-400" />
              <CardTitle className="text-lg">Trading Tip</CardTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            {currentTip.category.charAt(0).toUpperCase() + currentTip.category.slice(1)} Level
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          <h3 className="font-medium mb-2">{currentTip.title}</h3>
          <p className="text-sm text-muted-foreground">{currentTip.content}</p>
          <div className="flex flex-wrap gap-1 mt-3">
            {currentTip.tags.map(tag => (
              <span key={tag} className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </CardContent>
        <Separator />
        <CardFooter className="pt-2 flex justify-between">
          <p className="text-xs text-muted-foreground">Tip {currentTipIndex + 1} of {eligibleTips.length}</p>
          <Button variant="ghost" size="sm" onClick={nextTip} className="h-8 gap-1">
            Next Tip <ArrowRight className="h-3 w-3" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// Context and Provider for managing the trading tips globally
const TradingTipsContext = React.createContext<{
  showTip: () => void;
  hideTip: () => void;
  setUserLevel: (level: 'beginner' | 'intermediate' | 'advanced') => void;
}>({
  showTip: () => {},
  hideTip: () => {},
  setUserLevel: () => {},
});

export function TradingTipsProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [userLevel, setUserLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  
  // Show tip on first visit
  useEffect(() => {
    const hasSeenTip = localStorage.getItem('hasSeenFirstTip');
    if (!hasSeenTip) {
      setTimeout(() => {
        setIsOpen(true);
        localStorage.setItem('hasSeenFirstTip', 'true');
      }, 15000); // Show first tip after 15 seconds
    }
  }, []);
  
  const showTip = () => setIsOpen(true);
  const hideTip = () => setIsOpen(false);
  
  return (
    <TradingTipsContext.Provider value={{ showTip, hideTip, setUserLevel }}>
      {children}
      <TradingTipPopup isOpen={isOpen} onClose={hideTip} userLevel={userLevel} />
    </TradingTipsContext.Provider>
  );
}

export function useTradingTips() {
  return React.useContext(TradingTipsContext);
}

// Button component to manually trigger tips
export function ShowTradingTipButton() {
  const { showTip } = useTradingTips();
  
  return (
    <Button 
      onClick={showTip} 
      size="sm" 
      variant="outline" 
      className="flex items-center gap-1 h-8"
    >
      <Lightbulb className="h-4 w-4 text-yellow-400" />
      <span>Trading Tip</span>
    </Button>
  );
}