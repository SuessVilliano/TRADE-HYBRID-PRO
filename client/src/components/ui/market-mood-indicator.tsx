import { useEffect, useState } from 'react';
import { BarChart2, TrendingUp, TrendingDown, RefreshCw, Activity } from 'lucide-react';
import { Button } from './button';
import { Switch } from './switch';
import { cn } from '@/lib/utils';
import { useMarketMood } from '@/lib/context/MarketMoodContext';

/**
 * Market Mood Indicator Component
 * Displays the current market sentiment and allows toggling adaptive color scheme
 */
export function MarketMoodIndicator() {
  const { currentMood, moodScore, adaptiveColorsEnabled, setAdaptiveColorsEnabled, fetchMarketMood } = useMarketMood();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Handle refreshing market mood data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchMarketMood();
    } catch (error) {
      console.error('Failed to refresh market mood:', error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Format score as percentage
  const formatScore = (score: number) => {
    // Convert -1 to 1 scale to 0-100 percentage
    const percentage = Math.round(((score + 1) / 2) * 100);
    return `${percentage}%`;
  };
  
  return (
    <div className={cn(
      "p-4 rounded-lg border",
      adaptiveColorsEnabled
        ? "border-market-primary/30 bg-card"
        : "border-slate-700 bg-slate-800"
    )}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium flex items-center">
          <BarChart2 className="h-5 w-5 mr-2" />
          Market Mood
        </h3>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleRefresh} 
          disabled={isRefreshing}
          title="Refresh market sentiment"
        >
          <RefreshCw className={cn(
            "h-4 w-4",
            isRefreshing && "animate-spin"
          )} />
        </Button>
      </div>
      
      <div className="grid gap-4">
        <div className={cn(
          "flex items-center justify-between p-3 rounded-md",
          currentMood === 'bullish' && "bg-market-bullish-accent/10",
          currentMood === 'neutral' && "bg-market-neutral-accent/10",
          currentMood === 'bearish' && "bg-market-bearish-accent/10"
        )}>
          <div className="flex items-center">
            {currentMood === 'bullish' && <TrendingUp className="h-5 w-5 mr-2 text-market-bullish-accent" />}
            {currentMood === 'neutral' && <Activity className="h-5 w-5 mr-2 text-market-neutral-accent" />}
            {currentMood === 'bearish' && <TrendingDown className="h-5 w-5 mr-2 text-market-bearish-accent" />}
            <div>
              <div className="font-medium capitalize">{currentMood}</div>
              <div className="text-xs text-muted-foreground">Sentiment Score: {formatScore(moodScore)}</div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Adaptive Colors</div>
            <div className="text-xs text-muted-foreground">Change UI colors based on market mood</div>
          </div>
          <Switch
            checked={adaptiveColorsEnabled}
            onCheckedChange={setAdaptiveColorsEnabled}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Market Mood Badge Component
 * A compact badge displaying current market mood
 */
export function MarketMoodBadge() {
  const { currentMood, adaptiveColorsEnabled } = useMarketMood();
  
  if (!adaptiveColorsEnabled) return null;
  
  return (
    <div className={cn(
      "inline-flex items-center px-2 py-1 rounded-full text-xs",
      currentMood === 'bullish' && "bg-market-bullish-accent/10 text-market-bullish-accent",
      currentMood === 'neutral' && "bg-market-neutral-accent/10 text-market-neutral-accent",
      currentMood === 'bearish' && "bg-market-bearish-accent/10 text-market-bearish-accent"
    )}>
      {currentMood === 'bullish' && <TrendingUp className="h-3 w-3 mr-1" />}
      {currentMood === 'neutral' && <Activity className="h-3 w-3 mr-1" />}
      {currentMood === 'bearish' && <TrendingDown className="h-3 w-3 mr-1" />}
      <span className="capitalize">{currentMood}</span>
    </div>
  );
}