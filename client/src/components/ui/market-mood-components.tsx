import { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { Switch } from './switch';
import { useMarketMood } from '@/lib/context/MarketMoodContext';
import { cn } from '@/lib/utils';

/**
 * Toggle for enabling/disabling adaptive market mood colors
 */
export function MarketMoodToggle() {
  const { adaptiveColorsEnabled, setAdaptiveColorsEnabled } = useMarketMood();
  
  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="market-mood-toggle"
        checked={adaptiveColorsEnabled}
        onCheckedChange={setAdaptiveColorsEnabled}
      />
      <label 
        htmlFor="market-mood-toggle" 
        className="text-sm cursor-pointer"
      >
        {adaptiveColorsEnabled ? 'Enabled' : 'Disabled'}
      </label>
    </div>
  );
}

/**
 * Preview of different market mood color schemes
 */
export function MarketMoodPreview() {
  const { currentMood, adaptiveColorsEnabled } = useMarketMood();
  
  const moodPresets = [
    { id: 'bullish', label: 'Bullish', icon: TrendingUp, color: 'market-bullish' },
    { id: 'neutral', label: 'Neutral', icon: Activity, color: 'market-neutral' },
    { id: 'bearish', label: 'Bearish', icon: TrendingDown, color: 'market-bearish' }
  ];
  
  return (
    <div className={cn(
      "rounded-md p-3 border", 
      adaptiveColorsEnabled 
        ? "border-primary/30 bg-card"
        : "border-slate-700 bg-slate-800"
    )}>
      <h4 className="font-medium mb-2 flex items-center">
        <BarChart2 className="h-4 w-4 mr-2" />
        Current Market Mood
      </h4>
      
      <div className="grid grid-cols-3 gap-2">
        {moodPresets.map(mood => {
          const isActive = adaptiveColorsEnabled && currentMood === mood.id;
          const Icon = mood.icon;
          
          return (
            <div 
              key={mood.id}
              className={cn(
                "rounded p-2 flex flex-col items-center justify-center text-center transition-colors",
                isActive 
                  ? `bg-${mood.color}-accent text-${mood.color}-accent-foreground` 
                  : "bg-slate-800 text-slate-400"
              )}
            >
              <Icon className={cn(
                "h-5 w-5 mb-1",
                isActive ? `text-${mood.color}-accent-foreground` : "text-slate-400"
              )} />
              <span className="text-xs">{mood.label}</span>
            </div>
          );
        })}
      </div>
      
      <p className="text-xs text-muted-foreground mt-2">
        {adaptiveColorsEnabled
          ? "Interface colors adapt to market conditions"
          : "Enable to make interface colors adapt to market sentiment"
        }
      </p>
    </div>
  );
}

/**
 * Badge showing the current market mood
 */
export function MarketMoodBadge() {
  const { currentMood, adaptiveColorsEnabled } = useMarketMood();
  
  if (!adaptiveColorsEnabled) return null;
  
  const moodIcons = {
    'bullish': TrendingUp,
    'neutral': Activity,
    'bearish': TrendingDown
  };
  
  const moodLabels = {
    'bullish': 'Bullish',
    'neutral': 'Neutral',
    'bearish': 'Bearish'
  };
  
  const Icon = moodIcons[currentMood as keyof typeof moodIcons] || Activity;
  
  return (
    <div className={cn(
      "inline-flex items-center px-2 py-1 rounded-full text-xs",
      currentMood === 'bullish' && "bg-market-bullish-accent/10 text-market-bullish-accent",
      currentMood === 'neutral' && "bg-market-neutral-accent/10 text-market-neutral-accent",
      currentMood === 'bearish' && "bg-market-bearish-accent/10 text-market-bearish-accent"
    )}>
      <Icon className="h-3 w-3 mr-1" />
      <span>{moodLabels[currentMood as keyof typeof moodLabels]}</span>
    </div>
  );
}